import { Module } from '@nestjs/common';
import { ContentFilterModule } from './content-filter/content-filter.module';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';
import { QueueModule } from '../queue/queue.module';
import { VideoEncodingModule } from './video-encoding/video-encoding.module';
import { S3UploadModule } from './s3-upload/s3-upload.module';
import { TranscodeModule } from './transcode/transcode.module';

@Module({
  imports: [ContentFilterModule, QueueModule, VideoEncodingModule, S3UploadModule, TranscodeModule],
  providers: [UploadService],
  controllers: [UploadController],
})
export class UploadModule {}
