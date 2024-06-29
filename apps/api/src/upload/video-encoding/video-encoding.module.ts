import { Module } from '@nestjs/common';
import { VideoEncodingService } from './video-encoding.service';
import { S3UploadModule } from '../s3-upload/s3-upload.module';

@Module({
  imports: [S3UploadModule],
  providers: [VideoEncodingService],
  exports: [VideoEncodingService]
})
export class VideoEncodingModule {}
