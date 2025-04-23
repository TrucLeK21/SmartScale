import HealthMetrics from "../components/HealthMetrics";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faDna, faQrcode } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";

const mockData = {
  height: 175,
  weight: 67.5,
  date: new Date("2025-04-10"),
  age: 22,
  bmi: 21.97,
  bmr: 1580,
  tdee: 2450,
  lbm: 54.8,
  fatPercentage: 17.0,
  waterPercentage: 59.0,
  boneMass: 3.1,
  muscleMass: 43.0,
  proteinPercentage: 18.5,
  visceralFat: 8,
  idealWeight: 68.0,
};

function App() {
  const navigate = useNavigate();

  return (
    <div className="container-fluid d-flex flex-column align-items-center"
    style={{ height: "100%" }}>
      <HealthMetrics data={mockData} />

      <div className="mt-3 d-flex justify-content-center align-items-center gap-3">
          <button className="custom-btn fs-5">Lưu ở CSDL <FontAwesomeIcon icon={faQrcode} /></button>
          <button className="custom-btn fs-5 complete-btn" onClick={() => navigate("/")}><FontAwesomeIcon icon={faCheck} /></button>
          <button className="custom-btn fs-5">Chẩn đoán AI <FontAwesomeIcon icon={faDna} /></button>
      </div>
    </div>
  );
}

export default App;
