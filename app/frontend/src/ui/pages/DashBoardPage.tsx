import '../../assets/css/DashboardPage.css'
import LineChartComponent from '../components/ChartComponent/LineChart';
// import PieChartComponent from '../components/ChartComponent/PieChart';

const DashBoardPage = () => {
    return (
        <div className="main-content">
            <header className="main-header">
                <h3 className='fw-bold'>Dashboard</h3>
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

                        </div>

                        <div className="card">

                        </div>

                        <div className="card">

                        </div>

                        <div className="card">

                        </div>
                    </div>
                </div>

                <div className="bottom-container">
                    <div className="card">

                    </div>

                    <div className="card">

                    </div>
                </div>

            </section>
        </div>
    )
}

export default DashBoardPage;