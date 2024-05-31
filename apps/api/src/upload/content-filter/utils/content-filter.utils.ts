import * as tf from '@tensorflow/tfjs-node';
import sharp from 'sharp';
import { spawn } from 'child_process';
import { Constants } from '../constants/content-filter.constants';
import { predictionType } from 'nsfwjs';
import { framePrediction } from '../types/frame-prediction.type';

const Pipe2Jpeg = require('pipe2jpeg');

export async function extractFramesFromVideo(videoPath: string): Promise<Buffer[]> {
  
  const pipe2jpeg = new Pipe2Jpeg();
  const frames: Buffer[] = [];

  const ffmpegParams = [
    '-loglevel', 'quiet',
    // input
    '-i', `${videoPath}`, // input file
    // output
    '-an', // drop audio
    '-c:v', 'mjpeg', // use motion jpeg as output encoder
    '-pix_fmt', 'yuvj422p', // typical for mp4, may need different settings for some videos
    '-f', 'image2pipe', // pipe images as output
    '-vf', `fps=${Constants.VIDEO_SAMPLE_RATE}`, // optional video filter, do anything here such as process at fixed 5fps or resize to specific resulution
    'pipe:1', // output to unix pipe that is then captured by pipe2jpeg
  ];

  return new Promise((resolve, reject) => {
    pipe2jpeg.on('data', (jpegBuffer) => frames.push(jpegBuffer));

    const ffmpeg = spawn('ffmpeg', ffmpegParams, { stdio: ['ignore', 'pipe', 'ignore'] });
    ffmpeg.on('error', (error) => console.error('content filter ffmpeg error:', error));
    ffmpeg.on('exit', (code, signal) => resolve(frames));
    ffmpeg.stdout.pipe(pipe2jpeg);
  });
}

export function interpretPrediction(timestamp, predictions: predictionType[]) : framePrediction {
  let isExplicit = false;

  for(const prediction of predictions){
    if (Constants.VIDEO_CATEGORIES_TO_FLAG.includes(prediction.className) && prediction.probability > Constants.VIDEO_CATEGORIES_PREDICTION_THRESHOLD) {
      isExplicit = true
    }
  }
  
  return {timestamp, isExplicit, prediction: predictions};
}