import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUsersTable1742000000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id"         UUID NOT NULL DEFAULT uuid_generate_v4(),
        "name"       VARCHAR(100) NOT NULL,
        "email"      VARCHAR(255) NOT NULL,
        "password"   VARCHAR(255) NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_users_email" UNIQUE ("email"),
        CONSTRAINT "PK_users" PRIMARY KEY ("id")
      )
    `);

    // seed: senha = "senha123" em bcrypt (rounds=10)
    await queryRunner.query(`
      INSERT INTO "users" ("name", "email", "password") VALUES
      (
        'Admin Seed',
        'admin@fintech.com',
        '$2b$10$IY5ci.zY/chVpCKU3dh7E.AO.1Qhiy9OJfDPWeF48hDQPsR72lZmq'
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "users"`);
  }
}
