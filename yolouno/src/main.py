import aioble
import asyncio
import time
import sys
from bluetooth import UUID
import uselect
from machine import UART, Pin

# ---  Biến để lưu thông tin kết nối uart ---
uart1 = None

# --- Lệnh trigger GM65 (Under command trigger mode) ---
TRIGGER_COMMAND = [0x7E, 0x00, 0x08, 0x01, 0x00, 0x02, 0x01, 0xAB, 0xCD]
STOP_TRIGGER_COMMAND = [0x7E, 0x00, 0x08, 0x01, 0x00, 0x02, 0x00, 0xAB, 0xCD]

WEIGHT_SERVICE_UUID = UUID(0x181D)
WEIGHT_MEASUREMENT_UUID = UUID(0x2A9D)
CCCD_UUID = UUID(0x2902)
SCALE_NAME = "MI SCALE2"
led_blink = Pin(48, Pin.OUT)
is_getting_data = False
latest_stable_weight = None
latest_cccd_info = None

def parse_weight_data(data):
    is_stable = (data[0] & (1 << 5)) != 0
    is_removed = (data[0] & (1 << 7)) != 0
    weight = int.from_bytes(data[1:3], "little") / 200

    return {
        "isStable": is_stable,
        "isRemoved": is_removed,
        "weight": weight
    }

def current_time():
    # Trả về chuỗi thời gian đơn giản, VD: 12:34:56
    t = time.localtime()
    return "{:02}:{:02}:{:02}".format(t[3], t[4], t[5])

def send_command(uart, hex_list):
    command = bytes(hex_list)
    uart.write(command)
    print(f"[{current_time()}] >>> Command sent:", ' '.join(f'{b:02X}' for b in command))

async def scan_and_connect():
    print("\n================== STARTING BLE SCAN (5 SECONDS) ==================")
    print(f"[{current_time()}] Scanning for BLE devices...")

    device_found = False
    global is_getting_data
    global latest_stable_weight

    async with aioble.scan(duration_ms=5000, interval_us=30000, window_us=30000, active=True) as scanner:
        async for result in scanner:
            name = result.name()
            if name:
                print(f"[{current_time()}] Found: {name} | RSSI: {result.rssi}")
            else:
                continue

            if name == SCALE_NAME:
                device_found = True
                print(f"[{current_time()}] >>> Found target device: {name}")
                device = result.device

                print(f"[{current_time()}] >>> Connecting...")
                try:
                    connection = await device.connect(timeout_ms=2000)
                    print(f"[{current_time()}] >>> Connected successfully.")

                    try:
                        weight_service = await connection.service(WEIGHT_SERVICE_UUID)
                        weight_char = await weight_service.characteristic(WEIGHT_MEASUREMENT_UUID)

                        if weight_char is None:
                            print(f"[{current_time()}] >>> Weight characteristic not found.")
                            await connection.disconnect()
                            return
                    except asyncio.TimeoutError:
                        print(f"[{current_time()}] >>> Timeout while discovering services or characteristics.")
                        await connection.disconnect()
                        break

                    cccd = await weight_char.descriptor(CCCD_UUID)
                    if cccd:
                        try:
                            await asyncio.sleep_ms(300)
                            await cccd.write(struct.pack('<H', 2))  # enable indicate
                            print(f"[{current_time()}] >>> CCCD written successfully")
                        except Exception as e:
                            print(f"[{current_time()}] >>> Error writing CCCD: {e}")
                    else:
                        print(f"[{current_time()}] >>> CCCD not found")

                    print(f"[{current_time()}] >>> Waiting for weight data...")
                    while connection.is_connected():
                        try:
                            data = await weight_char.indicated(2000)
                            result = parse_weight_data(data)
                            if result:
                                is_getting_data = True
                            print(f"[{current_time()}] >>> Weight: {result['weight']} kg | Stable: {result['isStable']}")

                            # Nếu cân nặng ổn định thì chớp đèn báo hiệu
                            if result['isStable']:
                                latest_stable_weight = result['weight']
                                for _ in range(3):
                                    neopix.show(0, hex_to_rgb('#0000ff'))
                                    await asyncio.sleep_ms(300)
                                    neopix.show(0, hex_to_rgb('#000000'))
                                    await asyncio.sleep_ms(300)
                        except asyncio.TimeoutError:
                            print(f"[{current_time()}] >>> Timeout waiting for weight data")
                            if is_getting_data:
                                is_getting_data = False

                    await connection.disconnect()
                    print(f"[{current_time()}] >>> Disconnected.")
                except asyncio.TimeoutError:
                    print(f"[{current_time()}] >>> Connection timeout.")
                except Exception as e:
                    print(f"[{current_time()}] >>> Connection error: {e}")
                break

    if not device_found:
        print(f"[{current_time()}] No matching device found.")
    print("================== BLE SCAN FINISHED =========================\n")

async def blink_led():
    while True:
        if is_getting_data:
            led_blink.on()
            await asyncio.sleep_ms(1000)
        else:
            led_blink.on()
            await asyncio.sleep_ms(1000)
            led_blink.off()
            await asyncio.sleep_ms(1000)

async def scan_loop():
    while True:
        try:
            await scan_and_connect()
        except Exception as e:
            print("Error in scan_loop:", e)
        await asyncio.sleep_ms(1000)

async def serial_handler():
    global latest_stable_weight
    global uart1
    poll = uselect.poll()
    poll.register(sys.stdin, uselect.POLLIN)

    while True:
        if poll.poll(0):
            line = sys.stdin.readline().strip().upper()
            if line == "GET_WEIGHT":
                if latest_stable_weight is not None:
                    print(f"[WEIGHT] Stable weight: {latest_stable_weight} kg")
                    latest_stable_weight = None
                else:
                    print("[WEIGHT] No stable weight yet")
            elif line == "GET_CCCD":
                if uart1:
                    send_command(uart1, TRIGGER_COMMAND)
                else:
                    print("[ERROR] UART not initialized")
            elif line == "STOP_CCCD":
                if uart1:
                    send_command(uart1, STOP_TRIGGER_COMMAND)
                else:
                    print("[ERROR] UART not initialized")
            else:
                print("[ERROR] Invalid command")
        await asyncio.sleep_ms(50)

async def read_qr_code():
    while True:
        if uart1 and uart1.any():
            data = uart1.read()
            if data:
                print("<< Raw data (bytes):", data)
                if data == b'\x02\x00\x00\x01\x0031':
                    print("[INFO] QR command toggled successfully!")
                else:
                    print(f"[QR] {data}")
        await asyncio.sleep_ms(50)

def setup():
    global uart1
    try:
        uart1 = UART(1, baudrate=115200, tx=Pin(17), rx=Pin(18))
        print("[INFO] UART1 initialized successfully.")
    except Exception as e:
        print("[ERROR] Failed to initialize UART1:", e)
        uart1 = None

async def main():
    setup()
    await asyncio.gather(
        blink_led(),
        scan_loop(),
        serial_handler(),
        read_qr_code()
    )

asyncio.run(main())
