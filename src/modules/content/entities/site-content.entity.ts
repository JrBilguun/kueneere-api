import { Entity, PrimaryColumn, Column, UpdateDateColumn } from 'typeorm';

/**
 * Сайтын контент (баннер, текст) — хэсэг бүр нэг мөр:
 *   key = hero | ticker | campaign | community | newsletter
 *   data = { image, titleLine1, ... , i18n: { mn: {...}, en: {...}, ko: {...} } }
 */
@Entity('site_content')
export class SiteContent {
  @PrimaryColumn({ length: 50 })
  key: string;

  @Column({ type: 'json' })
  data: Record<string, unknown>;

  @UpdateDateColumn()
  updatedAt: Date;
}
