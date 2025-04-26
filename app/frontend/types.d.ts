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
    'start-face': string;
    'get-metrics': FaceData;
    'reset-user-state': void;
    'get-face-data': void;
    'rotate-camera': Direction;
};

type UserData = {
    race?: string;
    gender?: string;
    age?: number;
    height?: number;
    weight?: number;
};

type FaceData = {
    age: number;
    gender: string;
    race: string;
};

interface HealthRecord {
    date: Date;
    height: number;
    weight: number;
    age: number;
    bmi: number;
    bmr: number;
    tdee: number;
    lbm: number;
    fatPercentage: number;
    waterPercentage: number;
    boneMass: number;
    muscleMass: number;
    proteinPercentage: number;
    visceralFat: number;
    idealWeight: number;
    overviewScore: OverallHealthEvaluation;
};

type Direction = "up" | "down" | "stop" | "default";

type UnsubscribeFunction = () => void;

interface Window {
    electronAPI: {
        startBLE: () => void;
        startFaceAnalyzer: (data: string) => void;
        onGettingWeight: (callback: (data: WeightPayload) => void) => UnsubscribeFunction;
        getMetrics: (faceData: FaceData) => Promise<HealthRecord>;
        resetUserState: () => void;
        getFaceData: () => Promise<FaceData>;
        rotateCamera: (direction: Direction) => void;
    };
}