import { Test, TestingModule } from '@nestjs/testing';
import { ContentFilterService } from './content-filter.service';

describe('ContentFilterService', () => {
  let service: ContentFilterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ContentFilterService],
    }).compile();

    service = module.get<ContentFilterService>(ContentFilterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
