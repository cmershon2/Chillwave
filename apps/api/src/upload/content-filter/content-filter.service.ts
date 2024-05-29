import { Injectable } from '@nestjs/common';
import * as tf from '@tensorflow/tfjs-node';
import * as path from 'path';
import { extractFramesFromVideo } from './utils/content-filter.utils';

@Injectable()
export class ContentFilterService {

    private model: tf.GraphModel;

    constructor() {
        this.loadModel();
    }

    private async loadModel() {
        // Get the path to the model directory
        const modelPath = path.join(__dirname, '..', 'models', 'default-f16');
    
        // Load the TensorFlow model from the model directory
        this.model = await tf.loadGraphModel(`file://${modelPath}/model.json`);
    }

    async detectExplicitVideoContent(videoPath: string): Promise<boolean> {
        // Extract frames from the video at a specific sampling rate
        const frames = await extractFramesFromVideo(videoPath);
    
        // Classify each frame using the TensorFlow model
        const predictions = await Promise.all(
          frames.map((frame) => this.classifyFrame(frame)),
        );
    
        // Determine if any frame is classified as explicit content
        const hasExplicitContent = predictions.some((prediction) => prediction);
    
        return hasExplicitContent;
      }

      private async classifyFrame(frame: tf.TensorLike): Promise<boolean> {
        // Preprocess the frame for the TensorFlow model
        const preprocessedFrame = preprocess(frame);
    
        // Run the TensorFlow model on the preprocessed frame
        const prediction = this.model.predict(preprocessedFrame);
    
        // Interpret the prediction and return true if explicit content is detected
        return interpretPrediction(prediction);
      }
}