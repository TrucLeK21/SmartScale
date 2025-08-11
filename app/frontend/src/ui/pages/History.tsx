import { useEffect, useState } from "react";
import React from "react";
import "../../assets/css/HistoryPage.css";
import DatePicker from "../components/DatePickerComponent/DatePicker";
import DropDown from "../components/DropDownComponent/DropDown";


const HistoryPage: React.FC = () => {
    const [isSearching, setIsSearching] = useState<boolean>(false);
    const [historyData, setHistoryData] = useState<RecordData[]>([]);
    const loadHistory = async () => {
        try {
            const records = await window.electronAPI.getAllRecords();
            if (records.length !== 0) {
                setHistoryData(records);
            }
            console.log("Loaded records:", records);
        } catch (error) {
            console.error("Error loading records:", error);
        }
    }

    useEffect(() => {
        loadHistory();
    }, []);
    return (
        <div className="history-page-container">
            <div className="header-container">
                <div className="left-container">
                    <div className="icon">
                        <i className="bi bi-clock-history"></i>
                    </div>
                    <div className="title">
                        <h3>Lịch sử đo</h3>
                        <p>Xem các số đo cơ thể trong quá khứ</p>
                    </div>
                </div>
            </div>

            <div className="fillter-container d-flex align-items-center gap-4 flex-wrap">
                <DatePicker />




                <div className="group-container gender-dropdown-container">
                    <DropDown
                        iconClass="bi bi-gender-ambiguous"
                        placeholder="Chọn giới tính"
                        options={[
                            { value: "all", label: "Tất cả", iconClass: "bi bi-people" },
                            { value: "male", label: "Nam", iconClass: "bi bi-gender-male" },
                            { value: "female", label: "Nữ", iconClass: "bi bi-gender-female" },
                        ]}
                        onChange={(val) => console.log("Đã chọn:", val)}
                    />
                </div>


                <DropDown
                    iconClass="bi bi-globe"
                    placeholder="Chọn chủng tộc"
                    options={[
                        { value: "all", label: "Tất cả", iconClass: "bi bi-people" },
                        { value: "asian", label: "Châu Á", iconClass: "bi bi-globe-asia-australia" },
                        { value: "caucasian", label: "Khác", iconClass: "bi bi-person-circle" },
                    ]}
                    onChange={(val) => console.log("Đã chọn:", val)}
                />

                <div
                    className="group-container search-container d-flex align-items-center flex-grow-1 justify-content-between"
                    style={{ border: isSearching ? "1px solid white" : "none" }}
                >
                    <input
                        type="text"
                        onFocus={() => setIsSearching(true)}
                        onBlur={() => setIsSearching(false)}
                        placeholder="Nhập..."
                    />
                    <button className=" btn d-flex gap-2">
                        <i className="bi bi-search" ></i>
                        <span>Tìm kiếm</span>
                    </button>
                </div>


            </div>

            <div className="table-section">
                <div className="title d-flex align-items-center gap-2 mb-2">
                    <i className="bi bi-list-task"></i>
                    <h4>Bản ghi</h4>
                    <span
                        className="ms-2"
                        style={{
                            borderRadius: "50%",
                            backgroundColor: "var(--primary-color)",
                            color: "white",
                            padding: "0.2rem 0.5rem",
                        }}>{historyData.length}</span>
                </div>

                {/* Scroll wrapper */}
                <div className="table-container">
                    <div className="table-wrapper">
                        <table className="table table-hover">
                            <thead>
                                <tr>
                                    <th>Ngày</th>
                                    <th>Giới tính</th>
                                    <th>Chủng tộc</th>
                                    <th>Chiều cao (cm)</th>
                                    <th>Cân nặng</th>
                                    <th>Tuổi</th>
                                    <th>BMI</th>
                                    <th>BMR</th>
                                    <th>TDEE</th>
                                    <th>LBM</th>
                                    <th>Mỡ %</th>
                                    <th>Nước %</th>
                                    <th>Xương</th>
                                    <th>Cơ</th>
                                    <th>Protein %</th>
                                    <th>Mỡ nội tạng</th>
                                    <th>Cân nặng lý tưởng</th>
                                    <th>Điểm tổng quan</th>
                                </tr>
                            </thead>
                            <tbody>
                                {historyData.length > 0 ? (
                                    historyData.map((item, idx) => (
                                        <tr key={idx}>
                                            <td>{item.record?.date ? new Date(item.record.date).toLocaleDateString() : "-"}</td>
                                            <td>{item.gender === "male" ? "Nam" : "Nữ"}</td>
                                            <td>{item.race === "asian" ? "Châu Á" : "Khác"}</td>
                                            <td>{item.record?.height ?? "-"}</td>
                                            <td>{item.record?.weight ?? "-"}</td>
                                            <td>{item.record?.age ?? "-"}</td>
                                            <td>{item.record?.bmi ?? "-"}</td>
                                            <td>{item.record?.bmr ?? "-"}</td>
                                            <td>{item.record?.tdee ?? "-"}</td>
                                            <td>{item.record?.lbm ?? "-"}</td>
                                            <td>{item.record?.fatPercentage ?? "-"}</td>
                                            <td>{item.record?.waterPercentage ?? "-"}</td>
                                            <td>{item.record?.boneMass ?? "-"}</td>
                                            <td>{item.record?.muscleMass ?? "-"}</td>
                                            <td>{item.record?.proteinPercentage ?? "-"}</td>
                                            <td>{item.record?.visceralFat ?? "-"}</td>
                                            <td>{item.record?.idealWeight ?? "-"}</td>
                                            <td>{item.record?.overviewScore ?? "-"}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={18} className="text-center">
                                            Không có dữ liệu
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    {/* Footer phân trang */}
                    <div className="table-footer d-flex justify-content-between align-items-center">
                        <span>Hiển thị 1–10 / {historyData.length} bản ghi</span>
                        <div className="pagination">
                            <button>&laquo;</button>
                            <button className="active">1</button>
                            <button>2</button>
                            <button>3</button>
                            <button>&raquo;</button>
                        </div>
                    </div>

                </div>



            </div>
        </div>

    );
}

export default HistoryPage;