import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoriesService } from '../services/categories.service';
import type { CreateCategoryPayload, UpdateCategoryPayload } from '../types';

export const CATEGORIES_QUERY_KEY = ['categories'] as const;

export function useCategories() {
  return useQuery({
    queryKey: CATEGORIES_QUERY_KEY,
    queryFn: categoriesService.findAll,
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateCategoryPayload) => categoriesService.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY }),
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: { id: string } & UpdateCategoryPayload) =>
      categoriesService.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY }),
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => categoriesService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY }),
  });
}
