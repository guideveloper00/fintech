import { api } from '../lib/api';
import type {
  Transaction,
  CreateTransactionPayload,
  UpdateTransactionPayload,
  TransactionFilters,
  PaginatedData,
} from '../shared/types';

export const transactionsService = {
  async findAll(filters: TransactionFilters = {}): Promise<PaginatedData<Transaction>> {
    const params = Object.fromEntries(
      Object.entries(filters).filter(([, v]) => v !== undefined && v !== ''),
    );
    const res = await api.get<{ data: PaginatedData<Transaction> }>('/transactions', { params });
    return res.data.data;
  },

  async create(payload: CreateTransactionPayload): Promise<Transaction> {
    const res = await api.post<{ data: Transaction }>('/transactions', payload);
    return res.data.data;
  },

  async update(id: string, payload: UpdateTransactionPayload): Promise<Transaction> {
    const res = await api.patch<{ data: Transaction }>(`/transactions/${id}`, payload);
    return res.data.data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/transactions/${id}`);
  },
};
