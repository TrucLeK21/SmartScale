import argparse
import base64
from Crypto.Cipher import AES
from pathlib import Path
from PIL import Image
import io
import os
import sys

parser = argparse.ArgumentParser()
parser.add_argument('--image', required=True)
parser.add_argument('--key', required=True)
parser.add_argument('--iv', required=True)
args = parser.parse_args()

# Decode key and IV from base64
key = base64.b64decode(args.key)
iv = base64.b64decode(args.iv)

# Read the encrypted image
with open(args.image, 'rb') as f:
    ciphertext = f.read()

# Decrypt the image
cipher = AES.new(key, AES.MODE_CBC, iv)
padded_data = cipher.decrypt(ciphertext)

# Remove padding (assuming null-byte padding)
img_data = padded_data.rstrip(b'\0')

# Try opening image with PIL (optional check)
try:
    image = Image.open(io.BytesIO(img_data))
    image.show(title="Decrypted Image")  # Opens the image in default viewer

    # Save it if needed
    tmp_image_path = 'decrypted_image.png'
    # if image.mode == 'RGBA':
    #     image = image.convert('RGB')

    image.save(tmp_image_path)
    print(f"Decrypted image saved to {tmp_image_path}")
except Exception as e:
    print("Failed to decode image:", e)
    sys.exit(1)
