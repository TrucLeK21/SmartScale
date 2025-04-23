import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { isDev } from './util.js';
import { getPreloadPath, getPythonEnvPath, getPythonScriptPath, getSavedImagesPath } from './pathResolver.js';
import { spawn } from 'child_process';
import fs from 'fs';
import userState from './userState.js';
import calculateRecord from './calculateMetrics.js';

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
        const matches = base64Data.match(/^data:image\/(png|jpeg);base64,(.+)$/);
        if (!matches) return;
        
        const extension = matches[1];
        const data = matches[2];
        const buffer = Buffer.from(data, 'base64');
        
        // Sử dụng path.join để tạo đường dẫn đúng cho mọi hệ điều hành (Windows, macOS, Linux)
        const savePath = path.join(getSavedImagesPath(), `screenshot-${Date.now()}.${extension}`);
        
        fs.writeFile(savePath, buffer, (err) => {
            if (err) {
                console.error('Failed to save image:', err);
            } else {
                console.log('Image saved to:', savePath);
            }
        });
        

        // Prepare the path to run the face detection script
        const pythonEnvPath = getPythonEnvPath();
        const faceScriptPath = getPythonScriptPath('face_analyzer.py');

        const scaleFactor = 0.5; // Modify this to change the scale factor
    
        const faceProcess = spawn(pythonEnvPath, [faceScriptPath, '--image', savePath, '--scale', scaleFactor.toString()]);
    
        faceProcess.stdout.on('data', (data) => {
            try {
                const message = JSON.parse(data.toString());
                console.log('Face data received:', message);
                userState.set('race', message.race);
                userState.set('age', message.age);
                userState.set('gender', message.gender);

            } catch (e) {
                console.log('Raw data:', data.toString());
                console.error('Failed to parse Python output:', e);
            }
        });
    
        faceProcess.stderr.on('data', (data) => {
            BrowserWindow.getAllWindows()[0]?.webContents.send('face-data', {
                type: 'error',
                message: data.toString()
            });
        });
    
        faceProcess.on('close', (code) => {
            console.log(`Python face analyzing process exited with code ${code}`);
        });
    });

    ipcMain.handle("get-metrics", (_event, activityFactor) => {
        const userData = userState.get();
    
        if (!userData || typeof userData !== "object") {
            throw new Error("User data is not available or invalid");
        }

        if (!userState.isComplete()) {
            console.log('User data is incomplete:', userData);
        }
    
        // Lấy các tham số từ userData
        const race = userData.race === 'AI' ? 'asian' : 'caucasian';
        const age = userData.age;
        const height = 170; // Bạn có thể thay đổi nếu cần lấy từ userData
        const weight = userData.weight;
        const gender = userData.gender === "Man" ? "male" : 'female';
    
        // Gọi hàm calculateRecord với các tham số đã được tách
        const userMetrics = calculateRecord(weight, height, age, gender, activityFactor, race);
    
        return userMetrics;
    });
    
    ipcMain.on('reset-user-state', () => {
        userState.reset();
        console.log('User state reset');
    });
})

