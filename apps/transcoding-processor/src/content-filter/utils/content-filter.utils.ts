import { spawn } from 'child_process';
import { Constants } from '../constants/content-filter.constants';
import { predictionType } from 'nsfwjs';
import { FramePrediction } from '../types/frame-prediction.type';
import { S3ClientService } from '../../s3-client/s3-client.service';

const Pipe2Jpeg = require('pipe2jpeg');

export async function extractFramesFromVideo(key: string, s3Client : S3ClientService): Promise<Buffer[]> {
  
  const pipe2jpeg = new Pipe2Jpeg();
  const frames: Buffer[] = [];

  const ffmpegParams = [
    '-loglevel', 'quiet',
    '-i', 'pipe:0',
    '-an',
    '-c:v', 'mjpeg',
    '-pix_fmt', 'yuvj422p',
    '-f', 'image2pipe',
    '-vf', `fps=${Constants.VIDEO_SAMPLE_RATE}`,
    'pipe:1',
  ];

  return new Promise(async (resolve, reject) => {

    pipe2jpeg.on('data', (jpegBuffer) => frames.push(jpegBuffer));

    const ffmpeg = spawn('ffmpeg', ffmpegParams, {
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    ffmpeg.on('error', (error) => {
      console.error('content filter ffmpeg error:', error);
      reject(error);
    });

    ffmpeg.on('exit', (code, signal) => {
      if (code !== 0) {
        console.error(`FFmpeg exited with code ${code} and signal ${signal}`);
        reject(new Error(`FFmpeg exited with code ${code} and signal ${signal}`));
      } else {
        resolve(frames);
      }
    });

    // pipe in read stream as input
    const videoStream = await s3Client.getVideoStream('chillwave-video-intake', key)
    videoStream.pipe(ffmpeg.stdin);

    videoStream.on('error', (error)=> {
      console.error('Error streaming video: ',error);
    })

    videoStream.on('finish', ()=>{
      ffmpeg.stdin.end();
    })

    ffmpeg.stdout.pipe(pipe2jpeg);
  });
}

export function interpretPrediction(timestamp: number, predictions: predictionType[]): FramePrediction {
  let isExplicit = false;
  let review = false;

  for (const prediction of predictions) {
    if (Constants.VIDEO_CATEGORIES_TO_FLAG.includes(prediction.className) && prediction.probability > Constants.VIDEO_CATEGORIES_PREDICTION_MIN_THRESHOLD) {
      isExplicit = true;

      if (prediction.probability < Constants.VIDEO_CATEGORIES_PREDICTION_MAX_THRESHOLD) {
        review = true;
      }
    }
  }

  return { timestamp, isExplicit, review, prediction: predictions };
}
