import { Box, Button, Paper, TextField, Typography } from '@mui/material';
import { FilterAlt as FilterIcon, Clear as ClearIcon } from '@mui/icons-material';
import type { DashboardPeriodFilterProps } from './types';

export default function DashboardPeriodFilter({
  startDate,
  endDate,
  onStartChange,
  onEndChange,
  onApply,
  onClear,
}: DashboardPeriodFilterProps) {
  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
      <Box
        display="flex"
        flexWrap="wrap"
        alignItems="center"
        gap={2}
      >
        <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
          Filtrar por período:
        </Typography>
        <TextField
          label="Data inicial"
          type="date"
          size="small"
          value={startDate}
          onChange={(e) => onStartChange(e.target.value)}
          slotProps={{ inputLabel: { shrink: true } }}
          sx={{ width: 180 }}
        />
        <TextField
          label="Data final"
          type="date"
          size="small"
          value={endDate}
          onChange={(e) => onEndChange(e.target.value)}
          slotProps={{ inputLabel: { shrink: true } }}
          sx={{ width: 180 }}
        />
        <Button
          variant="contained"
          size="small"
          startIcon={<FilterIcon />}
          onClick={onApply}
          disabled={!startDate && !endDate}
        >
          Aplicar
        </Button>
        <Button
          variant="outlined"
          size="small"
          startIcon={<ClearIcon />}
          onClick={onClear}
          disabled={!startDate && !endDate}
        >
          Limpar
        </Button>
      </Box>
    </Paper>
  );
}
