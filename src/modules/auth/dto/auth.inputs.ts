import { InputType, Field } from '@nestjs/graphql';
import {
  IsArray,
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Role } from '../../../common/constants/roles';

const PASSWORD_RULE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;
const PASSWORD_MSG =
  'Нууц үг дор хаяж 1 том үсэг, 1 жижиг үсэг, 1 тоо агуулсан байх ёстой';

@InputType()
export class RegisterInput {
  @Field()
  @IsEmail({}, { message: 'Имэйл буруу байна' })
  email: string;

  @Field()
  @IsString()
  @MinLength(8, { message: 'Нууц үг хамгийн багадаа 8 тэмдэгт' })
  @Matches(PASSWORD_RULE, { message: PASSWORD_MSG })
  password: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  firstName: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  lastName: string;

  @Field({ nullable: true })
  @IsOptional()
  @Matches(/^\+?\d{8,15}$/, { message: 'Утасны дугаар буруу байна' })
  mobile?: string;
}

@InputType()
export class LoginInput {
  @Field()
  @IsEmail({}, { message: 'Имэйл буруу байна' })
  email: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  password: string;
}

@InputType()
export class UpdateProfileInput {
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
  @Matches(/^\+?\d{8,15}$/, { message: 'Утасны дугаар буруу байна' })
  mobile?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  avatarUrl?: string;
}

@InputType()
export class ChangePasswordInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  currentPassword: string;

  @Field()
  @IsString()
  @MinLength(8)
  @Matches(PASSWORD_RULE, { message: PASSWORD_MSG })
  newPassword: string;
}

/** Админ шинэ ажилтан (manager / marketer / admin) үүсгэх */
@InputType()
export class CreateStaffInput extends RegisterInput {
  @Field(() => [String])
  @IsArray()
  @IsIn(Object.values(Role), { each: true })
  roles: string[];
}
