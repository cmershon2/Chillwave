// queue.processor.ts
import {Job } from 'bull';
import { Injectable } from '@nestjs/common';
import { Process, Processor } from '@nestjs/bull';
import { ContentFilterService } from '../upload/content-filter/content-filter.service';

@Injectable()
@Processor('{video-upload}')
export class QueueProcessor {
  constructor(
    private readonly contentFilterService: ContentFilterService,
    // private readonly s3Service: S3Service,
  ) {}

  @Process()
  async processVideoUpload(job: Job<any>) {
    const videoData = job.data;

    // Run video through content filter
    const filterResult = await this.contentFilterService.detectExplicitVideoContent(videoData);

    if (filterResult.passed) {
      // Upload video to S3
      // await this.s3Service.uploadVideo(videoData);
      console.log('video passed, upload to S3!')
    } else {
      // Handle rejected video
      console.log('Video rejected by content filter:', filterResult);
    }
  }
}