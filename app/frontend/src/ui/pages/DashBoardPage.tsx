import { useEffect, useState } from 'react';
import '../../assets/css/DashboardPage.css'
import BarChartComponent from '../components/ChartComponent/BarChart';
import LineChartComponent from '../components/ChartComponent/LineChart';
import PieChartComponent from '../components/ChartComponent/PieChart';
import useHealthStore from '../hooks/healthStore';
import { DateRange } from 'react-day-picker';
import DatePicker from '../components/DatePickerComponent/DatePicker';
import DropDown from '../components/DropDownComponent/DropDown';

const metricOptions = [
  { value: "id", label: "ID" },
  { value: "gender", label: "Giới tính" },
  { value: "race", label: "Chủng tộc" },
  { value: "activityFactor", label: "Hệ số hoạt động" },
  { value: "height", label: "Chiều cao" },
  { value: "weight", label: "Cân nặng" },
  { value: "age", label: "Tuổi" },
  { value: "bmi", label: "BMI" },
  { value: "bmr", label: "BMR" },
  { value: "tdee", label: "TDEE" },
  { value: "lbm", label: "Khối lượng nạc (LBM)" },
  { value: "fatPercentage", label: "Tỉ lệ mỡ (%)" },
  { value: "waterPercentage", label: "Nước trong cơ thể (%)" },
  { value: "boneMass", label: "Khối lượng xương" },
  { value: "muscleMass", label: "Khối lượng cơ" },
  { value: "proteinPercentage", label: "Protein (%)" },
  { value: "visceralFat", label: "Mỡ nội tạng" },
  { value: "idealWeight", label: "Cân nặng lý tưởng" },
  { value: "overviewScore", label: "Điểm tổng quan" },
];


const DashBoardPage = () => {

    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: new Date(),
        to: new Date(),
    });

    const [overviewData, setOverviewData] = useState<OverviewData | null>(null);



    const startAnalyzeCallback = () => {
        window.electronAPI.resetUserState();
        useHealthStore.getState().clear();
    };

    const fetchOverviewData = async (startDate: Date, endDate: Date) => {
        try {
            const result = await window.electronAPI.getOverviewData(startDate, endDate);
            setOverviewData(result);
        } catch (error) {
            console.error("Lỗi khi lấy dữ liệu tổng quan:", error);
        }
    }

    useEffect(() => {
        if (dateRange?.from && dateRange?.to) {
            fetchOverviewData(dateRange.from, dateRange.to);
        }
    }, [dateRange]);

    useEffect(() => {
        startAnalyzeCallback();
    }, []);
    return (
        <div className="main-content">
            <header className="main-header">
                <h3 className='fw-bold text-light'>Dashboard</h3>

            </header>
            <section className="main-section">
                <div className="filter-container text-light">
                    <DatePicker value={dateRange} onChange={setDateRange} />

                </div>
                <div className="top-container">
                    <div className="card-container">

                        <div className="card">
                            <div className="header">
                                <div className="icon">
                                    <i className="bi bi-bar-chart-fill"></i>
                                </div>
                                <span className='title'>Tổng lượt đo</span>
                            </div>
                            <div className="value">
                                <h3>{overviewData?.totalRecords}</h3>
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
                                <h3>{overviewData?.averageWeight} kg</h3>
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
                                <h3>{overviewData?.averageBMI}</h3>
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
                                <h3>{overviewData?.averageFatPercentage }%</h3>
                            </div>
                        </div>
                    </div>
                    <div className="main-chart-container d-flex flex-column gap-2">
                        <div className="chart-header text-light d-flex align-items-center justify-content-between ">
                            <div className="left d-flex align-items-center gap-2">
                                <div className="icon">
                                    <i className="bi bi-graph-up"></i>
                                </div>
                                <h5 className='m-0 fw-semibold'>Xu hướng</h5>
                            </div>
                            <div className="right">
                                <DropDown 
                                    options={metricOptions}
                                    defaultValue='weight'
                                />
                            </div>

                        </div>
                        <div className="main-chart">

                            <div className="main-chart-header">
                                <h5>Biểu đồ BMI trung bình</h5>
                                <span>Tháng 7/2025</span>
                            </div>
                            <LineChartComponent />
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