import { useState } from "react";
import BarcodeScannerComponent from "react-qr-barcode-scanner";

function TestPage() {
  const [data, setData] = useState<string>("Không có dữ liệu");
  const [scanning, setScanning] = useState<boolean>(false);

  return (
    <div className="container mt-4 text-center">
      <h3>Test Quét QR Code</h3>

      {scanning ? (
        <div className="d-flex flex-column align-items-center mt-3">
          <BarcodeScannerComponent
            width={400}
            height={300}
            facingMode="user" // camera sau
            onUpdate={(err, result) => {
              if (result) {
                setData(result.getText());
                setScanning(false); // tự động tắt khi quét được
              }
            }}
          />
          <button
            className="btn btn-danger mt-3"
            onClick={() => setScanning(false)}
          >
            Dừng quét
          </button>
        </div>
      ) : (
        <button
          className="btn btn-primary mt-3"
          onClick={() => setScanning(true)}
        >
          Bắt đầu quét
        </button>
      )}

      <div className="alert alert-info mt-3">
        <strong>Kết quả: </strong> {data}
      </div>
    </div>
  );
}

export default TestPage;
