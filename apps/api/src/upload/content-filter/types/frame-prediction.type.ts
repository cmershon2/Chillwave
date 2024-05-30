import { predictionType } from "nsfwjs";

export type framePrediction = {
    timestamp: number;
    isExplicit: boolean;
    prediction: predictionType[];
}