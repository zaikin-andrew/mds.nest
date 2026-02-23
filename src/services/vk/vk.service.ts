import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { jwtVerify, importSPKI, KeyLike } from 'jose';
import * as fs from 'fs';
import * as path from 'path';
import { firstValueFrom } from 'rxjs';
import { AppConfigService } from '../../config/config.service';
import { VK_OAUTH_URL } from 'src/common/constants';

export interface VkTokenPayload {
  sub: string;
  email: string;
  first_name: string;
  last_name: string;
  avatar: string;
  exp: number;
  iat: number;
  iis?: string;
  app?: number;
}

export interface VkUserInfo {
  user_id: string;
  first_name: string;
  last_name: string;
  avatar: string;
  sex: number;
  email: string;
  verified: boolean;
  birthday: string;
}

@Injectable()
export class VkService implements OnModuleInit {
  private readonly logger = new Logger(VkService.name);
  private publicKey: KeyLike;

  constructor(
    private readonly httpService: HttpService,
    private readonly appConfig: AppConfigService,
  ) {}

  async onModuleInit() {
    const pemPath = path.resolve(__dirname, 'vk_public_key.pem');
    const pem = fs.readFileSync(pemPath, 'utf8');
    this.publicKey = await importSPKI(pem, 'RS256');
    this.logger.log('VK public key loaded');
  }

  async verifyVkToken(idToken: string): Promise<VkTokenPayload> {
    const { payload } = await jwtVerify(idToken, this.publicKey);
    const vkPayload = payload as unknown as VkTokenPayload;
    if (vkPayload.iis !== 'VK') throw new Error('Unexpected issuer');
    if (vkPayload.app !== Number(this.appConfig.vkClientId)) {
      throw new Error('Unexpected app id');
    }
    return vkPayload;
  }

  async getUserInfo(accessToken: string): Promise<{
    email: string;
    name: string;
    picture: string;
  }> {
    const { data } = await firstValueFrom(
      this.httpService.post<{ user: VkUserInfo }>(
        VK_OAUTH_URL,
        new URLSearchParams({
          access_token: accessToken,
          client_id: this.appConfig.vkClientId,
        }),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
      ),
    );

    return {
      email: data.user.email,
      name: `${data.user.first_name} ${data.user.last_name}`,
      picture: data.user.avatar,
    };
  }
}
