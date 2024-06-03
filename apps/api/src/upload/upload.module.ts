import { Module } from '@nestjs/common';
import { ContentFilterModule } from './content-filter/content-filter.module';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';
import { QueueModule } from '../queue/queue.module';

@Module({
  imports: [ContentFilterModule, QueueModule],
  providers: [UploadService],
  controllers: [UploadController]
})
export class UploadModule {}
