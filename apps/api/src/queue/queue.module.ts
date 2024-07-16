import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { QueueService } from './queue.service';

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
    BullModule.registerFlowProducer({
      name: '{video-processing-flow}',
    }),
    BullModule.registerQueue({
      name: '{video-content-filtering}',
    }),
    BullModule.registerQueue({
      name: '{video-transcoding}',
    }),
  ],
  providers: [
    QueueService, 
  ],
  exports: [QueueService],
})
export class QueueModule {}