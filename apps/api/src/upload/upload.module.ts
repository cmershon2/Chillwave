import { Module } from '@nestjs/common';
import { ContentFilterModule } from './content-filter/content-filter.module';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';
import { QueueModule } from '../queue/queue.module';
import { S3clientModule } from '../s3client/s3client.module';

@Module({
  imports: [ContentFilterModule, QueueModule, S3clientModule],
  providers: [UploadService],
  controllers: [UploadController],
})
export class UploadModule {}
