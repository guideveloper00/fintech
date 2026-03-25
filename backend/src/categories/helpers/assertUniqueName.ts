import { Repository } from "typeorm";
import { Category } from "../entities/category.entity";
import { ConflictException } from "@nestjs/common";

 export async function assertUniqueName(
    repo: Repository<Category>,
    userId: string,
    name: string,
    excludeId?: string,
  ): Promise<void> {
    const existing = await repo
      .createQueryBuilder('c')
      .where('c.userId = :userId', { userId })
      .andWhere('LOWER(c.name) = LOWER(:name)', { name })
      .getOne();

    if (existing && existing.id !== excludeId) {
      throw new ConflictException('Já existe uma categoria com esse nome');
    }
  }
