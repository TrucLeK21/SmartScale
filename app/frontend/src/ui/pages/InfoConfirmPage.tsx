import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Modal, Button, Form } from 'react-bootstrap';
import { activityWarnSound, analyzeActivitySound } from '../../assets/sounds';
import "react-toastify/dist/ReactToastify.css";
import HoldableNumberPicker from '../components/NumberPickerComponent/NumberPickerComponent';
import LoadingScreen from '../components/LoadingScreenComponent/LoadingScreen';
import useHealthStore from '../hooks/healthStore';
import { useNavigate } from 'react-router-dom';
import { showToast } from '../utils/toastUtils';
import '../../assets/css/InfoConfirmPage.css'

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

const InfoConfirmScreen: React.FC = () => {
    const [selected, setSelected] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [editingField, setEditingField] = useState<string | null>(null);
    const [tempValue, setTempValue] = useState<string | number>('');
    const [showModal, setShowModal] = useState(false);
    const [userData, setUserData] = useState({
        age: 25,
        gender: 'Nữ',
        race: 'Châu Á',
        height: 170,
    });
    const set = useHealthStore(state => state.set);
    const navigate = useNavigate();

    useEffect(() => {
        setIsLoading(true);
        const getFaceData = async () => {
            try {
                const data = await window.electronAPI.getFaceData();
                setIsLoading(false);
                const displayData = {
                    age: data.age,
                    race: data.race === 'asian' ? 'Châu Á' : 'Khác',
                    gender: data.gender === 'male' ? 'Nam' : 'Nữ',
                    height: data.height || 170, // Default height if not provided
                };
                console.log(displayData);
                setUserData(displayData);
                analyzeActivitySound().play();
            } catch (error: unknown) {
                if (error instanceof Error) {
                    showToast.error(`Có lỗi xảy ra khi lấy dữ liệu khuôn mặt: ${error.message}`);
                } else {
                    showToast.error(`Lỗi không xác định: ${error}`);
                }
            }
        };

        // Mock data for testing
        // const displayData = {
        //     age: 25,
        //     race: 'Châu Á',
        //     gender: 'Nam'
        // };
        // setUserData(displayData);
        // setIsLoading(false);

        getFaceData();
    }, []);

    const handleConfirm = async () => {
        if (selected === null) {
            activityWarnSound().play();
            showToast.warn("Vui lòng chọn mức độ vận động!");
            return;
        }

        const activityFactor = activityLevels.find((activity) => activity.id === selected)?.value;
        if (activityFactor !== undefined) {
            const formattedData = {
                age: userData.age,
                gender: genderMap[userData.gender] || userData.gender,
                race: raceMap[userData.race] || userData.race,
                height: userData.height,
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

        } else {
            showToast.error("Không tìm thấy mức độ vận động phù hợp!");
        }
    };

    const handleEdit = (field: string) => {
        setEditingField(field);
        setTempValue(userData[field as keyof typeof userData] || '');
        setShowModal(true);
    };

    const handleSaveEdit = () => {
        if (editingField) {
            setUserData((prev) => ({ ...prev, [editingField]: tempValue }));
            setEditingField(null);
            setShowModal(false);
        }
    };

    const renderEditField = () => {
        if (editingField === 'age') {
            return (
                <HoldableNumberPicker
                    min={6}
                    max={99}
                    initial={userData.age}
                    step={1}
                    onChange={(value) => setTempValue(value)}
                />
            );
        } else if (editingField === 'gender') {
            return (
                <Form className='d-flex justify-content-center gap-4 align-items-center'>
                    {['Nam', 'Nữ'].map((option) => (
                        <Form.Check
                            key={option}
                            type="radio"
                            id={`gender-${option}`}
                            label={option}
                            value={option}
                            checked={tempValue === option}
                            onChange={(e) => setTempValue(e.target.value)}
                            style={{ fontSize: '1.2rem', padding: '1rem' }}
                        />
                    ))}
                </Form>
            );
        } else if (editingField === 'race') {
            return (
                <Form className='d-flex justify-content-center gap-4 align-items-center'>
                    {['Châu Á', 'Khác'].map((option) => (
                        <Form.Check
                            key={option}
                            type="radio"
                            id={`race-${option}`}
                            label={option}
                            value={option}
                            checked={tempValue === option}
                            onChange={(e) => setTempValue(e.target.value)}
                            style={{ fontSize: '1.2rem', padding: '1rem' }}
                        />
                    ))}
                </Form>
            );
        } else if (editingField === 'height') {
            return (
                <HoldableNumberPicker
                    min={50}
                    max={250}
                    initial={userData.height}
                    step={1}
                    onChange={(value) => setTempValue(value)}
                />
            );

        }
        return null;
    };

    return isLoading ? (
        <>
            <LoadingScreen message={"Getting face data..."} />
        </>
    ) : (
        <div className="container-fluid d-flex flex-column align-items-center justify-content-between" style={styles.container}>
            <div className="d-flex flex-column align-items-center justify-content-center gap-2 position-relative" style={styles.frame}>
                <h3 className="text-center mb-3 text-light">Xác nhận thông tin của bạn</h3>

                <div className="w-100 mb-4">
                    <div className="row g-3 text-center">
                        {['age', 'gender', 'race', 'height'].map((field) => (
                            <div className="col-md-3 col-sm-6" key={field}>
                                <div
                                    className="rounded-3 shadow-sm hover-shadow align-items-center"
                                    style={styles.infoCard}
                                    onClick={() => handleEdit(field)}
                                >
                                    <div style={styles.cardHeader} className="d-flex flex-row gap-2 align-items-center">
                                        <div style={styles.cardIcon} className="d-flex justify-content-center align-items-center">
                                            <i className="bi bi-database-fill"></i>
                                        </div>
                                        <span className="text-capitalize">{field === 'age' ? 'Tuổi' : field === 'gender' ? 'Giới tính' : field === 'race' ? 'Chủng tộc' : 'Chiều cao'}</span>

                                    </div>
                                    <div className="d-flex justify-content-center w-100 align-items-center" style={styles.cardValue}>
                                        <p className="fs-5 fw-bold mb-0">{userData[field as keyof typeof userData]}</p>
                                    </div>
                                    <div className="footer mb-2">
                                        <small className="text-white">Nhấn để chỉnh sửa</small>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

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
                                        <p className="">{activity.description}</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <button className="fs-5 mt-4" style={styles.confirmButton} onClick={handleConfirm}>
                    Xác nhận
                </button>
            </div>


            {/* Modal chỉnh sửa thông tin */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered >
                <Modal.Header closeButton>
                    <Modal.Title>Chỉnh sửa {editingField === 'age' ? 'Tuổi' : editingField === 'gender' ? 'Giới tính': editingField === 'race' ? 'Chủng tộc' : 'Chiều cao'}</Modal.Title>
                </Modal.Header>
                <Modal.Body className='pl-3'>
                    {renderEditField()}
                </Modal.Body>
                <Modal.Footer >
                    <Button variant="secondary" onClick={() => setShowModal(false)} style={{ padding: '0.5rem 1rem', fontSize: '1rem' }}>
                        Hủy
                    </Button>
                    <Button variant="primary" onClick={handleSaveEdit} style={{ padding: '0.5rem 1rem', fontSize: '1rem' }}>
                        Lưu
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );

};

const styles: { [key: string]: React.CSSProperties } = {
    container: {
        height: '100%',
        // padding: '3rem 5rem',  
        // padding: '2rem',
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
    confirmButton: {
        backgroundColor: '#7163BA',
        color: 'white',
        padding: '1rem 2rem',
        fontWeight: 700,
        border: 'none',
        borderRadius: '9999px',
        fontSize: '1.2rem',
        touchAction: 'manipulation',
    },
};

export default InfoConfirmScreen;