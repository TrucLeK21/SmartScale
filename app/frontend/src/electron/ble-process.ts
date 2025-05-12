import { BrowserWindow } from 'electron';
import { spawn } from 'child_process';
import path from 'path';

function isJsonString(str: string): boolean {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
}

export function startBLEReader(mainWindow: BrowserWindow): void {
  const pythonProcess = spawn('python', [path.join(__dirname, 'ble_reader.py')]);

  pythonProcess.stdout.on('data', (data: Buffer) => {
    const lines = data.toString().split('\n').map(l => l.trim()).filter(Boolean);

    for (const line of lines) {
      if (isJsonString(line)) {
        const json = JSON.parse(line);
        mainWindow.webContents.send('weight-data', json);
      } else {
        console.log('[BLE LOG]', line);
      }
    }
  });

  pythonProcess.stderr.on('data', (data: Buffer) => {
    console.error('[BLE ERROR]', data.toString());
  });

  pythonProcess.on('exit', (code: number) => {
    console.log(`[BLE] Python exited with code ${code}`);
  });
}
