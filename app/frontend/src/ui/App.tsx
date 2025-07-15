import HomePage from './pages/HomePage';
import MainLayout from './layouts/MainLayout';
import { HashRouter as Router, Route, Routes } from "react-router-dom";
import './App.css';
import CameraPage from './pages/CameraPage';
import { Navigate } from "react-router-dom";
import WeightDisplayPage from './pages/WeightPage';
import InfoConfirmScreen from './pages/InfoConfirmPage';
import QRCodePage from './pages/QRCodePage';
import AIPage from './pages/AIPage';
import TestPage from './pages/TestPage';
import HealthResultPage from './pages/HealthResultPage';


function App() {
  return (
    <>
      <Router>
        <MainLayout>
          <Routes>
            <Route path="/" element={<Navigate to="/ai" />} />
            <Route path="/home" element={<HomePage />} />
            <Route path='/camera' element={<CameraPage/>}/>
            <Route path="/result" element={<HealthResultPage/>} />
            <Route path="/weight" element={<WeightDisplayPage/>}/>
            <Route path="/info" element={<InfoConfirmScreen/>} />
            <Route path="/qrcode" element={<QRCodePage/>}/>
            <Route path="/ai" element={<AIPage/>}/>
            <Route path="/test" element={<TestPage/>}/>
          </Routes>
        </MainLayout>
      </Router>
    </>
  );
}

export default App;
