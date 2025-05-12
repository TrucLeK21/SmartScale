import HealthMetrics from "../components/HealthMetrics";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faDatabase, faDna } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import useHealthStore from "../hooks/healthStore";
import "react-toastify/dist/ReactToastify.css";
import { showToast } from "../utils/toastUtils";

// const mockData = {
//     height: 175,
//     weight: 67.5,
//     date: new Date("2025-04-10"),
//     age: 22,
//     bmi: 21.97,
//     bmr: 1580,
//     tdee: 2450,
//     lbm: 54.8,
//     fatPercentage: 17.0,
//     waterPercentage: 59.0,
//     boneMass: 3.1,
//     muscleMass: 43.0,
//     proteinPercentage: 18.5,
//     visceralFat: 8,
//     idealWeight: 68.0,
//     overviewScore: {
//         "status": "Bình thường",
//         "evaluation": [
//             "BMI (22.96): Bình thường - Cân nặng của bạn trong mức khỏe mạnh",
//             "Độ tuổi: Thanh niên/Trưởng thành - Sức khỏe thường ổn định",
//             "Giới tính: Nam - Thường có cơ bắp nhiều hơn",
//             "Chủng tộc: asian - Áp dụng ngưỡng sức khỏe phù hợp"
//         ],
//         "recommendations": [
//             "Duy trì chế độ ăn uống và vận động hợp lý"
//         ],
//         "overall_status": "Sức khỏe tổng quan: Tốt - Tiếp tục duy trì lối sống lành mạnh"
//     }
// };

function App() {
    const navigate = useNavigate();
    // const record = mockData;
    // const isComplete = true;

    const record = useHealthStore(state => state.record);
    const isComplete = useHealthStore(state => state.isComplete);

    useEffect(() => {
        // Check if the user has completed the health record
        if (!isComplete) {
            showToast.error("Health record is incomplete. Redirecting to input page.");
        }
    }, [isComplete]);

    return (
        <div className="container-fluid d-flex flex-column align-items-center"
        style={{ height: "100%" }}>
            {record ? (
                <>
                    <HealthMetrics data={record} />
                    <div className="mt-3 d-flex justify-content-center align-items-center gap-3">
                        <button className="custom-btn fs-5" onClick={() => navigate("/qrcode")}>Lưu bản ghi <FontAwesomeIcon icon={faDatabase} /></button>
                        <button className="custom-btn fs-5 complete-btn" onClick={() => navigate("/")}><FontAwesomeIcon icon={faCheck} /></button>
                        <button className="custom-btn fs-5">Tư vấn AI <FontAwesomeIcon icon={faDna} /></button>
                    </div>
                </>
            ) : (
                <div className="alert alert-danger mt-4 text-center" role="alert">
                    Không tìm thấy dữ liệu sức khỏe. Vui lòng quay lại và nhập thông tin.
                </div>
            )}
        </div>
    );
}

export default App;
