import {
  Box,
  Chip,
  IconButton,
  Pagination,
  Paper,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Tooltip,
  Typography,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, ContentCopy as CopyIcon } from '@mui/icons-material';
import type { TransactionsTableProps, SortKey } from '../types';

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
}

export default function TransactionsTable({
  items,
  isLoading,
  totalPages,
  currentPage,
  sortBy,
  sortOrder,
  onPageChange,
  onSort,
  onEdit,
  onDelete,
  onCopy,
}: TransactionsTableProps) {
  function col(key: SortKey, label: string, align?: 'right' | 'center') {
    return (
      <TableCell sx={{ fontWeight: 700 }} align={align}>
        <TableSortLabel
          active={sortBy === key}
          direction={sortBy === key ? sortOrder : 'asc'}
          onClick={() => onSort(key)}
        >
          {label}
        </TableSortLabel>
      </TableCell>
    );
  }

  return (
    <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
      <TableContainer>
        <Table size="medium">
          <TableHead>
            <TableRow sx={{ bgcolor: 'action.hover' }}>
              {col('description', 'Descrição')}
              {col('category', 'Categoria')}
              {col('type', 'Tipo')}
              {col('amount', 'Valor', 'right')}
              {col('date', 'Data')}
              <TableCell sx={{ fontWeight: 700 }} align="center">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading &&
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 6 }).map((__, j) => (
                    <TableCell key={j}>
                      <Skeleton />
                    </TableCell>
                  ))}
                </TableRow>
              ))}

            {!isLoading && items.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                  Nenhuma transação encontrada.
                </TableCell>
              </TableRow>
            )}

            {!isLoading &&
              items.map((t) => (
                <TableRow key={t.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {t.description}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {t.category?.name
                      ? <Typography variant="body2" color="text.secondary">{t.category.name}</Typography>
                      : <Typography variant="body2" fontWeight={700} color="text.secondary">Sem categoria</Typography>
                    }
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={t.type === 'income' ? 'Receita' : 'Despesa'}
                      size="small"
                      color={t.type === 'income' ? 'success' : 'error'}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Typography
                      variant="body2"
                      fontWeight={600}
                      color={t.type === 'income' ? 'success.main' : 'error.main'}
                    >
                      {t.type === 'income' ? '+' : '-'}&nbsp;{formatCurrency(t.amount)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{formatDate(t.date)}</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Stack direction="row" justifyContent="center" spacing={0.5}>
                      <Tooltip title="Copiar como nova transação">
                        <IconButton size="small" color="default" onClick={() => onCopy(t)}>
                          <CopyIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Editar">
                        <IconButton size="small" onClick={() => onEdit(t)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Excluir">
                        <IconButton size="small" color="error" onClick={() => onDelete(t)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={(_, page) => onPageChange(page)}
            color="primary"
            shape="rounded"
          />
        </Box>
      )}
    </Paper>
  );
}
