import { Injectable } from '@nestjs/common';
import * as tf from '@tensorflow/tfjs-node';
import * as nsfwjs from "nsfwjs";
import { extractFramesFromVideo, interpretPrediction } from './utils/content-filter.utils';
import { Constants } from './constants/content-filter.constants';
import { framePrediction } from './types/frame-prediction.type';
import { PredictionResults } from './types/prediction-results.type';

@Injectable()
export class ContentFilterService {

    private model: nsfwjs.NSFWJS;

    constructor() {
        this.loadModel();
    }

    private async loadModel() {
        this.model = await nsfwjs.load("MobileNetV2Mid");
    }

    async detectExplicitVideoContent(videoPath: string): Promise<PredictionResults> {

        // Extract frames from the video
        const frames = await extractFramesFromVideo(videoPath);
        let results : PredictionResults = { passed: true, reason:'', flaggedFrames:[] }; 
    
        // Classify each frame using the TensorFlow model
        const predictions = await Promise.all(
          frames.map((frame, index) => this.classifyFrame(frame, index)),
        );
    
        // Determine if any frame is classified as explicit content
        const flaggedFrames = predictions.filter((prediction) => prediction.isExplicit)

        if(flaggedFrames){
            // TODO write to db that video contains explicit content
            results.passed = false;
            results.reason = 'Explicit content found'
            results.flaggedFrames = flaggedFrames.map(frame => frame.timestamp)
        }

        return results;
      }

      private async classifyFrame(frame: Buffer, index: number): Promise<framePrediction> {

        const preprocessedFrame = tf.node.decodeJpeg(frame, 3); // decode jpeg buffer to raw tensor
        const timestampEstimate = index * Constants.VIDEO_SAMPLE_RATE;

        // Run the TensorFlow model on the preprocessed frame
        const predictions = await this.model.classify(preprocessedFrame);

        const analysis = interpretPrediction(timestampEstimate, predictions);

        return analysis;
      }
}