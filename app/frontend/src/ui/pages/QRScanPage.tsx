import { useCallback, useEffect, useRef, useState } from "react";
import { BrowserQRCodeReader, IScannerControls } from "@zxing/browser";
import { useNavigate } from "react-router-dom";


// const parseCCCDData = (data: string): CCCDParsed | null => {
//     const parts = data.split("|").map(p => p.trim());
//     if (parts.length < 6) return null;

//     const formatDate = (str: string) => {
//         if (str.length !== 8) return "";
//         const day = str.slice(0, 2);
//         const month = str.slice(2, 4);
//         const year = str.slice(4, 8);
//         return `${year}-${month}-${day}`; // yyyy-MM-dd
//     };

//     const [cccd_id, cmnd_id, name, dobRaw, gender, address, issueDateRaw = ""] = parts;

//     return {
//         cccd_id,
//         cmnd_id,
//         name,
//         dob: formatDate(dobRaw),
//         gender,
//         address,
//         issue_date: issueDateRaw ? formatDate(issueDateRaw) : "",
//     };
// };

const QRScanPage: React.FC = () => {
    const [mode, setMode] = useState<"camera" | "gm65">("camera");
    // const [scanResult, setScanResult] = useState<string | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const navigate = useNavigate();

    const handleScanQR = useCallback(async () => {
        let controls: IScannerControls;

        if (mode === "camera") {
            const codeReader = new BrowserQRCodeReader();

            try {
                const videoDevices = await BrowserQRCodeReader.listVideoInputDevices();
                if (videoDevices.length === 0) {
                    setErrorMsg("Không tìm thấy camera.");
                    return;
                }

                const selectedDeviceId = videoDevices[1].deviceId;

                controls = await codeReader.decodeFromVideoDevice(
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
            } catch (e) {
                console.error("Error starting scanner:", e);
                setErrorMsg("Không thể mở camera.");
            }

            return () => {
                controls?.stop();
            };
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
    }, [handleScanQR]);

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
                    <div style={styles.body}>
                        <h5 className="text-light">Hãy đưa căn cước công dân vào vị trí của cảm biến</h5>
                    </div>

                )}

                {/* Nút chuyển chế độ */}
                <div style={styles.modeToggle}>
                    <button
                        style={{ width: 100 }}
                        onClick={() => setMode("camera")}
                        disabled={mode === "camera"}
                        className={`btn ${mode === "camera" ? "btn-outline-primary bg-light" : "btn-primary"} `}>
                        Camera
                    </button>
                    <button
                        style={{ width: 100 }}
                        onClick={() => setMode("gm65")}
                        disabled={mode === "gm65"}
                        className={`btn ${mode === "gm65" ? "btn-outline-primary bg-light" : "btn-primary"}`}>
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
        height: "80%",
        backgroundColor: "var(--sub-background-color)",
        // display: "flex",
        // flexDirection: "column",
        // justifyContent: "center",
        // alignItems: "center",
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
        marginTop: 20,
        width: "100%",
        justifyContent: "center",
        padding: 10,
        alignItems: "center",
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
