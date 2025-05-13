import os
import math
import cv2
import json
import sys
from cvzone.FaceMeshModule import FaceMeshDetector

# Suppress TensorFlow and OpenCV logs if needed
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'

# Constants
INTER_EYE_DISTANCE_CM = 6.3           # Real-world distance between eyes
# FOCAL_LENGTH = 261.9480               # Pre-calibrated focal length
FOCAL_LENGTH = 450               # Pre-calibrated focal length
ETHNICITY_HEAD_HEIGHT = {
    "asian": 12,                      # Eyes to top of head
    "causian": 13                    # Caucasians (European descent)
}
# CAMERA_TO_GROUND_MINUS_EYE = 121.5    # Camera height offset
CAMERA_TO_GROUND_MINUS_EYE = 117    # Camera height offset

# Helper function: calculate vertical height component
def calc_opposite(hypotenuse, angle_degrees):
    # print(f"Calculating opposite side with hypotenuse: {hypotenuse}, angle: {angle_degrees}")
    angle_radians = math.radians(angle_degrees)
    return hypotenuse * math.sin(angle_radians)

# Main function to estimate height
def estimate_height_from_image(image, angle_degrees, ethnicity):
    try:
        ethnicity = ethnicity.lower()
        if ethnicity not in ETHNICITY_HEAD_HEIGHT:
            return {"type": "error", "message": "Unsupported ethnicity"}

        h1 = ETHNICITY_HEAD_HEIGHT[ethnicity]
        h3 = CAMERA_TO_GROUND_MINUS_EYE

        detector = FaceMeshDetector(maxFaces=1)
        img, faces = detector.findFaceMesh(image, draw=False)

        if not faces:
            return {"type": "error", "message": "No face detected"}

        face = faces[0]
        pointLeft = face[145]     # Left eye
        pointRight = face[374]    # Right eye

        w, _ = detector.findDistance(pointLeft, pointRight)
        if w == 0:
            return {"type": "error", "message": "Invalid eye distance"}

        d = (INTER_EYE_DISTANCE_CM * FOCAL_LENGTH) / w
        h2 = calc_opposite(d, angle_degrees)

        height = h1 + h2 + h3
        return {"type": "success", "height": int(height)}

    except Exception as e:
        return {"type": "error", "message": f"Processing failed: {str(e)}"}

def calibrate_focal_length(real_eye_distance_cm):
    cap = cv2.VideoCapture(0)
    detector = FaceMeshDetector(maxFaces=1)

    print("Calibration started. Press 'q' to quit.")

    while True:
        success, img = cap.read()
        if not success:
            continue

        img, faces = detector.findFaceMesh(img, draw=False)
        if faces:
            face = faces[0]
            pointLeft = face[145]
            pointRight = face[374]
            w, _ = detector.findDistance(pointLeft, pointRight)

            if w > 0:
                f = (w * real_eye_distance_cm) / INTER_EYE_DISTANCE_CM
                cv2.putText(img, f"Focal length: {f:.2f}", (30, 60),
                            cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)

        cv2.imshow("Calibration", img)
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()

# Optional test entry point
def show_help():
    print("Usage:")
    print("  python height_estimator.py <angle_degrees> <ethnicity>")
    print("Example:")
    print("  python height_estimator.py 20 asian")
    print("Calibration mode:")
    print("  python height_estimator.py --calibrate <eye_distance_cm>")
    print("    Estimate focal length based on real eye-to-camera distance.")
    print("Supported ethnicities: asian, causian")

def run_calibration_mode(args):
    if len(args) < 3:
        print(json.dumps({"type": "error", "message": "Usage: python height_estimator.py --calibrate <eye_distance_cm>"}))
        sys.exit(1)

    try:
        real_eye_distance_cm = float(args[2])
    except ValueError:
        print(json.dumps({"type": "error", "message": "Invalid eye distance input"}))
        sys.exit(1)

    calibrate_focal_length(real_eye_distance_cm)

def run_height_estimation(angle_degrees, ethnicity):
    cap = cv2.VideoCapture(0)
    print("Press SPACE to capture image for height estimation. Press 'q' to quit.")

    while True:
        success, frame = cap.read()
        if not success:
            continue

        cv2.imshow("Capture", frame)
        key = cv2.waitKey(1) & 0xFF

        if key == ord(' '):  # Capture image
            image = frame.copy()
            result = estimate_height_from_image(image, angle_degrees, ethnicity)
            print(json.dumps(result))
            break

        elif key == ord('q'):  # Exit
            print(json.dumps({"type": "error", "message": "User exited without capturing"}))
            break

    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    if "--help" in sys.argv or "-h" in sys.argv:
        show_help()
        sys.exit(0)

    if "--calibrate" in sys.argv:
        run_calibration_mode(sys.argv)
        sys.exit(0)

    if len(sys.argv) < 3:
        print(json.dumps({"type": "error", "message": "Usage: python height_estimator.py <angle_degrees> <ethnicity>"}))
        sys.exit(1)

    try:
        angle_degrees = float(sys.argv[1])
        ethnicity = sys.argv[2].lower()
    except ValueError:
        print(json.dumps({"type": "error", "message": "Invalid input"}))
        sys.exit(1)

    run_height_estimation(angle_degrees, ethnicity)

