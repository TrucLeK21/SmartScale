<<<<<<< HEAD
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

        };
    }, []);


    return (
        <div className="container-fluid container">
            <div className="menu">
                <CardComponent 
                    // imageUrl='../assets/body-check-icon.png'
                    imageUrl={bodyCheckIcon}
                    title='Body Analysis'
                    navigateTo=''
                />
                <CardComponent 
                    imageUrl={balanceIcon}
                    title='Balance Test'
                    navigateTo=''
                />
                <CardComponent 
                    imageUrl={historyIcon}
                    title='History'
                    navigateTo=''
                />
                <button onClick={runPythonScript}>Say Hello</button>
=======
import CardComponent from '../components/CardComponent/CardComponent';
// import bodyCheckIcon from '../../assets/body-check-icon.png';
import faceIdIcon from '../../assets/face-id-icon.png';
import idCardIcon from '../../assets/id-card-icon.png';
// import balanceIcon from '../../assets/balance-icon.png';
// import historyIcon from '../../assets/history-icon.svg';
// import { greetingSound } from '../../assets/sounds';
import useHealthStore from '../hooks/healthStore';

function HomePage() {
    const startAnalyzeCallback = () => {
        window.electronAPI.resetUserState();
        useHealthStore.getState().clear();
        // const audio = greetingSound();
        // audio.play();
    };

    return (
        <div className="container-fluid" style={styles.container}>
            <div style={styles.menu}>
                <CardComponent 
                    imageUrl={faceIdIcon}
                    title='Dùng khuôn mặt'
                    navigateTo='/camera'
                    callback={startAnalyzeCallback}
                />
                <CardComponent 
                    imageUrl={idCardIcon}
                    title='Dùng căn cước công dân'
                    navigateTo='/qr-scan'
                    callback={startAnalyzeCallback}
                />
>>>>>>> combined-version
            </div>
        </div>
    );
}

<<<<<<< HEAD
=======
const styles: { [key: string]: React.CSSProperties } = {
    container: {
        padding: 0,
        margin: 0,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
    },
    menu: {
        display: "flex",
        gap: "3rem",
        padding: "2rem",
        width: "100vw",
        justifyContent: "center",
    
    }    
}

>>>>>>> combined-version
export default HomePage;
