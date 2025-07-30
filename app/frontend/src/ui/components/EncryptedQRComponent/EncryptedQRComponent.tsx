import React from 'react';
import CryptoJS from 'crypto-js';
import { QRCodeSVG } from 'qrcode.react';
import bkLogo from '../../../assets/bkLogo.svg';

interface EncryptToQRProps {
    data: Omit<HealthRecord, 'overviewScore'> | null;
    size?: number;
}

const EncryptToQR: React.FC<EncryptToQRProps> = ({ data, size = 128 }) => {

    const styles: { [key: string]: React.CSSProperties } = {
        container: {
            position: 'relative',
            display: 'inline-block',
            padding: '2rem',
            backgroundColor: 'white',
            borderRadius: 15
        },
        logo: {
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: size / 2,
            height: size / 2,
            objectFit: 'contain',
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

    if (data === null) {
        return (
        <div style={styles.errorContainer}>
            <p style={styles.errorText}>Không có dữ liệu để tạo mã QR</p>
        </div>
        );
    }

    const jsonString = JSON.stringify(data);

    // Encrypt json string with AES
    const secretKey = 'mysupersecretkey';
    const key128 = CryptoJS.enc.Utf8.parse(secretKey);
    const iv = CryptoJS.enc.Utf8.parse('1234567890123456'); // 16 byte IV
    const encryptedData = CryptoJS.AES.encrypt(jsonString, key128, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
    }).toString();

    return (
        <div style={styles.container}>
        <QRCodeSVG 
        value={encryptedData} 
        size={size} 
        />
        <img src={bkLogo} alt="BK Logo" style={styles.logo} />
        </div>
    );
};


export default EncryptToQR;