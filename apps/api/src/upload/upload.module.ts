import { Module } from '@nestjs/common';
import { ContentFilterModule } from './content-filter/content-filter.module';

@Module({
  imports: [ContentFilterModule]
})
export class UploadModule {}
