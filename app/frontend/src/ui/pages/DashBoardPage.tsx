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
    { value: "activityFactor", label: "Hệ số hoạt động", unit: "" },
    { value: "height", label: "Chiều cao", unit: "cm" },
    { value: "weight", label: "Cân nặng", unit: "kg" },
    { value: "age", label: "Tuổi", unit: "năm" },
    { value: "bmi", label: "BMI", unit: "kg/m²" },
    { value: "bmr", label: "BMR", unit: "kcal/ngày" },
    { value: "tdee", label: "TDEE", unit: "kcal/ngày" },
    { value: "lbm", label: "Khối lượng nạc (LBM)", unit: "kg" },
    { value: "fatPercentage", label: "Tỉ lệ mỡ", unit: "%" },
    { value: "waterPercentage", label: "Nước trong cơ thể", unit: "%" },
    { value: "boneMass", label: "Khối lượng xương", unit: "kg" },
    { value: "muscleMass", label: "Khối lượng cơ", unit: "kg" },
    { value: "proteinPercentage", label: "Protein", unit: "%" },
    { value: "visceralFat", label: "Mỡ nội tạng", unit: "level" },
    { value: "idealWeight", label: "Cân nặng lý tưởng", unit: "kg" },
];



const DashBoardPage = () => {

    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: new Date(),
        to: new Date(),
    });

    const [overviewData, setOverviewData] = useState<OverviewData | null>(null);
    const [dataKey, setDataKey] = useState<string>('weight');
    const [dataByKey, setDataByKey] = useState<ChartData[]>([]);
    const [bmiGroupData, setBmiGroupData] = useState<BMIGroupData[]>([]);
    const [bmiGroupByGender, setBmiGroupByGender] = useState<BMIGroupByGender[]>([]);

    const startAnalyzeCallback = () => {
        window.electronAPI.resetUserState();
        useHealthStore.getState().clear();
    };

    const getMetricLabel = (key: string) => {
        const option = metricOptions.find((m) => m.value === key);
        return option ? option.label : key;
    };

    const getMetricUnit = (key: string) => {
        const option = metricOptions.find((m) => m.value === key);
        return option ? option.unit : '';
    }

    const fetchDataByKey = async (startDate: Date, endDate: Date, key: string) => {
        try {
            const data = await window.electronAPI.getLineChartData(startDate, endDate, key);
            setDataByKey(data);
        } catch (error) {
            console.error("Lỗi khi lấy dữ liệu biểu đồ:", error);
        }
    }

    const fetchOverviewData = async (startDate: Date, endDate: Date) => {
        try {
            const result = await window.electronAPI.getOverviewData(startDate, endDate);
            setOverviewData(result);
        } catch (error) {
            console.error("Lỗi khi lấy dữ liệu tổng quan:", error);
        }
    }

    const fetchBMIGroupData = async (startDate: Date, endDate: Date) => {
        try {
            const result = await window.electronAPI.getBMIGroupData(startDate, endDate);
            setBmiGroupData(result);
        }
        catch (error) {
            console.error('Lỗi khi lấy dữ liệu phân bố BMI', error);
        }
    }

    const fetchBMIGroupByGender = async (startDate: Date, endDate: Date) => {
        try {
            const result = await window.electronAPI.getBMIGroupByGender(startDate, endDate);
            setBmiGroupByGender(result);
        } catch (error) {
            console.error('Lỗi khi lấy dữ liệu phân bố BMI theo độ tuổi, giới tính', error);
        }
    }

    useEffect(() => {
        if (dateRange?.from && dateRange?.to) {
            fetchOverviewData(dateRange.from, dateRange.to);
            fetchBMIGroupData(dateRange.from, dateRange.to);
            fetchBMIGroupByGender(dateRange.from, dateRange.to);
        }
    }, [dateRange]);

    useEffect(() => {
        if (dateRange?.from && dateRange?.to) {
            fetchDataByKey(dateRange.from, dateRange.to, dataKey);
        }
    }, [dataKey, dateRange])

    useEffect(() => {
        startAnalyzeCallback();
    }, []);

    useEffect(() => {
        console.table(bmiGroupByGender);
    }, [bmiGroupByGender]);
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
                                <h3>{overviewData?.averageFatPercentage}%</h3>
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
                                    defaultValue={dataKey}
                                    onChange={(value) => setDataKey(value)}
                                />
                            </div>

                        </div>
                        <div className="main-chart">
                            <LineChartComponent data={dataByKey} title={getMetricLabel(dataKey)} unit={getMetricUnit(dataKey)} />
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
                            <PieChartComponent data={bmiGroupData} />

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
                            <BarChartComponent data={bmiGroupByGender}/>

                        </div>
                    </div>
                </div>

            </section>
        </div>
    )
}

export default DashBoardPage;