import { useEffect, useState } from "react";
import React from "react";
import "../../assets/css/HistoryPage.css";
import DatePicker from "../components/DatePickerComponent/DatePicker";
import DropDown from "../components/DropDownComponent/DropDown";
import { DateRange } from "react-day-picker";

const pageSizeOptions = [
    { value: "5", label: "5" },
    { value: "10", label: "10" },
    { value: "20", label: "20" },
    { value: "50", label: "50" },
    { value: "100", label: "100" },
];

const HistoryPage: React.FC = () => {
    // const [isSearching, setIsSearching] = useState(false);
    const [historyData, setHistoryData] = useState<RecordData[]>([]);
    const [totalRecords, setTotalRecords] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const [filteredData, setFilteredData] = useState<RecordData[]>([]);
    const [genderFilter, setGenderFilter] = useState<string>("all");
    const [raceFilter, setRaceFilter] = useState<string>("all");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");


    const today = new Date();
    const lastMonth = new Date();
    lastMonth.setMonth(today.getMonth() - 1);

    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: lastMonth,
        to: today,
    });


    const [pageSize, setPageSize] = useState<number>(10);

    const loadHistory = async (page: number = 1) => {
        try {
            if (!dateRange?.from || !dateRange?.to) return;

            const { from, to } = dateRange;
            const result = await window.electronAPI.getRecordByDate({
                startDate: from.toISOString(),
                endDate: to.toISOString(),
                page,
                pageSize,
                sortDirection
            });

            setHistoryData(result.data);
            setTotalRecords(result.totalRecords);
            setTotalPages(result.totalPages);
            setCurrentPage(result.currentPage);
        } catch (error) {
            console.error("Error loading records:", error);
        }
    };

    useEffect(() => {
        let filtered = historyData;
        if (genderFilter !== "all") {
            filtered = filtered.filter((item) => item.gender === genderFilter);
        }
        if (raceFilter !== "all") {
            filtered = filtered.filter((item) => item.race === raceFilter);
        }

        setFilteredData(filtered);
        setTotalRecords(filtered.length);
    }, [historyData, genderFilter, raceFilter]);


    useEffect(() => {
        loadHistory();
    }, []);

    // Khi đổi ngày thì load lại từ page 1
    useEffect(() => {
        console.log(sortDirection)
        loadHistory(1);
    }, [dateRange, pageSize, sortDirection]);

    return (
        <div className="history-page-container">
            {/* Header */}
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

            {/* Bộ lọc */}
            <div className="fillter-container d-flex align-items-center gap-4 flex-wrap">
                <DatePicker value={dateRange} onChange={setDateRange} />

                <div className="group-container gender-dropdown-container">
                    <DropDown
                        iconClass="bi bi-gender-ambiguous"
                        placeholder="Chọn giới tính"
                        options={[
                            { value: "all", label: "Tất cả", iconClass: "bi bi-people" },
                            { value: "male", label: "Nam", iconClass: "bi bi-gender-male" },
                            { value: "female", label: "Nữ", iconClass: "bi bi-gender-female" },
                        ]}
                        onChange={(val) => setGenderFilter(val)}
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
                    onChange={(val) => setRaceFilter(val)}
                />

                {/* <div
                    className="group-container search-container d-flex align-items-center flex-grow-1 justify-content-between"
                    style={{ border: isSearching ? "1px solid white" : "none" }}
                >
                    <input
                        type="text"
                        onFocus={() => setIsSearching(true)}
                        onBlur={() => setIsSearching(false)}
                        placeholder="Nhập..."
                    />
                    <button className="btn d-flex gap-2">
                        <i className="bi bi-search"></i>
                        <span>Tìm kiếm</span>
                    </button>
                </div> */}
                <div className="sort-direction-container ">
                    <button
                    onClick={() => setSortDirection(sortDirection === "asc" ? "desc" : "asc")}
                    className="btn d-flex gap-2 justify-content-center align-items-center">
                        <i className="bi bi-arrow-repeat"></i>
                        {sortDirection === 'asc' ? 'Cũ nhất' : 'Mới nhất'}
                    </button>
                </div>
            </div>

            {/* Bảng dữ liệu */}
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
                            width: "24px",
                            height: "24px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        {totalRecords}
                    </span>
                </div>

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
                                {filteredData.length > 0 ? (
                                    filteredData.map((item, index) => (
                                        <tr key={index}>
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
                                            <td>{item.record?.overviewScore?.status ?? "-"}</td>
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
                        <div className="left d-flex align-items-center gap-3">
                            <DropDown
                                options={pageSizeOptions}
                                placeholder={`${pageSize}`}
                                onChange={(value) => {
                                    const newSize = parseInt(value, 10);
                                    if (newSize !== pageSize) {
                                        setPageSize(newSize);
                                        setCurrentPage(1);
                                        loadHistory(1); // load trang 1 với pageSize mới
                                    }
                                }}
                            />
                            <span> / Trang</span>
                        </div>
                        {/* <span>
                            Hiển thị {(currentPage - 1) * pageSize + 1}–
                            {Math.min(currentPage * pageSize, totalRecords)} / {totalRecords} bản ghi
                        </span> */}

                        <div className="pagination">
                            <button
                                disabled={currentPage === 1}
                                onClick={() => {
                                    const prevPage = currentPage - 1;
                                    if (prevPage >= 1) {
                                        loadHistory(prevPage);
                                    }
                                }}
                            >
                                &laquo;
                            </button>

                            {Array.from({ length: totalPages }, (_, i) => (
                                <button
                                    key={i}
                                    className={currentPage === i + 1 ? "active" : ""}
                                    onClick={() => loadHistory(i + 1)}
                                >
                                    {i + 1}
                                </button>
                            ))}

                            <button
                                disabled={currentPage === totalPages}
                                onClick={() => {
                                    const nextPage = currentPage + 1;
                                    if (nextPage <= totalPages) {
                                        loadHistory(nextPage);
                                    }
                                }}
                            >
                                &raquo;
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default HistoryPage;
