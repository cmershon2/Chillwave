import { Module } from '@nestjs/common';
import { ContentFilterService } from './content-filter.service';
import { S3clientModule } from 'src/s3client/s3client.module';

@Module({
  imports: [S3clientModule],
  providers: [ContentFilterService],
  exports: [ContentFilterService]
})
export class ContentFilterModule {}
