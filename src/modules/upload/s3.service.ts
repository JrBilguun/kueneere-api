import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';
import { extname } from 'path';

@Injectable()
export class S3Service {
  private readonly logger = new Logger(S3Service.name);
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly region: string;

  constructor(private readonly configService: ConfigService) {
    this.region = this.configService.get<string>('AWS_S3_REGION', 'eu-north-1');
    this.bucket = this.configService.get<string>(
      'AWS_S3_BUCKET',
      'kueneere-assets',
    );

    this.client = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_S3_ACCESS_KEY', ''),
        secretAccessKey: this.configService.get<string>(
          'AWS_S3_SECRET_KEY',
          '',
        ),
      },
      requestChecksumCalculation: 'WHEN_REQUIRED',
      responseChecksumValidation: 'WHEN_REQUIRED',
    });
  }

  /** Upload a file buffer to S3 */
  async upload(
    buffer: Buffer,
    originalName: string,
    mimeType: string,
    folder = 'uploads',
  ): Promise<{ key: string; url: string }> {
    const ext = extname(originalName) || '.bin';
    const key = `${folder}/${randomUUID()}${ext}`;

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: mimeType,
      }),
    );

    const url = `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
    this.logger.log(`Uploaded ${key} (${mimeType})`);
    return { key, url };
  }

  /** Delete a file from S3 by key */
  async delete(key: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    );
    this.logger.log(`Deleted ${key}`);
  }

  /** Generate a presigned URL for direct upload from client */
  async getPresignedUploadUrl(
    filename: string,
    mimeType: string,
    folder = 'uploads',
    expiresIn = 300,
  ): Promise<{ key: string; uploadUrl: string; publicUrl: string }> {
    const ext = extname(filename) || '.bin';
    const key = `${folder}/${randomUUID()}${ext}`;

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: mimeType,
    });

    const uploadUrl = await getSignedUrl(this.client, command, { expiresIn });
    const publicUrl = `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;

    return { key, uploadUrl, publicUrl };
  }

  /** Generate a presigned URL for downloading/viewing a private file */
  async getPresignedDownloadUrl(
    key: string,
    expiresIn = 3600,
  ): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });
    return getSignedUrl(this.client, command, { expiresIn });
  }
}
