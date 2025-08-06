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
            </div>
        </div>
    );
}

const styles: { [key: string]: React.CSSProperties } = {
    container: {
        padding: 0,
        margin: 0,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: '100%'
    },
    menu: {
        display: "flex",
        gap: "3rem",
        padding: "2rem",
        width: "100vw",
        justifyContent: "center",
    
    }    
}

export default HomePage;
