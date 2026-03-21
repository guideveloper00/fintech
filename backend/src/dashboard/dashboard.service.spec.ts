import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Transaction, TransactionType } from '../transactions/entities/transaction.entity';
import { DashboardService } from './dashboard.service';

const userId = 'user-uuid';

function makeQb(rawOverride?: Array<Record<string, string>>) {
  const qb: Record<string, jest.Mock> = {
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    innerJoin: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    addGroupBy: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    getRawMany: jest.fn().mockResolvedValue(rawOverride ?? []),
  };
  return qb;
}

const mockRepo = {
  createQueryBuilder: jest.fn(),
};

describe('DashboardService', () => {
  let service: DashboardService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        { provide: getRepositoryToken(Transaction), useValue: mockRepo },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
    jest.clearAllMocks();
  });

  // ------------------------------------------------------------------
  describe('getSummary', () => {
    it('should return zeroed summary when there are no transactions', async () => {
      // Both queries return empty arrays
      mockRepo.createQueryBuilder
        .mockReturnValueOnce(makeQb([]))   // totals query
        .mockReturnValueOnce(makeQb([]));  // top categories query

      const result = await service.getSummary(userId);

      expect(result.balance).toBe(0);
      expect(result.totalIncome).toBe(0);
      expect(result.totalExpense).toBe(0);
      expect(result.topExpenseCategories).toHaveLength(0);
    });

    it('should calculate balance as income minus expense', async () => {
      const totalsRaw = [
        { type: TransactionType.INCOME, total: '3000' },
        { type: TransactionType.EXPENSE, total: '1200' },
      ];
      mockRepo.createQueryBuilder
        .mockReturnValueOnce(makeQb(totalsRaw))
        .mockReturnValueOnce(makeQb([]));

      const result = await service.getSummary(userId);

      expect(result.totalIncome).toBe(3000);
      expect(result.totalExpense).toBe(1200);
      expect(result.balance).toBe(1800);
    });

    it('should return top expense categories sorted by total', async () => {
      const totalsRaw = [{ type: TransactionType.EXPENSE, total: '500' }];
      const topRaw = [
        { categoryId: 'cat-1', categoryName: 'Alimentação', total: '300' },
        { categoryId: 'cat-2', categoryName: 'Transporte', total: '150' },
        { categoryId: 'cat-3', categoryName: 'Lazer', total: '50' },
      ];
      mockRepo.createQueryBuilder
        .mockReturnValueOnce(makeQb(totalsRaw))
        .mockReturnValueOnce(makeQb(topRaw));

      const result = await service.getSummary(userId);

      expect(result.topExpenseCategories).toHaveLength(3);
      expect(result.topExpenseCategories[0].categoryName).toBe('Alimentação');
      expect(result.topExpenseCategories[0].total).toBe(300);
    });

    it('should handle income-only history (no expenses)', async () => {
      const totalsRaw = [{ type: TransactionType.INCOME, total: '5000' }];
      mockRepo.createQueryBuilder
        .mockReturnValueOnce(makeQb(totalsRaw))
        .mockReturnValueOnce(makeQb([]));

      const result = await service.getSummary(userId);

      expect(result.totalIncome).toBe(5000);
      expect(result.totalExpense).toBe(0);
      expect(result.balance).toBe(5000);
    });
  });
});
