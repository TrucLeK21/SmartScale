import React, { ReactNode } from 'react';
import NewNabarComponent from '../components/SidebarComponent/SidebarComponent';
import './NewLayout.css';
import ToastProvider from '../components/ToastProviderComponent/ToastProvider';
type Props = {
    children: ReactNode;
};

const NewLayout: React.FC<Props> = ({ children }) => {
    return (
        <div className='d-flex '>
            <NewNabarComponent />
            <main>
                {children}
                <ToastProvider />
            </main>
        </div>
    );
};

export default NewLayout;;



