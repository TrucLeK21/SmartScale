const electron = require('electron');

electron.contextBridge.exposeInMainWorld('electronAPI', {
    startBLE: () => ipcSend('start-ble'),
    saveImage: (data) => ipcSend('save-image', data),
    onGettingWeight: (callback) => ipcOn('weight-data', callback),
    removeListener: (event, callback) => electron.ipcRenderer.removeListener(event, callback),
} satisfies Window['electronAPI']);

function ipcSend<Key extends keyof EventPayloadMapping>(
    key: Key,
    payload?: EventPayloadMapping[Key] // Payload là optional
) {
    if (payload) {
        electron.ipcRenderer.send(key, payload);
    } else {
        electron.ipcRenderer.send(key);
    }
}

function ipcOn<Key extends keyof EventPayloadMapping>(
    key: Key,
    callback: (payload: EventPayloadMapping[Key]) => void
): UnsubscribeFunction {
    const cb = (_: Electron.IpcRendererEvent, payload: EventPayloadMapping[Key]) => {
        callback(payload);
    };
    electron.ipcRenderer.on(key, cb);
    return () => electron.ipcRenderer.off(key, cb);
}
