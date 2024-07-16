import { Processor, WorkerHost, InjectQueue, OnWorkerEvent } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Queue, Job } from 'bullmq';
import ffmpeg from 'fluent-ffmpeg';
import { promises as fs } from 'fs';
import ffmpegStatic from 'ffmpeg-static';
import { S3ClientService } from '../../s3-client/s3-client.service';
import { transcodeVideo } from '../utils/transcoding.utils';

@Injectable()
@Processor('{video-transcoding}', 
  { 
    concurrency: 1, 
    lockDuration: 600000*3, 
    stalledInterval: 600000 
  })
export class TranscodingProcessor extends WorkerHost {

  private readonly logger = new Logger(TranscodingProcessor.name);

  constructor(
    @InjectQueue('{video-transcoding}') private readonly transcodingQueue: Queue,
    private readonly s3Client : S3ClientService,
  ) {
    super();
    ffmpeg.setFfmpegPath(ffmpegStatic);
  }

  async process(job: Job<any, any, string>) {

    const tempDir = `/tmp/${job.data.key}`;

    try {
      await fs.mkdir(tempDir, { recursive: true });

      const transcode = await transcodeVideo(this.s3Client, job.data.key, false);

      return transcode;
    } catch (error) {
      this.logger.error('An error occurred:', error);
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
        this.logger.log('🚮 Temporary files deleted.');
      } catch (cleanupError) {
        this.logger.error('Error during cleanup:', cleanupError);
      }
    }
  }

  @OnWorkerEvent('completed')
  async onCompleted(job: Job, result: any) {
    this.logger.log(`Job ${job.id} of type ${job.name} has been completed.`);
  }

  @OnWorkerEvent('failed')
  async onFailed(job: Job, error: any) {
    this.logger.error(`Job ${job.id} of type ${job.name} has failed. Error: ${error}`);
  }

  @OnWorkerEvent('ready')
  async onReady() {
    this.logger.log('Starting Worker...');
    try {
      const counts = await this.transcodingQueue.getJobCounts();
      this.logger.log('Successfully Connected to Queue');
    } catch (error) {
      this.logger.error('Error Connecting to Queue:', error);
    }
    this.logger.log('Worker is ready');
  }
}
