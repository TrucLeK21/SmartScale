const electron = require('electron');

electron.contextBridge.exposeInMainWorld('electronAPI', {
    startBLE: () => ipcSend('start-ble'),
    startFaceAnalyzer: (data) => ipcSend('start-face', data),
    onGettingWeight: (callback) => ipcOn('weight-data', callback),
    getMetrics: (faceData) => ipcInvoke<'get-metrics', HealthRecord>('get-metrics', faceData),
    resetUserState: () => ipcSend('reset-user-state'),
    getFaceData: () => ipcInvoke<'get-face-data', FaceData>('get-face-data'),
    rotateCamera: (direction) => ipcSend('rotate-camera', direction),
    getAIResponse: (userData) => ipcInvoke<'get-ai-response', AIResponse>('get-ai-response', userData),
    startCCCD: (data) => ipcSend('start-cccd', data),
    startScan: () => ipcInvoke<'start-scan', ResponseMessage>('start-scan'),
    turnOffQrScanner: () => ipcSend('turn-off-qrscanner'),
    getAllRecords: () => ipcInvoke('get-all-records'),
    getRecord: (id) => ipcInvoke('get-record', id),
    addRecord: (record) => ipcInvoke('add-record', record),
    updateRecord: (id, record) => ipcInvoke('update-record', [id, record]),
    deleteRecord: (id) => ipcInvoke('delete-record', id),
    getRecordByDate: (args) => ipcInvoke<'get-record-by-date', GetRecordByDateResult>('get-record-by-date', args),
    ensurePipAndPackages: () => ipcSend("ensure-pip"),
    onGettingEnsureLogs: (callback) => ipcOn('packages-logs', callback),
    getOverviewData: (startDate, endDate) => ipcInvoke<'get-overview-data', OverviewData>('get-overview-data', { startDate, endDate }),
    getLineChartData: (startDate, endDate, metricKey) => ipcInvoke<'get-line-chart-data', ChartData[]>('get-line-chart-data', { startDate, endDate, metricKey }),
    getBMIGroupData: (startDate, endDate) => ipcInvoke<'get-bmi-group-data', BMIGroupData[]>('get-bmi-group-data', { startDate, endDate }),
    getBMIGroupByGender: (startDate, endDate) => ipcInvoke<'get-bmi-group-by-gender', BMIGroupByGender[]>('get-bmi-group-by-gender', { startDate, endDate }),


    getDebugStatus: () => ipcInvoke<'get-debug-status', { debugging: boolean }>('get-debug-status'), 
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