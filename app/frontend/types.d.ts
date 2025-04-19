interface PythonArgs {
    input: string;
}

interface WeightPayload {
    weightStatus: 'measuring' | 'info' | 'error';
    isStable?: boolean;
    isRemoved?: boolean;
    weight?: number;
    message: string;
}

type EventPayloadMapping = {
    'start-ble': void;
    'weight-data': WeightPayload;
    'save-image': string;
};

type UnsubscribeFunction = () => void;

interface Window {
    electronAPI: {
        startBLE: () => void;
        saveImage: (data: string) => void;
        onGettingWeight: (callback: (data: WeightPayload) => void) => UnsubscribeFunction;
        removeListener: (event: keyof EventPayloadMapping, callback: (data: WeightPayload) => void) => void;
    };
}