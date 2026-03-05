import { Test, TestingModule } from '@nestjs/testing';
import { UtmController } from './utm.controller';
import { UtmService } from './utm.service';
import { AuthGuard } from 'src/common/guards/auth.guard';

describe('UtmController', () => {
  let controller: UtmController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UtmController],
      providers: [UtmService],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<UtmController>(UtmController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
