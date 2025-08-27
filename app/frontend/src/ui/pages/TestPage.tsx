import { useEffect, useState } from "react";
import "react-toastify/dist/ReactToastify.css";
import { showToast } from "../utils/toastUtils";

type ResponseMessage = {
  success: boolean;
  message: string;
};

function App() {
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    // Gửi yêu cầu check pip/packages
    window.electronAPI.ensurePipAndPackages();

    // Nhận log
    const unsubscribe = window.electronAPI.onGettingEnsureLogs(
      (message: ResponseMessage) => {
        setLogs((prev) => [...prev, message.message]);

        if (message.success) {
          showToast.success(message.message);
        } else {
          showToast.error(message.message);
        }
      }
    );

    return () => unsubscribe();
  }, []);

  return (
    <div className="container-fluid d-flex flex-column align-items-center" style={{ height: "100%" }}>
      <div className="mt-3 w-75">
        {logs.map((msg, idx) => (
          <div
            key={idx}
            className={`alert ${
              msg.includes("❌")
                ? "alert-danger"
                : msg.includes("✅")
                ? "alert-success"
                : "alert-info"
            } mt-2`}
          >
            {msg}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
