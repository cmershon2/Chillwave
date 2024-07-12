import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { QueueService } from './queue.service';
import { ContentFilterModule } from '../upload/content-filter/content-filter.module';
import { VideoUploadProcessor } from './processors/video-upload.processor';
import { S3UploadModule } from 'src/upload/s3-upload/s3-upload.module';

@Module({
  imports: [
    BullModule.forRootAsync({
      useFactory: () => ({
        connection: {
          host: process.env.REDIS_HOST,
          port: +process.env.REDIS_PORT,
          username: process.env.REDIS_USERNAME,
          password: process.env.REDIS_PASSWORD,
        }
      })
    }),
    BullModule.registerQueue({
      name: '{video-upload}',
    }),
    BullModule.registerQueue({
      name: '{video-content-filtering}',
    }),
    BullModule.registerQueue({
      name: '{video-transcoding}',
    }),
    ContentFilterModule,
    S3UploadModule,
  ],
  providers: [QueueService, VideoUploadProcessor],
  exports: [QueueService],
})
export class QueueModule {}