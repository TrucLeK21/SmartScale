import sys
import os

print("=== Python Embedded Runtime Test ===")
print("Python version:", sys.version)
print("Python executable:", sys.executable)
print("Python prefix:", sys.prefix)
print("Current working directory:", os.getcwd())

try:
    import math, json, datetime
    print("Standard libraries loaded successfully!")
except Exception as e:
    print("Error loading stdlib:", e)

print("Embedded Python is working!")
