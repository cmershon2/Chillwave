import { Module } from '@nestjs/common';
import { TranscodeService } from './transcode.service';
import { S3UploadModule } from '../s3-upload/s3-upload.module';

@Module({
  imports: [S3UploadModule],
  providers: [TranscodeService],
  exports: [TranscodeService]
})
export class TranscodeModule {}
