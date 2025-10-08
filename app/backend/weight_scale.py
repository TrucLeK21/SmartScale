#!/usr/bin/python3

import asyncio
from bleak import BleakClient, BleakScanner
import json
import time
import sys

WEIGHT_MEASUREMENT_UUID = "00002A9D-0000-1000-8000-00805F9B34FB"
SCALE_NAME = "MI SCALE2"  # Sử dụng tên thay vì MAC

last_received_time = time.time()
is_stable_detected = False

def print_json(data):
    print(json.dumps(data))
    sys.stdout.flush()

def parse_weight_data(data):
    is_stable = (data[0] & (1 << 5)) != 0
    is_removed = (data[0] & (1 << 7)) != 0
    weight = int.from_bytes(data[1:3], byteorder="little") / 200

    return {
        "weightStatus": "measuring",
        "isStable": is_stable,
        "isRemoved": is_removed,
        "weight": weight
    }

# Tìm thiết bị theo tên
async def scan_scale():
    print_json({
        "weightStatus": "info",
        "message": f"Finding {SCALE_NAME}..."
    })
    return await BleakScanner.find_device_by_name(SCALE_NAME, timeout=30.0)

# Xử lý dữ liệu khi scale gửi về
def handle_notification(sender, data):
    global last_received_time, is_stable_detected

    last_received_time = time.time()
    payload = parse_weight_data(data)

    if not payload["isRemoved"]:
        print_json(payload)
    else:
        print_json({
            "weightStatus": "info",
            "message": "Weight is removed"
        })

    if payload["isStable"]:
        is_stable_detected = True

# Giao tiếp BLE và chờ dữ liệu
async def get_weight_data():
    global is_stable_detected, last_received_time

    # Kết nối theo tên thiết bị
    scale = await scan_scale()
    if scale is None:
        print_json({
            "weightStatus": "error",
            "message": "Failed to find scale by name"
        })
        return

    async with BleakClient(scale.address) as client:
        try:
            if not client.is_connected:
                await client.connect()

            if client.is_connected:
                print_json({
                    "weightStatus": "info",
                    "message": f"Connected to {SCALE_NAME} successfully"
                })

                await client.start_notify(WEIGHT_MEASUREMENT_UUID, handle_notification)

                # Giữ kết nối cho tới khi thiết bị ngắt kết nối
                while client.is_connected:
                    await asyncio.sleep(1)  # Chờ và tiếp tục nhận thông báo từ cân

                print_json({
                    "weightStatus": "info",
                    "message": "Scale disconnected"
                })
            else:
                print_json({
                    "weightStatus": "error",
                    "message": f"Failed to connect to {SCALE_NAME}"
                })

        except Exception as e:
            print_json({
                "weightStatus": "error",
                "message": str(e)
            })

        # finally:
        #     if client.is_connected:
        #         await client.disconnect()

asyncio.run(get_weight_data())
