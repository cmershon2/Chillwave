import { Processor, WorkerHost, InjectQueue, OnWorkerEvent } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue, Job } from 'bullmq';
import * as AWS from 'aws-sdk';
import ffmpeg from 'fluent-ffmpeg';
import { promises as fs } from 'fs';
import path from 'path';
import ffmpegStatic from 'ffmpeg-static';
import { transcodeVideo } from '../utils/queue.utils';

@Injectable()
@Processor('{video-transcoding}')
export class TranscodingProcessor extends WorkerHost {

  private s3 : AWS.S3;

  constructor(
    @InjectQueue('{video-transcoding}') private readonly transcodingQueue: Queue,
  ) {
    super();
    ffmpeg.setFfmpegPath(ffmpegStatic);

    this.s3 = new AWS.S3({
      s3ForcePathStyle: false,
      endpoint: process.env.S3_ENDPOINT,
      region: process.env.S3_REGION,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID,
        secretAccessKey: process.env.S3_ACCESS_KEY_SECRET,
      }
    });
  }

  async process(job: Job<any, any, string>) {
    console.log('Start transcoding', job.data);

    const tempDir = `/tmp/${job.data.key}`;
    const inputParams = { Bucket: 'chillwave-video-intake', Key: job.data.key };

    console.log(`📁 Temp Dir: ${tempDir}`);
    console.log(`🥤 S3 Input Params:`, JSON.stringify(inputParams, null, 2));

    try {
      await fs.mkdir(tempDir, { recursive: true });

      const data = await this.s3.getObject(inputParams).promise();
      const videoBuffer = data.Body as Buffer;

      const transcode = await transcodeVideo(videoBuffer, job.data.key, false);

      return transcode;
    } catch (error) {
      console.error('An error occurred:', error);
      throw JSON.stringify({
        statusCode: 400,
        body: {
          status: "FAILED",
          message: error,
        }
      })
    } finally {
      try {
        await fs.rm(tempDir, { recursive: true, force: true });
        console.log('🚮 Temporary files deleted.');
      } catch (cleanupError) {
        console.error('Error during cleanup:', cleanupError);
      }
    }
  }

  @OnWorkerEvent('completed')
  async onCompleted(job: Job, result: any) {
    console.log(`Job ${job.id} of type ${job.name} has been completed.`);
  }

  @OnWorkerEvent('failed')
  async onFailed(job: Job, error: any) {
    console.error(`Job ${job.id} of type ${job.name} has failed. Error: ${error}`);
  }

  @OnWorkerEvent('ready')
  async onReady() {
    console.log('Starting Worker...');
    try {
      const counts = await this.transcodingQueue.getJobCounts();
      console.log('Queue Connected:', counts);
    } catch (error) {
      console.error('Error Connecting to Queue:', error);
    }
    console.log('Worker is ready');
  }
}
