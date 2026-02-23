import { Test, TestingModule } from '@nestjs/testing';
import { UtmController } from './utm.controller';
import { UtmService } from './utm.service';

describe('UtmController', () => {
  let controller: UtmController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UtmController],
      providers: [UtmService],
    }).compile();

    controller = module.get<UtmController>(UtmController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
