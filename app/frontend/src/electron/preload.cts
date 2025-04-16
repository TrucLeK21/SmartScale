const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    sendPython: (args) => ipcRenderer.send('run-python', args), // send to main
    onPythonResult: (callback) => ipcRenderer.on('python-result', (_event: Electron.IpcRendererEvent, result: string) => callback(result)), // Receive from main
    removeListener: (callback) => ipcRenderer.removeListener('python-result', callback), // Remove listener
    saveImage: (data) => ipcRenderer.send('save-image', data),
} satisfies Window['electronAPI']);