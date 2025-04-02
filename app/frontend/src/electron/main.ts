import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { isDev } from './util.js';
import { getPreloadPath } from './pathResolver.js';
import { spawn } from 'child_process';


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

    ipcMain.on('run-python', (event, args) => {
        const pythonEnvPath = path.join(app.getAppPath(), '../backend', 'venv',  'Scripts', 'python');

        const python = spawn(pythonEnvPath, [
            path.join(app.getAppPath(), '../backend/main.py'),
            args.input,
        ]);
    
        let output = '';
    
        python.stdout.on('data', (data) => {
            output += data.toString();
        });
    
        python.stderr.on('data', (data) => {
            console.error(`Python Error: ${data}`);
        });
    
        python.on('close', (code) => {
            console.log(`Python process exited with code ${code}`); // Log it
            event.reply('python-result', output);
        });
    });
})