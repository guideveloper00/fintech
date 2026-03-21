import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material';
import type { CategoryFormData, CategoryFormDialogProps } from './types';

export default function CategoryFormDialog({
  open,
  onClose,
  onSubmit,
  editing,
  isPending,
}: CategoryFormDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CategoryFormData>();

  useEffect(() => {
    if (open) {
      reset({ name: editing?.name ?? '', description: editing?.description ?? '' });
    }
  }, [open, editing, reset]);

  const handleFormSubmit = ({ name, description }: CategoryFormData): void => {
    onSubmit({ name: name.trim(), description: description?.trim() || undefined });
  };

  const title = editing ? 'Editar Categoria' : 'Nova Categoria';

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          label="Nome da categoria"
          fullWidth
          margin="dense"
          {...register('name', {
            required: 'Nome é obrigatório',
            minLength: { value: 2, message: 'Mínimo 2 caracteres' },
            maxLength: { value: 50, message: 'Máximo 50 caracteres' },
          })}
          error={!!errors.name}
          helperText={errors.name?.message}
        />
        <TextField
          label="Descrição (opcional)"
          fullWidth
          margin="dense"
          multiline
          rows={2}
          {...register('description', {
            maxLength: { value: 255, message: 'Máximo 255 caracteres' },
          })}
          error={!!errors.description}
          helperText={errors.description?.message}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isPending}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit(handleFormSubmit)}
          disabled={isPending}
        >
          {isPending ? 'Salvando...' : 'Salvar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
