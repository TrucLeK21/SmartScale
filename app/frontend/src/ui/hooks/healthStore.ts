import { create } from 'zustand';

interface HealthData {
    faceData: {
        age?: number;
        gender?: string;
        race?: string;
    } | null;
    height?: number;
    weight?: number;
}

interface HealthStore extends HealthData {
    setFaceData: (data: HealthData['faceData']) => void;
    setHeight: (height: number) => void;
    setWeight: (weight: number) => void;
    resetData: () => void;
}

export const useHealthStore = create<HealthStore>((set) => ({
    faceData: null,
    height: undefined,
    weight: undefined,
    
    setFaceData: (data) => set({ faceData: data }),
    setHeight: (height) => set({ height }),
    setWeight: (weight) => set({ weight }),
    resetData: () => set({ faceData: null, height: undefined, weight: undefined }),
}));
