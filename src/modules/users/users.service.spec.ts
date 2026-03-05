import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { UsersService } from './users.service';
import { User } from './schemas/user.schema';
import { Subscription } from './schemas/subscription.schema';
import { AiSearch } from '../audiobooks/schemas/ai-search.schema';
import { History } from '../history/schemas/history.schema';
import { Playlist } from '../playlist/schemas/playlist.schema';
import { VkService } from '../../services/vk/vk.service';

function makeLeanExec(value: unknown) {
  return { lean: () => ({ exec: jest.fn().mockResolvedValue(value) }) };
}

function makeOrExec(value: unknown) {
  return { or: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(value) }) };
}

describe('UsersService', () => {
  let service: UsersService;
  let userModel: {
    findOne: jest.Mock;
    create: jest.Mock;
    updateOne: jest.Mock;
    deleteOne: jest.Mock;
  };
  let subscriptionModel: {
    findOne: jest.Mock;
    findOneAndDelete: jest.Mock;
  };
  let aiSearchModel: { findOne: jest.Mock };
  let historyModel: { deleteMany: jest.Mock };
  let playlistModel: { deleteMany: jest.Mock };
  let vkService: { getUserInfo: jest.Mock };

  beforeEach(async () => {
    userModel = {
      findOne: jest.fn(),
      create: jest.fn(),
      updateOne: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue({}) }),
      deleteOne: jest.fn().mockResolvedValue({}),
    };
    subscriptionModel = {
      findOne: jest.fn(),
      findOneAndDelete: jest.fn().mockResolvedValue({}),
    };
    aiSearchModel = { findOne: jest.fn() };
    historyModel = { deleteMany: jest.fn().mockResolvedValue({}) };
    playlistModel = { deleteMany: jest.fn().mockResolvedValue({}) };
    vkService = { getUserInfo: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getModelToken(User.name), useValue: userModel },
        { provide: getModelToken(Subscription.name), useValue: subscriptionModel },
        { provide: getModelToken(AiSearch.name), useValue: aiSearchModel },
        { provide: getModelToken(History.name), useValue: historyModel },
        { provide: getModelToken(Playlist.name), useValue: playlistModel },
        { provide: VkService, useValue: vkService },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ─── getOrCreateUser ──────────────────────────────────────────────────────
  describe('getOrCreateUser', () => {
    it('creates a new Firebase user and returns profile with no subscription', async () => {
      userModel.findOne.mockReturnValue(makeOrExec(null));
      const createdUser = {
        id: 'firebase-uid',
        email: 'new@example.com',
        name: 'New User',
        picture: 'https://pic.com/pic.jpg',
      };
      userModel.create.mockResolvedValue(createdUser);

      const authUser = {
        id: 'firebase-uid',
        email: 'new@example.com',
        name: 'New User',
        picture: 'https://pic.com/pic.jpg',
      };
      const result = await service.getOrCreateUser(authUser);

      expect(userModel.create).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'firebase-uid', email: 'new@example.com' }),
      );
      expect(result.id).toBe('firebase-uid');
      expect(result.subscription).toBeUndefined();
      expect(result.aiSearches).toBe(0);
    });

    it('returns existing user with active subscription', async () => {
      const existingUser = { id: 'user1', email: 'existing@example.com', name: 'Existing', picture: null, fbId: 'user1' };
      userModel.findOne.mockReturnValue(makeOrExec(existingUser));

      const subscription = {
        subscriberId: 1,
        userId: 'user1',
        type: 'Default',
        purchaseDate: new Date('2024-01-01'),
        durationMonths: 12,
        nextPaymentDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // future
      };
      subscriptionModel.findOne.mockReturnValue(makeLeanExec(subscription));
      aiSearchModel.findOne.mockReturnValue(makeLeanExec({ searches: 3 }));

      const result = await service.getOrCreateUser({ id: 'user1', email: 'existing@example.com' });

      expect(result.subscription).toBeDefined();
      expect(result.subscription!.status).toBe('ACTIVE');
      expect(result.aiSearches).toBe(3);
    });

    it('returns INACTIVE status when nextPaymentDate is in the past', async () => {
      const existingUser = { id: 'user1', email: 'e@e.com', fbId: 'user1' };
      userModel.findOne.mockReturnValue(makeOrExec(existingUser));

      const subscription = {
        subscriberId: 1,
        userId: 'user1',
        type: 'Default',
        purchaseDate: new Date('2023-01-01'),
        durationMonths: 6,
        nextPaymentDate: new Date('2023-07-01'), // past
      };
      subscriptionModel.findOne.mockReturnValue(makeLeanExec(subscription));
      aiSearchModel.findOne.mockReturnValue(makeLeanExec(null));

      const result = await service.getOrCreateUser({ id: 'user1', email: 'e@e.com' });

      expect(result.subscription!.status).toBe('INACTIVE');
    });

    it('returns INACTIVE when subscription has no nextPaymentDate', async () => {
      const existingUser = { id: 'user1', fbId: 'user1' };
      userModel.findOne.mockReturnValue(makeOrExec(existingUser));

      const subscription = {
        subscriberId: 1,
        userId: 'user1',
        type: 'Default',
        purchaseDate: new Date(),
        durationMonths: 12,
        nextPaymentDate: undefined,
      };
      subscriptionModel.findOne.mockReturnValue(makeLeanExec(subscription));
      aiSearchModel.findOne.mockReturnValue(makeLeanExec(null));

      const result = await service.getOrCreateUser({ id: 'user1' });

      expect(result.subscription!.status).toBe('INACTIVE');
    });

    it('aiSearches defaults to 0 when no aiSearch record exists', async () => {
      const existingUser = { id: 'user1', fbId: 'user1' };
      userModel.findOne.mockReturnValue(makeOrExec(existingUser));
      subscriptionModel.findOne.mockReturnValue(makeLeanExec(null));
      aiSearchModel.findOne.mockReturnValue(makeLeanExec(null));

      const result = await service.getOrCreateUser({ id: 'user1' });

      expect(result.aiSearches).toBe(0);
    });

    it('creates new VK user when no existing by email', async () => {
      userModel.findOne
        .mockReturnValueOnce(makeOrExec(null)) // no existing user
        .mockReturnValue({ exec: jest.fn().mockResolvedValue(null) }); // no existing by email

      vkService.getUserInfo.mockResolvedValue({
        email: 'vk@example.com',
        name: 'VK User',
        picture: 'https://vk.com/pic.jpg',
      });

      const createdUser = { id: 'vk-uid', vkId: 'vk-uid', email: 'vk@example.com', name: 'VK User' };
      userModel.create.mockResolvedValue(createdUser);

      const authUser = { id: 'vk-uid', vk: true, accessToken: 'vk-access-token' };
      const result = await service.getOrCreateUser(authUser);

      expect(vkService.getUserInfo).toHaveBeenCalledWith('vk-access-token');
      expect(userModel.create).toHaveBeenCalledWith(
        expect.objectContaining({ vkId: 'vk-uid', email: 'vk@example.com' }),
      );
      expect(result.id).toBe('vk-uid');
    });

    it('merges VK account into existing email-based account', async () => {
      userModel.findOne
        .mockReturnValueOnce(makeOrExec(null)) // no existing user by search params
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue({
            // existing by email
            id: 'existing-id',
            email: 'shared@example.com',
            vkId: undefined,
            picture: null,
            name: null,
            save: jest.fn().mockResolvedValue(true),
          }),
        });

      vkService.getUserInfo.mockResolvedValue({
        email: 'shared@example.com',
        name: 'VK User',
        picture: 'https://vk.com/pic.jpg',
      });

      const authUser = { id: 'vk-uid', vk: true, accessToken: 'vk-token' };
      const result = await service.getOrCreateUser(authUser);

      expect(result.id).toBe('existing-id');
    });
  });

  // ─── findByVkId ──────────────────────────────────────────────────────────
  describe('findByVkId', () => {
    it('finds user by vkId', async () => {
      const user = { id: 'user1', vkId: 'vk123' };
      userModel.findOne.mockReturnValue({ lean: () => ({ exec: jest.fn().mockResolvedValue(user) }) });

      const result = await service.findByVkId('vk123');

      expect(userModel.findOne).toHaveBeenCalledWith({ vkId: 'vk123' });
      expect(result).toEqual(user);
    });

    it('returns null when VK user not found', async () => {
      userModel.findOne.mockReturnValue({ lean: () => ({ exec: jest.fn().mockResolvedValue(null) }) });

      const result = await service.findByVkId('unknown');

      expect(result).toBeNull();
    });
  });

  // ─── deleteAllUserData ────────────────────────────────────────────────────
  describe('deleteAllUserData', () => {
    it('deletes history, playlists, user and subscription in parallel', async () => {
      historyModel.deleteMany.mockResolvedValue({});
      playlistModel.deleteMany.mockResolvedValue({});
      userModel.deleteOne.mockResolvedValue({});
      subscriptionModel.findOneAndDelete.mockResolvedValue({});

      await service.deleteAllUserData('user1');

      expect(historyModel.deleteMany).toHaveBeenCalledWith({ userId: 'user1' });
      expect(playlistModel.deleteMany).toHaveBeenCalledWith({ userId: 'user1' });
      expect(userModel.deleteOne).toHaveBeenCalledWith({ id: 'user1' });
      expect(subscriptionModel.findOneAndDelete).toHaveBeenCalledWith({ userId: 'user1' });
    });
  });
});
