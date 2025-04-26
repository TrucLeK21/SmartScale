import { create } from "zustand";


interface HealthStore {
    gender: string;
    race: string;
    activityFactor: number;
    record: HealthRecord | null;

    // Method để thiết lập giá trị
    set: (newData: {
        gender?: string;
        race?: string;
        activityFactor?: number;
        record?: HealthRecord;
    }) => void;

    // Method để lấy toàn bộ dữ liệu
    get: () => HealthStore;

    // Kiểm tra xem dữ liệu đã đầy đủ chưa
    isComplete: () => boolean;

    // Xóa toàn bộ dữ liệu
    clear: () => void;
}

const useHealthStore = create<HealthStore>((set, get) => ({
    gender: "male",
    race: "asian",
    activityFactor: 1.55,
    record: null,

    set: (newData) =>
        set((state) => ({
        ...state,
        ...newData,
        record: newData.record ?? state.record,
    })),

    get: () => get(),

    isComplete: () => {
        const state = get();
        return (
        state.gender !== "" &&
        state.race !== "" &&
        state.activityFactor > 0 &&
        state.record !== null
        );
    },

    clear: () =>
        set({
            gender: "",
            race: "",
            activityFactor: 0,
            record: null,
    }),
}));

export default useHealthStore;
