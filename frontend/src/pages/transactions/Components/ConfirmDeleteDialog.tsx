import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import type { ConfirmDeleteDialogProps } from '../types';

export default function ConfirmDeleteDialog({ open, onClose, onConfirm, isPending }: ConfirmDeleteDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Excluir transação</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Tem certeza que deseja excluir esta transação? Esta ação não pode ser desfeita.
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={isPending}>
          Cancelar
        </Button>
        <Button color="error" variant="contained" onClick={onConfirm} disabled={isPending}>
          {isPending ? 'Excluindo...' : 'Excluir'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
