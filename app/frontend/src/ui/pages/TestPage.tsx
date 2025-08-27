import { useEffect, useState } from "react";
import "react-toastify/dist/ReactToastify.css";
import { showToast } from "../utils/toastUtils";

function App() {
  const [pipMessage, setPipMessage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    // Gọi API ensure-pip và cài package qua electronAPI
    const checkPip = async () => {
      try {
        const result = await window.electronAPI.ensurePipAndPackages();
        if (result.success) {
          console.log("Pip/packages installed successfully");
          setErrorMsg(null);
          setPipMessage(result.message);
          showToast.success(result.message);
        } else {
          console.error("Ensure-pip failed:", result.message);
          setErrorMsg(result.message);
          setPipMessage("Lỗi: " + result.message);
          showToast.error(result.message);
        }
      } catch (err) {
        console.error("IPC call failed:", err);
        setErrorMsg("Không thể gọi ensure-pip");
        setPipMessage("Không thể gọi ensure-pip");
        showToast.error("Không thể gọi ensure-pip");
      }
    };

    checkPip();
  }, []);

  return (
    <div
      className="container-fluid d-flex flex-column align-items-center"
      style={{ height: "100%" }}
    >
      {pipMessage && (
        <div
          className={`alert ${errorMsg ? "alert-danger" : "alert-info"} mt-3 text-center`}
          role="alert"
        >
          {pipMessage}
        </div>
      )}
    </div>
  );
}

export default TestPage;
