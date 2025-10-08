import os, sys
sys.path.append(os.path.dirname(__file__))
import cv2
import json
import base64
import numpy as np
from flask import Flask, request, jsonify
from deepface import DeepFace
from Crypto.Cipher import AES
from height_estimate import estimate_height_from_image
import time

app = Flask(__name__)


class FaceAnalyzer:
    def __init__(self, max_dim=800):
        self.max_dim = max_dim

    def resize_if_needed(self, image):
        if image is None:
            raise ValueError("Invalid image provided.")

        h, w = image.shape[:2]
        if max(w, h) <= self.max_dim:
            return image
        scale = self.max_dim / max(w, h)
        new_size = (int(w * scale), int(h * scale))
        return cv2.resize(image, new_size, interpolation=cv2.INTER_AREA)

    def analyze_face(self, image):
        analyze_result = DeepFace.analyze(
            img_path=image,
            actions=["age", "gender", "race"],
            detector_backend="mtcnn",
            enforce_detection=True,
        )

        race_map = {
            "asian": "AI",
            "indian": "AI",
            "black": "EA",
            "middle eastern": "AI",
            "white": "EA",
            "latino hispanic": "AI",
        }

        race_group = race_map.get(analyze_result[0]["dominant_race"].lower(), "Unknown")

        return {
            "type": "success",
            "age": analyze_result[0]["age"],
            "gender": analyze_result[0]["dominant_gender"],
            "race": race_group,
        }

    def process_image(self, encrypted_data, key_b64, iv_b64, angle_degrees):
        key = base64.b64decode(key_b64)
        iv = base64.b64decode(iv_b64)

        cipher = AES.new(key, AES.MODE_CBC, iv)
        padded_data = cipher.decrypt(encrypted_data)
        decrypted_data = padded_data.rstrip(b"\0")

        image_array = np.frombuffer(decrypted_data, dtype=np.uint8)
        image = cv2.imdecode(image_array, cv2.IMREAD_COLOR)

        if image is None:
            return {"type": "error", "message": "Could not decode image"}

        resized = self.resize_if_needed(image)
        result = self.analyze_face(resized)

        if result["type"] == "success" and "race" in result:
            race = "asian" if result["race"] == "AI" else "causian"
            height_result = estimate_height_from_image(resized, angle_degrees, race)

            if height_result.get("type") == "success":
                result["height"] = height_result["height"]
            else:
                result["height_error"] = height_result.get("message")

        return result


analyzer = FaceAnalyzer()


@app.route("/analyze", methods=["POST"])
def analyze():
    start_time = time.time()  # Bắt đầu tính thời gian
    try:

        data = request.json
        encrypted_b64 = data.get("image")
        key = data.get("key")
        iv = data.get("iv")
        angle = int(data.get("angle", 0))

        if not encrypted_b64 or not key or not iv:
            return jsonify({"type": "error", "message": "Missing required fields"}), 400

        encrypted_data = base64.b64decode(encrypted_b64)

        result = analyzer.process_image(encrypted_data, key, iv, angle)
        elapsed = round((time.time() - start_time) * 1000, 2)  # ms

        # In log chi tiết để debug
        print("=== Face Analysis Debug Log ===")
        print(f"Angle: {angle}")
        print(f"Decoded image length: {len(base64.b64decode(encrypted_b64))} bytes")
        print(f"Analysis Result: {json.dumps(result, ensure_ascii=False)}")
        print(f"Execution Time: {elapsed} ms")
        print("===============================")

        return jsonify(result)
    except Exception as e:
        print("error:", e)
        return jsonify({"type": "error", "message": str(e)}), 500


@app.route("/init", methods=["GET"])
def init_route():
    try:
        default_image_path = os.path.join(
            os.path.dirname(__file__), "images", "demo.png"
        )
        if not os.path.exists(default_image_path):
            return (
                jsonify(
                    {
                        "type": "error",
                        "message": f"Default image not found at {default_image_path}",
                    }
                ),
                404,
            )

        image = cv2.imread(default_image_path)
        if image is None:
            return (
                jsonify({"type": "error", "message": "Cannot read default image"}),
                500,
            )

        resized = analyzer.resize_if_needed(image)
        result = analyzer.analyze_face(resized)

        print(
            json.dumps({"type": "result", "data": result}, ensure_ascii=False),
            flush=True,
        )
        print(
            json.dumps(
                {"type": "info", "message": "Init route executed successfully"},
                ensure_ascii=False,
            ),
            flush=True,
        )

        return jsonify({"type": "success", "message": "Init completed", "data": result})
    except Exception as e:
        return jsonify({"type": "error", "message": f"Init failed: {str(e)}"}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=False)
