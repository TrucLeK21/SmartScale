const electron = require('electron');

electron.contextBridge.exposeInMainWorld('electronAPI', {
    startBLE: () => ipcSend('start-ble'),
    startFaceAnalyzer: (data) => ipcSend('start-face', data),
    onGettingWeight: (callback) => ipcOn('weight-data', callback),
    onFaceData: (callback) => ipcOn('face-data', callback),
    getMetrics:  (activityFactor) => ipcInvoke<'get-metrics', HealthRecord>('get-metrics', activityFactor),
    resetUserState: () => ipcSend('reset-user-state'),
} satisfies Window['electronAPI']);

function ipcSend<Key extends keyof EventPayloadMapping>(
    key: Key,
    payload?: EventPayloadMapping[Key] // Payload is optional
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

function ipcInvoke<Key extends keyof EventPayloadMapping, Res = unknown>(
    key: Key,
    payload: EventPayloadMapping[Key]
): Promise<Res> {
    return electron.ipcRenderer.invoke(key, payload);
}