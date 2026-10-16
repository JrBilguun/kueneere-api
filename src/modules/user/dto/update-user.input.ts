import { InputType, Field } from '@nestjs/graphql';
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { Role } from '../../../common/constants/roles';

/** Админ хэрэглэгчийн мэдээлэл / эрх засах */
@InputType('UpdateUserInput')
export class UpdateUserInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  firstName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  lastName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  mobile?: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsIn(Object.values(Role), { each: true })
  roles?: string[];

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
