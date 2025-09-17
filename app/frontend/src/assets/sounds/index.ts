import analyzeGreet from './analyzeGreet.wav';
import analyzeFace from './analyzeFace.wav';
import removeWarn from './removeWarn.wav';
import analyzeActivity from './analyzeActivity.wav';
import analyzeWeight from './analyzeWeight.wav';
import analyzeWeightSaved from './analyzeWeightSaved.wav';
import activityWarn from './activityWarn.wav';
import useCCCD1 from './useCCCD1.wav'
import useCCCD2 from './useCCCD2.wav'

export const greetingSound = () => new Audio(analyzeGreet);
export const analyzeFaceSound = () => new Audio(analyzeFace);
export const removeWarnSound = () => new Audio(removeWarn);
export const analyzeActivitySound = () => new Audio(analyzeActivity);
export const analyzeWeightSavedSound = () => new Audio(analyzeWeightSaved);
export const analyzeWeightSound = () => new Audio(analyzeWeight);
export const activityWarnSound = () => new Audio(activityWarn);
export const useCCCD1Sound = () => new Audio(useCCCD1);
export const useCCCD2Sound = () => new Audio(useCCCD2);