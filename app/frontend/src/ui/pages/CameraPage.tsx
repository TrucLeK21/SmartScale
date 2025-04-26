import React, { useRef, useEffect, useState, useCallback } from "react";
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
import { analyzeFaceSound } from "../../assets/sounds";

const resolutions = [
  { label: "640x480", width: 640, height: 480 },
  { label: "960x540", width: 960, height: 540 },
  { label: "1280x720", width: 1280, height: 720 },
];

const CAPTURE_DELAY = 3000;

const Face: React.FC = () => {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [detections, setDetections] = useState<FaceDetection.Detection[]>([]);
  const [cameraView, setCameraView] = useState({ width: 960, height: 540 });
  const [deviceId, setDeviceId] = useState<string | undefined>(undefined);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedRes, setSelectedRes] = useState(resolutions[1].label);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const faceInBoxStartTimeRef = useRef<number | null>(null);
  const lastCommandRef = useRef<string | null>(null);
  const navigate = useNavigate();

  const handleCapture = useCallback(() => {
    const video = webcamRef.current?.video;
    if (!video) {
      toast.error("Failed to capture photo: Video not available");
      return;
    }
  
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = cameraView.width;
    tempCanvas.height = cameraView.height;
    const tempCtx = tempCanvas.getContext("2d");
    if (!tempCtx) {
      toast.error("Failed to capture photo: Canvas context not available");
      return;
    }
  
    tempCtx.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height);
  
    const croppedCanvas = document.createElement("canvas");
    croppedCanvas.width = 320;
    croppedCanvas.height = 320;
    const croppedCtx = croppedCanvas.getContext("2d");
    if (!croppedCtx) {
      toast.error("Failed to capture photo: Cropped canvas context not available");
      return;
    }
  
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
    window.electronAPI.startFaceAnalyzer(croppedImage);
  
    toast.success("Ảnh được chụp thành công!", {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: false,
      draggable: true,
    });
  
    setTimeout(() => {
      navigate("/weight");
    }, 2000);
  }, [cameraView.width, cameraView.height, navigate]);

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
      if (!canvas || !video) return;
    
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
    
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
    
      // Handle case when no faces are detected
      if (results.detections.length === 0) {
        if (lastCommandRef.current !== "stop") {
          window.electronAPI.rotateCamera("stop");
          lastCommandRef.current = "stop";
        }
        setDetections([]);
        faceInBoxStartTimeRef.current = null;
        return;
      }
    
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
    
        // Vertical alignment check
        const verticalThreshold = fixedBox.height * 0.1; // 10% of box height as threshold
    
        if (isInside) {
          if (lastCommandRef.current !== "stop") {
            window.electronAPI.rotateCamera("stop");
            lastCommandRef.current = "stop";
          }
          validDetections.push(detection);
          ctx.beginPath();
          ctx.rect(x, y, width, height);
          ctx.lineWidth = 2;
          ctx.strokeStyle = "red";
          ctx.stroke();
        } else {
          if (y < fixedBox.y - verticalThreshold) {
            if (lastCommandRef.current !== "moveup") {
              window.electronAPI.rotateCamera("up");
              lastCommandRef.current = "moveup";
            }
          } else if (y + height > fixedBox.y + fixedBox.height + verticalThreshold) {
            if (lastCommandRef.current !== "movedown") {
              window.electronAPI.rotateCamera("down");
              lastCommandRef.current = "movedown";
            }
          } else {
            if (lastCommandRef.current !== "stop") {
              window.electronAPI.rotateCamera("stop");
              lastCommandRef.current = "stop";
            }
          }
        }
      });
    
      setDetections(validDetections);
    
      if (validDetections.length > 0) {
        if (!faceInBoxStartTimeRef.current) {
          faceInBoxStartTimeRef.current = Date.now();
        } else if (Date.now() - faceInBoxStartTimeRef.current >= CAPTURE_DELAY) {
          handleCapture();
          faceInBoxStartTimeRef.current = null;
        }
      } else {
        faceInBoxStartTimeRef.current = null;
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
          .then(() => {
            analyzeFaceSound().play();
          })
          .catch((err) => {
            if (!isCancelled) {
              setError(`Failed to start camera: ${err.message}`);
            }
          });
      } else if (!isCancelled) {
        setTimeout(tryInitializeCamera, 500);
      }
    };

    tryInitializeCamera();

    return () => {
      isCancelled = true;
      if (camera) camera.stop();
      faceDetection.close();
    };
  }, [cameraView, deviceId, handleCapture]);

  const handleApplySettings = () => {
    const selected = resolutions.find((r) => r.label === selectedRes);
    if (selected) {
      setCameraView({ width: selected.width, height: selected.height });
    }
    setShowModal(false);
    setLoading(true);
    setTimeout(() => setLoading(false), 1000);
  };

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 4000);

    async function getDevices() {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter((device) => device.kind === "videoinput");
        setDevices(videoDevices);
        if (videoDevices.length > 0) {
          setDeviceId(videoDevices[0].deviceId);
        }
      } catch (err) {
        console.error("Error enumerating devices:", err);
        setError("Failed to enumerate camera devices.");
      }
    }
    getDevices();
  }, []);

  if (loading) return <LoadingScreen message="Starting the application..." />;

  if (error) {
    return (
      <div className="container-fluid d-flex justify-content-center align-items-center" style={{ height: "100%" }}>
        <div className="text-danger">
          {error}
          <div className="mt-3">
            <Button
              variant="secondary"
              className="ms-2"
              onClick={() => {
                setError(null);
                setLoading(true);
                setTimeout(() => setLoading(false), 2000);
              }}
            >
              Retry
            </Button>
          </div>
        </div>
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
          key={deviceId}
          ref={webcamRef}
          audio={false}
          screenshotFormat="image/png"
          style={{ position: "absolute", top: 0, left: 0, zIndex: 1, borderRadius: "20px" }}
          videoConstraints={{
            deviceId: deviceId ? { exact: deviceId } : undefined,
            width: { ideal: cameraView.width },
            height: { ideal: cameraView.height },
          }}
          mirrored={false}
          onUserMediaError={(err: string | DOMException) => {
            console.error("Webcam error:", err);
            let errorMessage = "Failed to access webcam.";
            if (typeof err === "string") {
              errorMessage = err;
            } else {
              console.error("Webcam error details:", err.name, err.message);
              if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
                errorMessage = "No camera found for the selected device.";
              } else if (err.name === "NotAllowedError") {
                errorMessage = "Camera access denied. Please grant permission.";
              } else if (err.name === "OverconstrainedError") {
                errorMessage = "Selected resolution or device is not supported.";
              }
            }
            setError(errorMessage);
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
            <p>Phát hiện gương mặt nằm trong khung</p>
          ) : (
            <p>Xin hãy đưa mặt vào khung xanh</p>
          )}
        </div>
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Camera Settings</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Resolution</Form.Label>
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
          </Form.Group>
          <Form.Group>
            <Form.Label>Camera</Form.Label>
            <Form.Select
              value={deviceId || ""}
              onChange={(e) => setDeviceId(e.target.value || undefined)}
            >
              {devices.length === 0 && <option value="">No cameras found</option>}
              {devices.map((device) => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label || `Camera ${device.deviceId.slice(0, 5)}...`}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleApplySettings}>
            Apply
          </Button>
        </Modal.Footer>
      </Modal>

      <ToastContainer />
    </div>
  );
};

export default Face;