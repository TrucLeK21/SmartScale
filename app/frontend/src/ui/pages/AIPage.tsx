import React, { useEffect, useMemo, useRef, useState } from 'react';
import LoadingScreen from '../components/LoadingScreen';
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
    const _baseUrl = "http://localhost:5005/generate-advice"; // Thay bằng URL của server Python
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
        records: fullRecord ? { ...fullRecord, overviewScore: undefined } : {},
    }), [activityFactor, gender, race, fullRecord]);


    useEffect(() => {
        if (!hasFetched.current) {
            console.log("Đang lấy dữ liệu AI...");
            hasFetched.current = true;
            setIsLoading(true);
            const fetchAiAdvice = async () => {
                try {
                    const body = { user_data };
                    const response = await fetch(_baseUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(body),
                    });

                    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

                    const data = await response.json();
                    console.log(data.result);
                    setAiResponse(data.result);
                } catch (error) {
                    console.error('Error sending message:', error);
                    setAiResponse(JSON.stringify({
                        overview: 'Có lỗi xảy ra khi gửi yêu cầu đến server.',
                        diet: { calories: {}, macros: {}, supplements: '' },
                        workout: { cardio: '', strength: [], frequency: '', note: '' }
                    }));
                } finally {
                    setIsLoading(false);
                }
            };

            if (fullRecord) {
                fetchAiAdvice();
            }
        }
    }, [user_data, fullRecord]);

    const parsedResponse = useMemo(() => {
        try {
            return JSON.parse(aiResponse);
        } catch {
            return null;
        }
    }, [aiResponse]);

    // if (!fullRecord) {
    //     return (
    //         <div style={styles.errorContainer}>
    //             <p style={styles.errorText}>Không có dữ liệu để tạo tư vấn AI</p>
    //         </div>
    //     );
    // }

    return (isLoading && fullRecord) ? (
        <LoadingScreen message={"Đang tải gợi ý từ AI..."} />
    ) : (
        <div className="d-flex flex-column align-items-center justify-content-center" style={styles.container}>
            {!fullRecord ? (
                <div style={styles.errorContainer}>
                    <p style={styles.errorText}>Không có dữ liệu để tạo tư vấn AI</p>
                </div>
            ) : (
                <div style={styles.frame}>

                        <div style={styles.content}>
                            <h2 className="mb-3">Tổng Quan</h2>
                            <p>{parsedResponse.overview}</p>
            
                            <div className="row mt-4">
                                <div className="col-6">
                                    <h4>Chế Độ Ăn</h4>
                                    <p><strong>Lượng calo:</strong></p>
                                    <ul>
                                        <li>Duy trì: {parsedResponse.diet.calories.maintain}</li>
                                        <li>Giảm mỡ: {parsedResponse.diet.calories.cut}</li>
                                        <li>Tăng cơ: {parsedResponse.diet.calories.bulk}</li>
                                    </ul>
                                    <p><strong>Thành phần dinh dưỡng: </strong></p>
                                    <ul>
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
            )}
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
        backgroundColor: '#f8f9fa',
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
};

export default AIPage;
