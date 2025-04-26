import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { isDev } from './util.js';
import { getPreloadPath, getPythonEnvPath, getPythonScriptPath, getSavedImagesPath } from './pathResolver.js';
import { spawn } from 'child_process';
import fs from 'fs';
import userState from './userState.js';
import calculateRecord from './calculateMetrics.js';
import { SerialPort, ReadlineParser } from 'serialport';

const SHOW_PYTHON_ERRORS = false;
let faceRecognitionDone = false;
let port: SerialPort | null = null;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
let parser: ReadlineParser | null = null;

const openSerialPort = () => {
    if (!port || !port.isOpen) {
        port = new SerialPort({ path: "COM8", baudRate: 115200 });
        parser = port.pipe(new ReadlineParser());
    }
};

app.on("ready", () => {
    const mainWindow = new BrowserWindow({
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
    

    ipcMain.on('start-ble', () => {
        const pythonEnvPath = getPythonEnvPath();
        const pythonScriptPath = getPythonScriptPath('weight_scale.py');

        const python = spawn(pythonEnvPath, [
            pythonScriptPath,
        ]);

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
    
        const extension = matches[1];
        const data = matches[2];
        const buffer = Buffer.from(data, 'base64');
    
        const savePath = path.join(getSavedImagesPath(), `screenshot-${Date.now()}.${extension}`);
    
        fs.writeFile(savePath, buffer, (err) => {
            if (err) {
                console.error('Failed to save image:', err);
            } else {
                console.log('Image saved to:', savePath);
            }
        });
    
        const pythonEnvPath = getPythonEnvPath();
        const faceScriptPath = getPythonScriptPath('face_analyzer.py');
    
        const faceProcess = spawn(pythonEnvPath, [faceScriptPath, '--image', savePath]);

        console.log(pythonEnvPath, faceScriptPath, '--image', savePath);
    
        faceProcess.stdout.on('data', (data) => {
            try {
                const message = JSON.parse(data.toString());
    
                if (message.type === 'success') {
                    userState.set('race', message.race === 'AI' ? 'asian' : 'other');
                    userState.set('age', message.age);
                    userState.set('gender', message.gender === "Man" ? "male" : 'female');
    
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
    
    
    ipcMain.handle("get-face-data", async () => {
        const timeout = 10000;
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
    
        const userData = userState.get();
    
        if (!userData || typeof userData !== "object") {
            throw new Error("User data is not available or invalid");
        }
    
        if (!userState.isComplete(["activityFactor", "height"])) {
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
        userState.set('height', 170); // Set height to a default value for testing

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

    ipcMain.on("rotate-camera", (event, direction) => {
        openSerialPort(); // Ensure the serial port is open before sending the command
    
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
})

