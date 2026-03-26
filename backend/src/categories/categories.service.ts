import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { assertUniqueName } from './helpers/assertUniqueName';
import { QueryCategoryDto, CategorySortBy, SortOrder } from './dto/query-category.dto';
import type { PaginatedData } from '../common/types/api-response.types';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly repo: Repository<Category>,
  ) {}

  async create(userId: string, dto: CreateCategoryDto): Promise<Category> {
    await assertUniqueName(this.repo, userId, dto.name);
    const category = this.repo.create({ ...dto, userId });
    return this.repo.save(category);
  }

  async findAll(userId: string, query: QueryCategoryDto = {}): Promise<PaginatedData<Category>> {
    const {
      sortBy = CategorySortBy.CREATED_AT,
      sortOrder = SortOrder.DESC,
      page,
      limit,
    } = query;

    const effectivePage = page ?? 1;
    const effectiveLimit = limit ?? 20;

    const columnMap: Record<CategorySortBy, string> = {
      [CategorySortBy.NAME]: 'c.name',
      [CategorySortBy.DESCRIPTION]: 'c.description',
      [CategorySortBy.CREATED_AT]: 'c.createdAt',
    };

    const orderColumn = columnMap[sortBy] ?? 'c.createdAt';

    const [items, total] = await this.repo
      .createQueryBuilder('c')
      .where('c.userId = :userId', { userId })
      .orderBy(orderColumn, sortOrder.toUpperCase() as 'ASC' | 'DESC')
      .skip((effectivePage - 1) * effectiveLimit)
      .take(effectiveLimit)
      .getManyAndCount();

    return {
      items,
      total,
      page: effectivePage,
      limit: effectiveLimit,
      totalPages: Math.ceil(total / effectiveLimit),
    };
  }

  async findOne(id: string, userId: string): Promise<Category> {
    const category = await this.repo.findOne({ where: { id } });
    if (!category) throw new NotFoundException('Categoria não encontrada');
    if (category.userId !== userId) throw new ForbiddenException();
    return category;
  }

  async update(
    id: string,
    userId: string,
    dto: UpdateCategoryDto,
  ): Promise<Category> {
    const category = await this.findOne(id, userId);
    if (dto.name) await assertUniqueName(this.repo, userId, dto.name, id);
    Object.assign(category, dto);
    return this.repo.save(category);
  }

  async remove(id: string, userId: string): Promise<void> {
    const category = await this.findOne(id, userId);
    await this.repo.remove(category);
  }
}