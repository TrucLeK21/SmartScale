import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { isDev } from './util.js';
import { getPreloadPath, getSavedImagesPath } from './pathResolver.js';
import { spawn } from 'child_process';
import fs from 'fs';

app.on("ready", () => {
    const mainWindow = new BrowserWindow({
        webPreferences: {
            preload: getPreloadPath(),
        }
    });
    if (isDev()) {
        mainWindow.loadURL('http://localhost:5123/');
    } else {
        mainWindow.loadFile(path.join(app.getAppPath(), '/dist-react/index.html'));
    }

    ipcMain.on('start-face', (_event, imagePath: string) => {
        const pythonEnvPath = path.join(app.getAppPath(), '..', 'backend', 'venv', 'Scripts', 'python.exe');
        const faceScriptPath = path.join(app.getAppPath(), '..', 'backend', 'face_detect.py');
    
        const faceProcess = spawn(pythonEnvPath, [faceScriptPath, imagePath]);
    
        faceProcess.stdout.on('data', (data) => {
            try {
                const message = JSON.parse(data.toString());
                BrowserWindow.getAllWindows()[0]?.webContents.send('face-data', message);
            } catch (e) {
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
            BrowserWindow.getAllWindows()[0]?.webContents.send('face-data', {
                type: 'info',
                message: `Face process exited with code ${code}`
            });
        });
    });
    
    

    ipcMain.on('start-ble', () => {
        const pythonEnvPath = path.join(app.getAppPath(), '..', 'backend', 'venv', 'Scripts', 'python.exe');
        const pythonScriptPath = path.join(app.getAppPath(), '..', 'backend', 'weight_scale.py');

        const python = spawn(pythonEnvPath, [
            pythonScriptPath,
        ]);

        console.log('Python process started:', pythonEnvPath, pythonScriptPath);

        python.stdout.on('data', (data) => {
            try {
                const message = JSON.parse(data.toString());
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
            console.log(`Python process exited with code ${code}`);
        });
    });

    ipcMain.on('save-image', (_event, base64Data: string) => {
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
    });
})

