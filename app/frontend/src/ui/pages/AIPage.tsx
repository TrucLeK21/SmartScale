import React, { useEffect, useRef, useState } from 'react';
import LoadingScreen from '../components/LoadingScreen';

const user_data = {
    "username": "user2",
    "password": "$2b$10$eQufI/GrFn8sIPpNi835xe84tL15TF8SoVcJSWvkiyTgP552nFMHi",
    "group": 2,
    "activityFactor": 1.2,
    "dateOfBirth": "2003-01-08T00:00:00.000Z",
    "fullName": "Nguyen",
    "gender": "male",
    "race": "asian",
    "overviewScore": {
        "status": "Bình thường",
        "evaluation": [
            "BMI (21.97): Bình thường - Cân nặng của bạn trong mức khỏe mạnh",
            "Độ tuổi: Thanh niên/Trưởng thành - Sức khỏe thường ổn định",
            "Giới tính: Nam - Thường có cơ bắp nhiều hơn",
            "Chủng tộc: asian - Áp dụng ngưỡng sức khỏe phù hợp"
        ],
        "recommendations": [],
        "overall_status": "Sức khỏe tổng quan: Tốt - Tiếp tục duy trì lối sống lành mạnh"
    },
    "records": [
        {
            "height": 175,
            "weight": 67.5,
            "date": "2025-04-10T00:00:00.000Z",
            "age": 22,
            "bmi": 21.97,
            "bmr": 1580,
            "tdee": 2450,
            "lbm": 54.8,
            "fatPercentage": 17.0,
            "waterPercentage": 59.0,
            "boneMass": 3.1,
            "muscleMass": 43.0,
            "proteinPercentage": 18.5,
            "visceralFat": 8,
            "idealWeight": 68.0
        }
    ]
};


function AIPage() {
    const [aiResponse, setAiResponse] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);
    const _baseUrl = "http://192.168.1.6:5000/api/ai/generate-advice"; // Thay bằng URL của server Python
    // Change this to enable API calling
    const hasFetched = useRef(false);


    const sendMessage = async () => {
        try {
            const body = { user_data };

            const response = await fetch(_baseUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            // const text = await response.text();
            // console.log(text);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const data = await response.json();
            console.log(data.message);
            setAiResponse(data.message);
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

    useEffect(() => {
        if (!hasFetched.current) {
            console.log("Fetching AI data...");
            hasFetched.current = true;
            sendMessage();
        }
    }, []);

    return isLoading ? (
        <LoadingScreen message={"Đang tải gợi ý từ AI..."} />
    ) : (
        <div className="d-flex flex-column align-items-center justify-content-center" style={styles.container}>
            <div style={styles.frame}>
                <div style={styles.content}>
                    <h2 className="mb-3">Tổng Quan</h2>
                    <p>{JSON.parse(aiResponse).overview}</p>
    
                    <div className="row mt-4">
                        <div className="col-6">
                            <h4>Chế Độ Ăn</h4>
                            <p><strong>Lượng calo:</strong></p>
                            <ul>
                                <li>Duy trì: {JSON.parse(aiResponse).diet.calories.maintain}</li>
                                <li>Giảm mỡ: {JSON.parse(aiResponse).diet.calories.cut}</li>
                                <li>Tăng cơ: {JSON.parse(aiResponse).diet.calories.bulk}</li>
                            </ul>
                            <p><strong>Thành phần dinh dưỡng: </strong></p>
                            <ul>
                                <li>Protein: {JSON.parse(aiResponse).diet.macros.protein}</li>
                                <li>Carbs: {JSON.parse(aiResponse).diet.macros.carbs}</li>
                                <li>Fats: {JSON.parse(aiResponse).diet.macros.fats}</li>
                            </ul>
                            <p><strong>Thực phẩm bổ sung:</strong> {JSON.parse(aiResponse).diet.supplements}</p>
                        </div>
    
                        <div className="col-6">
                            <h4>Luyện Tập</h4>
                            <p><strong>Cardio:</strong> {JSON.parse(aiResponse).workout.cardio}</p>
                            <p><strong>Rèn luyện sức mạnh:</strong></p>
                            <ul>
                                {JSON.parse(aiResponse).workout.strength.map((item: string, index: number) => (
                                    <li key={index}>{item}</li>
                                ))}
                            </ul>
                            <p><strong>Tần suất:</strong> {JSON.parse(aiResponse).workout.frequency}</p>
                            <p><strong>Ghi chú:</strong> {JSON.parse(aiResponse).workout.note}</p>
                        </div>
                    </div>
                </div>
            </div>
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
        msOverflowStyle: 'none',        // IE và Edge
        scrollbarWidth: 'none',         // Firefox
    } as React.CSSProperties,
    content: {
        padding: '1rem',
    }
};

export default AIPage;
