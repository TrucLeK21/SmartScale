import HomePage from './pages/HomePage';
import MainLayout from './layouts/MainLayout';
import { HashRouter as Router, Route, Routes } from "react-router-dom";
import './App.css';
import CameraPage from './pages/CameraPage';
import { Navigate } from "react-router-dom";
import HealthResultPage from './pages/HealthResultPage';



function App() {

  return (
    <>
      <Router>
        <MainLayout>
          <Routes>
            {/* <Route path="/" element={<Navigate to="/test" />} /> */}
            <Route path="/" element={<HomePage />} />
            <Route path='/camera' element={<CameraPage/>}/>
            <Route path="/test" element={<HealthResultPage/>} />
          </Routes>
        </MainLayout>
      </Router>
    </>
  );
}

export default App;
