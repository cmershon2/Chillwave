import { Injectable } from '@nestjs/common';
import * as tf from '@tensorflow/tfjs-node';
import * as path from 'path';
import * as nsfwjs from "nsfwjs";
import { extractFramesFromVideo, interpretPrediction, preprocess } from './utils/content-filter.utils';
import { spawn } from 'child_process';
import { Constants } from './constants/content-filter.constants';
import { framePrediction } from './types/frame-prediction.type';

@Injectable()
export class ContentFilterService {

    private model: nsfwjs.NSFWJS;

    constructor() {
        this.loadModel();
    }

    private async loadModel() {
        this.model = await nsfwjs.load("MobileNetV2Mid");
    }

    async detectExplicitVideoContent(videoPath: string): Promise<framePrediction[]> {

        // Extract frames from the video at a specific sampling rate
        const frames = await extractFramesFromVideo(videoPath);
    
        // Classify each frame using the TensorFlow model
        const predictions = await Promise.all(
          frames.map((frame, index) => this.classifyFrame(frame, index)),
        );
    
        // Determine if any frame is classified as explicit content
        const flaggedFrames = predictions.filter((prediction) => prediction.isExplicit)

        return flaggedFrames;
      }

      private async classifyFrame(frame: Buffer, index: number): Promise<framePrediction> {
        // Preprocess the frame for the TensorFlow model
        const preprocessedFrame = await preprocess(frame);
        const timestampEstimate = index * Constants.VIDEO_SAMPLE_RATE;

        // Run the TensorFlow model on the preprocessed frame
        const predictions = await this.model.classify(preprocessedFrame);

        const analysis = interpretPrediction(timestampEstimate, predictions);

        return analysis;
      }
}