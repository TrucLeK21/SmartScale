import React, { useEffect, useState } from 'react';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LoadingScreen from '../components/LoadingScreen';
import { analyzeWeightSavedSound, analyzeWeightSound, removeWarnSound } from '../../assets/sounds';
import { useNavigate } from 'react-router-dom';

function WeightDisplayPage() {
    const [weightData, setWeightData] = useState<WeightPayload | null>(null);
    const [isStable, setIsStable] = useState(false);
    const [animate, setAnimate] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isRemoved, setIsRemoved] = useState(false);
    const navigate = useNavigate();

    const handleStartBLE = () => {
        window.electronAPI.startBLE();
    };

    const handleToastify = (message: string, type: 'success' | 'error' | 'info' | 'warn') => {
        const config = {
            position: "top-right" as const,
            autoClose: 2000,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: false,
            draggable: true,
        };
        switch (type) {
            case 'success':
                toast.success(message, config);
                break;
            case 'error':
                toast.error(message, config);
                break;
            case 'info':
                toast.info(message, config);
                break;
            case 'warn':
                toast.warn(message, config);
                break;
        }
    };

    useEffect(() => {
        handleStartBLE();
        analyzeWeightSound().play();

        const unsubscribe = window.electronAPI.onGettingWeight((data: WeightPayload) => {
            setWeightData(data);
            setIsLoading(false);
            setIsRemoved(false);

            if (data.weightStatus === 'info') {
                if (data.message?.includes('Finding') || data.message?.includes('Connected')) {
                    setIsLoading(true);
                } else if (data.message?.includes('removed')) {
                    setIsRemoved(true);
                    removeWarnSound().play();
                    handleToastify(data.message, 'warn');
                } else {
                    handleToastify(data.message, 'info');
                }
            }

            if (data.weightStatus === 'measuring' && data.weight !== undefined) {
                setAnimate(true);
                setTimeout(() => setAnimate(false), 200);
            }

            setIsStable(data.isStable ?? false);

            if (data.isStable) {
                handleToastify("Cân nặng đã được cập nhật!", 'success');
                analyzeWeightSavedSound().play();
                setTimeout(() => {
                    navigate("/activity");
                }, 2000);
            }
        });

        return () => unsubscribe();
    }, [navigate]);

    const getTransform = () => {
        if (animate && !isStable) return 'scale(1.05)';
        if (isStable) return 'scale(1.1)';
        return 'scale(1)';
    };

    const dynamicStyles: React.CSSProperties = {
        ...styles.weightBox,
        transform: getTransform(),
        color: isStable ? '#198754' : 'var(--appbar-color)',
        borderRadius: isStable ? '1rem' : '0',
        boxShadow: isStable ? '0 0 20px #198754' : 'none',
    };

    const title = isStable
        ? "Cân nặng của bạn"
        : isRemoved
            ? "Xin hãy bước vào lại cân"
            : "Đang đo cân nặng";

    const titleColor = isRemoved ? '#dc3545' : '#212529';

    return isLoading ? (
        <LoadingScreen message={weightData?.message} />
    ) : (
        <div className="container-fluid d-flex flex-column align-items-center justify-content-center" style={styles.container}>
            <div className="d-flex flex-column align-items-center justify-content-center position-relative" style={styles.frame}>
                <h1 className="mb-4" style={{ color: titleColor }}>{title}</h1>
                <div className="weight-box fw-bold" style={dynamicStyles}>
                    {weightData?.weight !== undefined ? `${weightData.weight.toFixed(1)} kg` : '--.- kg'}
                </div>
            </div>
            <ToastContainer />
        </div>
    );
}

const styles: { [key: string]: React.CSSProperties } = {
    container: {
        height: '100%',
        padding: '3rem 5rem',
    },
    frame: {
        backgroundColor: '#f8f9fa',
        borderRadius: '1rem',
        height: '100%',
        width: '100%',
    },
    weightBox: {
        fontSize: '5rem',
        transition: 'transform 0.2s ease-in-out, color 0.2s, box-shadow 0.2s',
        padding: '2rem',
    },
};

export default WeightDisplayPage;
