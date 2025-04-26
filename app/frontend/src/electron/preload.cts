const electron = require('electron');

electron.contextBridge.exposeInMainWorld('electronAPI', {
    startBLE: () => ipcSend('start-ble'),
    startFaceAnalyzer: (data) => ipcSend('start-face', data),
    onGettingWeight: (callback) => ipcOn('weight-data', callback),
    getMetrics:  (faceData) => ipcInvoke<'get-metrics', HealthRecord>('get-metrics', faceData),
    resetUserState: () => ipcSend('reset-user-state'),
    getFaceData: () => ipcInvoke<'get-face-data', FaceData>('get-face-data'),
    rotateCamera: (direction) => ipcSend('rotate-camera', direction),
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
    key: Key
): EventPayloadMapping[Key] extends void ? Promise<Res> : never;

function ipcInvoke<Key extends keyof EventPayloadMapping, Res = unknown>(
    key: Key,
    payload: EventPayloadMapping[Key]
): Promise<Res>;

function ipcInvoke(key: string, payload?: any): Promise<any> {
    return electron.ipcRenderer.invoke(key, payload);
}