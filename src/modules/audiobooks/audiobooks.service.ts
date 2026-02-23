import {
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  GatewayTimeoutException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model, QueryFilter } from 'mongoose';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AppConfigService } from '../../config/config.service';
import { PaginatedResult } from 'src/common/interfaces/paginated.interface';
import {
  AI_SEARCH_FREE_LIMIT,
  DEFAULT_PAGE_SIZE,
  MAX_SKIP_LISTENED_BOOKS,
} from '../../common/constants';
import { Audiobook } from './schemas/audiobook.schema';
import { AiSearch } from './schemas/ai-search.schema';
import { ListenEvent } from './schemas/listen-event.schema';
import { WeeklyCount } from './schemas/weekly-count.schema';
import { MonthlyCount } from './schemas/monthly-count.schema';
import { WeekSelection } from '../selections/schemas/week-selection.schema';
import { History } from '../history/schemas/history.schema';
import { Subscription } from '../users/schemas/subscription.schema';
import { FindAllAudiobooksDto } from './dto/find-all.dto';
import { toIsoWeek, toYYYYMM } from './utils/date.utils';

@Injectable()
export class AudiobooksService {
  private readonly logger = new Logger(AudiobooksService.name);

  constructor(
    @InjectModel(Audiobook.name) private readonly audiobookModel: Model<Audiobook>,
    @InjectModel(AiSearch.name) private readonly aiSearchModel: Model<AiSearch>,
    @InjectModel(ListenEvent.name) private readonly listenEventModel: Model<ListenEvent>,
    @InjectModel(WeeklyCount.name) private readonly weeklyCountModel: Model<WeeklyCount>,
    @InjectModel(MonthlyCount.name) private readonly monthlyCountModel: Model<MonthlyCount>,
    @InjectModel(WeekSelection.name) private readonly weekSelectionModel: Model<WeekSelection>,
    @InjectModel(History.name) private readonly historyModel: Model<History>,
    @InjectModel(Subscription.name) private readonly subscriptionModel: Model<Subscription>,
    private readonly httpService: HttpService,
    private readonly appConfig: AppConfigService,
  ) {}

  // ─── Find All ──────────────────────────────────────────────

  async findAll(
    dto: FindAllAudiobooksDto,
    userId: string,
    skipListened: boolean,
  ): Promise<PaginatedResult<Audiobook>> {
    const filter = await this.buildFilter(dto, userId, skipListened);

    let query = this.audiobookModel.find(filter);

    if (dto.search) {
      const regex = new RegExp(this.normalizeString(dto.search), 'i');
      query = query.or([{ author: regex }, { name: regex }, { annotation: regex }]);
    }

    const [items, total] = await Promise.all([
      query
        .skip(dto.skip)
        .limit(dto.limit ?? DEFAULT_PAGE_SIZE)
        .lean()
        .exec(),
      this.countForFilter(filter, dto.search),
    ]);

    return {
      items,
      meta: {
        total,
        page: dto.page,
        limit: dto.limit ?? DEFAULT_PAGE_SIZE,
        pages: Math.ceil(total / (dto.limit ?? DEFAULT_PAGE_SIZE)),
      },
    };
  }

  // ─── Random ────────────────────────────────────────────────

  async getRandom(userId: string, skipListened: boolean): Promise<Audiobook[]> {
    const filter = await this.buildSkipListenedFilter(userId, skipListened);
    return this.audiobookModel.aggregate([{ $match: filter }, { $sample: { size: 1 } }]);
  }

  // ─── AI Search ─────────────────────────────────────────────

  async aiSearch(query: string, userId: string) {
    const [aiSearch, subscription] = await Promise.all([
      this.aiSearchModel.findOne({ userId }),
      this.subscriptionModel.findOne({ userId }).lean(),
    ]);

    if (!subscription && (aiSearch?.searches ?? 0) >= AI_SEARCH_FREE_LIMIT) {
      throw new ForbiddenException('AI search limit reached');
    }

    let response;
    try {
      response = await firstValueFrom(
        this.httpService.post(
          `${this.appConfig.aiUrl}/search`,
          { text: query },
          { validateStatus: () => true },
        ),
      );
    } catch {
      throw new GatewayTimeoutException('AI service unavailable');
    }

    if (response.status < 200 || response.status >= 300) {
      throw new GatewayTimeoutException('AI service error');
    }

    const ids: string[] = Array.isArray(response.data?.ids) ? response.data.ids : [];
    const audioBooks = await this.audiobookModel
      .find({ id: { $in: ids } })
      .lean()
      .maxTimeMS(10_000)
      .exec();

    const searches = await this.incrementAiSearches(userId, aiSearch);

    return { items: audioBooks, aiSearches: searches };
  }

  // ─── Find Similar ──────────────────────────────────────────

  async findSimilar(storyId: string, userId: string) {
    const subscription = await this.subscriptionModel.findOne({ userId }).lean();
    if (!subscription) {
      throw new ForbiddenException('Subscription required');
    }

    let response;
    try {
      response = await firstValueFrom(
        this.httpService.get(`${this.appConfig.aiUrl}/findSimilarStory/${storyId}`, {
          validateStatus: () => true,
        }),
      );
    } catch {
      throw new GatewayTimeoutException('AI service unavailable');
    }

    if (response.status < 200 || response.status >= 300) {
      throw new GatewayTimeoutException('AI service error');
    }

    const ids: string[] = Array.isArray(response.data?.ids) ? response.data.ids : [];
    const audioBooks = await this.audiobookModel
      .find({ id: { $in: ids } })
      .lean()
      .maxTimeMS(10_000)
      .exec();

    return { items: audioBooks };
  }

  // ─── Top Week / Month ─────────────────────────────────────

  async getTopWeek() {
    const isoWeek = toIsoWeek(new Date());
    const top = await this.weeklyCountModel
      .find({ isoWeek })
      .sort({ count: -1 })
      .limit(10)
      .lean()
      .exec();

    const items = await this.audiobookModel
      .find({ id: { $in: top.map((t) => t.bookId) } })
      .lean()
      .exec();

    return { items };
  }

  async getTopMonth() {
    const yyyymm = toYYYYMM(new Date());
    const top = await this.monthlyCountModel
      .find({ yyyymm })
      .sort({ count: -1 })
      .limit(10)
      .lean()
      .exec();

    const items = await this.audiobookModel
      .find({ id: { $in: top.map((t) => t.bookId) } })
      .lean()
      .exec();

    return { items };
  }

  // ─── Week Selection ────────────────────────────────────────

  async getWeekSelection() {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const selections = await this.weekSelectionModel
      .find({
        published: true,
        visibilityStartDate: { $gt: sixMonthsAgo, $lte: new Date() },
      })
      .populate('audioBooks')
      .sort({ visibilityStartDate: -1 })
      .lean()
      .exec();

    return { items: selections };
  }

  // ─── Search Names (autocomplete) ──────────────────────────

  async searchNames(query: string) {
    const regex = new RegExp(this.normalizeString(query), 'i');

    const [byName, byAuthor] = await Promise.all([
      this.audiobookModel.find({ name: regex }).select('name').lean().exec(),
      this.audiobookModel.find({ author: regex }).select('author').lean().exec(),
    ]);

    return {
      authors: [...new Set(byAuthor.map((b) => b.author))],
      works: [...new Set(byName.map((b) => b.name))],
    };
  }

  // ─── Listen Event ─────────────────────────────────────────

  async recordListenEvent(bookId: string, userId: string): Promise<void> {
    const timestamp = new Date();
    const isoWeek = toIsoWeek(timestamp);
    const yyyymm = toYYYYMM(timestamp);

    const existing = await this.listenEventModel
      .findOne({ isoWeek, yyyymm, userId, bookId })
      .lean()
      .exec();

    if (existing) {
      throw new ConflictException('Listen event already recorded');
    }

    await this.listenEventModel.create({ isoWeek, yyyymm, userId, bookId, timestamp });

    await Promise.all([
      this.weeklyCountModel.updateOne(
        { isoWeek, bookId },
        { $inc: { count: 1 } },
        { upsert: true },
      ),
      this.monthlyCountModel.updateOne(
        { yyyymm, bookId },
        { $inc: { count: 1 } },
        { upsert: true },
      ),
    ]);
  }

  // ─── Private helpers ──────────────────────────────────────

  private async buildFilter(
    dto: FindAllAudiobooksDto,
    userId: string,
    skipListened: boolean,
  ): Promise<QueryFilter<Audiobook>> {
    const filter: QueryFilter<Audiobook> = {};

    if (dto.foreignAuthor !== undefined) filter.foreignAuthor = dto.foreignAuthor;
    if (dto.source) filter.source = dto.source;

    if (dto.durationMin !== undefined || dto.durationMax !== undefined) {
      filter.duration = {};
      if (dto.durationMin !== undefined) filter.duration.$gte = dto.durationMin;
      if (dto.durationMax !== undefined) filter.duration.$lte = dto.durationMax;
    }

    if (dto.releaseYearMin !== undefined || dto.releaseYearMax !== undefined) {
      filter.liveReleaseYear = {};
      if (dto.releaseYearMin !== undefined) filter.liveReleaseYear.$gte = dto.releaseYearMin;
      if (dto.releaseYearMax !== undefined) filter.liveReleaseYear.$lte = dto.releaseYearMax;
    }

    const paramMap: Record<string, string[] | undefined> = {
      'params.Жанры/поджанры': dto.genres,
      'params.Общие характеристики': dto.characteristics,
      'params.Место действия': dto.setting,
      'params.Время действия': dto.period,
      'params.Сюжетные ходы': dto.plotDevices,
      'params.Линейность сюжета': dto.plotLinearity,
      'params.Возраст читателя': dto.readerAge,
    };

    for (const [key, values] of Object.entries(paramMap)) {
      if (values?.length) filter[key] = { $in: values };
    }

    if (skipListened) {
      const listened = await this.historyModel
        .find({ userId, isListened: true })
        .select('audioBookId')
        .limit(MAX_SKIP_LISTENED_BOOKS)
        .lean()
        .exec();
      if (listened.length) {
        filter.id = { $nin: listened.map((h) => h.audioBookId) };
      }
    }

    return filter;
  }

  private async buildSkipListenedFilter(
    userId: string,
    skipListened: boolean,
  ): Promise<QueryFilter<Audiobook>> {
    if (!skipListened) return {};
    const listened = await this.historyModel
      .find({ userId, isListened: true })
      .select('audioBookId')
      .limit(MAX_SKIP_LISTENED_BOOKS)
      .lean()
      .exec();
    if (!listened.length) return {};
    return { id: { $nin: listened.map((h) => h.audioBookId) } };
  }

  private async countForFilter(filter: QueryFilter<Audiobook>, search?: string): Promise<number> {
    if (!search) {
      return this.audiobookModel.countDocuments(filter);
    }
    const regex = new RegExp(this.normalizeString(search), 'i');
    return this.audiobookModel
      .countDocuments(filter)
      .or([{ author: regex }, { name: regex }, { annotation: regex }]);
  }

  private async incrementAiSearches(userId: string, existing: AiSearch | null): Promise<number> {
    if (existing) {
      existing.searches += 1;
      await (existing as any).save();
      return existing.searches;
    }
    const created = await this.aiSearchModel.create({ userId, searches: 1 });
    return created.searches;
  }

  private normalizeString(str: string): string {
    return str.replace(/[её]/gi, '(е|ё)');
  }
}
