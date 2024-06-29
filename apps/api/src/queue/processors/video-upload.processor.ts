import {Job } from 'bull';
import { Injectable } from '@nestjs/common';
import { OnQueueError, Process, Processor } from '@nestjs/bull';
import { ContentFilterService } from '../../upload/content-filter/content-filter.service';
import { VideoEncodingService } from '../../upload/video-encoding/video-encoding.service';
import { TranscodeService } from '../../upload/transcode/transcode.service';
import { S3UploadService } from '../../upload/s3-upload/s3-upload.service';

@Injectable()
@Processor('{video-upload}')
export class VideoUploadProcessor {
  constructor(
    private readonly contentFilterService: ContentFilterService,
    
    private readonly videoEncodingService: VideoEncodingService,
    private readonly transcodeService: TranscodeService,
  ) {}

  @Process()
  async processVideoUpload(job: Job<any>) {
    const videoData = job.data;
    const videoBuffer:Buffer = Buffer.from(videoData.buffer.data);

    console.log("📨 Recieved Video")

    try{
      // Run video through content filter
      const filterResult = await this.contentFilterService.detectExplicitVideoContent(videoBuffer);

      if (filterResult.passed) {
        // Upload video to S3
        console.log("✅ Video passed content filter, uploading for transcoding")        
        await this.transcodeService.transcodeVideo(videoData, 0, '360p');
        console.log("🚀 Video encoding completed")
      } else {
        // Handle rejected video
        console.log('Video rejected by content filter:', filterResult);
      }
    } catch (error) {
      // Handle errors
      console.error('Error processing video upload:', error);
      // Optionally, you can throw the error to mark the job as failed
      throw error;
    }
  }

  @OnQueueError()
  async handleQueueError(error: Error) {
    // Handle errors that occur during job processing
    console.error('Queue error:', error);
    // TODO log the error, send notifications, or take other actions
  }
}