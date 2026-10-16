import { ObjectType, Field, ID } from '@nestjs/graphql';
import { FilterableField } from '@ptc-org/nestjs-query-graphql';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { parseRoles, serializeRoles } from '../../../common/utils/roles.util';

@ObjectType('User')
@Entity('users')
export class User {
  @FilterableField(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @FilterableField({ nullable: true })
  @Column({ unique: true, length: 255, nullable: true, default: null })
  email: string | null;

  @Column({ name: 'password_hash', length: 255 })
  passwordHash: string;

  @FilterableField()
  @Column({ name: 'first_name', length: 100 })
  firstName: string;

  @FilterableField()
  @Column({ name: 'last_name', length: 100 })
  lastName: string;

  @Field(() => [String])
  @Column({
    type: 'varchar',
    length: 255,
    default: 'user',
    transformer: {
      to: (value: unknown) => serializeRoles(value) || 'user',
      from: (value: unknown) => {
        const roles = parseRoles(value);
        return roles.length > 0 ? roles : ['user'];
      },
    },
  })
  roles: string[];

  @FilterableField({ nullable: true })
  @Column({ length: 20, nullable: true, default: null, unique: true })
  mobile: string | null;

  @Field({ nullable: true })
  @Column({ name: 'avatar_url', length: 500, nullable: true, default: null })
  avatarUrl: string | null;

  @FilterableField()
  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @FilterableField({ nullable: true })
  @Column({ name: 'last_login_at', type: 'datetime', nullable: true })
  lastLoginAt: Date | null;

  @FilterableField(() => Date)
  @CreateDateColumn()
  @Index()
  createdAt: Date;

  @FilterableField(() => Date)
  @UpdateDateColumn()
  updatedAt: Date;
}
