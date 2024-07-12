import { Module } from '@nestjs/common';
import { ContentFilterModule } from './content-filter/content-filter.module';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';
import { QueueModule } from '../queue/queue.module';
import { S3UploadModule } from './s3-upload/s3-upload.module';
import { S3clientModule } from 'src/s3client/s3client.module';

@Module({
  imports: [ContentFilterModule, QueueModule, S3UploadModule, S3clientModule],
  providers: [UploadService],
  controllers: [UploadController],
})
export class UploadModule {}
