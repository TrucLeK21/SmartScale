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
    };
}