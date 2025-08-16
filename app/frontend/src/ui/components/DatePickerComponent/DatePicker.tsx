// DatePicker.tsx
import { useState } from "react";
import { DateRange, DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import "./DatePicker.css";

interface DatePickerProps {
  value: DateRange | undefined; // giá trị ngày nhận từ cha
  onChange: (range: DateRange | undefined) => void; // callback gửi lên cha
}

const DatePicker: React.FC<DatePickerProps> = ({ value, onChange }) => {
  const [selected, setSelected] = useState<DateRange | undefined>(value);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const togglePicker = () => {
    setSelected(value); // khi mở lại thì copy giá trị từ cha
    setIsOpen(!isOpen);
  };

  const handleCancel = () => {
    setSelected(value);
    setIsOpen(false);
  };

  const handleSave = () => {
    onChange(selected); // báo lên cha
    setIsOpen(false);
  };

  return (
    <div className="group-container date-picker-container d-flex align-items-center">
      <div className="content-show d-flex gap-2" onClick={togglePicker}>
        <div className="date-picker-icon">
          <i className="bi bi-calendar"></i>
        </div>
        <div className="date-picker-text">
          {`${value?.from ? value.from.toLocaleDateString() : "dd/mm/yyyy"} - ${
            value?.to ? value.to.toLocaleDateString() : "dd/mm/yyyy"
          }`}
        </div>
      </div>

      {isOpen && (
        <div className="date-modal-container">
          <DayPicker
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
