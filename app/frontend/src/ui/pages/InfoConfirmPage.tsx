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
    });
    const set = useHealthStore(state => state.set);
    const navigate = useNavigate();

    useEffect(() => {
        setIsLoading(true);
        const getFaceData = async () => {
            try {
                const data = await window.electronAPI.getFaceData('id_card');
                setIsLoading(false);
                const displayData = {
                    age: data.age,
                    race: data.race === 'asian' ? 'Châu Á' : 'Khác',
                    gender: data.gender === 'male' ? 'Nam' : 'Nữ',
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
        setIsLoading(false);

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
                activityFactor,
            };
    
            try {
                console.log("Gửi dữ liệu:", formattedData);
                const metrics = await window.electronAPI.getMetrics(formattedData);
                console.log("Nhận dữ liệu:", metrics);
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
                <Form>
                    {['Nam', 'Nữ'].map((option) => (
                        <Form.Check
                            key={option}
                            type="radio"
                            id={`gender-${option}`}
                            label={option}
                            value={option}
                            checked={tempValue === option}
                            onChange={(e) => setTempValue(e.target.value)}
                            className="mb-3"
                            style={{ fontSize: '1.2rem', padding: '1rem' }}
                        />
                    ))}
                </Form>
            );
        } else if (editingField === 'race') {
            return (
                <Form>
                    {['Châu Á', 'Khác'].map((option) => (
                        <Form.Check
                            key={option}
                            type="radio"
                            id={`race-${option}`}
                            label={option}
                            value={option}
                            checked={tempValue === option}
                            onChange={(e) => setTempValue(e.target.value)}
                            className="mb-3"
                            style={{ fontSize: '1.2rem', padding: '1rem' }}
                        />
                    ))}
                </Form>
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
                <h3 className="text-center mb-3">Xác nhận thông tin của bạn</h3>
    
                <div className="w-100 mb-4">
                    <div className="row g-3 text-center">
                        {['age', 'gender', 'race'].map((field) => (
                            <div className="col-md-4" key={field}>
                                <div
                                    className="bg-light rounded-3 p-3 shadow-sm border border-secondary-subtle hover-shadow"
                                    style={{ cursor: 'pointer', touchAction: 'manipulation' }}
                                    onClick={() => handleEdit(field)}
                                >
                                    <h6 className="text-capitalize">{field === 'age' ? 'Tuổi' : field === 'gender' ? 'Giới tính' : 'Chủng tộc'}</h6>
                                    <p className="fs-5 fw-bold mb-0">{userData[field as keyof typeof userData]}</p>
                                    <small className="text-muted">Nhấn để chỉnh sửa</small>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
    
                <h4 className="text-center mb-3">Chọn mức độ vận động</h4>
                <div className="row g-3 w-100 px-2">
                    {activityLevels.map((activity) => {
                        const isSelected = selected === activity.id;
    
                        return (
                            <div className="col-12 col-md-4" key={activity.id}>
                                <div
                                    className="border rounded-4 shadow-sm"
                                    style={{
                                        ...styles.card,
                                        ...(isSelected ? styles.selectedCard : styles.unselectedCard),
                                    }}
                                    onClick={() => setSelected(activity.id)}
                                >
                                    <h5 className="mb-1">{activity.label}</h5>
                                    <p className="mb-0">{activity.description}</p>
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
            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Chỉnh sửa {editingField === 'age' ? 'Tuổi' : editingField === 'gender' ? 'Giới tính' : 'Chủng tộc'}</Modal.Title>
                </Modal.Header>
                <Modal.Body className='pl-3'>
                    {renderEditField()}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)} style={{ padding: '0.75rem 1.5rem', fontSize: '1.1rem' }}>
                        Hủy
                    </Button>
                    <Button variant="primary" onClick={handleSaveEdit} style={{ padding: '0.75rem 1.5rem', fontSize: '1.1rem' }}>
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
        padding: '3rem 5rem',
        touchAction: 'pan-y',
    },
    frame: {
        backgroundColor: '#f8f9fa',
        padding: '2rem 5rem',
        borderRadius: '1rem',
        width: '100%',
        height: '100%',
    },
    card: {
        padding: '1rem',
        cursor: 'pointer',
        transition: '0.3s',
        touchAction: 'manipulation',
    },
    selectedCard: {
        backgroundColor: 'var(--appbar-color)',
        color: 'white',
    },
    unselectedCard: {
        backgroundColor: '#f1f1f1',
        color: 'black',
    },
    confirmButton: {
        background: 'linear-gradient(180deg, #8B70FB, #5E2FFA)',
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