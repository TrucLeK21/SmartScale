import os
import sys
import math
import cv2
import cvzone
from cvzone.FaceMeshModule import FaceMeshDetector

# Optional: Suppress TensorFlow log warnings if needed
# os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'

# Check and parse arguments
if len(sys.argv) < 3:
    print("Usage: python script.py <angle_degrees> <ethnicity: asian or causian>")
    sys.exit(1)

try:
    angle_degrees = float(sys.argv[1])
    ethnicity = sys.argv[2].lower()
except ValueError:
    print("Invalid input. Angle must be a number.")
    sys.exit(1)

# Determine h1 based on ethnicity
if ethnicity == "asian":
    h1 = 12  # Distance from eyes to top of head for Asians
elif ethnicity == "causian":
    h1 = 13  # Distance for Caucasians (European descent)
else:
    print("Unsupported ethnicity. Use 'asian' or 'causian'.")
    sys.exit(1)

# h3 is the approximate distance from camera to ground minus eye level
h3 = 121.5  # Constant based on camera placement and average leg-torso height

# Define function to compute vertical leg (opposite) from hypotenuse and angle
def calc_opposite(hypotenuse, angle_degrees):
    angle_radians = math.radians(angle_degrees)
    return hypotenuse * math.sin(angle_radians)

# Initialize webcam and FaceMesh detector
cap = cv2.VideoCapture(0)
detector = FaceMeshDetector(maxFaces=1)

while True:
    success, img = cap.read()
    img, faces = detector.findFaceMesh(img, draw=False)

    if faces:
        face = faces[0]

        # Draw landmark indices for debugging (optional)
        for id, point in enumerate(face):
            cv2.putText(img, str(id), point, cv2.FONT_HERSHEY_SIMPLEX, 0.3, (255, 0, 0), 1)

        pointLeft = face[145]     # Left eye
        pointRight = face[374]    # Right eye
        pointMiddle = face[168]   # Midpoint between the eyes

        cv2.circle(img, pointMiddle, 5, (255, 0, 255), cv2.FILLED)

        # Measure eye-to-eye pixel distance
        w, _ = detector.findDistance(pointLeft, pointRight)

        # Real-world distance between eyes in centimeters
        W = 6.3
        
        # Finding the focal length
        # d = 30
        # f = (w * d) / W

        # Focal length (pre-calibrated)
        f = 261.9480

        # Calculate real-world distance from camera to eyes
        d = (W * f) / w

        # h2 is vertical component from eyes to camera position
        h2 = calc_opposite(hypotenuse=d, angle_degrees=angle_degrees)

        # Total height estimation
        height = h1 + h2 + h3
        print(f"Estimated height: {height:.2f} cm")

        # Optional: draw result on image
        # cvzone.putTextRect(img, f"Height: {int(height)}cm",
        #                    (face[10][0] - 100, face[10][1] - 15),
        #                    scale=2)

    cv2.imshow("Image", img)
    cv2.waitKey(1)
