// queue.module.ts
import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { QueueService } from './queue.service';
import { ContentFilterModule } from '../upload/content-filter/content-filter.module';
import { VideoUploadProcessor } from './processors/video-upload.processor';

@Module({
  imports: [
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT),
      },
    }),
    BullModule.registerQueue({
      name: '{video-upload}',
    }),
    ContentFilterModule
  ],
  providers: [QueueService, VideoUploadProcessor],
  exports: [QueueService],
})
export class QueueModule {}