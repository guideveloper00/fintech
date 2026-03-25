import type { TopCategory } from '../../../shared/types';

// ─── PeriodFilter ─────────────────────────────────────────────────────────────

export interface DashboardPeriodFilterProps {
  startDate: string;
  endDate: string;
  onStartChange: (v: string) => void;
  onEndChange: (v: string) => void;
  onApply: () => void;
  onClear: () => void;
}

// ─── SummaryCard ──────────────────────────────────────────────────────────────

export type SummaryColor = 'success' | 'error' | 'primary';

export interface SummaryCardProps {
  title: string;
  value: number;
  color: SummaryColor;
  icon: React.ReactNode;
  loading: boolean;
}

// ─── TopCategoriesCard ────────────────────────────────────────────────────────

export interface TopCategoriesCardProps {
  categories: TopCategory[];
  totalExpense: number;
  loading: boolean;
}
