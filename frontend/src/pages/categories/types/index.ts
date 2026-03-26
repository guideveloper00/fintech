import type { Category, CategorySortBy } from '../../../shared/types';

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

export type SortDir = 'asc' | 'desc';

export interface CategoriesTableProps {
  items: Category[];
  isLoading: boolean;
  total: number;
  totalPages: number;
  currentPage: number;
  sortBy: CategorySortBy;
  sortOrder: SortDir;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
  onPageChange: (page: number) => void;
  onSort: (key: CategorySortBy) => void;
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
