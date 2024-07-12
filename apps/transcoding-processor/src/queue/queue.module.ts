import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { TranscodingProcessor } from './processors/transcoding.processor';

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
      name: '{video-transcoding}',
    }),
    BullModule.registerQueue({
      name: '{video-content-filtering}',
    }),
  ],
  providers: [TranscodingProcessor],
})
export class QueueModule {}
