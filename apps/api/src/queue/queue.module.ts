// queue.module.ts
import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { QueueService } from './queue.service';
import { ContentFilterModule } from '../upload/content-filter/content-filter.module';
import { VideoUploadProcessor } from './processors/video-upload.processor';
import { VideoEncodingModule } from 'src/upload/video-encoding/video-encoding.module';
import { TranscodeModule } from 'src/upload/transcode/transcode.module';
import { S3UploadModule } from 'src/upload/s3-upload/s3-upload.module';

@Module({
  imports: [
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT),
        password: process.env.REDIS_PASSWORD
      },
    }),
    BullModule.registerQueue(
      {name: '{video-upload}'},
      {name: '{transcoding}'}
    ),
    ContentFilterModule,
    VideoEncodingModule,
    TranscodeModule,
    S3UploadModule
  ],
  providers: [QueueService, VideoUploadProcessor],
  exports: [QueueService],
})
export class QueueModule {}