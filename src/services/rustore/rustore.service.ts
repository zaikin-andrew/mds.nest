import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { TopicMessage } from 'firebase-admin/messaging';
import { firstValueFrom } from 'rxjs';
import { AppConfigService } from '../../config/config.service';

interface RuStorePushMessage {
  message: {
    notification: {
      title?: string;
      body?: string;
      image?: string;
    };
    data?: Record<string, string>;
  };
}

interface RuStorePublishResponse {
  code?: number;
  status?: string;
  message: string;
}

@Injectable()
export class RustoreService {
  private readonly logger = new Logger(RustoreService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly appConfig: AppConfigService,
  ) {}

  async sendPushNotification(notification: TopicMessage): Promise<void> {
    const { url, projectId, token } = this.appConfig.rustore;
    if (!url || !projectId || !token) {
      this.logger.warn('Rustore push config is missing, skipping');
      return;
    }

    const message: RuStorePushMessage = {
      message: {
        notification: {
          title: notification.notification?.title,
          body: notification.notification?.body,
          image: notification.notification?.imageUrl,
        },
        data: notification.data,
      },
    };

    const { data } = await firstValueFrom(
      this.httpService.post<RuStorePublishResponse>(
        `${url}/${projectId}/topics/${notification.topic}/publish`,
        message,
        { headers: { Authorization: `Bearer ${token}` } },
      ),
    );

    if (data.code && [2000, 1001].includes(data.code)) {
      this.logger.warn(`Rustore push error: ${data.message}`);
    } else {
      this.logger.log(`Rustore push sent: ${data.message}`);
    }
  }
}
