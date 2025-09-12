import React from 'react'
import './NewNavbarComponent.css'
import { Image } from 'react-bootstrap';
import bklogo from '../../../assets/bkLogo.svg';
import { NavLink } from "react-router-dom";
const NewNavbarComponent: React.FC = () => {
    return (
        <nav>
            <NavLink
                to="/"
            >
                <Image src={bklogo} alt="logo" width={80} height={80} />
            </NavLink>

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
            <div
            style={{ 
                width: '80px',
             }}
            ></div>
        </nav>
    )
}

export default NewNavbarComponent