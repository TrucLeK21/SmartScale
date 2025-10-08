import React, { useEffect, useState } from 'react'
import useHealthStore from '../hooks/healthStore';
import { useNavigate } from 'react-router-dom';
import { activityWarnSound } from '../../assets/sounds';
import { showToast } from '../utils/toastUtils';



const activityLevels = [
    { id: 1, label: 'Ít vận động', description: 'Ngồi nhiều, ít đi lại', value: 1.2 },
    { id: 2, label: 'Vận động nhẹ', description: 'Đi bộ nhẹ, ít tập luyện', value: 1.375 },
    { id: 3, label: 'Vận động vừa', description: 'Tập thể thao 3-5 ngày/tuần', value: 1.55 },
    { id: 4, label: 'Vận động nhiều', description: 'Tập thể thao 6-7 ngày/tuần', value: 1.725 },
    { id: 5, label: 'Vận động rất nhiều', description: 'Tập nặng, vận động viên', value: 1.9 },
];

const genderMap: Record<string, string> = {
    'Nam': 'male',
    'Nữ': 'female',
};

const raceMap: Record<string, string> = {
    'Châu Á': 'asian',
    'Khác': 'other',
};


const ActivitySelectPage = () => {
    const [selected, setSelected] = useState<number | null>(null);
    const userData = useHealthStore((s) => s);
    const set = useHealthStore(state => state.set);
    const navigate = useNavigate();

    const handleConfirm = async () => {
        if (selected === null) {
            activityWarnSound().play();
            showToast.warn("Vui lòng chọn mức độ vận động!");
            return;
        }
        if (userData.record === null) {
            showToast.warn("Hãy xác nhận thông tin trước");
            navigate(-1);
        }

        const activityFactor = activityLevels.find((activity) => activity.id === selected)?.value;
        if (activityFactor !== undefined) {
            const formattedData = {
                age: userData.record!.age,
                gender: genderMap[userData.gender] || userData.gender,
                race: raceMap[userData.race] || userData.race,
                height: userData.record!.height,
                activityFactor,
            };

            try {
                console.log("Gửi dữ liệu:", formattedData);
                const metrics = await window.electronAPI.getMetrics(formattedData);
                console.log("Nhận dữ liệu:", metrics);


                // Lưu dữ liệu vào db
                await window.electronAPI.addRecord({
                    gender: formattedData.gender,
                    race: formattedData.race,
                    activityFactor: formattedData.activityFactor,
                    record: metrics,
                });

                set({
                    gender: formattedData.gender,
                    race: formattedData.race,
                    activityFactor: formattedData.activityFactor,
                    record: metrics,
                });
                navigate("/result");
            } catch (error: unknown) {
                if (error instanceof Error) {
                    showToast.error(`Có lỗi xảy ra khi tính toán chỉ số: ${error.message}`);
                } else {
                    showToast.error(`Lỗi không xác định khi tính toán chỉ số: ${error}`);
                }
            }
        }
        else {
            showToast.error("Không tìm thấy mức độ vận động phù hợp!");
        }
    }

    useEffect(() => {
        console.log("activity page: ", userData);
    }, [userData])

    return (
        <div className="container-fluid d-flex flex-column align-items-center justify-content-between" style={styles.container}>
            <div className="d-flex flex-column align-items-center justify-content-center gap-2 position-relative" style={styles.frame}>
                <h4 className="text-center mb-3 text-light">Chọn mức độ vận động</h4>
                <div className="row g-3 w-100 px-2">
                    {activityLevels.map((activity) => {
                        const isSelected = selected === activity.id;

                        return (
                            <div className="col-12 col-md-4" key={activity.id}>
                                <div
                                    className="rounded-4 shadow-sm"
                                    style={{
                                        ...styles.infoCard,
                                        ...(isSelected ? styles.selectedCard : styles.unselectedCard),
                                    }}
                                    onClick={() => setSelected(activity.id)}
                                >
                                    <div style={styles.cardHeader} className="d-flex flex-row gap-2 align-items-center">
                                        <div style={styles.cardIcon} className="d-flex justify-content-center align-items-center">
                                            <i className="bi bi-person-arms-up"></i>
                                        </div>
                                        <span className="text-capitalize">{activity.label}</span>

                                    </div>
                                    <div className="d-flex justify-content-center w-100 align-items-center" style={styles.cardValue}>
                                        <p className="text-center">{activity.description}</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="confirm-button-group d-flex justify-content-between w-100 mt-5">
                    <button
                        className='btn btn-secondary text-light px-4 py-2 fs-4'
                        onClick={() => { navigate(-1) }}
                        style={{
                            borderRadius: '9999px',
                        }}
                    >
                        <i className="bi bi-chevron-left me-2 "></i>
                        Quay lại
                    </button>

                    <button
                        className='btn text-light px-4 py-2 fs-4'
                        style={{
                            backgroundColor: '#7163BA',
                            borderRadius: '9999px',

                        }}
                        onClick={() => handleConfirm()}
                    >
                        Xác nhận
                        <i className="bi bi-check-lg ms-2"></i>
                    </button>
                </div>

            </div>

        </div>
    )
}


const styles: { [key: string]: React.CSSProperties } = {
    container: {
        touchAction: 'pan-y',
    },
    frame: {
        backgroundColor: 'transparent',
        padding: '2rem 5rem',
        borderRadius: '1rem',
        width: '100%',
        height: '100%',
    },

    infoCard: {
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        touchAction: 'manipulation',
        backgroundColor: 'var(--sub-background-color)',
        color: 'white',
        height: 140,
        borderRadius: 12
    },
    cardHeader: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        padding: '0 0.5rem',
        borderRadius: 12,
        height: '4rem',
        width: '100%',
    },
    cardIcon: {
        width: '2.5rem',
        height: '2.5rem',
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        borderRadius: 12
    },
    cardValue: {
        flex: 1,
    },
    card: {
        padding: '1rem',
        cursor: 'pointer',
        transition: '0.3s',
        touchAction: 'manipulation',
        backgroundColor: 'var(--sub-background-color)',
    },
    selectedCard: {
        backgroundColor: '#7163BA',
        color: 'white',
    },
    unselectedCard: {
        backgroundColor: 'var(--sub-background-color)',
        color: 'white',
    },
}
export default ActivitySelectPage