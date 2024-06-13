import { Test, TestingModule } from '@nestjs/testing';
import { TranscodeService } from './transcode.service';

describe('TranscodeService', () => {
  let service: TranscodeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TranscodeService],
    }).compile();

    service = module.get<TranscodeService>(TranscodeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
