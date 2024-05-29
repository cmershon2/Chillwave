import { Module } from '@nestjs/common';
import { ContentFilterService } from './content-filter.service';

@Module({
  providers: [ContentFilterService]
})
export class ContentFilterModule {}
