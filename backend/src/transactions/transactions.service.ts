import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from './entities/transaction.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { QueryTransactionDto } from './dto/query-transaction.dto';
import { PaginatedData } from '../common/types/api-response.types';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly repo: Repository<Transaction>,
  ) {}

  create(userId: string, dto: CreateTransactionDto): Promise<Transaction> {
    const transaction = this.repo.create({ ...dto, userId });
    return this.repo.save(transaction);
  }

  async findAll(
    userId: string,
    query: QueryTransactionDto,
  ): Promise<PaginatedData<Transaction>> {
    const { type, categoryId, startDate, endDate, page = 1, limit = 20 } = query;
    const qb = this.repo
      .createQueryBuilder('t')
      .leftJoinAndSelect('t.category', 'category')
      .where('t.userId = :userId', { userId })
      .orderBy('t.date', 'DESC')
      .addOrderBy('t.createdAt', 'DESC');

    if (type) qb.andWhere('t.type = :type', { type });
    if (categoryId) qb.andWhere('t.categoryId = :categoryId', { categoryId });
    if (startDate) qb.andWhere('t.date >= :startDate', { startDate });
    if (endDate) qb.andWhere('t.date <= :endDate', { endDate });

    const total = await qb.getCount();
    const data = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return {
      items: data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string, userId: string): Promise<Transaction> {
    const transaction = await this.repo.findOne({
      where: { id },
      relations: ['category'],
    });
    if (!transaction) throw new NotFoundException('Transação não encontrada');
    if (transaction.userId !== userId) throw new ForbiddenException();
    return transaction;
  }

  async update(
    id: string,
    userId: string,
    dto: UpdateTransactionDto,
  ): Promise<Transaction> {
    const transaction = await this.findOne(id, userId);
    Object.assign(transaction, dto);
    return this.repo.save(transaction);
  }

  async remove(id: string, userId: string): Promise<void> {
    const transaction = await this.findOne(id, userId);
    await this.repo.remove(transaction);
  }
}
