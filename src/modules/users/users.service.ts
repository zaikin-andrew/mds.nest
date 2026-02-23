import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserInfo } from '../../common/interfaces/user-info.interface';
import { User, UserDocument } from './schemas/user.schema';
import { Subscription, SubscriptionStatus } from './schemas/subscription.schema';
import { AiSearch } from '../audiobooks/schemas/ai-search.schema';
import { History } from '../history/schemas/history.schema';
import { Playlist } from '../playlist/schemas/playlist.schema';
import { VkService } from '../../services/vk/vk.service';

export interface UserProfile {
  id: string;
  email?: string;
  name?: string;
  picture?: string;
  aiSearches: number;
  subscription?: {
    subscriberId: number;
    userId: string;
    type: string;
    purchaseDate: Date;
    durationMonths: number;
    nextPaymentDate?: Date;
    status: SubscriptionStatus;
  };
}

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Subscription.name) private readonly subscriptionModel: Model<Subscription>,
    @InjectModel(AiSearch.name) private readonly aiSearchModel: Model<AiSearch>,
    @InjectModel(History.name) private readonly historyModel: Model<History>,
    @InjectModel(Playlist.name) private readonly playlistModel: Model<Playlist>,
    private readonly vkService: VkService,
  ) {}

  async getOrCreateUser(
    authUser: UserInfo & { vk?: boolean; accessToken?: string },
  ): Promise<UserProfile> {
    const searchParams: Record<string, string>[] = [
      { id: authUser.id },
      { vkId: authUser.id },
      { fbId: authUser.id },
    ];
    if (authUser.email) searchParams.push({ email: authUser.email });

    let user = await this.userModel.findOne().or(searchParams).exec();

    if (!user) {
      user = await this.createNewUser(authUser);
      return this.buildProfile(user, null, 0);
    }

    await this.mergeAccountFields(user, authUser);

    const [subscription, aiSearch] = await Promise.all([
      this.subscriptionModel.findOne({ userId: user.id }).lean().exec(),
      this.aiSearchModel.findOne({ userId: user.id }).lean().exec(),
    ]);

    return this.buildProfile(user, subscription, aiSearch?.searches ?? 0);
  }

  async findByVkId(vkId: string): Promise<User | null> {
    return this.userModel.findOne({ vkId }).lean().exec();
  }

  async deleteAllUserData(userId: string): Promise<void> {
    await Promise.all([
      this.historyModel.deleteMany({ userId }),
      this.playlistModel.deleteMany({ userId }),
      this.userModel.deleteOne({ id: userId }),
      this.subscriptionModel.findOneAndDelete({ userId }),
    ]);
  }

  private async createNewUser(
    authUser: UserInfo & { vk?: boolean; accessToken?: string },
  ): Promise<UserDocument> {
    if (authUser.email && !authUser.vk) {
      return this.userModel.create({
        id: authUser.id,
        email: authUser.email,
        name: authUser.name,
        picture: authUser.picture,
        fbId: authUser.id,
      });
    }

    const vkUserInfo = await this.vkService.getUserInfo(authUser.accessToken!);
    const existingByEmail = await this.userModel.findOne({ email: vkUserInfo.email }).exec();

    if (!existingByEmail) {
      return this.userModel.create({
        id: authUser.id,
        vkId: authUser.id,
        email: vkUserInfo.email,
        name: vkUserInfo.name,
        picture: vkUserInfo.picture,
      });
    }

    existingByEmail.vkId = authUser.id;
    if (!existingByEmail.picture) existingByEmail.picture = vkUserInfo.picture;
    if (!existingByEmail.name) existingByEmail.name = vkUserInfo.name;
    await existingByEmail.save();
    return existingByEmail;
  }

  private async mergeAccountFields(
    user: any,
    authUser: UserInfo & { vk?: boolean },
  ): Promise<void> {
    const updates: Record<string, string> = {};

    if (authUser.email && !user.fbId) updates.fbId = authUser.id;
    if (authUser.email && !user.picture && authUser.picture) updates.picture = authUser.picture;
    if (authUser.email && !user.name && authUser.name) updates.name = authUser.name;

    if (Object.keys(updates).length > 0) {
      await this.userModel.updateOne({ id: user.id }, updates).exec();
    }
  }

  private buildProfile(
    user: any,
    subscription: Subscription | null,
    aiSearches: number,
  ): UserProfile {
    const profile: UserProfile = {
      id: user.id,
      email: user.email,
      name: user.name,
      picture: user.picture,
      aiSearches,
    };

    if (subscription) {
      profile.subscription = {
        subscriberId: subscription.subscriberId,
        userId: subscription.userId,
        type: subscription.type,
        purchaseDate: subscription.purchaseDate,
        durationMonths: subscription.durationMonths,
        nextPaymentDate: subscription.nextPaymentDate,
        status: this.getSubscriptionStatus(subscription.nextPaymentDate),
      };
    }

    return profile;
  }

  private getSubscriptionStatus(nextPaymentDate?: Date): SubscriptionStatus {
    if (!nextPaymentDate) return 'INACTIVE';
    return new Date(nextPaymentDate).getTime() > Date.now() ? 'ACTIVE' : 'INACTIVE';
  }
}
