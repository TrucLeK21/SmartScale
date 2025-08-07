# Smart Scale Project Setup Guide

This document explains how to set up and run both the **Frontend** (Electron + React) and **Backend** (Python) parts of the project.

---
## Prerequisite: Install Visual Studio Build Tools (Windows Only)
You need to install the **Visual Studio Build Tools**:

### **Steps to Install Visual Studio Build Tools:**

1. **Download the installer:**  
https://visualstudio.microsoft.com/visual-cpp-build-tools/

2. **During installation, make sure to select the following components:**
   - **Desktop development with C++**
   - **MSVC v142 or newer** (C++ x64/x86 build tools)
   - **Windows 10 SDK** (or **Windows 11 SDK** depending on your system)
   - **C++ CMake tools for Windows**

## Frontend Setup (Electron + React)

### Install Dependencies
First, navigate to the `frontend` directory and install the required Node.js packages:

```bash
cd frontend
npm install
```

### Run in Development Mode
To start the application in development mode (hot reload, debugging enabled):

```bash
npm run dev
```

This will launch the Electron app with live reload on file changes.

### Build for Windows
To package the Electron app for Windows:

```bash
npm run dist:win
```

The built application will be located in the `dist/` directory after the process completes.

---

## Backend Setup (Python)

### Create a Virtual Environment (Recommended)
Navigate to the `backend` folder and create a Python virtual environment:

```bash
cd backend
python -m venv venv
```

Activate the virtual environment:
- On Windows:
  ```bash
  venv\Scripts\activate
  ```
- On macOS/Linux:
  ```bash
  source venv/bin/activate
  ```

### Install Python Modules
Once the virtual environment is activated, install the required Python modules:

```bash
pip install -r requirements.txt
```

---

## Notes
- Make sure Node.js and Python are installed before proceeding.
- Use Node.js v16+ and Python 3.8+ for best compatibility.
- Always avoid pushing `venv/` and `node_modules/` folders to the Git repository.
