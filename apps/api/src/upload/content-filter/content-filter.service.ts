import { Injectable } from '@nestjs/common';
import * as tf from '@tensorflow/tfjs-node';
import * as nsfwjs from "nsfwjs";
import { extractFramesFromVideo, interpretPrediction } from './utils/content-filter.utils';
import { Constants } from './constants/content-filter.constants';
import { FramePrediction } from './types/frame-prediction.type';
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

    async detectExplicitVideoContent(videoBuffer: Buffer): Promise<PredictionResults> {

      // Extract frames from the video
      const frames = await extractFramesFromVideo(videoBuffer);

      let results : PredictionResults = { 
        passed: true, 
        review: false, 
        reason:'', 
        flaggedFrames:[],
        frameData: [],
      }; 
    
      // Classify each frame using the TensorFlow model
      const predictions = await Promise.all(
        frames.map((frame, index) => this.classifyFrame(frame, index)),
      );
  
      // Determine if any frame is classified as explicit content
      const reviewFrames = predictions.filter((prediction) => prediction.isExplicit==true && prediction.review==true)
      const explicitFrames = predictions.filter((prediction) => prediction.isExplicit==true && prediction.review==false)
      
      // Calculate % of possible explicit content
      const explicitThreshold = explicitFrames.length / frames.length;

      // Handle cases that the video needs to be reviewed manually
      if(reviewFrames.length > 0 && explicitThreshold < Constants.VIDEO_EXPLICIT_THRESHOLD) {
        results.passed = false;
        results.review = true;
        results.reason = 'Possible explicit content found, further review required'
        results.flaggedFrames = reviewFrames.map(frame => frame.timestamp)
        results.frameData = predictions
        return results;
      }

      // Handle cases that the video contains large amounts of explicit content
      if(explicitThreshold > Constants.VIDEO_EXPLICIT_THRESHOLD){
        results.passed = false;
        results.review = false;
        results.reason = 'Exceeding amount of explicit content found'
        results.flaggedFrames = reviewFrames.map(frame => frame.timestamp)
        results.frameData = predictions;
        return results;
      }

      return results;
    }

      private async classifyFrame(frame: Buffer, index: number): Promise<FramePrediction> {

        const preprocessedFrame = tf.node.decodeJpeg(frame, 3); // decode jpeg buffer to raw tensor
        const timestampEstimate = index * Constants.VIDEO_SAMPLE_RATE;

        // Run the TensorFlow model on the preprocessed frame
        const predictions = await this.model.classify(preprocessedFrame);

        const analysis = interpretPrediction(timestampEstimate, predictions);

        return analysis;
      }
}