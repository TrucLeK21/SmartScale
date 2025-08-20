# Smart Health Device – Yolo UNO with MicroPython

This repository contains the source code for a **smart health device** running on **Yolo UNO** with MicroPython.  
The device is designed to:

- Measure **weight** via BLE.
- Scan **barcodes**.
- Communicate with a **health application** through serial data exchange.

> Learn more about the Yolo UNO board here:  
> [Yolo UNO – Official Documentation](https://docs.ohstem.vn/en/latest/yolo_uno/yolo_uno_khoi_lenh/gioi_thieu_yolo_uno.html)

---

## Features

- **BLE Weight Measurement**: Retrieves weight data from a connected scale.
- **Barcode Scanning**: Supports scanning barcodes for quick data input.
- **Serial Communication**: Transfers data between Yolo UNO and the health app via UART/USB serial.

---

## Commands

| Command      | Description                                |
| ------------ | ------------------------------------------ |
| `GET_WEIGHT` | Request weight measurement via BLE.        |
| `GET_CCCD`   | Start scanning barcode/QR code (e.g., ID). |
| `STOP_CCCD`  | Stop the barcode scanning process.         |

---

## Serial Message Format

- `[WEIGHT]` → Weight measurement data
- `[QR]` → Barcode/QR code data from GM65
- `[ERROR]` → Error messages or invalid responses

> These tags allow you to filter only useful results and ignore raw logs.

---

## Installation

### Requirements

- [Thonny IDE](https://thonny.org/)
- Yolo UNO board with MicroPython firmware installed.

### Install Required Package

This project requires the **aioble** package for BLE functionality.

To install it in Thonny:

1. Open **Thonny IDE**.
2. Connect your Yolo UNO to the computer.
3. Go to **Tools → Manage packages**.
4. Search for `aioble`.
5. Click **Install**.

---

## Usage

1. Flash this source code to your Yolo UNO using **Thonny**.
2. Power on the board.
3. The system will:
   - Connect via BLE to the weight scale.
   - Scan barcodes when available.
   - Send data to the health app through serial communication.

---
