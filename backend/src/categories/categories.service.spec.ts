import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CategoriesService } from './categories.service';
import { Category } from './entities/category.entity';

const USER_ID = 'user-uuid';
const OTHER_USER_ID = 'other-uuid';

const mockCategory: Category = {
  id: 'cat-uuid',
  name: 'Alimentação',
  description: null,
  userId: USER_ID,
  user: {} as any,
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Mock do QueryBuilder — suporta assertUniqueName (getOne) e findAll (getManyAndCount)
function makeQb(
  existing: Category | null = null,
  manyAndCount?: [Category[], number],
) {
  const qb: Record<string, jest.Mock> = {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getOne: jest.fn().mockResolvedValue(existing),
    getManyAndCount: jest.fn().mockResolvedValue(manyAndCount ?? [[], 0]),
  };
  return qb;
}

const mockRepo = {
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  remove: jest.fn(),
  createQueryBuilder: jest.fn(),
};

describe('CategoriesService', () => {
  let service: CategoriesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        { provide: getRepositoryToken(Category), useValue: mockRepo },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create and return a category', async () => {
      mockRepo.createQueryBuilder.mockReturnValue(makeQb(null)); // nenhuma categoria com mesmo nome
      mockRepo.create.mockReturnValue(mockCategory);
      mockRepo.save.mockResolvedValue(mockCategory);

      const result = await service.create(USER_ID, { name: 'Alimentação' });

      expect(mockRepo.create).toHaveBeenCalledWith({ name: 'Alimentação', userId: USER_ID });
      expect(result).toEqual(mockCategory);
    });
  });

  describe('findAll', () => {
    it('should return paginated categories for the user', async () => {
      mockRepo.createQueryBuilder.mockReturnValue(
        makeQb(null, [[mockCategory], 1]),
      );

      const result = await service.findAll(USER_ID, { page: 1, limit: 20 });

      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.totalPages).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return category when found and belongs to user', async () => {
      mockRepo.findOne.mockResolvedValue(mockCategory);

      const result = await service.findOne(mockCategory.id, USER_ID);

      expect(result).toEqual(mockCategory);
    });

    it('should throw NotFoundException when category does not exist', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      await expect(service.findOne('nonexistent', USER_ID)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException when category belongs to another user', async () => {
      mockRepo.findOne.mockResolvedValue(mockCategory);

      await expect(service.findOne(mockCategory.id, OTHER_USER_ID)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('update', () => {
    it('should update and return the category', async () => {
      const updated = { ...mockCategory, name: 'Transporte' };
      mockRepo.findOne.mockResolvedValue(mockCategory);
      mockRepo.createQueryBuilder.mockReturnValue(makeQb(null)); // nenhum conflito de nome
      mockRepo.save.mockResolvedValue(updated);

      const result = await service.update(mockCategory.id, USER_ID, { name: 'Transporte' });

      expect(mockRepo.save).toHaveBeenCalled();
      expect(result.name).toBe('Transporte');
    });
  });

  describe('remove', () => {
    it('should remove the category', async () => {
      mockRepo.findOne.mockResolvedValue(mockCategory);
      mockRepo.remove.mockResolvedValue(undefined);

      await service.remove(mockCategory.id, USER_ID);

      expect(mockRepo.remove).toHaveBeenCalledWith(mockCategory);
    });
  });
});
