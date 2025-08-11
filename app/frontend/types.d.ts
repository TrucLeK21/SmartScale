declare module 'swiper/css';
declare module 'swiper/css/navigation';
declare module 'swiper/css/pagination';
declare module 'swiper/css/effect-coverflow';
declare module 'swiper/css/effect-fade';

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
    'get-ai-response': UserData;
    'start-cccd': string;
    'start-scan': void;
    'scan-data': { barcode: string };

    'get-all-records': void;
    'get-record': number;                
    'add-record': Data;             
    'update-record': [number, Partial<Data>];
    'delete-record': number;
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

interface RecordData {
    gender: string
    race: string
    activityFactor: number
    record: HealthRecord | null
}

interface DBData {
    records: RecordData[]
}

type Direction = "up" | "down" | "stop" | "default";

type UnsubscribeFunction = () => void;

type AIResponse = {
    overview: string;
    diet: {
        calories: {
            maintain: string;
            cut: string;
            bulk: string;
        };
        macros: {
            protein: string;
            carbs: string;
            fats: string;
        };
        supplements: string;
    };
    workout: {
        cardio: string;
        strength: string[];
        frequency: string;
        note: string;
    };
};
type ParsedCCCD = {
    cccd_id: string;
    cmnd_id: string;
    name: string;
    dob: string;
    gender: string;
    address: string;
    issue_date: string;
};

interface Window {
    electronAPI: {
        startBLE: () => void;
        startFaceAnalyzer: (data: string) => void;
        onGettingWeight: (callback: (data: WeightPayload) => void) => UnsubscribeFunction;
        getMetrics: (faceData: FaceData) => Promise<HealthRecord>;
        resetUserState: () => void;
        getFaceData: () => Promise<FaceData>;
        rotateCamera: (direction: Direction) => void;
        getAIResponse: (user_data: UserData) => Promise<AIResponse>;
        startCCCD: (data: string) => void;
        startScan: () => void;
        onScanResult: (callback: (data: { barcode: string }) => void) => UnsubscribeFunction;

        getAllRecords: () => Promise<Data[]>;                       // Trả về mảng Data
        getRecord: (index: number) => Promise<Data | null>;         // Trả về 1 record hoặc null
        addRecord: (record: Data) => Promise<void>;                  // Thêm record, không trả về gì
        updateRecord: (index: number, record: Partial<Data>) => Promise<boolean>;  // Cập nhật trả về true/false
        deleteRecord: (index: number) => Promise<boolean>;
    };
}