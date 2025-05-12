import serial
import threading
import time
from pynput import keyboard

# Cấu hình cổng serial
PORT_NAME = 'COM8'  # Thay đổi nếu cần
BAUD_RATE = 115200

# Mở cổng serial
ser = serial.Serial(PORT_NAME, BAUD_RATE, timeout=1)

# Trạng thái phím để tránh gửi lệnh lặp
key_state = {
    'up': False,
    'down': False
}

# Hàm gửi lệnh
def send_command(cmd):
    if ser.is_open:
        ser.write((cmd + "\n").encode())
        print(f"Đã gửi: {cmd}")
    else:
        print("Serial port chưa mở")

# Xử lý khi ấn phím
def on_press(key):
    try:
        if key == keyboard.Key.up and not key_state['up']:
            key_state['up'] = True
            send_command("SERVO-MOVEUP")
        elif key == keyboard.Key.down and not key_state['down']:
            key_state['down'] = True
            send_command("SERVO-MOVEDN")
        elif key.char == 'g':  # Nhấn phím 'g' để lấy góc
            send_command("SERVO-GETANGLE")
    except AttributeError:
        pass

# Xử lý khi nhả phím
def on_release(key):
    if key == keyboard.Key.up:
        key_state['up'] = False
        send_command("SERVO-STOP")
    elif key == keyboard.Key.down:
        key_state['down'] = False
        send_command("SERVO-STOP")
    elif key == keyboard.Key.esc:
        print("Thoát chương trình")
        return False

# Thread để đọc dữ liệu trả về
def read_serial():
    buffer = []
    while True:
        try:
            if ser.in_waiting > 0:
                line = ser.readline().decode().strip()
                if line.startswith("ANGLE-"):
                    value = int(line.split("-")[1])
                    buffer.append(value)
                    if len(buffer) == 5:
                        average = sum(buffer) / 5
                        print(f"Góc trung bình: {average}")
                        buffer.clear()
                else:
                    print(f"Dữ liệu khác nhận được: {line}")
        except Exception as e:
            print("Lỗi khi đọc Serial:", e)
            break

# Bắt đầu thread đọc serial
threading.Thread(target=read_serial, daemon=True).start()

# Bắt đầu lắng nghe bàn phím
with keyboard.Listener(on_press=on_press, on_release=on_release) as listener:
    listener.join()

# Đóng serial khi thoát
ser.close()
