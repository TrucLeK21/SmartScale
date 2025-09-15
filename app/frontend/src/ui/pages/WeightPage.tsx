import React, { useEffect, useState } from 'react';
import "react-toastify/dist/ReactToastify.css";
import LoadingScreen from '../components/LoadingScreenComponent/LoadingScreen';
import { analyzeWeightSavedSound, analyzeWeightSound, removeWarnSound } from '../../assets/sounds';
import { useNavigate } from 'react-router-dom';
import { showToast } from '../utils/toastUtils';

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
                    showToast.warn(data.message);
                } else {
                    showToast.info(data.message);
                }
            }

            if (data.weightStatus === 'measuring' && data.weight !== undefined) {
                setAnimate(true);
                setTimeout(() => setAnimate(false), 200);
            }

            setIsStable(data.isStable ?? false);

            if (data.isStable) {
                showToast.success("Cân nặng đã được cập nhật!");
                analyzeWeightSavedSound().play();
                setTimeout(() => {
                    navigate("/info");
                }, 2000);
            }
        });

        return () => unsubscribe();
    }, [navigate]);


    // useEffect(() => {
    //     // ⚠️ Tạm thời bỏ BLE thật
    //     // handleStartBLE();
    //     // analyzeWeightSound().play();

    //     // 🎯 Dummy test: giả lập dữ liệu cân nặng sau 3 giây
    //     const timeout = setTimeout(() => {
    //         const dummyData: WeightPayload = {
    //             weight: 65.5,
    //             weightStatus: 'measuring',
    //             isStable: true,
    //             message: 'Dummy test: weight measured',
    //         };

    //         setWeightData(dummyData);
    //         setIsLoading(false);
    //         setIsRemoved(false);
    //         setIsStable(dummyData.isStable ?? true);

    //         showToast.success("Cân nặng đã được cập nhật!");
    //         analyzeWeightSavedSound().play();

    //         setTimeout(() => {
    //             navigate("/info");
    //         }, 2000);
    //     }, 3000); // 3 giây

    //     // 🧼 Cleanup khi unmount
    //     return () => clearTimeout(timeout);
    // }, [navigate]);

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
        </div>
    );
}

const styles: { [key: string]: React.CSSProperties } = {
    container: {
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
