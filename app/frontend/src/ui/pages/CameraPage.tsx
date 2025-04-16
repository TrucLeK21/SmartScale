import React, { useRef, useEffect, useState } from "react";
import Webcam from "react-webcam";
import FaceDetection from "@mediapipe/face_detection";
import { Camera } from "@mediapipe/camera_utils";
import { Modal, Button, Form } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGear } from "@fortawesome/free-solid-svg-icons";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LoadingScreen from "../components/LoadingScreen";
import { useNavigate } from "react-router-dom";

const resolutions = [
  { label: "640x480", width: 640, height: 480 },
  { label: "960x540", width: 960, height: 540 },
  { label: "1280x720", width: 1280, height: 720 },
];

const CAPTURE_DELAY = 3000; // Thời gian chờ trước khi chụp (ms)

const Face: React.FC = () => {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [detections, setDetections] = useState<FaceDetection.Detection[]>([]);
  const [cameraView, setCameraView] = useState({ width: 960, height: 540 });
  const [showModal, setShowModal] = useState(false);
  const [selectedRes, setSelectedRes] = useState(resolutions[1].label);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const faceInBoxStartTimeRef = useRef<number | null>(null);
  const navigate = useNavigate();


  useEffect(() => {
    let camera: Camera | null = null;
    let isCancelled = false;

    const faceDetection = new FaceDetection.FaceDetection({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/${file}`,
    });

    faceDetection.setOptions({
      model: "short",
      minDetectionConfidence: 0.5,
    });

    // Tính toán fixedBox trong useEffect để cập nhật khi cameraView thay đổi
    const fixedBox = {
      x: (cameraView.width - 320) / 2,
      y: (cameraView.height - 320) / 2,
      width: 320,
      height: 320,
    };

    faceDetection.onResults((results) => {
      if (isCancelled) return;
      const canvas = canvasRef.current;
      const video = webcamRef.current?.video;
      if (!canvas || !video) {
        console.error("Canvas or video not available");
        return;
      }

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        console.error("Canvas context not available");
        return;
      }


      // Đồng bộ kích thước canvas với cameraView
      canvas.width = cameraView.width;
      canvas.height = cameraView.height;

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

      // Logic chụp ảnh
      if (validDetections.length > 0) {
        if (!faceInBoxStartTimeRef.current) {
          console.log("Starting timer for capture");
          faceInBoxStartTimeRef.current = Date.now();
        } else if (Date.now() - faceInBoxStartTimeRef.current >= CAPTURE_DELAY) {
          console.log("Capturing photo");
          handleCapture();
          faceInBoxStartTimeRef.current = null;
        }
      } else {
        if (faceInBoxStartTimeRef.current) {
          console.log("Resetting timer: no face in box");
          faceInBoxStartTimeRef.current = null;
        }
      }
    });

    const tryInitializeCamera = () => {
      const videoElement = webcamRef.current?.video;
      if (videoElement && !isCancelled) {
        camera = new Camera(videoElement, {
          onFrame: async () => {
            if (!isCancelled) {
              await faceDetection.send({ image: videoElement });
            }
          },
          width: cameraView.width,
          height: cameraView.height,
        });
        camera
          .start()
          .catch((err) => {
            console.error("Failed to start camera:", err);
            if (!isCancelled) {
              setError("Failed to access webcam. Please check permissions or device.");
            }
          });
      } else if (!isCancelled) {
        setTimeout(tryInitializeCamera, 500);
      }
    };

    tryInitializeCamera();

    return () => {
      isCancelled = true;
      camera?.stop();
      faceDetection.close();
    };
  }, [cameraView]);


  const handleCapture = () => {
    const video = webcamRef.current?.video;

    if (!video) {
      console.error("Video not available");
      toast.error("Failed to capture photo: Video not available");
      return;
    }

    // Tạo canvas tạm thời để chụp ảnh từ video
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = cameraView.width;
    tempCanvas.height = cameraView.height;
    const tempCtx = tempCanvas.getContext("2d");
    if (!tempCtx) {
      console.error("Temp canvas context not available");
      toast.error("Failed to capture photo: Canvas context not available");
      return;
    }

    // Vẽ khung hình từ video lên canvas tạm thời
    tempCtx.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height);

    // Tạo canvas để cắt vùng khung xanh
    const croppedCanvas = document.createElement("canvas");
    croppedCanvas.width = 320;
    croppedCanvas.height = 320;
    const croppedCtx = croppedCanvas.getContext("2d");
    if (!croppedCtx) {
      console.error("Cropped canvas context not available");
      toast.error("Failed to capture photo: Cropped canvas context not available");
      return;
    }

    // Cắt vùng khung xanh từ canvas tạm thời
    croppedCtx.drawImage(
      tempCanvas,
      (cameraView.width - 320) / 2,
      (cameraView.height - 320) / 2,
      320,
      320,
      0,
      0,
      320,
      320
    );

    const croppedImage = croppedCanvas.toDataURL("image/png");
    window.electronAPI.saveImage(croppedImage);

    // Hiển thị thông báo chụp ảnh thành công
    toast.success("Ảnh được chụp thành công!", {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: false,
      draggable: true,
    });

    setTimeout(() => {
      navigate('/test');
    }, 2000);
  };

  const handleChangeResolution = () => {
    const selected = resolutions.find((r) => r.label === selectedRes);
    if (selected) {
      setCameraView({ width: selected.width, height: selected.height });
    }
    setShowModal(false);
  };

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) return <LoadingScreen message="Starting the application..." />;

  if (error) {
    return (
      <div className="container-fluid d-flex justify-content-center align-items-center" style={{ height: "100%" }}>
        <div className="text-danger">{error}</div>
      </div>
    );
  }

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
          screenshotFormat="image/png"
          style={{ position: "absolute", top: 0, left: 0, zIndex: 1, borderRadius: "20px" }}
          videoConstraints={{
            width: { ideal: cameraView.width },
            height: { ideal: cameraView.height },
            facingMode: "user",
          }}
          onUserMediaError={(err) => {
            console.error("Webcam error:", err);
            setError("Failed to access webcam or unsupported resolution. Please try another resolution.");
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

      <ToastContainer aria-label={undefined} />
    </div>
  );
};

export default Face;