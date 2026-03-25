import {
  Avatar,
  Box,
  Card,
  CardContent,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import type { SummaryColor, SummaryCardProps } from '../types';

const colorMap: Record<SummaryColor, string> = {
  success: 'success.main',
  error: 'error.main',
  primary: 'primary.main',
};

const bgMap: Record<SummaryColor, string> = {
  success: 'success.50',
  error: 'error.50',
  primary: 'primary.50',
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

export default function SummaryCard({ title, value, color, icon, loading }: SummaryCardProps) {
  return (
    <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', height: '100%' }}>
      <CardContent sx={{ p: 3 }}>
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {title}
            </Typography>
            {loading ? (
              <Skeleton width={140} height={36} />
            ) : (
              <Typography variant="h5" fontWeight={700} color={colorMap[color]}>
                {formatCurrency(value)}
              </Typography>
            )}
          </Box>
          <Avatar sx={{ bgcolor: bgMap[color], color: colorMap[color], width: 48, height: 48 }}>
            {icon}
          </Avatar>
        </Stack>
      </CardContent>
    </Card>
  );
}
