import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { Transaction, TransactionType } from './entities/transaction.entity';

const userId = 'user-uuid';

const mockTransaction: Transaction = {
  id: 'tx-uuid',
  description: 'Supermercado',
  amount: 150.5,
  type: TransactionType.EXPENSE,
  date: '2026-03-21',
  categoryId: 'cat-uuid',
  category: null,
  userId,
  user: null as any,
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Mock mínimo do QueryBuilder
function makeQb(overrides: Record<string, jest.Mock> = {}) {
  const qb: Record<string, jest.Mock> = {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    innerJoin: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    addOrderBy: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    addGroupBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    getCount: jest.fn().mockResolvedValue(1),
    getMany: jest.fn().mockResolvedValue([mockTransaction]),
    getRawMany: jest.fn().mockResolvedValue([]),
    ...overrides,
  };
  return qb;
}

const mockRepo = {
  create: jest.fn((dto) => ({ ...dto })),
  save: jest.fn(async (entity) => ({ ...entity, id: 'tx-uuid' })),
  findOne: jest.fn(),
  remove: jest.fn(),
  createQueryBuilder: jest.fn(),
};

describe('TransactionsService', () => {
  let service: TransactionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        { provide: getRepositoryToken(Transaction), useValue: mockRepo },
      ],
    }).compile();

    service = module.get<TransactionsService>(TransactionsService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create and save a transaction', async () => {
      const dto = {
        description: 'Salário',
        amount: 5000,
        type: TransactionType.INCOME,
        date: '2026-03-01',
      };
      const result = await service.create(userId, dto as any);

      expect(mockRepo.create).toHaveBeenCalledWith({ ...dto, userId });
      expect(mockRepo.save).toHaveBeenCalled();
      expect(result).toMatchObject({ userId });
    });
  });

  describe('findAll', () => {
    it('should return paginated transactions for the user', async () => {
      const qb = makeQb();
      mockRepo.createQueryBuilder.mockReturnValue(qb);

      const result = await service.findAll(userId, { page: 1, limit: 20 });

      expect(qb.where).toHaveBeenCalledWith('t.userId = :userId', { userId });
      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.totalPages).toBe(1);
    });

    it('should apply type filter when provided', async () => {
      const qb = makeQb();
      mockRepo.createQueryBuilder.mockReturnValue(qb);

      await service.findAll(userId, { type: TransactionType.EXPENSE, page: 1, limit: 20 });

      expect(qb.andWhere).toHaveBeenCalledWith('t.type = :type', {
        type: TransactionType.EXPENSE,
      });
    });
  });

  describe('findOne', () => {
    it('should return the transaction when it belongs to the user', async () => {
      mockRepo.findOne.mockResolvedValue(mockTransaction);

      const result = await service.findOne(mockTransaction.id, userId);
      expect(result).toBe(mockTransaction);
    });

    it('should throw NotFoundException when transaction does not exist', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent', userId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException when transaction belongs to another user', async () => {
      mockRepo.findOne.mockResolvedValue({ ...mockTransaction, userId: 'other-user' });

      await expect(service.findOne(mockTransaction.id, userId)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('update', () => {
    it('should update and save the transaction', async () => {
      mockRepo.findOne.mockResolvedValue({ ...mockTransaction });
      const dto = { description: 'Atualizado' };

      const result = await service.update(mockTransaction.id, userId, dto as any);

      expect(mockRepo.save).toHaveBeenCalled();
      expect(result).toMatchObject({ id: 'tx-uuid' });
    });
  });

  describe('remove', () => {
    it('should remove the transaction', async () => {
      mockRepo.findOne.mockResolvedValue({ ...mockTransaction });

      await service.remove(mockTransaction.id, userId);

      expect(mockRepo.remove).toHaveBeenCalled();
    });
  });
});
