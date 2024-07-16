import { predictionType } from 'nsfwjs';

export type FramePrediction = {
  timestamp: number;
  isExplicit: boolean;
  review: boolean;
  prediction: predictionType[];
};
