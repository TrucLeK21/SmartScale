import { useEffect } from 'react';
import '../../assets/css/DashboardPage.css'
import BarChartComponent from '../components/ChartComponent/BarChart';
import LineChartComponent from '../components/ChartComponent/LineChart';
import PieChartComponent from '../components/ChartComponent/PieChart';
import useHealthStore from '../hooks/healthStore';
import { greetingSound } from '../../assets/sounds';

const DashBoardPage = () => {
    const startAnalyzeCallback = () => {
        window.electronAPI.resetUserState();
        useHealthStore.getState().clear();
        const audio = greetingSound();
        audio.play();
    };
    useEffect(() => {


        startAnalyzeCallback();
    }, []);
    return (
        <div className="main-content">
            <header className="main-header">
                <h3 className='fw-bold text-light'>Dashboard</h3>
            </header>
            <section className="main-section">
                <div className="top-container">
                    <div className="main-chart">
                        <div className="main-chart-header">
                            <h5>Biểu đồ BMI trung bình</h5>
                            <span>Tháng 7/2025</span>
                        </div>
                        <LineChartComponent />
                    </div>

                    <div className="card-container">

                        <div className="card">
                            <div className="header">
                                <div className="icon">
                                    <i className="bi bi-bar-chart-fill"></i>
                                </div>
                                <span className='title'>Tổng lượt đo</span>
                            </div>
                            <div className="value">
                                <h3>125</h3>
                            </div>
                        </div>

                        <div className="card">
                            <div className="header">
                                <div className="icon">
                                    <i className="bi bi-browser-safari"></i>
                                </div>
                                <span className='title'>Cân nặng trung bình</span>
                            </div>
                            <div className="value">
                                <h3>70 kg</h3>
                            </div>
                        </div>

                        <div className="card">
                            <div className="header">
                                <div className="icon">
                                    <i className="bi bi-person-arms-up"></i>
                                </div>
                                <span className='title'>BMI trung bình</span>
                            </div>
                            <div className="value">
                                <h3>21.5</h3>
                            </div>
                        </div>
                        <div className="card">
                            <div className="header">
                                <div className="icon">
                                    <i className="bi bi-percent"></i>
                                </div>
                                <span className='title'>Tỉ lệ mỡ trung bình</span>
                            </div>
                            <div className="value">
                                <h3>20%</h3>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bottom-container">
                    <div className="card">
                        <div className="header">
                            <div className="icon">
                                <i className="bi bi-pie-chart-fill"></i>
                            </div>
                            <span>Biểu đồ phân bố BMI</span>
                        </div>
                        <div className="chart-container">
                            <PieChartComponent />

                        </div>
                    </div>

                    <div className="card">
                        <div className="header">
                            <div className="icon">
                                <i className="bi bi-bar-chart-line-fill"></i>
                            </div>
                            <span>Biểu đồ BMI trung bình theo độ tuổi và giới tính</span>
                        </div>
                        <div className="chart-container">
                            <BarChartComponent />

                        </div>
                    </div>
                </div>

            </section>
        </div>
    )
}

export default DashBoardPage;