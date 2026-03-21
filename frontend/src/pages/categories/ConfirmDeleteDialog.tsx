import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import type { ConfirmDeleteDialogProps } from './types';

export default function ConfirmDeleteDialog({
  open,
  onClose,
  onConfirm,
  categoryName,
  isPending,
}: ConfirmDeleteDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Excluir Categoria</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Deseja excluir a categoria <strong>{categoryName}</strong>? Esta ação não pode ser
          desfeita. Transações vinculadas perderão a categoria.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isPending}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={onConfirm}
          disabled={isPending}
        >
          {isPending ? 'Excluindo...' : 'Excluir'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
