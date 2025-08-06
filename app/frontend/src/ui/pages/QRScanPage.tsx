import { useEffect, useRef, useState } from "react";
import { BrowserQRCodeReader, IScannerControls } from "@zxing/browser";
import { useNavigate } from "react-router-dom";

type CCCDParsed = {
    cccd_id: string;
    cmnd_id: string;
    name: string;
    dob: string;
    gender: string;
    address: string;
    issue_date: string;
};

const parseCCCDData = (data: string): CCCDParsed | null => {
    const parts = data.split("|").map(p => p.trim());
    if (parts.length < 6) return null;

    const formatDate = (str: string) => {
        if (str.length !== 8) return "";
        const day = str.slice(0, 2);
        const month = str.slice(2, 4);
        const year = str.slice(4, 8);
        return `${year}-${month}-${day}`; // yyyy-MM-dd
    };

    const [cccd_id, cmnd_id, name, dobRaw, gender, address, issueDateRaw = ""] = parts;

    return {
        cccd_id,
        cmnd_id,
        name,
        dob: formatDate(dobRaw),
        gender,
        address,
        issue_date: issueDateRaw ? formatDate(issueDateRaw) : "",
    };
};

const QRScanPage: React.FC = () => {
    const [mode, setMode] = useState<"camera" | "gm65">("camera");
    const [scanResult, setScanResult] = useState<string | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (mode === "camera") {
            const codeReader = new BrowserQRCodeReader();
            let controls: IScannerControls;

            const startScanner = async () => {
                try {
                    const videoDevices = await BrowserQRCodeReader.listVideoInputDevices();
                    if (videoDevices.length === 0) {
                        setErrorMsg("Không tìm thấy camera.");
                        return;
                    }

                    const selectedDeviceId = videoDevices[0].deviceId;

                    controls = await codeReader.decodeFromVideoDevice(
                        selectedDeviceId,
                        videoRef.current!,
                        (result, error, ctrl) => {
                            if (result) {
                                const text = result.getText();
                                setScanResult(text);
                                const parsed = parseCCCDData(text);
                                if (parsed) {
                                    window.electronAPI.startCCCD(parsed);
                                    ctrl.stop();
                                    navigate("/weight");
                                }
                            }

                            // Bỏ qua NotFoundException
                            if (error && error.name !== "NotFoundException") {
                                console.error("Decode error:", error);
                            }
                        }
                    );

                } catch (e) {
                    console.error("Error starting scanner:", e);
                    setErrorMsg("Không thể mở camera.");
                }
            };

            startScanner();

            return () => {
                controls?.stop();
            };
        }

        if (mode === "gm65") {
            // Gửi yêu cầu bắt đầu quét
            window.electronAPI.startScan();

            // Lắng nghe kết quả từ GM65
            const unsubscribe = window.electronAPI.onScanResult(({ barcode }) => {
                console.log("Scan result after callback:", barcode);
                setScanResult(barcode);
                const parsed = parseCCCDData(barcode);
                if (parsed) {
                    window.electronAPI.startCCCD(parsed);
                    navigate("/weight");
                }
            });

            return () => {
                unsubscribe();
            };
        }
    }, [mode, navigate]);

    return (
        <div style={styles.container}>
            <h2 className="text-light">Quét mã QR / CCCD</h2>

            {/* Nút chuyển chế độ */}
            <div style={styles.modeToggle}>
                <button onClick={() => setMode("camera")} disabled={mode === "camera"}>📷 Camera</button>
                <button onClick={() => setMode("gm65")} disabled={mode === "gm65"}>🔌 GM65</button>
            </div>

            {/* Camera video */}
            {mode === "camera" && (
                <div style={styles.wrapper}>
                    <video ref={videoRef} style={styles.video} />
                    <div style={styles.overlay} />
                    <div style={styles.tutorialText}>Đưa mã QR vào khung để quét</div>
                </div>
            )}

            {scanResult && (
                <div style={{ marginTop: 20, color: "green" }}>
                    ✅ Mã quét được: <strong>{scanResult}</strong>
                </div>
            )}
            {errorMsg && (
                <div style={{ marginTop: 20, color: "red" }}>
                    ❌ Lỗi: {errorMsg}
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
        flex: 1
    },
    modeToggle: {
        display: "flex",
        gap: 10,
        marginBottom: 20,
    },
    wrapper: {
        position: "relative",
        width: "100%",
        maxWidth: 500,
        aspectRatio: "4/3",
        margin: "0 auto",
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
