import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Snackbar,
  Typography,
} from '@mui/material';
import { Add } from '@mui/icons-material';
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from '../../hooks/useCategories';
import { extractErrorMessage } from '../../lib/extractErrorMessage';
import type { Category } from '../../types';
import type { CategoryFormData, SnackbarState } from './types';
import CategoriesTable from './CategoriesTable';
import CategoryFormDialog from './CategoryFormDialog';
import ConfirmDeleteDialog from './ConfirmDeleteDialog';

export default function CategoriesPage() {
  const { data: categories = [], isLoading } = useCategories();

  // Form dialog
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);

  // Delete dialog
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  // Snackbar
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
      {/* Header */}
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

      {/* Table */}
      <CategoriesTable
        categories={categories}
        isLoading={isLoading}
        onEdit={openEdit}
        onDelete={openDelete}
      />

      {/* Form dialog (create / edit) */}
      <CategoryFormDialog
        open={formOpen}
        onClose={closeForm}
        onSubmit={handleFormSubmit}
        editing={editing}
        isPending={isSaving}
      />

      {/* Delete confirmation dialog */}
      <ConfirmDeleteDialog
        open={!!deleteTarget}
        onClose={closeDelete}
        onConfirm={handleDelete}
        categoryName={deleteTarget?.name ?? ''}
        isPending={deleteMutation.isPending}
      />

      {/* Feedback snackbar */}
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
