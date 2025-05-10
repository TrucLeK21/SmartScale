import CardComponent from '../components/CardComponent';
import bodyCheckIcon from '../../assets/body-check-icon.png';
// import balanceIcon from '../../assets/balance-icon.png';
import historyIcon from '../../assets/history-icon.svg';
import { greetingSound } from '../../assets/sounds';
import useHealthStore from '../hooks/healthStore';

function HomePage() {
    const startAnalyzeCallback = () => {
        window.electronAPI.resetUserState();
        useHealthStore.getState().clear();
        const audio = greetingSound();
        audio.play();
    };

    return (
        <div className="container-fluid" style={styles.container}>
            <div style={styles.menu}>
                <CardComponent 
                    imageUrl={bodyCheckIcon}
                    title='Phân tích sức khỏe'
                    navigateTo='/camera'
                    callback={startAnalyzeCallback}
                />
                <CardComponent 
                    imageUrl={historyIcon}
                    title='Lịch sử'
                    navigateTo=''
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
        justifyContent: "flex-start",
        alignItems: "flex-start"
    },
    menu: {
        display: "flex",
        gap: "1rem",
        padding: "2rem",
        width: "100vw"
    }    
}

export default HomePage;
