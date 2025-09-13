import React from 'react'
import './NewNavbarComponent.css'
import { NavLink } from "react-router-dom";
const NewNavbarComponent: React.FC = () => {
    return (
        <nav>

            <ul className='d-flex'>
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
    )
}

export default NewNavbarComponent