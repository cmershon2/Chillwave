import { Module } from '@nestjs/common';
import { ImageUploadService } from './image.service';

@Module({
  providers: [ImageUploadService],
  exports: [ImageUploadService],
})
export class ImageModule {}
