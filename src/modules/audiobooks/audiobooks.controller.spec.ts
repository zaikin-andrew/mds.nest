import { Test, TestingModule } from '@nestjs/testing';
import { AudiobooksController } from './audiobooks.controller';
import { AudiobooksService } from './audiobooks.service';
import { AuthGuard } from 'src/common/guards/auth.guard';

const mockService = {
  findAll: jest.fn(),
  getRandom: jest.fn(),
  getTopWeek: jest.fn(),
  getTopMonth: jest.fn(),
  getWeekSelection: jest.fn(),
  searchNames: jest.fn(),
  findSimilar: jest.fn(),
  aiSearch: jest.fn(),
  recordListenEvent: jest.fn(),
};

const mockUser = { id: 'user1', name: 'Test User', email: 'test@example.com' };

describe('AudiobooksController', () => {
  let controller: AudiobooksController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AudiobooksController],
      providers: [{ provide: AudiobooksService, useValue: mockService }],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<AudiobooksController>(AudiobooksController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('delegates to service.findAll with user id and skipListened flag', () => {
      const dto = { page: 1, limit: 20, skip: 0 } as any;
      mockService.findAll.mockResolvedValue({ items: [], meta: {} });

      controller.findAll(dto, mockUser, false);

      expect(mockService.findAll).toHaveBeenCalledWith(dto, mockUser.id, false);
    });
  });

  describe('getRandom', () => {
    it('delegates to service.getRandom', () => {
      mockService.getRandom.mockResolvedValue([]);

      controller.getRandom(mockUser, true);

      expect(mockService.getRandom).toHaveBeenCalledWith(mockUser.id, true);
    });
  });

  describe('getTopWeek', () => {
    it('delegates to service.getTopWeek', () => {
      mockService.getTopWeek.mockResolvedValue({ items: [] });

      controller.getTopWeek();

      expect(mockService.getTopWeek).toHaveBeenCalled();
    });
  });

  describe('getTopMonth', () => {
    it('delegates to service.getTopMonth', () => {
      mockService.getTopMonth.mockResolvedValue({ items: [] });

      controller.getTopMonth();

      expect(mockService.getTopMonth).toHaveBeenCalled();
    });
  });

  describe('getWeekSelection', () => {
    it('delegates to service.getWeekSelection', () => {
      mockService.getWeekSelection.mockResolvedValue({ items: [] });

      controller.getWeekSelection();

      expect(mockService.getWeekSelection).toHaveBeenCalled();
    });
  });

  describe('searchNames', () => {
    it('passes query string to service.searchNames', () => {
      const dto = { query: 'Chekhov' } as any;
      mockService.searchNames.mockResolvedValue({ authors: [], works: [] });

      controller.searchNames(dto);

      expect(mockService.searchNames).toHaveBeenCalledWith('Chekhov');
    });
  });

  describe('findSimilar', () => {
    it('passes storyId and userId to service.findSimilar', () => {
      mockService.findSimilar.mockResolvedValue({ items: [] });

      controller.findSimilar('story123', mockUser);

      expect(mockService.findSimilar).toHaveBeenCalledWith('story123', mockUser.id);
    });
  });

  describe('aiSearch', () => {
    it('passes query and userId to service.aiSearch', () => {
      const dto = { query: 'a book about detectives' } as any;
      mockService.aiSearch.mockResolvedValue({ items: [], aiSearches: 1 });

      controller.aiSearch(dto, mockUser);

      expect(mockService.aiSearch).toHaveBeenCalledWith('a book about detectives', mockUser.id);
    });
  });

  describe('listenEvent', () => {
    it('passes bookId and userId to service.recordListenEvent', () => {
      const dto = { bookId: 'book123' } as any;
      mockService.recordListenEvent.mockResolvedValue(undefined);

      controller.listenEvent(dto, mockUser);

      expect(mockService.recordListenEvent).toHaveBeenCalledWith('book123', mockUser.id);
    });
  });
});
