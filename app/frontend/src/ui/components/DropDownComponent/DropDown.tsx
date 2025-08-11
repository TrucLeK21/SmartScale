import React, { useEffect, useRef, useState } from "react";
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
    const [openUpward, setOpenUpward] = useState<boolean>(false);
    const containerRef = useRef<HTMLDivElement>(null);


    const handleSelect = (option: DropDownOption) => {
        setSelected(option);
        setIsOpen(false);
        if (onChange) onChange(option.value);
    };
    
    useEffect(() => {
        if (isOpen && containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            const dropdownHeight = 200; // Ước lượng chiều cao dropdown list, có thể điều chỉnh hoặc tính chính xác

            // Nếu không đủ chỗ phía dưới để hiển thị dropdown, thì bật lên trên
            if (window.innerHeight - rect.bottom < dropdownHeight) {
                setOpenUpward(true);
            } else {
                setOpenUpward(false);
            }
        }
    }, [isOpen]);
    return (
        <div className="custom-dropdown" ref={containerRef} >
            <div
                className="dropdown-display"
                onClick={() => setIsOpen((prev) => !prev)}
            >
                {iconClass && <i className={`${iconClass} dropdown-main-icon`}></i>}
                <span className="me-2">{selected ? selected.label : placeholder}</span>
                <i className="bi bi-chevron-down dropdown-arrow"></i>
            </div>

            {isOpen && (
                 <ul className={`dropdown-list ${openUpward ? "upward" : ""}`}>
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
