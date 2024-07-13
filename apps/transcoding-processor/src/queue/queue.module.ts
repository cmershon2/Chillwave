import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { TranscodingProcessor } from './processors/transcoding.processor';
import { ContentFilteringProcessor } from './processors/content-filtering.processor';
import { S3ClientModule } from '../s3-client/s3-client.module';

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
    S3ClientModule,
  ],
  providers: [TranscodingProcessor, ContentFilteringProcessor],
})
export class QueueModule {}
