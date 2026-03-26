import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Snackbar,
  Typography,
} from '@mui/material';
import { Add } from '@mui/icons-material';

import { extractErrorMessage } from '../../lib/extractErrorMessage';
import type { Category, CategoryFilters, CategorySortBy } from '../../shared/types';
import type { CategoryFormData, SnackbarState } from './types';
import CategoriesTable from './Components/CategoriesTable';
import CategoryFormDialog from './Components/CategoryFormDialog';
import ConfirmDeleteDialog from './Components/ConfirmDeleteDialog';
import {
  useCategoriesPaginated,
  useCreateCategory,
  useDeleteCategory,
  useUpdateCategory,
} from '@/shared/hooks/useCategories';

const DEFAULT_FILTERS: CategoryFilters = {
  page: 1,
  limit: 20,
  sortBy: 'createdAt',
  sortOrder: 'desc',
};

export default function CategoriesPage() {
  const [filters, setFilters] = useState<CategoryFilters>(DEFAULT_FILTERS);

  const { data, isLoading } = useCategoriesPaginated(filters);

  const items = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;
  const currentPage = data?.page ?? 1;

  // Dialog de formulário
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);

  // Dialog de exclusão
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  // Snackbar de feedback
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'success',
  });

  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(category: Category) {
    setEditing(category);
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditing(null);
  }

  function handleSort(key: CategorySortBy) {
    setFilters((f) => ({
      ...f,
      page: 1,
      sortBy: key,
      sortOrder: f.sortBy === key && f.sortOrder === 'asc' ? 'desc' : 'asc',
    }));
  }

  function handlePageChange(page: number) {
    setFilters((f) => ({ ...f, page }));
  }

  function handleFormSubmit(payload: CategoryFormData) {
    if (editing) {
      updateMutation.mutate(
        { id: editing.id, ...payload },
        {
          onSuccess: () => {
            closeForm();
            setSnackbar({ open: true, message: 'Categoria atualizada!', severity: 'success' });
          },
          onError: (err) => {
            setSnackbar({
              open: true,
              message: extractErrorMessage(err, 'Erro ao atualizar categoria.'),
              severity: 'error',
            });
          },
        },
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => {
          closeForm();
          setSnackbar({ open: true, message: 'Categoria criada!', severity: 'success' });
        },
        onError: (err) => {
          setSnackbar({
            open: true,
            message: extractErrorMessage(err, 'Erro ao criar categoria.'),
            severity: 'error',
          });
        },
      });
    }
  }

  function openDelete(category: Category) {
    setDeleteTarget(category);
  }

  function closeDelete() {
    setDeleteTarget(null);
  }

  function handleDelete() {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: () => {
        closeDelete();
        setSnackbar({ open: true, message: 'Categoria excluída!', severity: 'success' });
      },
      onError: (err) => {
        setSnackbar({
          open: true,
          message: extractErrorMessage(err, 'Erro ao excluir categoria.'),
          severity: 'error',
        });
      },
    });
  }

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <Box>
      {/* Cabeçalho */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Categorias
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Gerencie as categorias para classificar suas transações
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={openCreate}>
          Nova Categoria
        </Button>
      </Box>

      {/* Tabela */}
      <CategoriesTable
        items={items}
        isLoading={isLoading}
        total={data?.total ?? 0}
        totalPages={totalPages}
        currentPage={currentPage}
        sortBy={filters.sortBy ?? 'createdAt'}
        sortOrder={filters.sortOrder ?? 'desc'}
        onEdit={openEdit}
        onDelete={openDelete}
        onPageChange={handlePageChange}
        onSort={handleSort}
      />

      {/* Dialog de formulário (criar / editar) */}
      <CategoryFormDialog
        open={formOpen}
        onClose={closeForm}
        onSubmit={handleFormSubmit}
        editing={editing}
        isPending={isSaving}
      />

      {/* Dialog de confirmação de exclusão */}
      <ConfirmDeleteDialog
        open={!!deleteTarget}
        onClose={closeDelete}
        onConfirm={handleDelete}
        categoryName={deleteTarget?.name ?? ''}
        isPending={deleteMutation.isPending}
      />

      {/* Snackbar de feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3500}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
