import { Injectable } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Upload } from '@aws-sdk/lib-storage';
import { Readable } from 'stream';
import { AppConfigService } from '../../config/config.service';
import { YANDEX_S3_ENDPOINT, YANDEX_S3_REGION } from '../../common/constants';

@Injectable()
export class YandexStorageService {
  private readonly s3: S3Client;
  readonly bucketName: string;

  constructor(private readonly appConfig: AppConfigService) {
    this.bucketName = this.appConfig.bucketName;
    this.s3 = new S3Client({
      endpoint: YANDEX_S3_ENDPOINT,
      region: YANDEX_S3_REGION,
      credentials: {
        accessKeyId: this.appConfig.serviceAccountKeyId,
        secretAccessKey: this.appConfig.serviceAccountKey,
      },
    });
  }

  async isFileExist(key: string): Promise<boolean> {
    try {
      await this.s3.send(new HeadObjectCommand({ Bucket: this.bucketName, Key: key }));
      return true;
    } catch {
      return false;
    }
  }

  async uploadFile(
    fileName: string,
    body: Buffer | Uint8Array | string | Readable,
    contentType = 'audio/mp3',
  ): Promise<string> {
    const upload = new Upload({
      client: this.s3,
      params: {
        Bucket: this.bucketName,
        Key: fileName,
        Body: body,
        ACL: 'public-read',
        ContentType: contentType,
      },
    });

    await upload.done();
    return `${this.appConfig.storageUrl}/${this.bucketName}/${fileName}`;
  }

  async getSignedUploadUrl(fileKey: string, contentType: string): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: fileKey,
      ACL: 'public-read',
      ContentType: contentType,
    });
    return getSignedUrl(this.s3, command, { expiresIn: 3600 });
  }

  async downloadFile(fileName: string): Promise<Buffer> {
    const { Body } = await this.s3.send(
      new GetObjectCommand({ Bucket: this.bucketName, Key: fileName }),
    );
    const chunks: Buffer[] = [];
    for await (const chunk of Body as Readable) {
      chunks.push(Buffer.from(chunk));
    }
    return Buffer.concat(chunks);
  }

  async listAllObjects(): Promise<{ Key?: string; Size?: number }[]> {
    const objects: { Key?: string; Size?: number }[] = [];
    let continuationToken: string | undefined;

    do {
      const response = await this.s3.send(
        new ListObjectsV2Command({
          Bucket: this.bucketName,
          ContinuationToken: continuationToken,
        }),
      );
      if (response.Contents) {
        objects.push(...response.Contents.map((o) => ({ Key: o.Key, Size: o.Size })));
      }
      continuationToken = response.NextContinuationToken;
    } while (continuationToken);

    return objects;
  }
}
