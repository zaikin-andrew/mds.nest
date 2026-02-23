import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { UserInfo } from '../interfaces/user-info.interface';
import { User } from '../../modules/users/schemas/user.schema';
import { FirebaseService } from '../../services/firebase/firebase.service';
import { VkService } from '../../services/vk/vk.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly firebaseService: FirebaseService,
    private readonly vkService: VkService,
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const req = context.switchToHttp().getRequest();
    const token = req.headers.authorization;

    if (!token) {
      throw new UnauthorizedException('Token not found');
    }

    const isVk = req.headers['x-is-vk-token'] === 'true';

    try {
      req.user = isVk
        ? await this.resolveVkUser(token, req.headers['x-access-token'] as string)
        : await this.resolveFirebaseUser(token);
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }

    return true;
  }

  private async resolveFirebaseUser(token: string): Promise<UserInfo> {
    const decoded = await this.firebaseService.verifyToken(token);
    return {
      id: decoded.uid,
      name: decoded.name,
      email: decoded.email,
      picture: decoded.picture,
    };
  }

  private async resolveVkUser(idToken: string, accessToken?: string): Promise<UserInfo> {
    const payload = await this.vkService.verifyVkToken(idToken);
    const vkId = payload.sub.toString();

    const user = await this.userModel.findOne({ vkId }).lean().exec();
    if (!user) {
      throw new UnauthorizedException('VK user not found. Please re-login.');
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      picture: user.picture,
    };
  }
}
