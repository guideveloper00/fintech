import { api } from '../lib/api';
import type {
  Category,
  CategoryFilters,
  CreateCategoryPayload,
  PaginatedData,
  UpdateCategoryPayload,
} from '../shared/types';

export const categoriesService = {
  /** Retorna todas as categorias do usuário (sem paginação) — usado para dropdowns. */
  async findAll(): Promise<Category[]> {
    const res = await api.get<{ data: PaginatedData<Category> }>('/categories', {
      params: { limit: 500, sortBy: 'name', sortOrder: 'asc' },
    });
    return res.data.data.items;
  },

  /** Retorna uma página paginada e ordenada de categorias — usado na tabela. */
  async findPaginated(filters: CategoryFilters = {}): Promise<PaginatedData<Category>> {
    const res = await api.get<{ data: PaginatedData<Category> }>('/categories', {
      params: filters,
    });
    return res.data.data;
  },

  async create(payload: CreateCategoryPayload): Promise<Category> {
    const res = await api.post<{ data: Category }>('/categories', payload);
    return res.data.data;
  },

  async update(id: string, payload: UpdateCategoryPayload): Promise<Category> {
    const res = await api.patch<{ data: Category }>(`/categories/${id}`, payload);
    return res.data.data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/categories/${id}`);
  },
};
