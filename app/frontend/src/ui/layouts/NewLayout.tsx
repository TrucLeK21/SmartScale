import React, { ReactNode } from 'react';
import NewNabarComponent from '../components/SidebarComponent/SidebarComponent';
import './NewLayout.css'; 
type Props = {
    children: ReactNode;
};  

const NewLayout: React.FC<Props> = ({ children }) => {
    return (
        <div className='d-flex '>
            <NewNabarComponent />
            <main>{children}</main>   
        </div>
    );
};

export default NewLayout;;



