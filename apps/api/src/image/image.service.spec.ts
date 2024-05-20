import { Test, TestingModule } from '@nestjs/testing';
import { ImageUploadService } from './image.service';

describe('ImageUploadService', () => {
  let service: ImageUploadService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ImageUploadService],
    }).compile();

    service = module.get<ImageUploadService>(ImageUploadService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
