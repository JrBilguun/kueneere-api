import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { ForbiddenException, UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../../common/guards/gql-auth.guard';
import { StaffGuard } from '../../common/guards/role.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { hasAnyRole } from '../../common/utils/roles.util';
import { STAFF_ROLES } from '../../common/constants/roles';
import { User } from '../user/entities/user.entity';
import { S3Service } from './s3.service';
import {
  PresignedUploadInput,
  PresignedUploadResponse,
} from './dto/presigned-url.dto';

/**
 * S3 руу шууд upload хийх presigned URL.
 *   1) getPresignedUploadUrl → uploadUrl
 *   2) frontend: fetch(uploadUrl, { method: 'PUT', body: file, headers: { 'Content-Type': mimeType } })
 *   3) publicUrl-ийг product.mainImage / campaignAsset.url-д хадгална
 * Энгийн хэрэглэгч зөвхөн "avatars" хавтас руу upload хийнэ.
 */
@Resolver()
export class UploadResolver {
  constructor(private readonly s3Service: S3Service) {}

  @UseGuards(GqlAuthGuard)
  @Mutation(() => PresignedUploadResponse, {
    description: 'S3 presigned upload URL',
  })
  getPresignedUploadUrl(
    @CurrentUser() user: User,
    @Args('input') input: PresignedUploadInput,
  ): Promise<PresignedUploadResponse> {
    const folder = input.folder ?? 'uploads';
    if (folder !== 'avatars' && !hasAnyRole(user.roles, ...STAFF_ROLES)) {
      throw new ForbiddenException('Зөвхөн avatars хавтас руу upload хийнэ');
    }
    return this.s3Service.getPresignedUploadUrl(
      input.filename,
      input.mimeType,
      folder,
    );
  }

  @UseGuards(GqlAuthGuard, StaffGuard)
  @Mutation(() => Boolean, { description: 'S3-аас файл устгах (ажилтан)' })
  async deleteFile(@Args('key') key: string): Promise<boolean> {
    await this.s3Service.delete(key);
    return true;
  }
}
