import { Test, TestingModule } from '@nestjs/testing';
import { S3UploadService } from './s3-upload.service';

describe('S3UploadService', () => {
  let service: S3UploadService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [S3UploadService],
    }).compile();

    service = module.get<S3UploadService>(S3UploadService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
