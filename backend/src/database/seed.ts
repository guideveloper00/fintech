/**
 * Script de seed — cria o usuário de demonstração, categorias e transações de exemplo.
 * Uso: npm run seed
 * Idempotente: só executa se o usuário seed ainda não existir.
 */
import 'reflect-metadata';
import * as bcrypt from 'bcrypt';
import { AppDataSource } from './data-source';
import { User } from '../users/entities/user.entity';
import { Category } from '../categories/entities/category.entity';
import { Transaction, TransactionType } from '../transactions/entities/transaction.entity';

const SEED_EMAIL = 'admin@fintech.com';
const SEED_PASSWORD = 'senha123';
const SEED_NAME = 'Admin';

/** Retorna uma data no formato YYYY-MM-DD com offset de dias a partir de hoje */
function dateOffset(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

async function seed(): Promise<void> {
  await AppDataSource.initialize();

  const userRepo = AppDataSource.getRepository(User);
  const existing = await userRepo.findOne({ where: { email: SEED_EMAIL } });

  // ── Usuário ────────────────────────────────────────────────────────────────
  let user: User;
  if (existing) {
    console.log(`Seed: usuário ${SEED_EMAIL} já existe — reaproveitando.`);
    user = existing;
  } else {
    const hashed = await bcrypt.hash(SEED_PASSWORD, 10);
    user = await userRepo.save(
      userRepo.create({ name: SEED_NAME, email: SEED_EMAIL, password: hashed }),
    );
    console.log(`Seed: usuário criado — id: ${user.id}`);
  }

  // ── Categorias ─────────────────────────────────────────────────────────────
  const categoryRepo = AppDataSource.getRepository(Category);
  const existingCategories = await categoryRepo.find({ where: { userId: user.id } });

  let allCategories: Category[];
  if (existingCategories.length > 0) {
    console.log(`Seed: ${existingCategories.length} categorias já existem — reaproveitando.`);
    allCategories = existingCategories;
  } else {
    const categoryDefs = [
      'Alimentação',
      'Transporte',
      'Salário',
      'Freelance',
      'Aluguel',
      'Utilidades',
      'Saúde',
      'Lazer',
      'Educação',
      'Fornecedor',
    ];
    allCategories = [];
    for (const name of categoryDefs) {
      const c = await categoryRepo.save(
        categoryRepo.create({ name, userId: user.id }),
      );
      allCategories.push(c);
    }
    console.log(`Seed: ${allCategories.length} categorias criadas.`);
  }

  // Atalhos por nome para montar as transações
  const cat = (name: string) =>
    allCategories.find((c) => c.name === name)?.id ?? null;

  // ── Transações ─────────────────────────────────────────────────────────────
  const transactionRepo = AppDataSource.getRepository(Transaction);
  const existingTransactions = await transactionRepo.count({ where: { userId: user.id } });

  if (existingTransactions > 0) {
    console.log(`Seed: ${existingTransactions} transações já existem — nada a fazer.`);
    await AppDataSource.destroy();
    return;
  }

  const transactions: Partial<Transaction>[] = [
    // Mês atual — semana 4
    { description: 'Supermercado Extra',         amount: 320.50,  type: TransactionType.EXPENSE, date: dateOffset(-2),   categoryId: cat('Alimentação') },
    { description: 'Uber — reunião cliente',     amount: 42.90,   type: TransactionType.EXPENSE, date: dateOffset(-3),   categoryId: cat('Transporte') },
    { description: 'Salário março',              amount: 6500.00, type: TransactionType.INCOME,  date: dateOffset(-5),   categoryId: cat('Salário') },
    { description: 'Farmácia Drogasil',          amount: 98.00,   type: TransactionType.EXPENSE, date: dateOffset(-6),   categoryId: cat('Saúde') },
    { description: 'Projeto freelance — logo',   amount: 1200.00, type: TransactionType.INCOME,  date: dateOffset(-7),   categoryId: cat('Freelance') },

    // Mês atual — semana 3
    { description: 'Conta de luz',               amount: 185.40,  type: TransactionType.EXPENSE, date: dateOffset(-10),  categoryId: cat('Utilidades') },
    { description: 'iFood — jantar',             amount: 67.80,   type: TransactionType.EXPENSE, date: dateOffset(-11),  categoryId: cat('Alimentação') },
    { description: 'Aluguel março',              amount: 1800.00, type: TransactionType.EXPENSE, date: dateOffset(-13),  categoryId: cat('Aluguel') },
    { description: 'Curso React avançado',       amount: 249.90,  type: TransactionType.EXPENSE, date: dateOffset(-14),  categoryId: cat('Educação') },

    // Mês atual — semana 2
    { description: 'Gasolina posto BR',          amount: 210.00,  type: TransactionType.EXPENSE, date: dateOffset(-17),  categoryId: cat('Transporte') },
    { description: 'Pagamento fornecedor web',   amount: 900.00,  type: TransactionType.EXPENSE, date: dateOffset(-18),  categoryId: cat('Fornecedor') },
    { description: 'Cinema & pipoca',            amount: 88.00,   type: TransactionType.EXPENSE, date: dateOffset(-19),  categoryId: cat('Lazer') },
    { description: 'Adiantamento projeto API',   amount: 2000.00, type: TransactionType.INCOME,  date: dateOffset(-21),  categoryId: cat('Freelance') },
    { description: 'Consulta médica',            amount: 250.00,  type: TransactionType.EXPENSE, date: dateOffset(-22),  categoryId: cat('Saúde') },

    // Mês passado — semana 4
    { description: 'Salário fevereiro',          amount: 6500.00, type: TransactionType.INCOME,  date: dateOffset(-34),  categoryId: cat('Salário') },
    { description: 'Supermercado Carrefour',     amount: 289.70,  type: TransactionType.EXPENSE, date: dateOffset(-35),  categoryId: cat('Alimentação') },
    { description: 'Parcela carro',              amount: 780.00,  type: TransactionType.EXPENSE, date: dateOffset(-36),  categoryId: cat('Transporte') },
    { description: 'Netflix + Spotify',          amount: 75.80,   type: TransactionType.EXPENSE, date: dateOffset(-37),  categoryId: cat('Lazer') },
    { description: 'Aluguel fevereiro',          amount: 1800.00, type: TransactionType.EXPENSE, date: dateOffset(-41),  categoryId: cat('Aluguel') },

    // Mês passado — semana 2
    { description: 'Projeto freelance — site',   amount: 3500.00, type: TransactionType.INCOME,  date: dateOffset(-48),  categoryId: cat('Freelance') },
    { description: 'Conta de água',              amount: 92.30,   type: TransactionType.EXPENSE, date: dateOffset(-49),  categoryId: cat('Utilidades') },
    { description: 'Farmácia — vitaminas',       amount: 134.00,  type: TransactionType.EXPENSE, date: dateOffset(-51),  categoryId: cat('Saúde') },
    { description: 'Padaria São Paulo',          amount: 45.60,   type: TransactionType.EXPENSE, date: dateOffset(-53),  categoryId: cat('Alimentação') },

    // 2 meses atrás
    { description: 'Salário janeiro',            amount: 6500.00, type: TransactionType.INCOME,  date: dateOffset(-65),  categoryId: cat('Salário') },
    { description: 'Aluguel janeiro',            amount: 1800.00, type: TransactionType.EXPENSE, date: dateOffset(-68),  categoryId: cat('Aluguel') },
    { description: 'Manutenção notebook',        amount: 450.00,  type: TransactionType.EXPENSE, date: dateOffset(-70),  categoryId: cat('Fornecedor') },
    { description: 'Academia mensal',            amount: 99.90,   type: TransactionType.EXPENSE, date: dateOffset(-72),  categoryId: cat('Saúde') },
    { description: 'Conta de internet',          amount: 129.90,  type: TransactionType.EXPENSE, date: dateOffset(-74),  categoryId: cat('Utilidades') },
    { description: 'Consultoria UX — projeto',  amount: 1800.00, type: TransactionType.INCOME,  date: dateOffset(-75),  categoryId: cat('Freelance') },
    { description: 'Restaurante aniversário',    amount: 312.00,  type: TransactionType.EXPENSE, date: dateOffset(-78),  categoryId: cat('Lazer') },
    { description: 'Livros técnicos',            amount: 187.40,  type: TransactionType.EXPENSE, date: dateOffset(-80),  categoryId: cat('Educação') },
    { description: 'Parcela carro',              amount: 780.00,  type: TransactionType.EXPENSE, date: dateOffset(-83),  categoryId: cat('Transporte') },
    { description: 'Supermercado Pão de Açúcar', amount: 356.90,  type: TransactionType.EXPENSE, date: dateOffset(-87),  categoryId: cat('Alimentação') },
  ];

  for (const tx of transactions) {
    await transactionRepo.save(
      transactionRepo.create({ ...tx, userId: user.id }),
    );
  }
  console.log(`Seed: ${transactions.length} transações criadas.`);

  await AppDataSource.destroy();
}

seed().catch((err) => {
  console.error('Seed falhou:', err);
  process.exit(1);
});
