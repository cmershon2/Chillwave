import { Test, TestingModule } from '@nestjs/testing';
import { S3clientService } from './s3client.service';

describe('S3clientService', () => {
  let service: S3clientService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [S3clientService],
    }).compile();

    service = module.get<S3clientService>(S3clientService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
