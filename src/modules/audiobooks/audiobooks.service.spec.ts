import { Test, TestingModule } from '@nestjs/testing';
import { AudiobooksService } from './audiobooks.service';

describe('AudiobooksService', () => {
  let service: AudiobooksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AudiobooksService],
    }).compile();

    service = module.get<AudiobooksService>(AudiobooksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
