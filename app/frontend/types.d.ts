declare module "swiper/css";
declare module "swiper/css/navigation";
declare module "swiper/css/pagination";
declare module "swiper/css/effect-coverflow";
declare module "swiper/css/effect-fade";

interface PythonArgs {
  input: string;
}

interface WeightPayload {
  weightStatus: "measuring" | "info" | "error";
  isStable?: boolean;
  isRemoved?: boolean;
  weight?: number;
  message: string;
}

type GetRecordByDateArgs = {
  startDate: string; // hoặc Date, nhưng thường IPC nên truyền string
  endDate: string;
  page?: number;
  pageSize?: number;
};

type GetRecordByDateResult = {
  data: RecordData[];
  totalRecords: number;
  totalPages: number;
  currentPage: number;
};

type OverviewData = {
    totalRecords: number;
    averageWeight: number;
    averageBMI: number;
    averageFatPercentage: number;
}

type ChartData = {
    date: string;
    value: number;
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
    'start-scan': QrResponseMessage;
    'scan-data': { barcode: string };

    'turn-off-qrscanner': void;

    'get-all-records': void;
    'get-record': string;
    'add-record': Data;
    'update-record': [string, Partial<Data>];
    'delete-record': string;
    'get-record-by-date': GetRecordByDateArgs;
    'get-overview-data': { startDate: Date, endDate: Date };
    'get-line-chart-data': { startDate: Date, endDate: Date, metricKey: MetricKey };
    'get-bmi-group-data': {startDate: Date, endDate: Date};
    'get-bmi-group-by-gender': {startDate: Date, endDate: Date};
    "ensure-pip": ResponseMessage;
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
    height?: number;
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
}

interface RecordData {
    id?: string;
    gender: string
    race: string
    activityFactor: number
    record: HealthRecord | null
}

interface DBData {
  records: RecordData[];
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

type ResponseMessage = {
    success: boolean;
    message: string;
}

type BMIGroupData = {
    name: string;
    value: number;
}

type BMIGroupByGender = {
    ageGroup: string;
    maleBMI: number;
    femaleBMI: number;
}

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
        startScan: () => Promise<ResponseMessage>;

        turnOffQrScanner: () => void;

        getAllRecords: () => Promise<RecordData[]>;
        getRecord: (id: string) => Promise<RecordData | null>;
        addRecord: (record: RecordData) => Promise<void>;
        updateRecord: (id: string, record: Partial<RecordData>) => Promise<boolean>;
        deleteRecord: (id: string) => Promise<boolean>;
        getRecordByDate: (
            args: GetRecordByDateArgs
        ) => Promise<GetRecordByDateResult>;
        getOverviewData: (startDate: Date, endDate: Date) => Promise<OverviewData>;
        getLineChartData: (startDate: Date, endDate: Date, metricKey: MetricKey) => Promise<ChartData[]>;
        getBMIGroupData: (startDate: Date, endDate: Date) => Promise<BMIGroupData[]>;
        getBMIGroupByGender: (startDate: Date, endDate: Date) => Promise<BMIGroupByGender[]>;
        ensurePipAndPackages: () => Promise<ResponseMessage>;
    };
}
