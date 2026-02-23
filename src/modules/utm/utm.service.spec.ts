import { Test, TestingModule } from '@nestjs/testing';
import { UtmService } from './utm.service';

describe('UtmService', () => {
  let service: UtmService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UtmService],
    }).compile();

    service = module.get<UtmService>(UtmService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
