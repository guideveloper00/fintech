import { api } from '../lib/api';
import type { Category, CreateCategoryPayload, UpdateCategoryPayload } from '../types';

export const categoriesService = {
  async findAll(): Promise<Category[]> {
    const res = await api.get<{ data: Category[] }>('/categories');
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
