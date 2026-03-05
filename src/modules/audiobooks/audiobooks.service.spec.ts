import { ConflictException, ForbiddenException, GatewayTimeoutException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { of, throwError } from 'rxjs';
import { AudiobooksService } from './audiobooks.service';
import { Audiobook } from './schemas/audiobook.schema';
import { AiSearch } from './schemas/ai-search.schema';
import { ListenEvent } from './schemas/listen-event.schema';
import { WeeklyCount } from './schemas/weekly-count.schema';
import { MonthlyCount } from './schemas/monthly-count.schema';
import { WeekSelection } from '../selections/schemas/week-selection.schema';
import { History } from '../history/schemas/history.schema';
import { Subscription } from '../users/schemas/subscription.schema';
import { AppConfigService } from 'src/config/config.service';

// ─── Fluent query chain helper (for find + chained methods ending with exec) ─
function makeChain(result: unknown) {
  const chain: Record<string, unknown> = {};
  ['skip', 'limit', 'lean', 'select', 'populate', 'sort', 'maxTimeMS', 'or'].forEach((m) => {
    chain[m] = jest.fn().mockReturnValue(chain);
  });
  (chain.exec as jest.Mock) = jest.fn().mockResolvedValue(result);
  return chain;
}

// ─── Subscription findOne mock (service calls .lean() which should be thenable) ─
function subFindOne(result: unknown) {
  return { lean: jest.fn().mockResolvedValue(result) };
}

describe('AudiobooksService', () => {
  let service: AudiobooksService;
  let audiobookModel: jest.Mocked<any>;
  let aiSearchModel: jest.Mocked<any>;
  let listenEventModel: jest.Mocked<any>;
  let weeklyCountModel: jest.Mocked<any>;
  let monthlyCountModel: jest.Mocked<any>;
  let weekSelectionModel: jest.Mocked<any>;
  let historyModel: jest.Mocked<any>;
  let subscriptionModel: jest.Mocked<any>;
  let httpService: jest.Mocked<any>;

  beforeEach(async () => {
    audiobookModel = {
      find: jest.fn(),
      aggregate: jest.fn(),
      countDocuments: jest.fn(),
    };
    aiSearchModel = {
      findOne: jest.fn(),
      create: jest.fn(),
    };
    listenEventModel = {
      findOne: jest.fn(),
      create: jest.fn(),
    };
    weeklyCountModel = {
      find: jest.fn(),
      updateOne: jest.fn().mockResolvedValue({}),
    };
    monthlyCountModel = {
      find: jest.fn(),
      updateOne: jest.fn().mockResolvedValue({}),
    };
    weekSelectionModel = { find: jest.fn() };
    historyModel = { find: jest.fn() };
    subscriptionModel = { findOne: jest.fn() };
    httpService = {
      post: jest.fn().mockReturnValue(of({ status: 200, data: { ids: [] } })),
      get: jest.fn().mockReturnValue(of({ status: 200, data: { ids: [] } })),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AudiobooksService,
        { provide: getModelToken(Audiobook.name), useValue: audiobookModel },
        { provide: getModelToken(AiSearch.name), useValue: aiSearchModel },
        { provide: getModelToken(ListenEvent.name), useValue: listenEventModel },
        { provide: getModelToken(WeeklyCount.name), useValue: weeklyCountModel },
        { provide: getModelToken(MonthlyCount.name), useValue: monthlyCountModel },
        { provide: getModelToken(WeekSelection.name), useValue: weekSelectionModel },
        { provide: getModelToken(History.name), useValue: historyModel },
        { provide: getModelToken(Subscription.name), useValue: subscriptionModel },
        { provide: HttpService, useValue: httpService },
        { provide: AppConfigService, useValue: { aiUrl: 'http://ai-service' } },
      ],
    }).compile();

    service = module.get<AudiobooksService>(AudiobooksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ─── findAll ─────────────────────────────────────────────────────────────
  describe('findAll', () => {
    it('returns paginated result without filters', async () => {
      const items = [{ id: 'book1', name: 'Test', author: 'Author' }];
      // find chain
      audiobookModel.find.mockReturnValue(makeChain(items));
      // countDocuments resolves directly (no search → no .or())
      audiobookModel.countDocuments.mockResolvedValue(5);
      // historyModel not called (skipListened=false)

      const dto = { page: 1, limit: 20, skip: 0 } as any;
      const result = await service.findAll(dto, 'user1', false);

      expect(result.items).toEqual(items);
      expect(result.meta.total).toBe(5);
      expect(result.meta.page).toBe(1);
    });

    it('applies search filter and uses .or() on countDocuments', async () => {
      audiobookModel.find.mockReturnValue(makeChain([]));
      // With search → countDocuments().or() is called
      audiobookModel.countDocuments.mockReturnValue({
        or: jest.fn().mockResolvedValue(3),
      });

      const dto = { page: 1, limit: 20, skip: 0, search: 'Dostoevsky' } as any;
      const result = await service.findAll(dto, 'user1', false);

      expect(result.meta.total).toBe(3);
    });

    it('applies foreignAuthor filter', async () => {
      audiobookModel.find.mockReturnValue(makeChain([]));
      audiobookModel.countDocuments.mockResolvedValue(0);

      const dto = { page: 1, limit: 20, skip: 0, foreignAuthor: true } as any;
      await service.findAll(dto, 'user1', false);

      expect(audiobookModel.find).toHaveBeenCalledWith(
        expect.objectContaining({ foreignAuthor: true }),
      );
    });

    it('applies duration filter', async () => {
      audiobookModel.find.mockReturnValue(makeChain([]));
      audiobookModel.countDocuments.mockResolvedValue(0);

      const dto = { page: 1, limit: 20, skip: 0, durationMin: 600, durationMax: 3600 } as any;
      await service.findAll(dto, 'user1', false);

      expect(audiobookModel.find).toHaveBeenCalledWith(
        expect.objectContaining({ duration: { $gte: 600, $lte: 3600 } }),
      );
    });

    it('applies releaseYear filter', async () => {
      audiobookModel.find.mockReturnValue(makeChain([]));
      audiobookModel.countDocuments.mockResolvedValue(0);

      const dto = { page: 1, limit: 20, skip: 0, releaseYearMin: 2000, releaseYearMax: 2024 } as any;
      await service.findAll(dto, 'user1', false);

      expect(audiobookModel.find).toHaveBeenCalledWith(
        expect.objectContaining({ liveReleaseYear: { $gte: 2000, $lte: 2024 } }),
      );
    });

    it('applies genre filter', async () => {
      audiobookModel.find.mockReturnValue(makeChain([]));
      audiobookModel.countDocuments.mockResolvedValue(0);

      const dto = { page: 1, limit: 20, skip: 0, genres: ['Fantasy'] } as any;
      await service.findAll(dto, 'user1', false);

      expect(audiobookModel.find).toHaveBeenCalledWith(
        expect.objectContaining({ 'params.Жанры/поджанры': { $in: ['Fantasy'] } }),
      );
    });

    it('excludes listened books when skipListened=true', async () => {
      // historyModel.find chain
      historyModel.find.mockReturnValue(makeChain([{ audioBookId: 'book-listened' }]));
      audiobookModel.find.mockReturnValue(makeChain([]));
      audiobookModel.countDocuments.mockResolvedValue(0);

      const dto = { page: 1, limit: 20, skip: 0 } as any;
      await service.findAll(dto, 'user1', true);

      expect(audiobookModel.find).toHaveBeenCalledWith(
        expect.objectContaining({ id: { $nin: ['book-listened'] } }),
      );
    });

    it('does not add id filter when no listened books found', async () => {
      historyModel.find.mockReturnValue(makeChain([]));
      audiobookModel.find.mockReturnValue(makeChain([]));
      audiobookModel.countDocuments.mockResolvedValue(0);

      const dto = { page: 1, limit: 20, skip: 0 } as any;
      await service.findAll(dto, 'user1', true);

      expect(audiobookModel.find).toHaveBeenCalledWith(
        expect.not.objectContaining({ id: expect.anything() }),
      );
    });
  });

  // ─── getRandom ────────────────────────────────────────────────────────────
  describe('getRandom', () => {
    it('returns random book without skipListened', async () => {
      const randomBook = [{ id: 'random-book', name: 'Random' }];
      audiobookModel.aggregate.mockResolvedValue(randomBook);

      const result = await service.getRandom('user1', false);
      expect(result).toEqual(randomBook);
      expect(audiobookModel.aggregate).toHaveBeenCalledWith([
        { $match: {} },
        { $sample: { size: 1 } },
      ]);
    });

    it('excludes listened books when skipListened=true', async () => {
      historyModel.find.mockReturnValue(makeChain([{ audioBookId: 'book1' }]));
      audiobookModel.aggregate.mockResolvedValue([]);

      await service.getRandom('user1', true);

      expect(audiobookModel.aggregate).toHaveBeenCalledWith([
        { $match: { id: { $nin: ['book1'] } } },
        { $sample: { size: 1 } },
      ]);
    });

    it('returns empty filter when skipListened=true but no listened books', async () => {
      historyModel.find.mockReturnValue(makeChain([]));
      audiobookModel.aggregate.mockResolvedValue([]);

      await service.getRandom('user1', true);

      expect(audiobookModel.aggregate).toHaveBeenCalledWith([
        { $match: {} },
        { $sample: { size: 1 } },
      ]);
    });
  });

  // ─── getTopWeek ───────────────────────────────────────────────────────────
  describe('getTopWeek', () => {
    it('returns top books for the current week', async () => {
      weeklyCountModel.find.mockReturnValue(makeChain([{ bookId: 'book1' }]));
      audiobookModel.find.mockReturnValue(makeChain([{ id: 'book1' }]));

      const result = await service.getTopWeek();
      expect(result).toEqual({ items: [{ id: 'book1' }] });
    });
  });

  // ─── getTopMonth ──────────────────────────────────────────────────────────
  describe('getTopMonth', () => {
    it('returns top books for the current month', async () => {
      monthlyCountModel.find.mockReturnValue(makeChain([{ bookId: 'book1' }]));
      audiobookModel.find.mockReturnValue(makeChain([{ id: 'book1' }]));

      const result = await service.getTopMonth();
      expect(result).toEqual({ items: [{ id: 'book1' }] });
    });
  });

  // ─── getWeekSelection ─────────────────────────────────────────────────────
  describe('getWeekSelection', () => {
    it('returns published week selections from last 6 months', async () => {
      const selections = [{ title: 'Week 1', published: true, audioBooks: [] }];
      weekSelectionModel.find.mockReturnValue(makeChain(selections));

      const result = await service.getWeekSelection();
      expect(result).toEqual({ items: selections });
    });
  });

  // ─── searchNames ──────────────────────────────────────────────────────────
  describe('searchNames', () => {
    it('returns unique authors and works', async () => {
      const nameChain = makeChain([{ name: 'Crime and Punishment' }]);
      const authorChain = makeChain([{ author: 'Dostoevsky' }, { author: 'Dostoevsky' }]);

      audiobookModel.find
        .mockReturnValueOnce(nameChain)
        .mockReturnValueOnce(authorChain);

      const result = await service.searchNames('Dostoevsky');

      expect(result.authors).toEqual(['Dostoevsky']);
      expect(result.works).toEqual(['Crime and Punishment']);
    });

    it('normalizes ё/е in query', async () => {
      const chain = makeChain([]);
      audiobookModel.find.mockReturnValue(chain);

      await service.searchNames('ёжик');

      const callArgs = audiobookModel.find.mock.calls[0][0];
      expect(callArgs.name.source).toContain('(е|ё)');
    });
  });

  // ─── aiSearch ─────────────────────────────────────────────────────────────
  describe('aiSearch', () => {
    it('creates aiSearch record and returns results for new free user', async () => {
      // No existing aiSearch doc
      aiSearchModel.findOne.mockResolvedValue(null);
      subscriptionModel.findOne.mockReturnValue(subFindOne(null));

      httpService.post.mockReturnValue(of({ status: 200, data: { ids: ['book1'] } }));
      audiobookModel.find.mockReturnValue(makeChain([{ id: 'book1' }]));
      aiSearchModel.create.mockResolvedValue({ searches: 1 });

      const result = await service.aiSearch('query', 'user1');

      expect(result.aiSearches).toBe(1);
      expect(result.items).toEqual([{ id: 'book1' }]);
    });

    it('increments aiSearch counter for existing user', async () => {
      const existingDoc = { userId: 'user1', searches: 1, save: jest.fn().mockResolvedValue(true) };
      aiSearchModel.findOne.mockResolvedValue(existingDoc);
      subscriptionModel.findOne.mockReturnValue(subFindOne(null));

      httpService.post.mockReturnValue(of({ status: 200, data: { ids: [] } }));
      audiobookModel.find.mockReturnValue(makeChain([]));

      const result = await service.aiSearch('query', 'user1');

      expect(existingDoc.save).toHaveBeenCalled();
      expect(result.aiSearches).toBe(2);
    });

    it('throws ForbiddenException when free user reaches limit (2 searches)', async () => {
      // AI_SEARCH_FREE_LIMIT = 2
      aiSearchModel.findOne.mockResolvedValue({ userId: 'user1', searches: 2 });
      subscriptionModel.findOne.mockReturnValue(subFindOne(null));

      await expect(service.aiSearch('query', 'user1')).rejects.toThrow(ForbiddenException);
    });

    it('allows subscribed user to bypass limit', async () => {
      const existingDoc = { userId: 'user1', searches: 10, save: jest.fn().mockResolvedValue(true) };
      aiSearchModel.findOne.mockResolvedValue(existingDoc);
      subscriptionModel.findOne.mockReturnValue(subFindOne({ userId: 'user1', type: 'Default' }));

      httpService.post.mockReturnValue(of({ status: 200, data: { ids: [] } }));
      audiobookModel.find.mockReturnValue(makeChain([]));

      const result = await service.aiSearch('query', 'user1');
      expect(result).toBeDefined();
    });

    it('throws GatewayTimeoutException on AI service 5xx', async () => {
      aiSearchModel.findOne.mockResolvedValue(null);
      subscriptionModel.findOne.mockReturnValue(subFindOne(null));
      httpService.post.mockReturnValue(of({ status: 503, data: {} }));

      await expect(service.aiSearch('query', 'user1')).rejects.toThrow(GatewayTimeoutException);
    });

    it('throws GatewayTimeoutException on network error', async () => {
      aiSearchModel.findOne.mockResolvedValue(null);
      subscriptionModel.findOne.mockReturnValue(subFindOne(null));
      httpService.post.mockReturnValue(throwError(() => new Error('ECONNREFUSED')));

      await expect(service.aiSearch('query', 'user1')).rejects.toThrow(GatewayTimeoutException);
    });

    it('returns empty items when AI responds with no ids', async () => {
      aiSearchModel.findOne.mockResolvedValue(null);
      subscriptionModel.findOne.mockReturnValue(subFindOne(null));
      httpService.post.mockReturnValue(of({ status: 200, data: { ids: [] } }));
      audiobookModel.find.mockReturnValue(makeChain([]));
      aiSearchModel.create.mockResolvedValue({ searches: 1 });

      const result = await service.aiSearch('query', 'user1');
      expect(result.items).toEqual([]);
    });
  });

  // ─── findSimilar ──────────────────────────────────────────────────────────
  describe('findSimilar', () => {
    it('throws ForbiddenException when user has no subscription', async () => {
      subscriptionModel.findOne.mockReturnValue(subFindOne(null));

      await expect(service.findSimilar('story1', 'user1')).rejects.toThrow(ForbiddenException);
    });

    it('returns similar books for subscribed user', async () => {
      subscriptionModel.findOne.mockReturnValue(subFindOne({ userId: 'user1' }));
      httpService.get.mockReturnValue(of({ status: 200, data: { ids: ['book1'] } }));
      audiobookModel.find.mockReturnValue(makeChain([{ id: 'book1' }]));

      const result = await service.findSimilar('story1', 'user1');
      expect(result).toEqual({ items: [{ id: 'book1' }] });
    });

    it('throws GatewayTimeoutException when AI service throws', async () => {
      subscriptionModel.findOne.mockReturnValue(subFindOne({ userId: 'user1' }));
      httpService.get.mockReturnValue(throwError(() => new Error('timeout')));

      await expect(service.findSimilar('story1', 'user1')).rejects.toThrow(GatewayTimeoutException);
    });

    it('throws GatewayTimeoutException on non-2xx AI response', async () => {
      subscriptionModel.findOne.mockReturnValue(subFindOne({ userId: 'user1' }));
      httpService.get.mockReturnValue(of({ status: 503, data: {} }));

      await expect(service.findSimilar('story1', 'user1')).rejects.toThrow(GatewayTimeoutException);
    });

    it('returns empty items when AI returns no ids', async () => {
      subscriptionModel.findOne.mockReturnValue(subFindOne({ userId: 'user1' }));
      httpService.get.mockReturnValue(of({ status: 200, data: { ids: [] } }));
      audiobookModel.find.mockReturnValue(makeChain([]));

      const result = await service.findSimilar('story1', 'user1');
      expect(result.items).toEqual([]);
    });
  });

  // ─── recordListenEvent ────────────────────────────────────────────────────
  describe('recordListenEvent', () => {
    it('creates listen event and updates weekly/monthly counts', async () => {
      listenEventModel.findOne.mockReturnValue({
        lean: () => ({ exec: jest.fn().mockResolvedValue(null) }),
      });
      listenEventModel.create.mockResolvedValue({});

      await service.recordListenEvent('book1', 'user1');

      expect(listenEventModel.create).toHaveBeenCalledWith(
        expect.objectContaining({ bookId: 'book1', userId: 'user1' }),
      );
      expect(weeklyCountModel.updateOne).toHaveBeenCalled();
      expect(monthlyCountModel.updateOne).toHaveBeenCalled();
    });

    it('throws ConflictException when listen event already exists', async () => {
      listenEventModel.findOne.mockReturnValue({
        lean: () => ({
          exec: jest.fn().mockResolvedValue({ bookId: 'book1', userId: 'user1' }),
        }),
      });

      await expect(service.recordListenEvent('book1', 'user1')).rejects.toThrow(ConflictException);
      expect(listenEventModel.create).not.toHaveBeenCalled();
    });
  });
});
