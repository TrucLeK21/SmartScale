import React, { useRef, useEffect, useState } from "react";
import Webcam from "react-webcam";
import FaceDetection from "@mediapipe/face_detection";
import { Camera } from "@mediapipe/camera_utils";
import { Modal, Button, Form } from "react-bootstrap";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGear } from '@fortawesome/free-solid-svg-icons'

const resolutions = [
  { label: "640x480", width: 640, height: 480 },
  { label: "960x540", width: 960, height: 540 },
  { label: "1280x720", width: 1280, height: 720 },
];

const Face: React.FC = () => {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [detections, setDetections] = useState<FaceDetection.DetectionList>([]);
  const [cameraView, setCameraView] = useState({ width: 960, height: 540 });
  const [showModal, setShowModal] = useState(false);
  const [selectedRes, setSelectedRes] = useState(resolutions[0].label);

  useEffect(() => {
    let camera: Camera | null = null;

    const fixedBox = {
      x: (cameraView.width - 320) / 2,
      y: (cameraView.height - 320) / 2,
      width: 320,
      height: 320,
    };

    const faceDetection = new FaceDetection.FaceDetection({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/${file}`,
    });

    faceDetection.setOptions({
      model: "short",
      minDetectionConfidence: 0.5,
    });

    faceDetection.onResults((results) => {
      const canvas = canvasRef.current;
      const video = webcamRef.current?.video;
      if (!canvas || !video) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      ctx.beginPath();
      ctx.rect(fixedBox.x, fixedBox.y, fixedBox.width, fixedBox.height);
      ctx.lineWidth = 3;
      ctx.strokeStyle = "lime";
      ctx.stroke();

      const validDetections: FaceDetection.Detection[] = [];

      results.detections.forEach((detection) => {
        const box = detection.boundingBox;
        const x = (box.xCenter - box.width / 2) * canvas.width;
        const y = (box.yCenter - box.height / 2) * canvas.height;
        const width = box.width * canvas.width;
        const height = box.height * canvas.height;

        const isInside =
          x >= fixedBox.x &&
          y >= fixedBox.y &&
          x + width <= fixedBox.x + fixedBox.width &&
          y + height <= fixedBox.y + fixedBox.height;

        if (isInside) {
          validDetections.push(detection);
          ctx.beginPath();
          ctx.rect(x, y, width, height);
          ctx.lineWidth = 2;
          ctx.strokeStyle = "red";
          ctx.stroke();
        }
      });

      setDetections(validDetections);
    });

    const tryInitializeCamera = () => {
      const videoElement = webcamRef.current?.video;
      if (videoElement) {
        camera = new Camera(videoElement, {
          onFrame: async () => {
            await faceDetection.send({ image: videoElement });
          },
          width: cameraView.width,
          height: cameraView.height,
        });
        camera.start();
      } else {
        setTimeout(tryInitializeCamera, 200);
      }
    };

    tryInitializeCamera();

    return () => {
      camera?.stop();
      faceDetection.close();
    };
  }, [cameraView]); // Re-run on resolution change

  const handleChangeResolution = () => {
    const selected = resolutions.find((r) => r.label === selectedRes);
    if (selected) {
      setCameraView({ width: selected.width, height: selected.height });
    }
    setShowModal(false);
  };

  return (
    <div
      className="container-fluid d-flex justify-content-center align-items-center"
      style={{ height: "100%" }}
    >
      <div
        style={{
          position: "relative",
          width: `${cameraView.width}px`,
          height: `${cameraView.height}px`,
        }}
      >
        <button
          className="btn btn-light"
          onClick={() => setShowModal(true)}
          style={{ position: "absolute", top: 10, right: 10, zIndex: 10 }}
        >
            <FontAwesomeIcon icon={faGear} />
        </button>

        <Webcam
          ref={webcamRef}
          audio={false}
          screenshotFormat="image/jpeg"
          style={{ position: "absolute", top: 0, left: 0, zIndex: 1, borderRadius: "20px" }}
          videoConstraints={{
            width: { exact: cameraView.width },
            height: { exact: cameraView.height },
            facingMode: "user",
          }}
        />

        <canvas
          style={{ position: "absolute", top: 0, left: 0, zIndex: 2, borderRadius: "20px" }}
          ref={canvasRef}
          width={cameraView.width}
          height={cameraView.height}
        />

        <div
          style={{
            position: "absolute",
            bottom: 10,
            left: 10,
            zIndex: 3,
            color: "white",
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            padding: "5px",
            borderRadius: "3px",
          }}
        >
          {detections.length > 0 ? (
            <p>Face detected inside box</p>
          ) : (
            <p>Please align your face inside the green box</p>
          )}
        </div>
      </div>

      {/* Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Camera Resolution</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Select
            value={selectedRes}
            onChange={(e) => setSelectedRes(e.target.value)}
          >
            {resolutions.map((res) => (
              <option key={res.label} value={res.label}>
                {res.label}
              </option>
            ))}
          </Form.Select>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleChangeResolution}>
            Apply
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Face;
