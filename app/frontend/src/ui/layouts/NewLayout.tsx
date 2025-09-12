import React from 'react';
import { Outlet } from 'react-router-dom';
import './NewLayout.css';
import ToastProvider from '../components/ToastProviderComponent/ToastProvider';
import NewNavbarComponent from '../components/NewNavbarComponent/NewNavbarComponent';
import FooterComponent from '../components/FooterComponent/FooterComponent';

const NewLayout: React.FC = () => {
    return (
        <div className="d-flex flex-column">
            <NewNavbarComponent />
            <main>
                <Outlet />   {/* nơi render route con */}
                <ToastProvider />
            </main>
            <FooterComponent/>
        </div>
    );
};

export default NewLayout;
