import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

type Stage = 'local' | 'dev' | 'test' | 'prod';

@Injectable()
export class AppConfigService {
  constructor(private readonly config: ConfigService) {}

  get stage(): Stage {
    return this.config.getOrThrow<Stage>('NODE_ENV');
  }

  get isProd(): boolean {
    return this.stage === 'prod';
  }

  get port(): number {
    return this.config.getOrThrow<number>('SERVER_PORT');
  }

  // Database

  get mongoUrl(): string {
    return this.config.getOrThrow<string>('MONGO_URL');
  }

  // Firebase

  get serviceAccountKeyId(): string {
    return this.config.getOrThrow<string>('SERVICE_ACCOUNT_ACCESS_KEY_ID');
  }

  get serviceAccountKey(): string {
    return this.config.getOrThrow<string>('SERVICE_ACCOUNT_ACCESS_KEY');
  }

  // VK

  get vkClientId(): string {
    return this.config.getOrThrow<string>('VK_CLIENT_ID');
  }

  // Storage

  get bucketName(): string {
    return this.config.getOrThrow<string>('BUCKET_NAME');
  }

  get storageUrl(): string {
    return this.config.getOrThrow<string>('STORAGE_URL');
  }

  get communityBucketName(): string {
    return this.config.getOrThrow<string>('COMMUNITY_BUCKET_NAME');
  }

  // OpenAI

  get openaiToken(): string {
    return this.config.getOrThrow<string>('OPENAI_TOKEN');
  }

  // Admin

  get adminCredentials(): { username: string; password: string }[] {
    return [
      this.parseCredentials(
        this.config.getOrThrow<string>('ADDISON_CREDENTIALS'),
      ),
      this.parseCredentials(
        this.config.getOrThrow<string>('AZAIKIN_CREDENTIALS'),
      ),
    ];
  }

  // Telegram

  get tgSupportUserId(): string {
    return this.config.getOrThrow<string>('TG_SUPPORT_USER_ID');
  }

  // Rustore

  get rustore() {
    return {
      url: this.config.getOrThrow<string>('RUSTORE_PUSH_SERVICE_URL'),
      projectId: this.config.getOrThrow<string>(
        'RUSTORE_PUSH_SERVICE_PROJECT_ID',
      ),
      token: this.config.getOrThrow<string>('RUSTORE_PUSH_SERVICE_TOKEN'),
    };
  }

  // AI

  get aiUrl(): string | undefined {
    return this.config.get<string>('AI_URL');
  }

  private parseCredentials(raw: string): {
    username: string;
    password: string;
  } {
    const [username, password] = raw.split(':');
    return { username, password };
  }
}
