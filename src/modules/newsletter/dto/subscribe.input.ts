import { InputType, Field } from '@nestjs/graphql';
import {
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

@InputType()
export class SubscribeNewsletterInput {
  @Field()
  @IsEmail({}, { message: 'Имэйл буруу байна' })
  email: string;

  @Field({ nullable: true, defaultValue: 'mn' })
  @IsOptional()
  @IsIn(['mn', 'en', 'ko'])
  locale?: string;

  @Field({ nullable: true, description: 'footer / popup / checkout ...' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  source?: string;
}
