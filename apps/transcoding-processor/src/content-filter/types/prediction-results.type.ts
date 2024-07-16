import { FramePrediction } from './frame-prediction.type';

export type PredictionResults = {
  passed: boolean;
  reason: string;
  review: boolean;
  flaggedFrames: number[];
  frameData: FramePrediction[];
};
