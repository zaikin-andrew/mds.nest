import { Test, TestingModule } from '@nestjs/testing';
import { AppVersionController } from './app-version.controller';
import { AppVersionService } from './app-version.service';
import { AuthGuard } from 'src/common/guards/auth.guard';

describe('AppVersionController', () => {
  let controller: AppVersionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppVersionController],
      providers: [AppVersionService],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<AppVersionController>(AppVersionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
