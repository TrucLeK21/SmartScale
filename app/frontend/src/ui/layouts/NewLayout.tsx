import React from 'react';
import { Outlet } from 'react-router-dom';
import NewNabarComponent from '../components/SidebarComponent/SidebarComponent';
import './NewLayout.css';
import ToastProvider from '../components/ToastProviderComponent/ToastProvider';

const NewLayout: React.FC = () => {
    return (
        <div className="d-flex">
            <NewNabarComponent />
            <main>
                <Outlet />   {/* nơi render route con */}
                <ToastProvider />
            </main>
        </div>
    );
};

export default NewLayout;
