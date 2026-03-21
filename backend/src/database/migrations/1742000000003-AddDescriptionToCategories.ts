import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDescriptionToCategories1742000000003
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "categories"
      ADD COLUMN "description" VARCHAR(255)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "categories"
      DROP COLUMN "description"
    `);
  }
}
