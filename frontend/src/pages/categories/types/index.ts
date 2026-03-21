import type { Category } from '../../../types';

// ─── CategoryFormDialog ───────────────────────────────────────────────────────

export interface CategoryFormData {
  name: string;
  description?: string;
}

export interface CategoryFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: CategoryFormData) => void;
  editing?: Category | null;
  isPending: boolean;
}

// ─── CategoriesTable ─────────────────────────────────────────────────────────

export interface CategoriesTableProps {
  categories: Category[];
  isLoading: boolean;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}

// ─── ConfirmDeleteDialog ──────────────────────────────────────────────────────

export interface ConfirmDeleteDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  categoryName: string;
  isPending: boolean;
}

// ─── CategoriesPage (index) ───────────────────────────────────────────────────

export interface SnackbarState {
  open: boolean;
  message: string;
  severity: 'success' | 'error';
}
