import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddLooksAndSiteContent1792063131552 implements MigrationInterface {
  name = 'AddLooksAndSiteContent1792063131552';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`look_items\` (\`id\` int NOT NULL AUTO_INCREMENT, \`look_id\` int NOT NULL, \`product_id\` int NOT NULL, \`x\` decimal(6,3) NOT NULL, \`y\` decimal(6,3) NOT NULL, \`position\` int NOT NULL DEFAULT '0', PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`looks\` (\`id\` int NOT NULL AUTO_INCREMENT, \`title\` varchar(255) NOT NULL, \`translations\` json NULL, \`image_url\` varchar(500) NOT NULL, \`image_width\` int NULL, \`image_height\` int NULL, \`bundle_discount_percent\` decimal(5,2) NOT NULL DEFAULT '0.00', \`is_published\` tinyint NOT NULL DEFAULT 0, \`position\` int NOT NULL DEFAULT '0', \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), INDEX \`IDX_247d52dd6cfee2aa1fca4f157a\` (\`is_published\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`site_content\` (\`key\` varchar(50) NOT NULL, \`data\` json NOT NULL, \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`key\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`line_items\` ADD \`look_id\` int NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`orders\` ADD \`discount_total\` decimal(12,2) NOT NULL DEFAULT '0.00'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`look_items\` ADD CONSTRAINT \`FK_141b74264786fbe030cbf14d4a9\` FOREIGN KEY (\`look_id\`) REFERENCES \`looks\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`look_items\` ADD CONSTRAINT \`FK_01f9a521ab154d07d039d8336b4\` FOREIGN KEY (\`product_id\`) REFERENCES \`products\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`look_items\` DROP FOREIGN KEY \`FK_01f9a521ab154d07d039d8336b4\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`look_items\` DROP FOREIGN KEY \`FK_141b74264786fbe030cbf14d4a9\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`orders\` DROP COLUMN \`discount_total\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`line_items\` DROP COLUMN \`look_id\``,
    );
    await queryRunner.query(`DROP TABLE \`site_content\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_247d52dd6cfee2aa1fca4f157a\` ON \`looks\``,
    );
    await queryRunner.query(`DROP TABLE \`looks\``);
    await queryRunner.query(`DROP TABLE \`look_items\``);
  }
}
