import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction, TransactionType } from '../transactions/entities/transaction.entity';
import { DashboardQueryDto } from './dto/dashboard-query.dto';

export interface TopCategory {
  categoryId: string;
  categoryName: string;
  total: number;
}

export interface DashboardData {
  balance: number;
  totalIncome: number;
  totalExpense: number;
  topExpenseCategories: TopCategory[];
  period: { startDate: string | null; endDate: string | null };
}

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepo: Repository<Transaction>,
  ) {}

  async getSummary(userId: string, query: DashboardQueryDto = {}): Promise<DashboardData> {
    const { startDate, endDate } = query;

    // Base totals query builder
    const totalsQb = this.transactionRepo
      .createQueryBuilder('t')
      .select('t.type', 'type')
      .addSelect('SUM(t.amount)', 'total')
      .where('t.userId = :userId', { userId })
      .groupBy('t.type');

    if (startDate) totalsQb.andWhere('t.date >= :startDate', { startDate });
    if (endDate) totalsQb.andWhere('t.date <= :endDate', { endDate });

    const totalsRaw: Array<{ type: string; total: string }> = await totalsQb.getRawMany();

    const totalIncome = Number(
      totalsRaw.find((r) => r.type === TransactionType.INCOME)?.total ?? 0,
    );
    const totalExpense = Number(
      totalsRaw.find((r) => r.type === TransactionType.EXPENSE)?.total ?? 0,
    );

    // Top 3 expense categories builder
    const topQb = this.transactionRepo
      .createQueryBuilder('t')
      .innerJoin('t.category', 'c')
      .select('c.id', 'categoryId')
      .addSelect('c.name', 'categoryName')
      .addSelect('SUM(t.amount)', 'total')
      .where('t.userId = :userId', { userId })
      .andWhere('t.type = :type', { type: TransactionType.EXPENSE })
      .andWhere('t.categoryId IS NOT NULL')
      .groupBy('c.id')
      .addGroupBy('c.name')
      .orderBy('SUM(t.amount)', 'DESC')
      .limit(3);

    if (startDate) topQb.andWhere('t.date >= :startDate', { startDate });
    if (endDate) topQb.andWhere('t.date <= :endDate', { endDate });

    const topRaw: Array<{
      categoryId: string;
      categoryName: string;
      total: string;
    }> = await topQb.getRawMany();

    const topExpenseCategories: TopCategory[] = topRaw.map((r) => ({
      categoryId: r.categoryId,
      categoryName: r.categoryName,
      total: Number(r.total),
    }));

    return {
      balance: totalIncome - totalExpense,
      totalIncome,
      totalExpense,
      topExpenseCategories,
      period: { startDate: startDate ?? null, endDate: endDate ?? null },
    };
  }
}
