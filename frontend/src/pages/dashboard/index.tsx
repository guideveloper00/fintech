import { Alert, Box, Grid, Typography } from '@mui/material';
import { useState } from 'react';
import {
  AccountBalance as BalanceIcon,
  TrendingUp as IncomeIcon,
  TrendingDown as ExpenseIcon,
} from '@mui/icons-material';
import type { DashboardQueryParams } from '../../shared/types';
import { extractErrorMessage } from '../../lib/extractErrorMessage';
import SummaryCard from './Components/SummaryCard';
import TopCategoriesCard from './Components/TopCategoriesCard';
import DashboardPeriodFilter from './Components/DashboardPeriodFilter';
import { useDashboard } from '@/shared/hooks/useDashboard';

export default function DashboardPage() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [appliedParams, setAppliedParams] = useState<DashboardQueryParams | undefined>(undefined);

  const { data, isLoading, isError, error } = useDashboard(appliedParams);

  function handleApply() {
    if (startDate && endDate && endDate < startDate) return;
    const params: DashboardQueryParams = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    setAppliedParams(Object.keys(params).length ? params : undefined);
  }

  function handleClear() {
    setStartDate('');
    setEndDate('');
    setAppliedParams(undefined);
  }

  return (
    <Box>
      <Box mb={3}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Dashboard
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Resumo financeiro da sua conta
        </Typography>
      </Box>

      <DashboardPeriodFilter
        startDate={startDate}
        endDate={endDate}
        onStartChange={setStartDate}
        onEndChange={setEndDate}
        onApply={handleApply}
        onClear={handleClear}
      />

      {isError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {extractErrorMessage(error, 'Erro ao carregar dados.')}
        </Alert>
      )}

      <Grid container spacing={3} mb={4}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <SummaryCard
            title="Saldo atual"
            value={data?.balance ?? 0}
            color="primary"
            icon={<BalanceIcon />}
            loading={isLoading}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <SummaryCard
            title="Total de receitas"
            value={data?.totalIncome ?? 0}
            color="success"
            icon={<IncomeIcon />}
            loading={isLoading}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <SummaryCard
            title="Total de despesas"
            value={data?.totalExpense ?? 0}
            color="error"
            icon={<ExpenseIcon />}
            loading={isLoading}
          />
        </Grid>
      </Grid>

      <TopCategoriesCard
        categories={data?.topExpenseCategories ?? []}
        totalExpense={data?.totalExpense ?? 0}
        loading={isLoading}
      />
    </Box>
  );
}

