import { Module } from '@nestjs/common';
import { S3Service } from './s3.service';
import { UploadResolver } from './upload.resolver';
import { UploadController } from './upload.controller';

@Module({
  controllers: [UploadController],
  providers: [S3Service, UploadResolver],
  exports: [S3Service],
})
export class UploadModule {}
