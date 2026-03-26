/**
 * Script de seed — cria o usuário de demonstração e categorias de exemplo.
 * Uso: npm run seed
 */
import 'reflect-metadata';
import * as bcrypt from 'bcrypt';
import { AppDataSource } from './data-source';

const SEED_EMAIL = 'admin@fintech.com';
const SEED_PASSWORD = 'senha123';
const SEED_NAME = 'Admin';

async function seed(): Promise<void> {
  await AppDataSource.initialize();

  const userRepo = AppDataSource.getRepository('users');

  const existing = await userRepo.findOne({ where: { email: SEED_EMAIL } });

  if (existing) {
    console.log(`Seed: usuário ${SEED_EMAIL} já existe — nada a fazer.`);
  } else {
    const hashed = await bcrypt.hash(SEED_PASSWORD, 10);
    const user = userRepo.create({
      name: SEED_NAME,
      email: SEED_EMAIL,
      password: hashed,
    });
    const saved = await userRepo.save(user);
    console.log(`Seed: usuário criado — id: ${(saved as { id: string }).id}`);

    // Cria categorias de exemplo vinculadas ao usuário seed
    const categoryRepo = AppDataSource.getRepository('categories');
    const sampleCategories = [
      'Alimentação',
      'Transporte',
      'Fornecedor',
      'Receita de Cliente',
      'Reembolso',
    ];
    for (const name of sampleCategories) {
      await categoryRepo.save(
        categoryRepo.create({ name, userId: (saved as { id: string }).id }),
      );
    }
    console.log(`Seed: ${sampleCategories.length} categorias criadas.`);
  }

  await AppDataSource.destroy();
}

seed().catch((err) => {
  console.error('Seed falhou:', err);
  process.exit(1);
});
