import { useEffect, useState } from "react";
import "react-toastify/dist/ReactToastify.css";
import { showToast } from "../utils/toastUtils";
import LoadingScreen from "../components/LoadingScreenComponent/LoadingScreen";


const CheckDependencies = () => {
    const [logs, setLogs] = useState<string[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [message, setMessage] = useState<string>("");

    useEffect(() => {
        // Gửi yêu cầu check pip/packages
        window.electronAPI.ensurePipAndPackages();

        // Nhận log
        const unsubscribe = window.electronAPI.onGettingEnsureLogs(
            (message: ResponseMessage) => {
                setLogs((prev) => [...prev, message.message]);
                setMessage(message.message);
                if (message.success && message.message !== "DONE") {
                    showToast.success(message.message);
                } else {
                    if(message.message !== "DONE")
                    showToast.error(message.message);
                }

                if (message.message === "DONE") {
                    setLoading(false);
                }
            }
        );
        return () => {
            unsubscribe();
        };
    }, []);

    return (
        <div className="container-fluid d-flex flex-column align-items-center justify-content-center" style={{ height: "100%" }}>
            <div className="mt-3 w-75">
                {loading ? (
                    <LoadingScreen message={message} />
                ) :(
                    logs.map((msg, idx) => (
                        msg !== "DONE" &&
                        <div
                            key={idx}
                            className={`alert ${msg.includes("❌")
                                ? "alert-danger"
                                : msg.includes("✅")
                                    ? "alert-success"
                                    : "alert-info"
                                } mt-2`}
                        >
                            {msg}
                        </div>
                    ))
                )}
                {/*  */}
            </div>
        </div>
    );
}

export default CheckDependencies