import HomePage from './pages/HomePage';
import MainLayout from './layouts/MainLayout';
import { HashRouter as Router, Route, Routes } from "react-router-dom";
import './App.css';
import CameraPage from './pages/CameraPage';

function App() {

  return (
    <>
      <Router>
        <MainLayout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path='/camera' element={<CameraPage/>}/>
          </Routes>
        </MainLayout>
      </Router>
    </>
  );
}

export default App;
