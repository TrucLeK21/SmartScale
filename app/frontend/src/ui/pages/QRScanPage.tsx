import { useCallback, useEffect, useRef, useState } from "react";
import { BrowserQRCodeReader, IScannerControls } from "@zxing/browser";
import { useNavigate } from "react-router-dom";



const QRScanPage: React.FC = () => {
    const [mode, setMode] = useState<"camera" | "gm65">("camera");
    const [timeLeft, setTimeLeft] = useState<number>(20);
    const [isTimeOut, setIsTimeOut] = useState<boolean>(false);
    // const [scanResult, setScanResult] = useState<string | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const controlsRef = useRef<IScannerControls | null>(null);
    const navigate = useNavigate();

    const stopCamera = () => {
        console.log(">>> stopCamera called");
        controlsRef.current?.stop();
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;

            stream.getTracks().forEach(track => {
                console.log(">>> stopping track:", track.kind);
                track.stop();
            });

            videoRef.current.srcObject = null;
        } 
    }


    const handleScanQR = useCallback(async () => {
        stopCamera();
        window.electronAPI.turnOffQrScanner();

        if (mode === "camera") {
            const codeReader = new BrowserQRCodeReader();

            try {
                const videoDevices = await BrowserQRCodeReader.listVideoInputDevices();
                if (videoDevices.length === 0) {
                    setErrorMsg("Không tìm thấy camera.");
                    return;
                }

                const selectedDeviceId = videoDevices[1].deviceId;

                const controls = await codeReader.decodeFromVideoDevice(
                    selectedDeviceId,
                    videoRef.current!,
                    (result, _, ctrl) => {
                        if (result) {
                            const text = result.getText();
                            console.log("Scan result:", String(text));
                            if (text) {
                                window.electronAPI.startCCCD(text);
                                ctrl.stop();
                                navigate("/weight");
                            }
                        }
                    }
                );

                controlsRef.current = controls;
            } catch (e) {
                console.error("Error starting scanner:", e);
                setErrorMsg("Không thể mở camera.");
            }

        }

        if (mode === "gm65") {

            const result = await window.electronAPI.startScan();
            if (result.success) {
                console.log("Scan started successfully");
                setErrorMsg(null);
                navigate("/weight");
            } else {
                console.error("Scan failed:", result.message);
                setErrorMsg(result.message);
            }
        }

    }, [mode, navigate]);

    useEffect(() => {
        handleScanQR();

        return () => {
            console.log("Cleanup scanner");
            stopCamera();                  // 🔹 tắt hẳn camera
            window.electronAPI.turnOffQrScanner();
        };
    }, [handleScanQR]);

    useEffect(() => {
        if (mode !== "gm65") {
            // reset khi chuyển về camera
            setTimeLeft(20);
            setIsTimeOut(false);
            return;
        }

        if (isTimeOut) return; // nếu hết giờ thì dừng hẳn, chờ user bấm nút

        if (timeLeft === 0) {
            setIsTimeOut(true);
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [mode, timeLeft, isTimeOut]);

    useEffect(() => {
        return () => {
            stopCamera();
            window.electronAPI.turnOffQrScanner();
        };
    }, []);


    return (
        <div style={styles.container}>
            <div style={styles.wrapper}>
                <div style={styles.header}>
                    <h2 className="text-light mb-0">Quét mã QR / CCCD</h2>
                </div>


                {/* Camera video */}
                {mode === "camera" && (
                    <div style={styles.body}>
                        <video ref={videoRef} style={styles.video} />
                        <div style={styles.overlay} />
                        <div style={styles.tutorialText}>Đưa mã QR vào khung để quét</div>
                    </div>
                )}

                {/* Cảm biến */}
                {mode === "gm65" && (
                    <div style={styles.body} className="flex-column">
                        <h5 className="text-light mb-5">
                            Hãy đưa căn cước công dân vào vị trí của cảm biến
                        </h5>

                        {!isTimeOut ? (
                            <p className="text-light">
                                <span className="text-success">Đếm ngược:</span> {timeLeft}s
                            </p>
                        ) : (
                            <div style={{ textAlign: "center" }}>
                                <p className="text-danger"> Hết giờ</p>
                                <button
                                    className="btn "
                                    onClick={() => {
                                        setTimeLeft(20);
                                        setIsTimeOut(false);
                                        handleScanQR();
                                    }}
                                    style={{
                                        backgroundColor: 'var(--sub-background-color-2)',
                                        color: 'white'
                                    }}
                                >
                                    <i className="bi bi-arrow-counterclockwise me-2"></i>
                                    Thử lại
                                </button>
                            </div>
                        )}
                    </div>
                )}


                {/* Nút chuyển chế độ */}
                <div style={styles.modeToggle}>
                    <button
                        style={{
                            width: 100,
                            backgroundColor: mode === "camera" ? 'var(--primary-color)' : 'var(--sub-background-color)',
                            border: mode === "camera" ? 'none' : '2px solid var(--primary-color)',
                            color: "white"
                        }}
                        onClick={() => setMode("camera")}
                        disabled={mode === "camera"}
                        className="btn">
                        Camera
                    </button>
                    <button
                        style={{
                            width: 100,
                            backgroundColor: mode === "gm65" ? 'var(--primary-color)' : 'var(--sub-background-color)',
                            border: mode === "gm65" ? 'none' : '2px solid var(--primary-color)',
                            color: "white"

                        }}
                        onClick={() => setMode("gm65")}
                        disabled={mode === "gm65"}
                        className="btn">
                        Cảm biến
                    </button>
                </div>

            </div>
            {/*             
            {scanResult && (
                <div style={{ marginTop: 20, color: "green" }}>
                    ✅ Mã quét được: <strong>{scanResult}</strong>
                </div>
            )} */}
            {errorMsg && (
                <div style={{ marginTop: 20, color: "red" }}>
                    Đã có lỗi xảy ra: {errorMsg}
                </div>
            )}
        </div>
    );
};

export default QRScanPage;

const styles: { [key: string]: React.CSSProperties } = {
    container: {
        padding: 0,
        margin: 0,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: 'transparent',
        width: "100%",
        height: "100vh",
    },
    wrapper: {
        width: "80%",
        height: "85%",
        backgroundColor: "var(--sub-background-color)",
        position: 'relative',
        borderRadius: 8,
    },
    header: {
        marginBottom: 20,
        backgroundColor: "rgba(255, 255, 255, 0.1)",
        padding: 10,
        borderRadius: "8px 8px 0 0",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
    },
    modeToggle: {
        display: "flex",
        gap: 20,
        width: "100%",
        justifyContent: "center",
        alignItems: "center",
        position: 'absolute',
        bottom: 10,
    },
    body: {
        position: "relative",
        width: "100%",
        maxWidth: 500,
        aspectRatio: "4/3",
        margin: "0 auto",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
    },
    video: {
        width: "100%",
        height: "100%",
        objectFit: "cover",
        borderRadius: 8,
    },
    overlay: {
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        boxSizing: "border-box",
        border: "100px solid rgba(0,0,0,0.5)",
        borderTop: "80px solid rgba(0,0,0,0.5)",
        borderBottom: "80px solid rgba(0,0,0,0.5)",
        pointerEvents: "none",
        borderRadius: 8,
    },
    tutorialText: {
        position: "absolute",
        bottom: 10,
        left: 0,
        width: "100%",
        textAlign: "center",
        color: "#fff",
        textShadow: "0 0 5px #000",
        fontWeight: "bold",
    }
};
