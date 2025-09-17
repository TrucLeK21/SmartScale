import { useEffect, useState } from "react";
import BarcodeScannerComponent from "react-qr-barcode-scanner";
import { useNavigate } from "react-router-dom";
import { useCCCD1Sound, useCCCD2Sound } from "../../assets/sounds";

const QRScanPage: React.FC = () => {
    const [mode, setMode] = useState<"camera" | "gm65">("camera");
    const [timeLeft, setTimeLeft] = useState<number>(20);
    const [isTimeOut, setIsTimeOut] = useState<boolean>(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [data, setData] = useState<string | null>(null);
    const [scanning, setScanning] = useState<boolean>(true);
    const navigate = useNavigate();
    const cccd1Sound = useCCCD1Sound();
    const cccd2Sound = useCCCD2Sound();

    // 🚀 Xử lý khi scan thành công (camera + GM65)
    useEffect(() => {
        if (data) {
            console.log("Scan result:", data);
            window.electronAPI.startCCCD(data);
            setScanning(false);
            navigate("/weight");
        }
    }, [data, navigate]);

    // ⏳ Timer GM65
    useEffect(() => {
        if (mode !== "gm65") {
            setTimeLeft(20);
            setIsTimeOut(false);
            return;
        }

        if (isTimeOut) return;
        if (timeLeft === 0) {
            setIsTimeOut(true);
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [mode, timeLeft, isTimeOut]);

    // 🔄 Xử lý khi đổi mode: gọi GM65 hoặc tắt scanner
    useEffect(() => {

        if (mode === "gm65") {
            // Khi đổi qua GM65 -> gọi API Electron để bắt đầu quét
            cccd2Sound.play();
            window.electronAPI.startScan()
                .then((res: { success: boolean; message?: string }) => {
                    if (!res.success) setErrorMsg(res.message || "Quét thất bại");
                    else {
                        setErrorMsg(null);
                        navigate("/weight");
                    }
                });
            setTimeLeft(20);
            setIsTimeOut(false);
        } else {
            // Khi đổi sang camera -> tắt GM65 nếu có API stop
            cccd1Sound.play();
            window.electronAPI.turnOffQrScanner();
            setErrorMsg(null);
            setScanning(true);
        }

        return () => {
            window.electronAPI.turnOffQrScanner();
        };
    }, [mode, navigate]);

    return (
        <div style={styles.container}>
            <div style={styles.wrapper}>
                <div style={styles.header}>
                    <h2 className="text-light mb-0">Quét mã QR / CCCD</h2>
                </div>

                {/* Camera */}
                {mode === "camera" && (
                    <div style={styles.body}>
                        {scanning ? (
                            <div style={{ position: "relative", width: "100%", height: "100%" }}>
                                <BarcodeScannerComponent
                                    width={500}
                                    height={375}
                                    facingMode="user"
                                    onUpdate={(_err, result) => {
                                        if (result) setData(result.getText());
                                    }}
                                />
                                <div style={styles.overlay} />
                                <div style={styles.tutorialText}>Đưa mã QR vào khung để quét</div>
                            </div>
                        ) : (
                            <button
                                className="btn btn-primary"
                                onClick={() => {
                                    setScanning(true);
                                    setErrorMsg(null);
                                }}
                            >
                                Bắt đầu quét
                            </button>
                        )}
                    </div>
                )}

                {/* GM65 */}
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
                                <p className="text-danger">Hết giờ</p>
                                <button
                                    className="btn"
                                    onClick={() => {
                                        setTimeLeft(20);
                                        setIsTimeOut(false);
                                        window.electronAPI.startScan()
                                            .then((res: { success: boolean; message?: string }) => {
                                                if (!res.success) setErrorMsg(res.message || "Quét thất bại");
                                                else {
                                                    setErrorMsg(null);
                                                    navigate("/weight");
                                                }
                                            });
                                        setTimeLeft(20);
                                        setIsTimeOut(false);
                                    }}
                                    style={{
                                        backgroundColor: "var(--sub-background-color-2)",
                                        color: "white"
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
                            backgroundColor: mode === "camera" ? "var(--primary-color)" : "var(--sub-background-color)",
                            border: mode === "camera" ? "none" : "2px solid var(--primary-color)",
                            color: "white"
                        }}
                        onClick={() => setMode("camera")}
                        disabled={mode === "camera"}
                        className="btn"
                    >
                        Camera
                    </button>
                    <button
                        style={{
                            width: 100,
                            backgroundColor: mode === "gm65" ? "var(--primary-color)" : "var(--sub-background-color)",
                            border: mode === "gm65" ? "none" : "2px solid var(--primary-color)",
                            color: "white"
                        }}
                        onClick={() => setMode("gm65")}
                        disabled={mode === "gm65"}
                        className="btn"
                    >
                        Cảm biến
                    </button>
                </div>
            </div>

            {/* Thông báo lỗi */}
            {errorMsg && (
                <div style={{ marginTop: 20, color: "red" }}>
                    Đã có lỗi xảy ra: {errorMsg}
                </div>
            )}
        </div>
    );
};

export default QRScanPage;

// ======== Styles giữ nguyên ========
const styles: { [key: string]: React.CSSProperties } = {
    container: { padding: 0, margin: 0, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", backgroundColor: "transparent", width: "100%", height: "100vh" },
    wrapper: { width: "80%", height: "85%", backgroundColor: "var(--sub-background-color)", position: "relative", borderRadius: 8 },
    header: { marginBottom: 20, backgroundColor: "rgba(255, 255, 255, 0.1)", padding: 10, borderRadius: "8px 8px 0 0", display: "flex", justifyContent: "center", alignItems: "center" },
    modeToggle: { display: "flex", gap: 20, width: "100%", justifyContent: "center", alignItems: "center", position: "absolute", bottom: 10 },
    body: { position: "relative", width: "100%", maxWidth: 500, aspectRatio: "4/3", margin: "0 auto", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" },
    overlay: { position: "absolute", top: "50%", left: "50%", width: "200px", height: "200px", border: "3px solid var(--primary-color)", transform: "translate(-50%, -50%)", borderRadius: "8px", boxShadow: "0 0 15px var(--primary-color)" },
    tutorialText: { position: "absolute", bottom: 10, left: 0, width: "100%", textAlign: "center", color: "#fff", textShadow: "0 0 5px #000", fontWeight: "bold" }
};
