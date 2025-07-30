import { useEffect, useRef, useState } from "react";
import { BrowserQRCodeReader, IScannerControls } from "@zxing/browser";
import { useNavigate } from "react-router-dom";

// Hàm parse CCCD từ chuỗi quét được
const parseCCCDData = (data: string) => {
    const parts = data.split("|").map((p) => p.trim());
    if (parts.length < 6) return null;

    const formatDate = (str: string) => {
        if (str.length !== 8) return "";
        const day = str.slice(0, 2);
        const month = str.slice(2, 4);
        const year = str.slice(4, 8);
        return `${year}-${month}-${day}`; // yyyy-MM-dd
    };

    const [cccd_id, cmnd_id, name, dobRaw, gender, address, issueDateRaw = ""] =
        parts;

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
    const videoRef = useRef<HTMLVideoElement>(null);
    const [scanResult, setScanResult] = useState<string | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const codeReader = new BrowserQRCodeReader();
        let controls: IScannerControls;

        const startScanner = async () => {
            try {
                const videoInputDevices =
                    await BrowserQRCodeReader.listVideoInputDevices();
                if (videoInputDevices.length === 0) {
                    setErrorMsg("Không tìm thấy camera nào.");
                    return;
                }

                const selectedDeviceId = videoInputDevices[0].deviceId;

                controls = await codeReader.decodeFromVideoDevice(
                    selectedDeviceId,
                    videoRef.current!,
                    (result, error, ctrl) => {
                        if (result) {
                            setScanResult(result.getText());
                            const parsedData = parseCCCDData(result.getText());
                            if (parsedData) {
                                window.electronAPI.startCCCD(parsedData);

                                console.log("Parsed CCCD Data:", parsedData);
                            }
                            ctrl.stop(); // Tự động dừng khi có kết quả
                            navigate("/weight");
                        }
                        if (error) {
                            console.error("Error decoding QR code:", error);
                        }
                    }
                );
            } catch (err: unknown) {
                if (err instanceof Error) {
                    setErrorMsg("Không thể khởi động camera: " + err.message);
                } else {
                    setErrorMsg(
                        "Đã xảy ra lỗi không xác định khi khởi động camera."
                    );
                }
            }
        };

        startScanner();

        return () => {
            controls?.stop();
        };
    }, []);

    return (
        <div style={styles.container}>
            <h2 className="text-light">Quét mã QR</h2>

            <div style={styles.wrapper}>
                <video ref={videoRef} style={styles.video} />

                {/* Overlay */}
                <div style={styles.overlay} />
                {/* Hướng dẫn */}
                <div style={styles.tutorialText}>
                    Đưa mã QR vào khung để quét
                </div>
            </div>

            {scanResult && (
                <div style={{ marginTop: 20, color: "green" }}>
                    ✅ Mã QR: <strong>{scanResult}</strong>
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
        backgroundColor: "transparent",
        flex: 1,
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
        pointerEvents: "none", // Đảm bảo không cản tương tác video
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
    },
};
