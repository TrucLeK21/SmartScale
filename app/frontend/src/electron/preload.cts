const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    sendPython: (args) => ipcRenderer.send('run-python', args), // send to main
    onPythonResult: (callback) => ipcRenderer.on('python-result', (_event: Electron.IpcRendererEvent, result: string) => callback(result)), // Receive from main
} satisfies Window['electronAPI']);