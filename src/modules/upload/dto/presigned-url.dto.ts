import { ObjectType, Field, InputType } from '@nestjs/graphql';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsIn,
  Matches,
} from 'class-validator';

export const UPLOAD_FOLDERS = [
  'products',
  'categories',
  'assets',
  'avatars',
  'uploads',
];

@InputType()
export class PresignedUploadInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  filename: string;

  @Field({ description: 'image/jpeg, image/png, image/webp, video/mp4 ...' })
  @Matches(/^(image\/(jpeg|png|webp|gif|avif)|video\/(mp4|webm|quicktime))$/, {
    message: 'Зөвхөн зураг эсвэл видео файл',
  })
  mimeType: string;

  @Field({ nullable: true, defaultValue: 'uploads' })
  @IsOptional()
  @IsIn(UPLOAD_FOLDERS)
  folder?: string;
}

@ObjectType()
export class PresignedUploadResponse {
  @Field()
  key: string;

  @Field()
  uploadUrl: string;

  @Field()
  publicUrl: string;
}
