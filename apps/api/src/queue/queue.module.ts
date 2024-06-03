// queue.module.ts
import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { QueueService } from './queue.service';
import { QueueProcessor } from './queue.processor';
import { ContentFilterModule } from 'src/upload/content-filter/content-filter.module';

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
  providers: [QueueService, QueueProcessor],
  exports: [QueueService],
})
export class QueueModule {}