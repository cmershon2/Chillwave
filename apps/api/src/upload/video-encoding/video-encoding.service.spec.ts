import { Test, TestingModule } from '@nestjs/testing';
import { VideoEncodingService } from './video-encoding.service';

describe('VideoEncodingService', () => {
  let service: VideoEncodingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VideoEncodingService],
    }).compile();

    service = module.get<VideoEncodingService>(VideoEncodingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
