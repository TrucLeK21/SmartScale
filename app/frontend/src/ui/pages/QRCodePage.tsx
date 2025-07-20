import { useEffect, useRef } from "react";
import EncryptedQRComponent from "../components/EncryptedQRComponent/EncryptedQRComponent"
import useHealthStore from "../hooks/healthStore";
// import { useSwiperSlide } from 'swiper/react';

function QRCodePage() {
    const data = useHealthStore((state) => state.getRecord());
    const cachedQRData = useRef<Omit<HealthRecord, 'overviewScore'> | null>(null);
    const hasGenerated = useRef(false);

    // let dataWithoutOverview: Omit<HealthRecord, 'overviewScore'> | null = null;

    // const data = {
    //     "height": 170,
    //     "weight": 67.5,
    //     "date": new Date(2025, 4, 23),
    //     "age": 25,
    //     "bmi": 21.97,
    //     "bmr": 1580,
    //     "tdee": 2450,
    //     "lbm": 54.8,
    //     "fatPercentage": 17.0,
    //     "waterPercentage": 59.0,
    //     "boneMass": 3.1,
    //     "muscleMass": 43.0,
    //     "proteinPercentage": 18.5,
    //     "visceralFat": 8,
    //     "idealWeight": 68.0,
    //     // "overviewScore": {
    //     //         "status": "Thừa cân",
    //     //         "evaluation": [
    //     //             "BMI (23.01): Thừa cân - Bạn có nguy cơ về sức khỏe nếu không kiểm soát cân nặng",
    //     //             "Độ tuổi: Thanh niên/Trưởng thành - Sức khỏe thường ổn định",
    //     //             "Giới tính: Nam - Thường có cơ bắp nhiều hơn",
    //     //             "Chủng tộc: Châu Á - Áp dụng ngưỡng sức khỏe phù hợp"
    //     //         ],
    //     //         "recommendations": [
    //     //             "Kiểm soát cân nặng bằng chế độ ăn uống lành mạnh và tập thể dục đều đặn"
    //     //         ],
    //     //         "overall_status": "Sức khỏe tổng quan: Khá ổn - Theo dõi và điều chỉnh nếu cần"
    //     //     }
    // };
    const size = 256;

    useEffect(() => {
        if (!hasGenerated.current) {
            if (data) {
                cachedQRData.current = Object.fromEntries(
                    Object.entries(data).filter(([key]) => key !== 'overviewScore')
                ) as Omit<HealthRecord, 'overviewScore'>;
            }
        }
    }, [data]);

    return (
        <div className="container-fluid d-flex flex-column align-items-center justify-content-center" style={styles.container}>
            <div className="d-flex flex-column align-items-center justify-content-center position-relative gap-3" style={styles.frame}>
                <h2 style={styles.title}>Quét Mã QR Để Lấy Thông Tin</h2>
                <EncryptedQRComponent data={cachedQRData.current} size={size}/>
                <p style={styles.instruction}>
                    Mở ứng dụng và chọn biểu tượng <i className="bi bi-qr-code-scan" style={styles.icon}></i> rồi quét mã QR phía trên.
                </p>
            </div>
        </div>
    )
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
    title: {
        fontSize: '1.5rem',
        fontWeight: 'bold',
        color: '#333',
    },
    instruction: {
        fontSize: '1rem',
        color: '#555',
        marginBottom: '10px',
        lineHeight: '1.5',
    },
    icon: {
        fontSize: "1.5rem",
        verticalAlign: "middle",
    }
};

export default QRCodePage