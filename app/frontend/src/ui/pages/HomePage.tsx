import CardComponent from '../components/CardComponent';
import './HomePage.css'
import bodyCheckIcon from '../../assets/body-check-icon.png'
import balanceIcon from '../../assets/balance-icon.png'
import historyIcon from '../../assets/history-icon.svg'
import { useEffect } from 'react';

function HomePage() {
const runPythonScript = () => {
    window.electronAPI.sendPython({ input: 'Truc' });
};

    useEffect(() => {
        const handleResult = (result: string) => {
            console.log('Python Output:', result);
            alert(result);
        };
    
        // Register the listener once
        window.electronAPI.onPythonResult(handleResult);
    
        // Cleanup the listener when the component unmounts or before the effect runs again
        return () => {
            window.electronAPI.removeListener(handleResult);
        };
    }, []);


    return (
        <div className="container-fluid container">
            <div className="menu">
                <CardComponent 
                    imageUrl={bodyCheckIcon}
                    title='Phân tích sức khỏe'
                    navigateTo='/camera'
                />
                <CardComponent 
                    imageUrl={balanceIcon}
                    title='Kiểm tra thăng bằng'
                    navigateTo=''
                />
                <CardComponent 
                    imageUrl={historyIcon}
                    title='Lịch sử'
                    navigateTo=''
                />
                <button onClick={runPythonScript}>Say Hello</button>
            </div>
        </div>
    );
}

export default HomePage;
