import { Injectable, OnModuleInit } from '@nestjs/common';
import { initializeApp, getApps, cert, ServiceAccount } from 'firebase-admin/app';
import { getAuth, DecodedIdToken } from 'firebase-admin/auth';
import { getMessaging, TopicMessage } from 'firebase-admin/messaging';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

@Injectable()
export class FirebaseService implements OnModuleInit {
  onModuleInit() {
    if (getApps().length > 0) return;

    const serviceAccountPath = resolve(__dirname + '/service-account/serviceAccountKey.json');
    const serviceAccount = readFileSync(serviceAccountPath, 'utf-8');
    if (!serviceAccount) {
      throw new Error('Service account not found');
    }

    initializeApp({
      credential: cert(JSON.parse(serviceAccount) as ServiceAccount),
    });
  }

  verifyToken(token: string): Promise<DecodedIdToken> {
    return getAuth().verifyIdToken(token);
  }

  sendPushNotification(message: TopicMessage): Promise<string> {
    return getMessaging().send(message);
  }
}
