import React, { useEffect, useMemo, useRef, useState } from 'react';
import LoadingScreen from '../components/LoadingScreenComponent/LoadingScreen';
import useHealthStore from '../hooks/healthStore';
// const user_data1 = {
//     "activityFactor": 1.2,
//     "gender": "male",
//     "race": "asian",
//     "overviewScore": {
//         "status": "Bình thường",
//         "evaluation": [
//             "BMI (21.97): Bình thường - Cân nặng của bạn trong mức khỏe mạnh",
//             "Độ tuổi: Thanh niên/Trưởng thành - Sức khỏe thường ổn định",
//             "Giới tính: Nam - Thường có cơ bắp nhiều hơn",
//             "Chủng tộc: asian - Áp dụng ngưỡng sức khỏe phù hợp"
//         ],
//         "recommendations": [],
//         "overall_status": "Sức khỏe tổng quan: Tốt - Tiếp tục duy trì lối sống lành mạnh"
//     },
//     "records": [
//         {
//             "height": 175,
//             "weight": 67.5,
//             "date": "2025-04-10T00:00:00.000Z",
//             "age": 22,
//             "bmi": 21.97,
//             "bmr": 1580,
//             "tdee": 2450,
//             "lbm": 54.8,
//             "fatPercentage": 17.0,
//             "waterPercentage": 59.0,
//             "boneMass": 3.1,
//             "muscleMass": 43.0,
//             "proteinPercentage": 18.5,
//             "visceralFat": 8,
//             "idealWeight": 68.0
//         }
//     ]
// };


function AIPage() {
    const [aiResponse, setAiResponse] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);
    const [isDebugging, setIsDebugging] = useState<boolean>(false);
    // Change this to enable API calling
    const hasFetched = useRef(false);

    const fullRecord = useHealthStore(state => state.getRecord());
    const activityFactor = useHealthStore(state => state.activityFactor);
    const gender = useHealthStore(state => state.gender);
    const race = useHealthStore(state => state.race);

    const user_data = useMemo(() => ({
        activityFactor,
        gender,
        race,
        overviewScore: fullRecord?.overviewScore,
        records: fullRecord ? [{ ...fullRecord, overviewScore: undefined }] : [],
    }), [activityFactor, gender, race, fullRecord]);



    useEffect(() => {
        const fetchData = async () => {
            if (hasFetched.current) return;
            hasFetched.current = true;
            setIsLoading(true);

            try {
                const { debugging } = await window.electronAPI.getDebugStatus();

                if (debugging) {
                    console.log("Đang ở chế độ DEBUG, không gọi AI");
                    setIsDebugging(true);
                    setAiResponse(JSON.stringify({
                        overview: '',
                        diet: {
                            calories: { maintain: '', cut: '', bulk: '' },
                            macros: { protein: '', carbs: '', fats: '' },
                            supplements: ''
                        },
                        workout: {
                            cardio: '',
                            strength: [],
                            frequency: '',
                            note: ''
                        }
                    }));
                    setIsLoading(false);
                    return;
                }

                console.log("Đang gọi API AI...");
                const response = await window.electronAPI.getAIResponse(user_data);
                setAiResponse(JSON.stringify(response, null, 2));
                setIsLoading(false);
                console.log("Lấy dữ liệu AI thành công");
            } catch (error) {
                console.error("Lỗi khi lấy dữ liệu AI:", error);
                setAiResponse('');
                setIsLoading(false);
            }
        };

        fetchData();
    }, [user_data]);
    // user_data1, fullRecord
    const parsedResponse = useMemo(() => {
        try {
            return JSON.parse(aiResponse);
        } catch {
            return null;
        }
    }, [aiResponse]);
    // return (isLoading && fullRecord) ? (
    return (isLoading) ? (
        <LoadingScreen message={"Đang tải gợi ý từ AI..."} />
    ) : (
        <div className="d-flex flex-column align-items-center justify-content-center" style={styles.container}>
            {isDebugging && (
                <div style={styles.debugBanner}>
                    🚧 Đang ở chế độ Debugging - dữ liệu hiển thị là rỗng 🚧
                </div>
            )}
            <div style={styles.frame}>

                <div className='text-light' style={styles.content}>
                    <h2 className="mb-3">Tổng Quan</h2>
                    <p>{parsedResponse.overview}</p>

                    <div className="row mt-4">
                        <div className="col-6">
                            <h4>Chế Độ Ăn</h4>
                            <p><strong>Lượng calo:</strong></p>
                            <ul className='fw-light'>
                                <li>Duy trì: {parsedResponse.diet.calories.maintain}</li>
                                <li>Giảm mỡ: {parsedResponse.diet.calories.cut}</li>
                                <li>Tăng cơ: {parsedResponse.diet.calories.bulk}</li>
                            </ul>
                            <p><strong>Thành phần dinh dưỡng: </strong></p>
                            <ul className='fw-light'>
                                <li>Protein: {parsedResponse.diet.macros.protein}</li>
                                <li>Carbs: {parsedResponse.diet.macros.carbs}</li>
                                <li>Fats: {parsedResponse.diet.macros.fats}</li>
                            </ul>
                            <p><strong>Thực phẩm bổ sung:</strong> {parsedResponse.diet.supplements}</p>
                        </div>

                        <div className="col-6">
                            <h4>Luyện Tập</h4>
                            <p><strong>Cardio:</strong> {parsedResponse.workout.cardio}</p>
                            <p><strong>Rèn luyện sức mạnh:</strong></p>
                            <ul>
                                {parsedResponse.workout.strength.map((item: string, index: number) => (
                                    <li key={index}>{item}</li>
                                ))}
                            </ul>
                            <p><strong>Tần suất:</strong> {parsedResponse.workout.frequency}</p>
                            <p><strong>Ghi chú:</strong> {parsedResponse.workout.note}</p>
                        </div>
                    </div>
                </div>
            </div>
            {/* )} */}
        </div>
    );
}
const styles: { [key: string]: React.CSSProperties } = {
    container: {
        height: '100%',
        padding: '3rem 5rem',
        touchAction: 'pan-y',
    },
    frame: {
        backgroundColor: 'var(--sub-background-color)',
        padding: '1rem',
        borderRadius: '1rem',
        width: '100%',
        height: '100%',
        overflowY: 'auto',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',

        // Ẩn scrollbar
        msOverflowStyle: 'none',
        scrollbarWidth: 'none',
    } as React.CSSProperties,
    content: {
        padding: '1rem',

    },
    errorContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '1rem',
        backgroundColor: '#f8d7da',
        borderRadius: '0.5rem',
        border: '1px solid #f5c6cb',
    },
    errorText: {
        color: '#721c24',
        fontSize: '1rem',
        margin: 0,
    },
    debugBanner: {
        backgroundColor: '#ffc107',
        color: '#212529',
        textAlign: 'center',
        fontWeight: 'bold',
        padding: '8px',
        borderRadius: '0.5rem',
        marginBottom: '1rem',
    },
};

export default AIPage;
