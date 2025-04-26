import serial
import time
import serial.tools.list_ports

# Function to list available serial ports
def list_serial_ports():
    ports = serial.tools.list_ports.comports()
    if not ports:
        print("No serial ports found.")
        return None
    for port in ports:
        print(f"Port: {port.device}, Description: {port.description}")
    return [port.device for port in ports]

# Function to open serial port with retries
def open_serial_port(port_name, baudrate, retries=3, delay=2):
    for attempt in range(retries):
        try:
            ser = serial.Serial(
                port=port_name,
                baudrate=baudrate,
                timeout=1  # 1-second timeout for reading
            )
            print(f"Serial port {port_name} opened successfully")
            return ser
        except serial.SerialException as e:
            print(f"Attempt {attempt + 1} failed: {e}")
            if attempt < retries - 1:
                time.sleep(delay)
    raise serial.SerialException(f"Could not open serial port {port_name} after {retries} retries")

# Function to wait for SERVO-START message while printing all received messages
def wait_for_servo_start(ser, timeout=30):
    start_time = time.time()
    print("Waiting for SERVO-START message...")
    
    while time.time() - start_time < timeout:
        try:
            line = ser.readline().decode('utf-8').strip()
            if line:
                print(f"Received: {line}")
                if line == "SERVO-START":
                    print("SERVO-START detected. Servo is ready.")
                    return True
        except UnicodeDecodeError:
            print("Received invalid data, skipping...")
        time.sleep(0.01)  # Short delay to avoid CPU overload
    raise TimeoutError("Timeout waiting for SERVO-START message")

# Function to read and print all serial messages continuously
def read_serial_messages(ser):
    print("Continuously reading serial messages...")
    while True:
        try:
            line = ser.readline().decode('utf-8').strip()
            if line:
                print(f"Received: {line}")
        except UnicodeDecodeError:
            print("Received invalid data, skipping...")
        except KeyboardInterrupt:
            print("Stopped reading serial messages")
            break
        time.sleep(0.01)  # Short delay to avoid CPU overload

# Main function to communicate with servo and print all serial messages
def communicate_with_servo(port_name='COM8', baudrate=115200):
    # List available ports to confirm COM8 exists
    available_ports = list_serial_ports()
    if not available_ports or port_name not in available_ports:
        print(f"Port {port_name} not found. Available ports: {available_ports}")
        return

    ser = None
    try:
        # Open serial port
        ser = open_serial_port(port_name, baudrate)
        time.sleep(3)  # Wait for ESP32 initialization (e.g., after reset)

        # Wait for SERVO-START while printing all messages
        wait_for_servo_start(ser)

        # Send SERVO-GETANGLE command
        command = b'SERVO-GETANGLE\n'
        ser.write(command)
        print(f"Sent: {command.decode().strip()}")

        # Continue reading and printing all serial messages
        read_serial_messages(ser)

    except serial.SerialException as e:
        print(f"Serial error: {e}")
    except TimeoutError as e:
        print(f"Timeout error: {e}")
    except Exception as e:
        print(f"Unexpected error: {e}")
    finally:
        # Close the serial port
        if ser and ser.is_open:
            ser.close()
            print(f"Serial port {port_name} closed")

# Run the script
if __name__ == "__main__":
    communicate_with_servo(port_name='COM8', baudrate=115200)