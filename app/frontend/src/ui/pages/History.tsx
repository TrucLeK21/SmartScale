import { useEffect, useState } from "react";
import React from "react";
import "../../assets/css/HistoryPage.css";
import DatePicker from "../components/DatePickerComponent/DatePicker";
import DropDown from "../components/DropDownComponent/DropDown";
import { DateRange } from "react-day-picker";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { showToast } from "../utils/toastUtils";

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
    const [genderFilter, setGenderFilter] = useState<"all" | "male" | "female">("all");
    const [raceFilter, setRaceFilter] = useState<"all" | "asian" | "caucasian">("all");
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
                sortDirection,
                gender: genderFilter,
                race: raceFilter,
            });

            setHistoryData(result.data);
            setTotalRecords(result.totalRecords);
            setTotalPages(result.totalPages);
            setCurrentPage(result.currentPage);
        } catch (error) {
            console.error("Error loading records:", error);
        }
    };


    const exportToExcel = async () => {
        try {
            if (!dateRange?.from || !dateRange?.to) return;
            const { from, to } = dateRange;
            const allHistoryData = await window.electronAPI.getRecordByDate({
                startDate: from.toISOString(),
                endDate: to.toISOString(),
                sortDirection,
                gender: genderFilter,
                race: raceFilter,
                paginate: false,
            })

            if (!allHistoryData.data || allHistoryData.data.length === 0) {
                showToast.warn("Không có dữ liệu để xuất file");
                return;
            }

            // Chuyển dữ liệu thành JSON đơn giản (flatten record)
            const formattedData = allHistoryData.data.map((item) => ({
                "Ngày": item.record?.date ? new Date(item.record.date).toLocaleDateString() : "-",
                "Giới tính": item.gender === "male" ? "Nam" : "Nữ",
                "Chủng tộc": item.race === "asian" ? "Châu Á" : "Khác",
                "Chiều cao (cm)": item.record?.height ?? "-",
                "Cân nặng (kg)": item.record?.weight ?? "-",
                "Tuổi (năm)": item.record?.age ?? "-",
                "BMI (kg/m²)": item.record?.bmi ?? "-",
                "BMR (kcal)": item.record?.bmr ?? "-",
                "TDEE (kcal)": item.record?.tdee ?? "-",
                "LBM (kg)": item.record?.lbm ?? "-",
                "Tỉ lệ mỡ (%)": item.record?.fatPercentage ?? "-",
                "Tỉ lệ nước (%)": item.record?.waterPercentage ?? "-",
                "Khối lượng xương (kg)": item.record?.boneMass ?? "-",
                "Khối lượng cơ (kg)": item.record?.muscleMass ?? "-",
                "Tỉ lệ protein (%)": item.record?.proteinPercentage ?? "-",
                "Mỡ nội tạng": item.record?.visceralFat ?? "-", // nếu có đơn vị, ví dụ "level"
                "Cân nặng lý tưởng (kg)": item.record?.idealWeight ?? "-",
                "Điểm tổng quan": item.record?.overviewScore?.status ?? "-"
            }));

            // Format ngày YYYY-MM-DD
            const formatDate = (date: Date) => date.toISOString().split("T")[0];
            const fileName = `lich_su_do_${formatDate(from)}_den_${formatDate(to)}.xlsx`;

            // Tạo worksheet & workbook
            const worksheet = XLSX.utils.json_to_sheet(formattedData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "History");

            // Xuất file
            const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
            const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
            saveAs(blob, fileName);
        }
        catch (e) {
            showToast.error(`Đã có lỗi xảy ra: ${e}`);
        }
    };


    // Khi đổi ngày thì load lại từ page 1
    useEffect(() => {
        loadHistory(1);
    }, [dateRange, pageSize, sortDirection, genderFilter, raceFilter]);

    useEffect(() => {
        console.table(historyData);
    }, [historyData])

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
                        onChange={(val) => setGenderFilter(val as "all" | "male" | "female")}
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
                    onChange={(val) => setRaceFilter(val as "all" | "asian" | "caucasian")}
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
                        <i className="bi bi-arrow-repeat fs-4"></i>
                        {sortDirection === 'asc' ? 'Cũ nhất' : 'Mới nhất'}
                    </button>
                </div>

                <div className="export-file-container">
                    <button
                        onClick={exportToExcel}
                        className="btn d-flex gap-2 justify-content-center align-items-center">
                        <i className="bi bi-filetype-xlsx fs-4"></i>
                        Xuất file
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
                                    <th>Cân nặng (kg)</th>
                                    <th>Tuổi</th>
                                    <th>BMI (kg/m²)</th>
                                    <th>BMR (kcal/ngày)</th>
                                    <th>TDEE (kcal/ngày)</th>
                                    <th>LBM (kg)</th>
                                    <th>Tỉ lệ mỡ (%)</th>
                                    <th>Tỉ lệ nước (%)</th>
                                    <th>Khối lượng xương (kg)</th>
                                    <th>Khối lượng cơ (kg)</th>
                                    <th>Tỉ lệ protein (%)</th>
                                    <th>Mỡ nội tạng</th>
                                    <th>Cân nặng lý tưởng (kg)</th>
                                    <th>Điểm tổng quan</th>
                                </tr>
                            </thead>
                            <tbody>
                                {historyData.length > 0 ? (
                                    historyData.map((item, index) => (
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
