import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuthGuard } from 'src/common/guards/auth.guard';

const mockService = {
  getOrCreateUser: jest.fn(),
  deleteAllUserData: jest.fn(),
};

const mockUser = { id: 'user1', name: 'Test User', email: 'test@example.com' };

describe('UsersController', () => {
  let controller: UsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: mockService }],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<UsersController>(UsersController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getInfo', () => {
    it('delegates to service.getOrCreateUser with current user', () => {
      const profile = { id: 'user1', aiSearches: 0 };
      mockService.getOrCreateUser.mockResolvedValue(profile);

      controller.getInfo(mockUser);

      expect(mockService.getOrCreateUser).toHaveBeenCalledWith(mockUser);
    });

    it('returns the result from service', async () => {
      const profile = { id: 'user1', email: 'test@example.com', aiSearches: 3 };
      mockService.getOrCreateUser.mockResolvedValue(profile);

      const result = controller.getInfo(mockUser);

      await expect(result).resolves.toEqual(profile);
    });
  });

  describe('remove', () => {
    it('delegates to service.deleteAllUserData with user id', () => {
      mockService.deleteAllUserData.mockResolvedValue(undefined);

      controller.remove(mockUser);

      expect(mockService.deleteAllUserData).toHaveBeenCalledWith(mockUser.id);
    });

    it('returns result of service call', async () => {
      mockService.deleteAllUserData.mockResolvedValue(undefined);

      const result = controller.remove(mockUser);

      await expect(result).resolves.toBeUndefined();
    });
  });
});
