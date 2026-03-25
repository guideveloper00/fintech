import type { Category, Transaction } from '../../../shared/types';

// ─── TransactionsFilters ──────────────────────────────────────────────────────

export interface TransactionsFiltersProps {
  localType: string;
  localCategory: string;
  localStart: string;
  localEnd: string;
  categories: Category[];
  hasActiveFilters: boolean;
  onTypeChange: (v: string) => void;
  onCategoryChange: (v: string) => void;
  onStartChange: (v: string) => void;
  onEndChange: (v: string) => void;
  onApply: () => void;
  onClear: () => void;
}

// ─── TransactionsTable ────────────────────────────────────────────────────────

export interface TransactionsTableProps {
  items: Transaction[];
  isLoading: boolean;
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  onEdit: (t: Transaction) => void;
  onDelete: (t: Transaction) => void;
}

// ─── ConfirmDeleteDialog ──────────────────────────────────────────────────────

export interface ConfirmDeleteDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isPending: boolean;
}
