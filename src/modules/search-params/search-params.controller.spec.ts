import { Test, TestingModule } from '@nestjs/testing';
import { SearchParamsController } from './search-params.controller';
import { SearchParamsService } from './search-params.service';
import { AuthGuard } from 'src/common/guards/auth.guard';

describe('SearchParamsController', () => {
  let controller: SearchParamsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SearchParamsController],
      providers: [SearchParamsService],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<SearchParamsController>(SearchParamsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
