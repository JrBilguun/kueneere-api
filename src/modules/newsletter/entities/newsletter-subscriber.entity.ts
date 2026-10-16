import { ObjectType, ID } from '@nestjs/graphql';
import { FilterableField } from '@ptc-org/nestjs-query-graphql';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/** kueneree хуудасны доод талын "Newsletter" бүртгэл */
@ObjectType('NewsletterSubscriber')
@Entity('newsletter_subscribers')
export class NewsletterSubscriber {
  @FilterableField(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @FilterableField()
  @Column({ length: 255, unique: true })
  email: string;

  /** mn | en | ko */
  @FilterableField()
  @Column({ length: 5, default: 'mn' })
  locale: string;

  @FilterableField({ nullable: true })
  @Column({ length: 50, nullable: true })
  source: string | null;

  @FilterableField()
  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @FilterableField({ nullable: true })
  @Column({ name: 'unsubscribed_at', type: 'datetime', nullable: true })
  unsubscribedAt: Date | null;

  @FilterableField()
  @CreateDateColumn()
  createdAt: Date;

  @FilterableField()
  @UpdateDateColumn()
  updatedAt: Date;
}
