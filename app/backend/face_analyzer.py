import os

os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'
import cv2
import json
import sys
import argparse
from deepface import DeepFace
import numpy as np
from Crypto.Cipher import AES
import base64
from height_estimate import estimate_height_from_image

class FaceAnalyzer:
    def __init__(self, max_dim=800):
        self.max_dim = max_dim

    def analyze_face(self, image):
        try:
            print(json.dumps({"type": "info", "message": "Analyzing face..."}), flush=True)

            analyze_result = DeepFace.analyze(
                img_path=image,
                actions=['age', 'gender', 'race'],
                detector_backend="mtcnn",  # dùng backend chính xác hơn
                enforce_detection=True     # bắt buộc phát hiện mặt rõ ràng
            )

            race_map = {
                'asian': 'AI',
                'indian': 'AI',
                'black': 'EA',
                'middle eastern': 'AI',
                'white': 'EA',
                'latino hispanic': 'AI'
            }

            race_group = race_map.get(analyze_result[0]['dominant_race'].lower(), 'Unknown')

            main_result = {
                'type': 'success',
                'age': analyze_result[0]['age'],
                'gender': analyze_result[0]['dominant_gender'],
                'race': race_group
            }

            return main_result

        except Exception as e:
            error_message = {"type": "error", "message": f"Face analysis failed: {str(e)}"}
            print(json.dumps(error_message), flush=True)
            return error_message

    def resize_if_needed(self, image):
        if image is None:
            raise ValueError("Invalid image provided.")

        height, width = image.shape[:2]
        if max(width, height) <= self.max_dim:
            return image  # không resize nếu ảnh đủ nhỏ

        scale = self.max_dim / max(width, height)
        new_size = (int(width * scale), int(height * scale))
        return cv2.resize(image, new_size, interpolation=cv2.INTER_AREA)


    def process_image(self, image_path, key_b64, iv_b64, angle_degrees):
        try:
            # Giải mã ảnh AES-256-CBC từ file đã mã hóa
            key = base64.b64decode(key_b64)
            iv = base64.b64decode(iv_b64)

            with open(image_path, 'rb') as f:
                encrypted_data = f.read()

            cipher = AES.new(key, AES.MODE_CBC, iv)
            padded_data = cipher.decrypt(encrypted_data)
            decrypted_data = padded_data.rstrip(b'\0')

            # Giải mã thành ảnh numpy từ bytes
            image_array = np.frombuffer(decrypted_data, dtype=np.uint8)
            image = cv2.imdecode(image_array, cv2.IMREAD_COLOR)

            if image is None:
                raise ValueError("Could not decode image from decrypted data.")
        

            resized_image = self.resize_if_needed(image)
            result = self.analyze_face(resized_image)
        
            if result.get("type") == "success" and "race" in result:
                race = "asian" if result["race"] == "AI" else "causian"
                height_result = estimate_height_from_image(resized_image, angle_degrees, race)

                if height_result.get("type") == "success":
                    result["height"] = height_result["height"]
                else:
                    result["height_error"] = height_result.get("message")
            
            print(json.dumps(result), flush=True)
    

        except Exception as e:
            error_result = {
                "type": "error",
                "message": f"Image processing failed: {str(e)}"
            }
            print(json.dumps(error_result), flush=True)

# Call directly from command line
if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Analyze a face from an image.")
    parser.add_argument("--image", required=False, help="Path to the image file.")
    parser.add_argument('--key', help="Base64 encoded key for decryption.")
    parser.add_argument('--iv', help="Base64 encoded IV for decryption.")
    parser.add_argument("--maxdim", type=int, default=800, help="Max dimension for image resize (default: 800)")
    parser.add_argument("--angle", type=int, default=0, help="Angle for height estimation (default: 0 degrees)")
    parser.add_argument("--init", action="store_true", help="Run initial setup (download models, test pipeline)")

    args = parser.parse_args()

    image_path = args.image
    max_dim = args.maxdim
    angle_degrees = args.angle
    key = args.key
    iv = args.iv

    analyzer = FaceAnalyzer(max_dim=max_dim)

    if args.init:
        # Dùng sẵn ảnh mặc định để chạy test
        default_image_path = os.path.join(os.path.dirname(__file__), "images", "demo.png")
        print(json.dumps({"type": "info", "message": "Running initial setup, using default image: {}".format(default_image_path)}), flush=True)

        if not os.path.exists(default_image_path):
            print(json.dumps({"type": "error", "message": f"Default image not found at {default_image_path}."}), flush=True)
            sys.exit(1)

        try:
            image = cv2.imread(default_image_path)
            if image is None:
                raise ValueError("Cannot read default image.")

            resized = analyzer.resize_if_needed(image)
            result = analyzer.analyze_face(resized)

            # 👉 Thêm dòng sau để hiển thị kết quả phân tích khuôn mặt
            print(json.dumps({"type": "result", "data": result}, indent=2, ensure_ascii=False), flush=True)

            print(json.dumps({"type": "info", "message": "Initial setup completed successfully."}), flush=True)
        except Exception as e:
            print(json.dumps({"type": "error", "message": f"Init failed: {str(e)}"}), flush=True)
        sys.exit(0)


    if not key or not iv:
        print(json.dumps({"type": "error", "message": "Missing encryption key or IV."}), flush=True)
        sys.exit(1)

    analyzer.process_image(image_path, key, iv, angle_degrees)

    # Optionally delete image after processing
    # if os.path.exists(image_path):
    #     os.remove(image_path)
