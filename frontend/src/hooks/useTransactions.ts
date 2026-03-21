import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { transactionsService } from '../services/transactions.service';
import type { TransactionFilters, CreateTransactionPayload, UpdateTransactionPayload } from '../types';
import { DASHBOARD_QUERY_KEY } from './useDashboard';

export const TRANSACTIONS_QUERY_KEY = (filters: TransactionFilters) =>
  ['transactions', filters] as const;

export function useTransactions(filters: TransactionFilters = {}) {
  return useQuery({
    queryKey: TRANSACTIONS_QUERY_KEY(filters),
    queryFn: () => transactionsService.findAll(filters),
    placeholderData: (prev) => prev, // mantém dados anteriores ao trocar de página
  });
}

export function useCreateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateTransactionPayload) => transactionsService.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] });
      qc.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEY });
    },
  });
}

export function useUpdateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateTransactionPayload }) =>
      transactionsService.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] });
      qc.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEY });
    },
  });
}

export function useDeleteTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => transactionsService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] });
      qc.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEY });
    },
  });
}
