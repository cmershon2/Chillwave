import { Job } from 'bullmq';
import { Injectable } from '@nestjs/common';
import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { ContentFilterService } from '../../upload/content-filter/content-filter.service';
import { QueueService } from '../queue.service';
import AWS from 'aws-sdk';

@Injectable()
@Processor('{video-upload}')
export class VideoUploadProcessor extends WorkerHost {

  constructor(
    private readonly contentFilterService: ContentFilterService,
    private readonly queueService: QueueService,
  ) {
    super();
  }

  async process(job: Job<any>): Promise<void> {

    console.log(`📨 Received Video: ${job.data.key}`);

    try {

      // Run video through content filter
      const filterResult = await this.contentFilterService.detectExplicitVideoContent(job.data.key);

      if (filterResult.passed) {
        // Upload video to S3
        console.log('✅ Video passed content filter, uploading for transcoding');
        await job.moveToCompleted('Video passed content filter',job.token)
        return;

      } else {
        // Handle rejected video
        console.log('Video rejected by content filter:', filterResult);
        throw filterResult;
      }
    } catch (error) {
      // Handle errors
      console.error('Error processing video upload:', error);
      await job.moveToFailed(new Error(`Error processing video upload: ${error}`), job.token);
      throw error;
    }
  }

  @OnWorkerEvent('error')
  async handleQueueError(job: Job, error: Error): Promise<void> {
    // Handle errors that occur during job processing
    console.error('Queue error:', error);
    // TODO log the error, send notifications, or take other actions
  }

  @OnWorkerEvent('completed')
  async onCompleted(job: Job): Promise<void> {
    // Once the upload job is completed, add a job to the transcoding queue
    await this.queueService.enqueueTranscoding({
      key: job.data.key,
    });

    console.log('🚀 Job added to transcoding queue');
  }
}
