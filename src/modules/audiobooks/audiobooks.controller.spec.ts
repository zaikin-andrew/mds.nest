import { Test, TestingModule } from '@nestjs/testing';
import { AudiobooksController } from './audiobooks.controller';
import { AudiobooksService } from './audiobooks.service';

describe('AudiobooksController', () => {
  let controller: AudiobooksController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AudiobooksController],
      providers: [AudiobooksService],
    }).compile();

    controller = module.get<AudiobooksController>(AudiobooksController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
