import React, { useState, useRef, useEffect } from 'react';
import { Button } from 'react-bootstrap';

interface Props {
    min?: number;
    max?: number;
    step?: number;
    initial?: number;
    onChange?: (value: number) => void;
}

const HoldableNumberPicker: React.FC<Props> = ({
    min = 1,
    max = 100,
    step = 1,
    initial = 25,
    onChange,
}) => {
    const [value, setValue] = useState(initial);
    const intervalRef = useRef<number | null>(null);

    useEffect(() => {
        if (onChange) onChange(value);
    }, [value, onChange]);

    const changeValue = (delta: number) => {
        setValue((prev) => {
            const newVal = Math.min(max, Math.max(min, prev + delta * step));
            return newVal;
        });
    };

    const startHold = (delta: number) => {
        changeValue(delta);
        intervalRef.current = setInterval(() => changeValue(delta), 100);
    };

    const stopHold = () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = null;
    };

    return (
        <div className="d-flex flex-row align-items-center justify-content-center gap-4">
            <Button
                onMouseDown={() => startHold(-1)}
                onMouseUp={stopHold}
                onMouseLeave={stopHold}
                onTouchStart={() => startHold(-1)}
                onTouchEnd={stopHold}
            // className="mt-2"
            >
                -
            </Button>


            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{value}</div>
            <Button
                onMouseDown={() => startHold(1)}
                onMouseUp={stopHold}
                onMouseLeave={stopHold}
                onTouchStart={() => startHold(1)}
                onTouchEnd={stopHold}
            // className="mb-2"
            >
                +
            </Button>

        </div>
    );
};

export default HoldableNumberPicker;
