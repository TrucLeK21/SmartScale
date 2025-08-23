import HomePage from "./pages/HomePage";
import { HashRouter as Router, Route, Routes } from "react-router-dom";
import "./App.css";
import CameraPage from "./pages/CameraPage";
import { Navigate } from "react-router-dom";
import WeightDisplayPage from "./pages/WeightPage";
import InfoConfirmScreen from "./pages/InfoConfirmPage";
import QRCodePage from "./pages/QRCodePage";
import AIPage from "./pages/AIPage";
import TestPage from "./pages/TestPage";
import HealthResultPage from "./pages/HealthResultPage";
import DashBoardPage from "./pages/DashBoardPage";
import NewLayout from "./layouts/NewLayout";
import QRScanPage from "./pages/QRScanPage";
import HistoryPage from "./pages/History";
// import MainLayout from './layouts/MainLayout';

function App() {
  return (
    <>
      <Router>
        {/* <MainLayout> */}
        <NewLayout>
          <Routes>
            <Route path="/" element={<Navigate to="/test" />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/camera" element={<CameraPage />} />
            <Route path="/result" element={<HealthResultPage />} />
            <Route path="/weight" element={<WeightDisplayPage />} />
            <Route path="/info" element={<InfoConfirmScreen />} />
            <Route path="/qrcode" element={<QRCodePage />} />
            <Route path="/ai" element={<AIPage />} />
            <Route path="/test" element={<TestPage />} />
            <Route path="/dashboard" element={<DashBoardPage />} />
            <Route path="/qr-scan" element={<QRScanPage />} />
            <Route path="/history" element={<HistoryPage />} />
          </Routes>
        </NewLayout>
        {/* </MainLayout> */}
      </Router>
    </>
  );
}

export default App;
