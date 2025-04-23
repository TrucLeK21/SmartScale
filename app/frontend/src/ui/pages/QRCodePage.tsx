import EncryptedQRComponent from "../components/EncryptedQRComponent"

function QRCodePage() {
    const data = {
        "height": 170,
        "weight": 67.5,
        "date": new Date(2025, 4, 23),
        "age": 25,
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
        "idealWeight": 68.0,
    };
    const size = 256;

    return (
        <div className="container-fluid d-flex flex-column align-items-center justify-content-center" style={styles.container}>
            <div className="d-flex flex-column align-items-center justify-content-center position-relative gap-3" style={styles.frame}>
                <h2 style={styles.title}>Quét Mã QR Để Lấy Thông Tin</h2>
                <EncryptedQRComponent data={data} size={size}/>
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