import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCategoriesAndTransactions1742000000002
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // --------------------------------------------------------
    // CATEGORIAS
    // --------------------------------------------------------
    await queryRunner.query(`
      CREATE TABLE "categories" (
        "id"         UUID NOT NULL DEFAULT uuid_generate_v4(),
        "name"       VARCHAR(100) NOT NULL,
        "user_id"    UUID NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_categories" PRIMARY KEY ("id"),
        CONSTRAINT "FK_categories_user"
          FOREIGN KEY ("user_id")
          REFERENCES "users" ("id")
          ON DELETE CASCADE
      )
    `);

    // --------------------------------------------------------
    // TRANSAÇÕES
    // --------------------------------------------------------
    await queryRunner.query(`
      CREATE TYPE "transaction_type_enum" AS ENUM ('income', 'expense')
    `);

    await queryRunner.query(`
      CREATE TABLE "transactions" (
        "id"          UUID NOT NULL DEFAULT uuid_generate_v4(),
        "description" VARCHAR(255) NOT NULL,
        "amount"      NUMERIC(15, 2) NOT NULL,
        "type"        "transaction_type_enum" NOT NULL,
        "date"        DATE NOT NULL,
        "category_id" UUID,
        "user_id"     UUID NOT NULL,
        "created_at"  TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at"  TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_transactions" PRIMARY KEY ("id"),
        CONSTRAINT "FK_transactions_category"
          FOREIGN KEY ("category_id")
          REFERENCES "categories" ("id")
          ON DELETE SET NULL,
        CONSTRAINT "FK_transactions_user"
          FOREIGN KEY ("user_id")
          REFERENCES "users" ("id")
          ON DELETE CASCADE
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "transactions"`);
    await queryRunner.query(`DROP TYPE "transaction_type_enum"`);
    await queryRunner.query(`DROP TABLE "categories"`);
  }
}
