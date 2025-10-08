import React from 'react'
import './NewNavbarComponent.css'
import { NavLink, useLocation } from "react-router-dom";

const analysisRoutes = [
    "/home",
    "/camera",
    "/weight",
    "/info",
    "/activity-select",
    "/result",
    "/qr-scan"
];

const NewNavbarComponent: React.FC = () => {
    const location = useLocation();

    // Check xem route hiện tại có thuộc nhóm phân tích không
    const isAnalysisActive = analysisRoutes.some((path) =>
        location.pathname.startsWith(path)
    );

    return (
        <nav className='new-navbar'>
            <ul className='d-flex navbar-list'>
                <li>
                    <NavLink
                        to="/dashboard"
                        title="Dashboard"
                        className={({ isActive }) => (isActive ? "active" : "")}
                    >
                        <i className="bi bi-house-door-fill"></i>
                        <span>Dashboard</span>
                    </NavLink>
                </li>

                <li>
                    <NavLink
                        to="/home"
                        title="Phân tích sức khỏe"
                        className={() => (isAnalysisActive ? "active" : "")}
                    >
                        <i className="bi bi-clipboard-data-fill"></i>
                        <span>Phân tích sức khỏe</span>
                    </NavLink>
                </li>

                <li>
                    <NavLink
                        to="/history"
                        title="Lịch sử"
                        className={({ isActive }) => (isActive ? "active" : "")}
                    >
                        <i className="bi bi-clock-history"></i>
                        <span>Lịch sử</span>
                    </NavLink>
                </li>
            </ul>
        </nav>
    );
};

export default NewNavbarComponent;
