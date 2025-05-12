import os
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'

import cv2
import json
import sys
import argparse
from deepface import DeepFace

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

            print(json.dumps(main_result), flush=True)

        except Exception as e:
            error_message = {"type": "error", "message": f"Face analysis failed: {str(e)}"}
            print(json.dumps(error_message), flush=True)

    def resize_if_needed(self, image):
        if image is None:
            raise ValueError("Invalid image provided.")

        height, width = image.shape[:2]
        if max(width, height) <= self.max_dim:
            return image  # không resize nếu ảnh đủ nhỏ

        scale = self.max_dim / max(width, height)
        new_size = (int(width * scale), int(height * scale))
        return cv2.resize(image, new_size, interpolation=cv2.INTER_AREA)

    def process_image(self, image_path):
        try:
            image = cv2.imread(image_path)
            if image is None:
                raise ValueError(f"Could not read image at path: {image_path}")

            resized_image = self.resize_if_needed(image)
            self.analyze_face(resized_image)
        except Exception as e:
            print(json.dumps({"type": "error", "message": f"Image processing failed: {str(e)}"}), flush=True)

# Call directly from command line
if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Analyze a face from an image.")
    parser.add_argument("--image", required=True, help="Path to the image file.")
    parser.add_argument("--maxdim", type=int, default=800, help="Max dimension for image resize (default: 800)")
    args = parser.parse_args()

    image_path = args.image
    max_dim = args.maxdim

    analyzer = FaceAnalyzer(max_dim=max_dim)
    analyzer.process_image(image_path)
