import { app, BrowserWindow, ipcMain, screen } from 'electron';
import path from 'path';
import { isDev } from './util.js';
import { getPreloadPath, getPythonEnvPath, getPythonScriptPath, getSavedImagesPath } from './pathResolver.js';
import { spawn } from 'child_process';
import fs from 'fs';
import userState from './userState.js';
import calculateRecord from './calculateMetrics.js';
import { SerialPort, ReadlineParser } from 'serialport';
import crypto from 'crypto';
import dayjs from 'dayjs';


const SHOW_PYTHON_ERRORS = false;
let faceRecognitionDone = false;
let port: SerialPort | null = null;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
let parser: ReadlineParser | null = null;

const checkPortExists = async (portPath: string): Promise<boolean> => {
    try {
        const ports = await SerialPort.list();
        return ports.some(port => port.path === portPath);
    } catch (err: unknown) {
        console.error('Error listing serial ports:', (err as Error).message);
        return false;
    }
};

const openSerialPort = (portNum: string) => {
    if (port && port.isOpen) {
        console.log("Port already open, closing first...");
        port.close((err) => {
            if (err) {
                console.error("Error closing port:", err);
                return;
            }
            console.log("Port closed. Reopening...");
            createPort(portNum);
        });
    } else {
        createPort(portNum);
    }
};

type ParsedCCCD = {
    cccd_id: string;
    cmnd_id: string;
    name: string;
    dob: string;
    gender: string;
    address: string;
    issue_date: string;
}
const createPort = (portNum: string) => {
    console.log("Opening port:", portNum);
    port = new SerialPort({ path: portNum, baudRate: 115200 });
    parser = port.pipe(new ReadlineParser());
};

app.on("ready", () => {
    const { width, height } = screen.getPrimaryDisplay().workAreaSize
    const mainWindow = new BrowserWindow({
        width,
        height,
        webPreferences: {
            preload: getPreloadPath(),
        }
    });
    if (isDev()) {
        mainWindow.webContents.session.clearCache();
        mainWindow.loadURL('http://localhost:5123/');
    } else {
        mainWindow.loadFile(path.join(app.getAppPath(), '/dist-react/index.html'));
    }


    ipcMain.on('start-ble', async () => {
        const pythonEnvPath = getPythonEnvPath();
        const pythonScriptPath = getPythonScriptPath('weight_scale.py');

        const ESP32_VID = "303A"; // Espressif VID

        try {
            const ports = await SerialPort.list();
            const esp32Port = ports.find(port => port.vendorId && port.vendorId.toUpperCase() === ESP32_VID);

            if (esp32Port) {
                console.log('ESP32 detected on port:', esp32Port.path);

                openSerialPort(esp32Port.path);
                
                // Gửi lệnh GET
                port?.write('GET\n', (err) => {
                    if (err) {
                        return console.error('Error writing:', err.message);
                    }
                    console.log('GET command sent');
                });
                // Đọc dữ liệu từ ESP32
                port?.on('data', (data) => {
                    const received = data.toString().trim();
                    if (received.includes('[SERIAL]')) {
                        const match = received.match(/(\d+(\.\d+)?)\s*kg/);

                        if (match) {
                            const finalWeight = parseFloat(match[1]);
                            console.log("Weight:", finalWeight);

                            const message = { isStable: true, weight: finalWeight };
                            userState.set('weight', finalWeight);
                            BrowserWindow.getAllWindows()[0]?.webContents.send('weight-data', message);
                        } else {
                            console.log("Cannot find weight.");
                        }
                    }
                });

                return;
            }
        } catch (err) {
            console.error('Error checking serial ports:', err);
        }

        // if ESP32 not found, run python script
        const python = spawn(pythonEnvPath, [pythonScriptPath]);
        console.log('Python process started:', pythonEnvPath, pythonScriptPath);

        python.stdout.on('data', (data) => {
            try {
                const message = JSON.parse(data.toString());
                if (message.isStable) {
                    userState.set('weight', message.weight);
                }

                BrowserWindow.getAllWindows()[0]?.webContents.send('weight-data', message);
            } catch (e) {
                console.error('Failed to parse Python output:', e);
            }
        });

        python.stderr.on('data', (data) => {
            const errorMessage = { weightStatus: 'error', message: data.toString() };
            BrowserWindow.getAllWindows()[0]?.webContents.send('weight-data', errorMessage);
        });

        python.on('close', (code) => {
            console.log(`Python measuring weight process exited with code ${code}`);
        });
    });



    ipcMain.on('start-face', (_event, base64Data: string) => {
        faceRecognitionDone = false;
        const matches = base64Data.match(/^data:image\/(png|jpeg);base64,(.+)$/);
        if (!matches) return;

        // const extension = matches[1];
        const data = matches[2];
        const buffer = Buffer.from(data, 'base64');

        // Tạo khóa và IV (khóa cần lưu lại dùng để giải mã phía Python)
        const key = crypto.randomBytes(32); // AES-256
        const iv = crypto.randomBytes(16);  // 128-bit IV

        // Mã hóa ảnh bằng AES-CBC
        const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
        const encryptedBuffer = Buffer.concat([cipher.update(buffer), cipher.final()]);

        const encryptedPath = path.join(getSavedImagesPath(), `screenshot-${Date.now()}.enc`);

        fs.writeFile(encryptedPath, encryptedBuffer, (err) => {
            if (err) {
                console.error('Failed to save encrypted image:', err);
            } else {
                console.log('Encrypted image saved to:', encryptedPath);
            }
        });

        // Gọi script Python và truyền thêm key + iv (mã hóa base64 để an toàn)
        const pythonEnvPath = getPythonEnvPath();
        const faceScriptPath = getPythonScriptPath('face_analyzer.py');

        const faceProcess = spawn(pythonEnvPath, [
            faceScriptPath,
            '--image', encryptedPath,
            '--key', key.toString('base64'),
            '--iv', iv.toString('base64'),
            '--angle', '75' // Thay đổi góc nghiêng nếu cần
        ]);

        // const args = [
        //     '--image', encryptedPath,
        //     '--key', key.toString('base64'),
        //     '--iv', iv.toString('base64'),
        //     '--angle', '55' // Thay đổi góc nghiêng nếu cần
        // ];

        // console.log('Running command:', pythonEnvPath, '[faceScriptPath]', ...args);

        faceProcess.stdout.on('data', (data) => {
            console.log(`Python output: ${data}`);
        });

        faceProcess.stdout.on('data', (data) => {
            try {
                const message = JSON.parse(data.toString());
                console.log('Python face analyzing output:', message);

                if (message.type === 'success') {
                    userState.set('race', message.race === 'AI' ? 'asian' : 'other');
                    userState.set('age', message.age);
                    userState.set('gender', message.gender === "Man" ? "male" : 'female');
                    userState.set('height', message.height);
                    faceRecognitionDone = true;
                }
            } catch (e) {
                console.log('Raw data:', data.toString());
                console.error('Failed to parse Python output:', e);
            }
        });

        faceProcess.stderr.on('data', (data) => {
            if (SHOW_PYTHON_ERRORS) {
                console.error('Error from Python process:', data.toString());
            }
        });

        faceProcess.on('close', (code) => {
            console.log(`Python face analyzing process exited with code ${code}`);
        });
    });


    ipcMain.handle("get-face-data", async (_, mode: string) => {
        if (mode === 'face') {
            const timeout = 15000;
            const pollInterval = 100;

            const waitForRecognition = () => new Promise<void>((resolve, reject) => {
                const startTime = Date.now();
                const interval = setInterval(() => {
                    if (faceRecognitionDone) {
                        clearInterval(interval);
                        resolve();
                    } else if (Date.now() - startTime > timeout) {
                        clearInterval(interval);
                        reject(new Error("Timeout waiting for face recognition to complete"));
                    }
                }, pollInterval);
            });

            if (!faceRecognitionDone) {
                await waitForRecognition();
            }
        }

        // hard code height
        userState.set('height', 170);

        const userData = userState.get();
        console.log(userData);
        if (!userData || typeof userData !== "object") {
            throw new Error("User data is not available or invalid");
        }

        if (!userState.isComplete(["activityFactor"])) {
            console.log('User data is incomplete:', userData);
            throw new Error("User data is incomplete");
        }

        return {
            race: userData.race,
            gender: userData.gender,
            age: userData.age,
        };
    });


    ipcMain.on('reset-user-state', () => {
        userState.reset();
        console.log('User state reset');
    });

    ipcMain.handle("get-metrics", (_event, faceData) => {
        userState.update(faceData);
        // userState.set('height', 170); // Set height to a default value for testing

        const userData = userState.get();
        console.log('User data:', userData);

        if (!userData || typeof userData !== "object") {
            throw new Error("User data is not available or invalid");
        }

        if (!userState.isComplete()) {
            console.log('User data is incomplete:', userData);
            throw new Error("User data is incomplete");
        }


        // Gọi hàm calculateRecord với các tham số đã được tách
        const userMetrics = calculateRecord(userData.weight, userData.height, userData.age, userData.gender, userData.activityFactor, userData.race);

        return userMetrics;
    });

    ipcMain.on("rotate-camera", async (event, direction) => {
        const isPortAvailable = await checkPortExists('COM8');
        if (!isPortAvailable) {
            console.error('Port COM8 does not exist, skipping command send');
            event.reply('serial-response', { success: false, message: 'Cổng COM8 không tồn tại' });
            return;
        }

        openSerialPort("COM8"); // Ensure the serial port is open before sending the command
    
        let command = "";

        if (direction === "up") command = "SERVO-MOVEUP";
        else if (direction === "down") command = "SERVO-MOVEDN";
        else if (direction === "stop") command = "SERVO-STOP";
        else if (direction === "default") command = "SERVO-MOVEDEFAULT";

        if (command) {
            const fullCommand = command + "\n";
            port?.write(fullCommand, (err) => {
                if (err) {
                    console.error("Error sending serial:", err.message);
                    event.reply("serial-response", { success: false, message: "Lỗi gửi dữ liệu" });
                } else {
                    console.log("Command sent:", fullCommand);
                    event.reply("serial-response", { success: true, message: "Đã gửi string đến COM8" });
                }
            });
        }
    });


    ipcMain.handle("get-ai-response", async (_event, userData) => {
        const _baseUrl = "https://health-app-server-j2mc.onrender.com/api/ai/generate-advice"; // Thay bằng URL của server Python
        try {
            const response = await fetch(_baseUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_data: userData }),
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            console.log(response);
            const data = await response.json();
            let messageText = data.message;

            if (typeof messageText === 'string') {
                // Bỏ phần markdown ` ```json` đầu và ``` cuối nếu có
                messageText = messageText
                    .replace(/^```json\s*/i, '')  // Bỏ ```json và ký tự xuống dòng
                    .replace(/\s*```$/, '');      // Bỏ ``` cuối cùng
            }

            const result = JSON.parse(messageText);

            return result as AIResponse;
        } catch (error) {
            console.error('Error sending message:', error);
            return {
                overview: 'Không thể lấy tư vấn từ AI.',
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
            };
        }
    });

    ipcMain.on('start-cccd', (_evnent, data: ParsedCCCD) => {
        const age = dayjs().diff(dayjs(data.dob, 'YYYY-MM-DD'), 'year');

        userState.set("age", age);
        userState.set("gender", data.gender.toLowerCase() === "nam" ? "male" : "female");
        userState.set("race", 'asian');

        console.log(userState.get());
        console.log('Parsed CCCD data:', data);
    });
})


