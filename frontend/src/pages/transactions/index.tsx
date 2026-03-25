import { useState } from 'react';
import { Alert, Box, Button, Stack, Typography } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import type { Transaction, TransactionFilters } from '../../shared/types';
import TransactionFormDialog from './Components/TransactionFormDialog';
import TransactionsFilters from './Components/TransactionsFilters';
import TransactionsTable from './Components/TransactionsTable';
import ConfirmDeleteDialog from './Components/ConfirmDeleteDialog';
import { useDeleteTransaction, useTransactions } from '@/shared/hooks/useTransactions';
import { useCategories } from '@/shared/hooks/useCategories';

const EMPTY_FILTERS: TransactionFilters = { page: 1, limit: 10 };

export default function TransactionsPage() {
  const [filters, setFilters] = useState<TransactionFilters>(EMPTY_FILTERS);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Transaction | null>(null);

  // Filtros locais (antes de aplicar)
  const [localType, setLocalType] = useState('');
  const [localCategory, setLocalCategory] = useState('');
  const [localStart, setLocalStart] = useState('');
  const [localEnd, setLocalEnd] = useState('');

  const { data, isLoading, isError } = useTransactions(filters);
  const { data: categories = [] } = useCategories();
  const { mutate: deleteTransaction, isPending: deleting } = useDeleteTransaction();

  const hasActiveFilters =
    !!filters.type || !!filters.categoryId || !!filters.startDate || !!filters.endDate;

  const applyFilters = () => {
    if (localStart && localEnd && localEnd < localStart) return;
    setFilters({
      page: 1,
      limit: 10,
      type: (localType as TransactionFilters['type']) || undefined,
      categoryId: localCategory || undefined,
      startDate: localStart || undefined,
      endDate: localEnd || undefined,
    });
  };

  const clearFilters = () => {
    setLocalType('');
    setLocalCategory('');
    setLocalStart('');
    setLocalEnd('');
    setFilters(EMPTY_FILTERS);
  };

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (t: Transaction) => {
    setEditing(t);
    setFormOpen(true);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteTransaction(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) });
  };

  return (
    <Box>
      {/* Cabeçalho */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Transações
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {data ? `${data.total} transação(ões) encontrada(s)` : ''}
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
          Nova transação
        </Button>
      </Stack>

      {isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Erro ao carregar transações.
        </Alert>
      )}

      <TransactionsFilters
        localType={localType}
        localCategory={localCategory}
        localStart={localStart}
        localEnd={localEnd}
        categories={categories}
        hasActiveFilters={hasActiveFilters}
        onTypeChange={setLocalType}
        onCategoryChange={setLocalCategory}
        onStartChange={setLocalStart}
        onEndChange={setLocalEnd}
        onApply={applyFilters}
        onClear={clearFilters}
      />

      <TransactionsTable
        items={data?.items ?? []}
        isLoading={isLoading}
        totalPages={data?.totalPages ?? 1}
        currentPage={filters.page ?? 1}
        onPageChange={(page) => setFilters((f) => ({ ...f, page }))}
        onEdit={openEdit}
        onDelete={setDeleteTarget}
      />

      <TransactionFormDialog
        open={formOpen}
        editing={editing}
        onClose={() => setFormOpen(false)}
        existingTransactions={data?.items ?? []}
      />

      <ConfirmDeleteDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        isPending={deleting}
      />
    </Box>
  );
}
