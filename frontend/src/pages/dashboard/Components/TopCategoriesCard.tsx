import {
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  LinearProgress,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import { Category as CategoryIcon } from '@mui/icons-material';
import type { TopCategoriesCardProps } from '../types';

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

const BAR_COLORS = ['error', 'warning', 'info'] as const;

export default function TopCategoriesCard({ categories, totalExpense, loading }: TopCategoriesCardProps) {
  const base = totalExpense > 0 ? totalExpense : 1;

  return (
    <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
      <CardContent sx={{ p: 3 }}>
        <Stack direction="row" alignItems="center" gap={1} mb={3}>
          <CategoryIcon color="action" fontSize="small" />
          <Typography variant="h6" fontWeight={600}>
            Top categorias de despesa
          </Typography>
          <Chip label="Top 3" size="small" color="default" />
        </Stack>

        <Divider sx={{ mb: 3 }} />

        {loading && (
          <Stack spacing={3}>
            {[1, 2, 3].map((i) => (
              <Box key={i}>
                <Skeleton width="60%" height={20} sx={{ mb: 1 }} />
                <Skeleton height={8} sx={{ borderRadius: 1 }} />
              </Box>
            ))}
          </Stack>
        )}

        {!loading && categories.length === 0 && (
          <Box sx={{ py: 6, textAlign: 'center', color: 'text.secondary' }}>
            <CategoryIcon sx={{ fontSize: 48, opacity: 0.3, mb: 1 }} />
            <Typography variant="body2">Nenhuma despesa registrada ainda</Typography>
          </Box>
        )}

        {!loading && categories.length > 0 && (
          <Stack spacing={3}>
            {categories.map((cat, index) => {
              const pct = Math.round((cat.total / base) * 100);
              const barColor = BAR_COLORS[index] ?? 'inherit';
              return (
                <Box key={cat.categoryId}>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={0.75}
                  >
                    <Stack direction="row" alignItems="center" gap={1}>
                      <Chip
                        label={`#${index + 1}`}
                        size="small"
                        color={barColor}
                        variant="outlined"
                        sx={{ width: 44 }}
                      />
                      <Typography
                        variant="body2"
                        fontWeight={cat.categoryName === 'Sem categoria' ? 700 : 500}
                      >
                        {cat.categoryName}
                      </Typography>
                    </Stack>
                    <Typography variant="body2" fontWeight={600} color="error.main">
                      {formatCurrency(cat.total)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                      {pct}%
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={pct}
                    color={barColor}
                    sx={{ height: 6, borderRadius: 3 }}
                  />
                </Box>
              );
            })}
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}
