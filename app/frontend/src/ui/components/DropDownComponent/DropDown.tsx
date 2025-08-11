import React, { useState } from "react";
import "./DropDown.css";

interface DropDownOption {
  value: string;
  label: string;
  iconClass?: string; // class icon bootstrap, ví dụ: "bi bi-gender-male"
}

interface DropDownProps {
  options: DropDownOption[];
  placeholder?: string;
  onChange?: (value: string) => void;
  iconClass?: string; // icon bên trái của dropdown
}

const DropDown: React.FC<DropDownProps> = ({
  options,
  placeholder = "Chọn...",
  onChange,
  iconClass
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<DropDownOption | null>(null);

  const handleSelect = (option: DropDownOption) => {
    setSelected(option);
    setIsOpen(false);
    if (onChange) onChange(option.value);
  };

  return (
    <div className="custom-dropdown">
      <div
        className="dropdown-display"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        {iconClass && <i className={`${iconClass} dropdown-main-icon`}></i>}
        <span className="me-2">{selected ? selected.label : placeholder}</span>
        <i className="bi bi-chevron-down dropdown-arrow"></i>
      </div>

      {isOpen && (
        <ul className="dropdown-list">
          {options.map((option) => (
            <li
              key={option.value}
              className="dropdown-item"
              onClick={() => handleSelect(option)}
            >
              {option.iconClass && (
                <i className={`${option.iconClass} dropdown-item-icon`}></i>
              )}
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default DropDown;
