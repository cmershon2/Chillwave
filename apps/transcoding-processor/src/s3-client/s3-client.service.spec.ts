import { Test, TestingModule } from '@nestjs/testing';
import { S3ClientService } from './s3-client.service';

describe('S3ClientService', () => {
  let service: S3ClientService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [S3ClientService],
    }).compile();

    service = module.get<S3ClientService>(S3ClientService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
