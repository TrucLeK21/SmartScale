import { useState } from "react";
import { DateRange, DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import "./DatePicker.css";

const DatePicker: React.FC = () => {
    const today: Date = new Date();

    // Ngày đã lưu chính thức
    const [savedDate, setSavedDate] = useState<DateRange | undefined>({
        from: today,
        to: today,
    });

    // Ngày đang chọn trong modal
    const [selected, setSelected] = useState<DateRange | undefined>(savedDate);

    const [isOpen, setIsOpen] = useState<boolean>(false);

    const togglePicker = () => {
        if (isOpen) {
            // Đang mở → đóng
            setIsOpen(false);
        } else {
            // Đang đóng → mở và copy giá trị từ savedDate
            setSelected(savedDate);
            setIsOpen(true);
        }
    };

    const handleCancel = () => {
        setSelected(savedDate); // khôi phục
        setIsOpen(false);
    };

    const handleSave = () => {
        setSavedDate(selected);
        setIsOpen(false);
    };

    return (
        <div className="group-container date-picker-container d-flex align-items-center">
            <div className="content-show d-flex gap-2" onClick={togglePicker}>
                <div className="date-picker-icon">
                    <i className="bi bi-calendar"></i>
                </div>
                <div className="date-picker-text">
                    {`${savedDate?.from ? savedDate.from.toLocaleDateString() : "dd/mm/yyyy"} - ${savedDate?.to ? savedDate.to.toLocaleDateString() : "dd/mm/yyyy"
                        }`}
                </div>
            </div>

            {isOpen && (
                <div className="date-modal-container">
                    <DayPicker
                        animate={true}
                        mode="range"
                        selected={selected}
                        onSelect={setSelected}
                    />
                    <div className="btn-container d-flex gap-2 justify-content-end mt-3">
                        <button className="btn btn-secondary" onClick={handleCancel}>
                            Hủy
                        </button>
                        <button className="btn btn-success" onClick={handleSave}>
                            Lưu
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DatePicker;
