import os
# os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3' 
import cv2
import cvzone
from cvzone.FaceMeshModule import FaceMeshDetector
import math


def calc_opposite(hypotenuse, angle_degrees):
    # Chuyển độ sang radian vì math.sin dùng radian
    angle_radians = math.radians(angle_degrees)
    opposite = hypotenuse * math.sin(angle_radians)
    return opposite

cap = cv2.VideoCapture(0)
detector = FaceMeshDetector(maxFaces=1)

while True:
    success, img = cap.read()
    img, faces = detector.findFaceMesh(img, draw=False)
    
    
    if faces: 
        face = faces[0]
        pointLeft  = face[145]
        pointRight = face[374]
        
        # Draw the points and line between them
        # cv2.line(img, pointLeft, pointRight, (0, 200, 0), 3)
        # cv2.circle(img, pointLeft, 5, (255, 0, 255), cv2.FILLED)
        # cv2.circle(img, pointRight, 5, (255, 0, 255), cv2.FILLED)
        w, _ = detector.findDistance(pointLeft, pointRight)
        
        W = 6.3  # The space between the eyes in cm
        # Finding the focal length
        # d = 30
        # f = (w * d) / W
        
        # print(f)
        f = 261.9480
        d = (W*f)/w
        # print(d)
        
        h1 = calc_opposite(hypotenuse=d, angle_degrees=45)
        
        # the distance from camera to the ground plus from the eyes to the top of the head 
        h2 = 134 + 12 + 4
        
        height = h1 + h2
        print(d)
        
        cvzone.putTextRect(img, f"Distance: {int(height)}cm",
                           (face[10][0]-100, face[10][1]-15),
                           scale=2, )
        
        
    cv2.imshow("Image", img)
    cv2.waitKey(1)