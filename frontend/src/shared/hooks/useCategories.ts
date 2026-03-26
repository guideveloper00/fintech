import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { CategoryFilters, CreateCategoryPayload, UpdateCategoryPayload } from '../types';
import { categoriesService } from '@/services/categories.service';

export const CATEGORIES_QUERY_KEY = ['categories'] as const;

/** Retorna todas as categorias sem paginação — para dropdowns. */
export function useCategories() {
  return useQuery({
    queryKey: [...CATEGORIES_QUERY_KEY, 'all'],
    queryFn: categoriesService.findAll,
    staleTime: 1000 * 60 * 5,
  });
}

/** Retorna categorias paginadas e ordenadas — para a tabela da página de Categorias. */
export function useCategoriesPaginated(filters: CategoryFilters = {}) {
  return useQuery({
    queryKey: [...CATEGORIES_QUERY_KEY, 'paginated', filters],
    queryFn: () => categoriesService.findPaginated(filters),
    staleTime: 1000 * 60 * 2,
    placeholderData: (prev) => prev,
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
