import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitSchema1791987261395 implements MigrationInterface {
  name = 'InitSchema1791987261395';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`users\` (\`id\` varchar(36) NOT NULL, \`email\` varchar(255) NULL, \`password_hash\` varchar(255) NOT NULL, \`first_name\` varchar(100) NOT NULL, \`last_name\` varchar(100) NOT NULL, \`roles\` varchar(255) NOT NULL DEFAULT 'user', \`mobile\` varchar(20) NULL, \`avatar_url\` varchar(500) NULL, \`is_active\` tinyint NOT NULL DEFAULT 1, \`last_login_at\` datetime NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), INDEX \`IDX_c9b5b525a96ddc2c5647d7f7fa\` (\`created_at\`), UNIQUE INDEX \`IDX_97672ac88f789774dd47f7c8be\` (\`email\`), UNIQUE INDEX \`IDX_d376a9f93bba651f32a2c03a7d\` (\`mobile\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`payments\` (\`id\` int NOT NULL AUTO_INCREMENT, \`source_id\` int NOT NULL, \`source_type\` varchar(50) NOT NULL DEFAULT 'order', \`provider\` varchar(30) NOT NULL DEFAULT 'qpay', \`amount\` decimal(12,2) NOT NULL, \`transaction_id\` varchar(255) NULL, \`status\` enum ('pending', 'completed', 'rejected', 'refunded') NOT NULL DEFAULT 'pending', \`paid_at\` datetime NULL, \`data\` json NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), INDEX \`IDX_dff34bb62da0f9fb491773423f\` (\`source_id\`), INDEX \`IDX_3c324ca49dabde7ffc0ef64675\` (\`transaction_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`categories\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`slug\` varchar(255) NOT NULL, \`description\` text NULL, \`image_url\` varchar(500) NULL, \`parent_id\` int NULL, \`position\` int NOT NULL DEFAULT '0', \`is_active\` tinyint NOT NULL DEFAULT 1, \`translations\` json NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_420d9f679d41281f282f5bc7d0\` (\`slug\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`product_images\` (\`id\` int NOT NULL AUTO_INCREMENT, \`product_id\` int NOT NULL, \`image_url\` varchar(500) NOT NULL, \`alt\` varchar(255) NULL, \`position\` int NOT NULL DEFAULT '0', PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`products\` (\`id\` int NOT NULL AUTO_INCREMENT, \`category_id\` int NULL, \`name\` varchar(255) NOT NULL, \`slug\` varchar(255) NOT NULL, \`description\` text NULL, \`details\` text NULL, \`care\` text NULL, \`fit_note\` varchar(500) NULL, \`color\` varchar(100) NULL, \`color_hex\` varchar(20) NULL, \`price\` decimal(12,2) NOT NULL DEFAULT '0.00', \`compare_at_price\` decimal(12,2) NULL, \`currency\` varchar(10) NOT NULL DEFAULT 'MNT', \`main_image\` varchar(500) NULL, \`drop_name\` varchar(100) NULL, \`status\` enum ('draft', 'active', 'archived') NOT NULL DEFAULT 'draft', \`is_featured\` tinyint NOT NULL DEFAULT 0, \`position\` int NOT NULL DEFAULT '0', \`translations\` json NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), INDEX \`IDX_bc44678714c0e57916bb7cfc34\` (\`drop_name\`), INDEX \`IDX_1846199852a695713b1f8f5e9a\` (\`status\`), UNIQUE INDEX \`IDX_464f927ae360106b783ed0b410\` (\`slug\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`variants\` (\`id\` int NOT NULL AUTO_INCREMENT, \`product_id\` int NOT NULL, \`sku\` varchar(100) NULL, \`size\` varchar(20) NOT NULL DEFAULT 'OS', \`color\` varchar(100) NOT NULL DEFAULT '', \`stock\` int NOT NULL DEFAULT '0', \`price\` decimal(12,2) NULL, \`position\` int NOT NULL DEFAULT '0', \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_9df3dfe3b422bc91678a42c694\` (\`product_id\`, \`size\`, \`color\`), UNIQUE INDEX \`IDX_36c4c7a3b994abc268f8ebbf48\` (\`sku\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`line_items\` (\`id\` int NOT NULL AUTO_INCREMENT, \`order_id\` int NOT NULL, \`product_id\` int NULL, \`variant_id\` int NULL, \`name\` varchar(255) NOT NULL DEFAULT '', \`product_slug\` varchar(255) NULL, \`image_url\` varchar(500) NULL, \`size\` varchar(20) NULL, \`color\` varchar(100) NULL, \`quantity\` int NOT NULL DEFAULT '1', \`unit_price\` decimal(12,2) NOT NULL, \`amount\` decimal(12,2) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`orders\` (\`id\` int NOT NULL AUTO_INCREMENT, \`number\` varchar(50) NOT NULL, \`user_id\` varchar(36) NULL, \`cart_token\` varchar(64) NULL, \`status\` enum ('basket', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled') NOT NULL DEFAULT 'basket', \`payment_state\` enum ('unpaid', 'paid', 'refunded') NOT NULL DEFAULT 'unpaid', \`item_total\` decimal(12,2) NOT NULL DEFAULT '0.00', \`delivery_fee\` decimal(12,2) NOT NULL DEFAULT '0.00', \`total\` decimal(12,2) NOT NULL DEFAULT '0.00', \`currency\` varchar(10) NOT NULL DEFAULT 'MNT', \`customer_name\` varchar(255) NULL, \`email\` varchar(255) NULL, \`phone\` varchar(30) NULL, \`city\` varchar(100) NULL, \`district\` varchar(100) NULL, \`khoroo\` varchar(100) NULL, \`address_line\` varchar(500) NULL, \`notes\` text NULL, \`placed_at\` datetime NULL, \`paid_at\` datetime NULL, \`data\` json NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), INDEX \`IDX_a922b820eeef29ac1c6800e826\` (\`user_id\`), INDEX \`IDX_775c9f06fc27ae3ff8fb26f2c4\` (\`status\`), UNIQUE INDEX \`IDX_4e174e347d448617acdf98fef0\` (\`number\`), UNIQUE INDEX \`IDX_8d5b852c3c9422e768f9361ac4\` (\`cart_token\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`newsletter_subscribers\` (\`id\` int NOT NULL AUTO_INCREMENT, \`email\` varchar(255) NOT NULL, \`locale\` varchar(5) NOT NULL DEFAULT 'mn', \`source\` varchar(50) NULL, \`is_active\` tinyint NOT NULL DEFAULT 1, \`unsubscribed_at\` datetime NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_0dc48416511f011f7de7b2a8f8\` (\`email\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`channel_budgets\` (\`id\` int NOT NULL AUTO_INCREMENT, \`channel\` varchar(100) NOT NULL, \`allocated\` decimal(14,2) NOT NULL DEFAULT '0.00', \`spent\` decimal(14,2) NOT NULL DEFAULT '0.00', \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_e7122740ec6dc1fbeba5eb4518\` (\`channel\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`campaign_assets\` (\`id\` int NOT NULL AUTO_INCREMENT, \`campaign_id\` int NULL, \`name\` varchar(255) NOT NULL, \`type\` enum ('image', 'video') NOT NULL DEFAULT 'image', \`url\` varchar(500) NOT NULL, \`thumbnail_url\` varchar(500) NULL, \`storage_key\` varchar(500) NULL, \`size\` enum ('small', 'medium', 'large') NOT NULL DEFAULT 'small', \`impressions\` int NOT NULL DEFAULT '0', \`engagement\` decimal(6,2) NOT NULL DEFAULT '0.00', \`ctr\` decimal(6,2) NOT NULL DEFAULT '0.00', \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`campaigns\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`description\` text NULL, \`status\` enum ('live', 'paused', 'scheduled', 'ended') NOT NULL DEFAULT 'scheduled', \`channel\` varchar(100) NOT NULL, \`budget\` decimal(14,2) NOT NULL DEFAULT '0.00', \`spend\` decimal(14,2) NOT NULL DEFAULT '0.00', \`revenue\` decimal(14,2) NOT NULL DEFAULT '0.00', \`impressions\` bigint NOT NULL DEFAULT '0', \`clicks\` int NOT NULL DEFAULT '0', \`conversions\` int NOT NULL DEFAULT '0', \`start_date\` date NULL, \`end_date\` date NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), INDEX \`IDX_8b6b94352da69af03dbaf87c63\` (\`status\`), INDEX \`IDX_24edda0cb1775c2a5e19263980\` (\`channel\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`budget_transactions\` (\`id\` int NOT NULL AUTO_INCREMENT, \`description\` varchar(255) NOT NULL, \`amount\` decimal(14,2) NOT NULL, \`channel\` varchar(100) NULL, \`campaign_id\` int NULL, \`occurred_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), INDEX \`IDX_de18a7ac82e5f1681ab4f4a7aa\` (\`occurred_at\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`budget_settings\` (\`id\` int NOT NULL DEFAULT '1', \`total_budget\` decimal(14,2) NOT NULL DEFAULT '0.00', \`daily_budget\` decimal(14,2) NOT NULL DEFAULT '0.00', \`currency\` varchar(10) NOT NULL DEFAULT 'MNT', \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`audience_segments\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`description\` text NULL, \`size\` int NOT NULL DEFAULT '0', \`growth\` decimal(7,2) NOT NULL DEFAULT '0.00', \`engagement\` decimal(6,2) NOT NULL DEFAULT '0.00', \`ltv\` decimal(14,2) NOT NULL DEFAULT '0.00', \`engagement_level\` varchar(20) NOT NULL DEFAULT 'medium', \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`categories\` ADD CONSTRAINT \`FK_88cea2dc9c31951d06437879b40\` FOREIGN KEY (\`parent_id\`) REFERENCES \`categories\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`product_images\` ADD CONSTRAINT \`FK_4f166bb8c2bfcef2498d97b4068\` FOREIGN KEY (\`product_id\`) REFERENCES \`products\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`products\` ADD CONSTRAINT \`FK_9a5f6868c96e0069e699f33e124\` FOREIGN KEY (\`category_id\`) REFERENCES \`categories\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`variants\` ADD CONSTRAINT \`FK_a9625f5484e6b6941d401ec101c\` FOREIGN KEY (\`product_id\`) REFERENCES \`products\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`line_items\` ADD CONSTRAINT \`FK_364f2fd50813438fe69360aef27\` FOREIGN KEY (\`order_id\`) REFERENCES \`orders\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`line_items\` ADD CONSTRAINT \`FK_1b81216fae107f69ae22d662ce5\` FOREIGN KEY (\`variant_id\`) REFERENCES \`variants\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`line_items\` ADD CONSTRAINT \`FK_450feb799862e681a2b41b6421a\` FOREIGN KEY (\`product_id\`) REFERENCES \`products\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`campaign_assets\` ADD CONSTRAINT \`FK_8a54e454361f6e1ff9230377a97\` FOREIGN KEY (\`campaign_id\`) REFERENCES \`campaigns\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`campaign_assets\` DROP FOREIGN KEY \`FK_8a54e454361f6e1ff9230377a97\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`line_items\` DROP FOREIGN KEY \`FK_450feb799862e681a2b41b6421a\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`line_items\` DROP FOREIGN KEY \`FK_1b81216fae107f69ae22d662ce5\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`line_items\` DROP FOREIGN KEY \`FK_364f2fd50813438fe69360aef27\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`variants\` DROP FOREIGN KEY \`FK_a9625f5484e6b6941d401ec101c\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`products\` DROP FOREIGN KEY \`FK_9a5f6868c96e0069e699f33e124\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`product_images\` DROP FOREIGN KEY \`FK_4f166bb8c2bfcef2498d97b4068\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`categories\` DROP FOREIGN KEY \`FK_88cea2dc9c31951d06437879b40\``,
    );
    await queryRunner.query(`DROP TABLE \`audience_segments\``);
    await queryRunner.query(`DROP TABLE \`budget_settings\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_de18a7ac82e5f1681ab4f4a7aa\` ON \`budget_transactions\``,
    );
    await queryRunner.query(`DROP TABLE \`budget_transactions\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_24edda0cb1775c2a5e19263980\` ON \`campaigns\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_8b6b94352da69af03dbaf87c63\` ON \`campaigns\``,
    );
    await queryRunner.query(`DROP TABLE \`campaigns\``);
    await queryRunner.query(`DROP TABLE \`campaign_assets\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_e7122740ec6dc1fbeba5eb4518\` ON \`channel_budgets\``,
    );
    await queryRunner.query(`DROP TABLE \`channel_budgets\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_0dc48416511f011f7de7b2a8f8\` ON \`newsletter_subscribers\``,
    );
    await queryRunner.query(`DROP TABLE \`newsletter_subscribers\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_8d5b852c3c9422e768f9361ac4\` ON \`orders\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_4e174e347d448617acdf98fef0\` ON \`orders\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_775c9f06fc27ae3ff8fb26f2c4\` ON \`orders\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_a922b820eeef29ac1c6800e826\` ON \`orders\``,
    );
    await queryRunner.query(`DROP TABLE \`orders\``);
    await queryRunner.query(`DROP TABLE \`line_items\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_36c4c7a3b994abc268f8ebbf48\` ON \`variants\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_9df3dfe3b422bc91678a42c694\` ON \`variants\``,
    );
    await queryRunner.query(`DROP TABLE \`variants\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_464f927ae360106b783ed0b410\` ON \`products\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_1846199852a695713b1f8f5e9a\` ON \`products\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_bc44678714c0e57916bb7cfc34\` ON \`products\``,
    );
    await queryRunner.query(`DROP TABLE \`products\``);
    await queryRunner.query(`DROP TABLE \`product_images\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_420d9f679d41281f282f5bc7d0\` ON \`categories\``,
    );
    await queryRunner.query(`DROP TABLE \`categories\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_3c324ca49dabde7ffc0ef64675\` ON \`payments\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_dff34bb62da0f9fb491773423f\` ON \`payments\``,
    );
    await queryRunner.query(`DROP TABLE \`payments\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_d376a9f93bba651f32a2c03a7d\` ON \`users\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_97672ac88f789774dd47f7c8be\` ON \`users\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_c9b5b525a96ddc2c5647d7f7fa\` ON \`users\``,
    );
    await queryRunner.query(`DROP TABLE \`users\``);
  }
}
