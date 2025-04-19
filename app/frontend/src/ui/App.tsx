import HomePage from './pages/HomePage';
import MainLayout from './layouts/MainLayout';
import { HashRouter as Router, Route, Routes } from "react-router-dom";
import './App.css';
import CameraPage from './pages/CameraPage';
import { Navigate } from "react-router-dom";
import HealthResultPage from './pages/HealthResultPage';
import WeightDisplayPage from './pages/WeightPage';
import ActivitySelectScreen from './pages/ActivitySelectScreen';



function App() {

  return (
    <>
      <Router>
        <MainLayout>
          <Routes>
            <Route path="/" element={<Navigate to="/weight" />} />
            <Route path="/home" element={<HomePage />} />
            <Route path='/camera' element={<CameraPage/>}/>
            <Route path="/test" element={<HealthResultPage/>} />
            <Route path="/weight" element={<WeightDisplayPage/>}></Route>
            <Route path="/activity" element={<ActivitySelectScreen/>} />
          </Routes>
        </MainLayout>
      </Router>
    </>
  );
}

export default App;
