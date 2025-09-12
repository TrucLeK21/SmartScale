import React from "react";
import './SidebarComponent.css';
import bklogo from '../../../assets/bkLogo.svg';
import { NavLink } from "react-router-dom";

const SidebarComponent: React.FC = () => {

    return (
        <aside className="sidebar">
            <div className="">
                <div className="sidebar-header">
                    <NavLink
                        to="/"
                    >
                        <img src={bklogo} alt="logo" />
                    </NavLink>
                </div>
                <nav className="sidebar-nav">
                    <ul>
                        <li >
                            <NavLink
                                to="/dashboard"
                                title="Dashboard"
                                className={({ isActive }) => isActive ? "active" : ""}
                            >

                                <i className="bi bi-house-door-fill"></i>
                                <span>Dashboard</span>
                            </NavLink>


                        </li>
                        <li >
                            <NavLink
                                to="/home"
                                title="Phân tích sức khỏe"
                                className={({ isActive }) => isActive ? "active" : ""}
                            >

                                <i className="bi bi-clipboard-data-fill"></i>
                                <span>Phân tích sức khỏe</span>

                            </NavLink>
                        </li>
                        <li >
                            <NavLink
                                to="/history"
                                title="Lịch sử"
                                className={({ isActive }) => isActive ? "active" : ""}>
                                <i className="bi bi-clock-history"></i>
                                <span>Lịch sử</span>
                            </NavLink>
                        </li>

                    </ul>
                </nav>
            </div>

            <div className="sidebar-footer">
                <small>&copy; 2025 BK health station</small>
            </div>
        </aside>
    );
}

export default SidebarComponent;

