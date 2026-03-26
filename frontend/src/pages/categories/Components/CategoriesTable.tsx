import {
  Box,
  IconButton,
  Pagination,
  Paper,
  Skeleton,
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
import { Delete, Edit } from '@mui/icons-material';
import type { CategorySortBy } from '../../../shared/types';
import type { CategoriesTableProps } from '../types';

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('pt-BR').format(new Date(iso));
}

export default function CategoriesTable({
  items,
  isLoading,
  totalPages,
  currentPage,
  sortBy,
  sortOrder,
  onEdit,
  onDelete,
  onPageChange,
  onSort,
}: CategoriesTableProps) {
  function col(key: CategorySortBy, label: string) {
    return (
      <TableCell>
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
    <Box>
      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              {col('name', 'Nome')}
              {col('description', 'Descrição')}
              {col('createdAt', 'Criada em')}
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton /></TableCell>
                    <TableCell><Skeleton /></TableCell>
                    <TableCell><Skeleton /></TableCell>
                    <TableCell align="right"><Skeleton width={80} sx={{ ml: 'auto' }} /></TableCell>
                  </TableRow>
                ))
              : items.length === 0
              ? (
                  <TableRow>
                    <TableCell colSpan={4}>
                      <Box py={4} textAlign="center">
                        <Typography color="text.secondary">
                          Nenhuma categoria cadastrada.
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                )
              : items.map((cat) => (
                  <TableRow key={cat.id} hover>
                    <TableCell>
                      <Typography fontWeight={500}>{cat.name}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {cat.description ?? '—'}
                      </Typography>
                    </TableCell>
                    <TableCell>{formatDate(cat.createdAt)}</TableCell>
                    <TableCell align="right">
                      <Tooltip title="Editar">
                        <IconButton size="small" onClick={() => onEdit(cat)}>
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Excluir">
                        <IconButton size="small" color="error" onClick={() => onDelete(cat)}>
                          <Delete fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </TableContainer>

      {totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={2}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={(_, page) => onPageChange(page)}
            color="primary"
            shape="rounded"
          />
        </Box>
      )}
    </Box>
  );
}
