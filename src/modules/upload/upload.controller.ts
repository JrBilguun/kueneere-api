import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { mkdir, writeFile } from 'fs/promises';
import { extname, join, resolve } from 'path';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { StaffGuard } from '../../common/guards/role.guard';
import { S3Service } from './s3.service';
import { UPLOAD_FOLDERS } from './dto/presigned-url.dto';

const MAX_BYTES = 15 * 1024 * 1024;
const ALLOWED =
  /^(image\/(jpeg|png|webp|gif|avif)|video\/(mp4|webm|quicktime))$/;

interface UploadedBlob {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

/**
 * POST /uploads  (multipart/form-data: file, folder?)
 *
 * kueneere-admin барааны зураг оруулахад ашиглана.
 *  - AWS_S3_* тохируулсан бол → S3 руу
 *  - Тохируулаагүй бол → серверийн UPLOAD_DIR (Docker volume) руу хадгалж
 *    `${PUBLIC_URL}/uploads/...` хаягаар үйлчилнэ (main.ts → useStaticAssets)
 */
@Controller('uploads')
@UseGuards(JwtAuthGuard, StaffGuard)
export class UploadController {
  constructor(
    private readonly config: ConfigService,
    private readonly s3: S3Service,
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: MAX_BYTES } }))
  async upload(
    @UploadedFile() file: UploadedBlob | undefined,
    @Body('folder') folderInput?: string,
  ): Promise<{ url: string; key: string; storage: 's3' | 'local' }> {
    if (!file) throw new BadRequestException('file талбар хоосон байна');
    if (!ALLOWED.test(file.mimetype)) {
      throw new BadRequestException('Зөвхөн зураг эсвэл видео файл');
    }
    const folder = UPLOAD_FOLDERS.includes(folderInput ?? '')
      ? folderInput
      : 'uploads';

    if (this.config.get<string>('AWS_S3_ACCESS_KEY')) {
      const { key, url } = await this.s3.upload(
        file.buffer,
        file.originalname,
        file.mimetype,
        folder,
      );
      return { url, key, storage: 's3' };
    }

    const ext = (extname(file.originalname) || '.bin').toLowerCase();
    const key = `${folder}/${randomUUID()}${ext}`;
    const root = resolve(this.config.get<string>('app.uploadDir', 'uploads'));
    await mkdir(join(root, folder), { recursive: true });
    await writeFile(join(root, key), file.buffer);
    const base = this.config.get<string>(
      'app.publicUrl',
      'http://localhost:3003',
    );
    return {
      url: `${base.replace(/\/$/, '')}/uploads/${key}`,
      key,
      storage: 'local',
    };
  }
}
