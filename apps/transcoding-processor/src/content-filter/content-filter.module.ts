import { Module } from '@nestjs/common';
import { ContentFilterService } from './content-filter.service';
import { S3ClientModule } from 'src/s3-client/s3-client.module';

@Module({
  imports: [S3ClientModule],
  providers: [ContentFilterService],
  exports: [ContentFilterService],
})
export class ContentFilterModule {}
