import {
  Button,
  Chip,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { FilterAlt as FilterIcon, FilterAltOff as ClearFilterIcon } from '@mui/icons-material';
import type { TransactionsFiltersProps } from '../types';

export default function TransactionsFilters({
  localType,
  localCategory,
  localStart,
  localEnd,
  categories,
  hasActiveFilters,
  onTypeChange,
  onCategoryChange,
  onStartChange,
  onEndChange,
  onApply,
  onClear,
}: TransactionsFiltersProps) {
  const dateError = !!localStart && !!localEnd && localEnd < localStart;

  return (
    <Paper
      elevation={0}
      sx={{ border: '1px solid', borderColor: 'divider', p: 2.5, mb: 3, borderRadius: 2 }}
    >
      <Stack direction="row" alignItems="center" gap={1} mb={2}>
        <FilterIcon fontSize="small" color="action" />
        <Typography variant="subtitle2" fontWeight={600}>
          Filtros
        </Typography>
        {hasActiveFilters && (
          <Chip label="Ativos" size="small" color="primary" variant="outlined" />
        )}
      </Stack>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} flexWrap="wrap">
        <FormControl size="small" sx={{ minWidth: 130 }}>
          <InputLabel>Tipo</InputLabel>
          <Select value={localType} label="Tipo" onChange={(e) => onTypeChange(e.target.value)}>
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="income">Receita</MenuItem>
            <MenuItem value="expense">Despesa</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Categoria</InputLabel>
          <Select
            value={localCategory}
            label="Categoria"
            onChange={(e) => onCategoryChange(e.target.value)}
          >
            <MenuItem value="">Todas</MenuItem>
            {categories.map((cat) => (
              <MenuItem key={cat.id} value={cat.id}>
                {cat.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          label="Data inicial"
          type="date"
          size="small"
          value={localStart}
          onChange={(e) => onStartChange(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ minWidth: 150 }}
        />

        <TextField
          label="Data final"
          type="date"
          size="small"
          value={localEnd}
          onChange={(e) => onEndChange(e.target.value)}
          InputLabelProps={{ shrink: true }}
          inputProps={{ min: localStart || undefined }}
          error={dateError}
          helperText={dateError ? 'Deve ser após a data inicial' : undefined}
          sx={{ minWidth: 150 }}
        />

        <Stack direction="row" spacing={1} alignItems="center">
          <Button variant="contained" size="small" onClick={onApply} disabled={dateError}>
            Filtrar
          </Button>
          {hasActiveFilters && (
            <Tooltip title="Limpar filtros">
              <IconButton size="small" onClick={onClear}>
                <ClearFilterIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
      </Stack>
    </Paper>
  );
}
