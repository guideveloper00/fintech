import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from '@mui/material';
import type { Transaction, CreateTransactionPayload } from '../types';
import { useCategories } from '../hooks/useCategories';
import { useCreateTransaction, useUpdateTransaction } from '../hooks/useTransactions';
import { extractErrorMessage } from '../lib/extractErrorMessage';

interface TransactionFormDialogProps {
  open: boolean;
  editing: Transaction | null;
  onClose: () => void;
}

type FormValues = Omit<CreateTransactionPayload, 'amount'> & { amount: number | '' };

export default function TransactionFormDialog({
  open,
  editing,
  onClose,
}: TransactionFormDialogProps) {
  const { data: categories = [] } = useCategories();
  const { mutate: create, isPending: creating } = useCreateTransaction();
  const { mutate: update, isPending: updating } = useUpdateTransaction();
  const isPending = creating || updating;
  const [mutationError, setMutationError] = useState<string | null>(null);

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      description: '',
      amount: '' as const,
      type: 'expense',
      date: new Date().toISOString().slice(0, 10),
      categoryId: '',
    } as FormValues,
  });

  // Preenche o form ao abrir para edição
  useEffect(() => {
    if (open) {
      setMutationError(null);
      if (editing) {
        reset({
          description: editing.description,
          amount: editing.amount,
          type: editing.type,
          date: editing.date,
          categoryId: editing.categoryId ?? '',
        });
      } else {
        reset({
          description: '',
          amount: '' as const,
          type: 'expense',
          date: new Date().toISOString().slice(0, 10),
          categoryId: '',
        } as FormValues);
      }
    }
  }, [open, editing, reset]);

  const onSubmit = (data: FormValues) => {
    const payload = {
      ...data,
      amount: Number(data.amount),
      categoryId: data.categoryId || undefined,
    };

    if (editing) {
      update(
        { id: editing.id, payload },
        {
          onSuccess: onClose,
          onError: (err) => setMutationError(extractErrorMessage(err, 'Erro ao atualizar transação.')),
        },
      );
    } else {
      create(payload as CreateTransactionPayload, {
        onSuccess: onClose,
        onError: (err) => setMutationError(extractErrorMessage(err, 'Erro ao criar transação.')),
      });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{editing ? 'Editar transação' : 'Nova transação'}</DialogTitle>

      <DialogContent>
        <Stack spacing={2.5} sx={{ mt: 1 }}>
          {mutationError && (
            <Alert severity="error" onClose={() => setMutationError(null)}>
              {mutationError}
            </Alert>
          )}
          <TextField
            label="Descrição"
            fullWidth
            {...register('description', {
              required: 'Descrição é obrigatória',
              maxLength: { value: 255, message: 'Máximo 255 caracteres' },
            })}
            error={!!errors.description}
            helperText={errors.description?.message}
          />

          <TextField
            label="Valor"
            type="number"
            fullWidth
            inputProps={{ min: 0.01, step: 0.01 }}
            InputProps={{
              startAdornment: <InputAdornment position="start">R$</InputAdornment>,
            }}
            {...register('amount', {
              required: 'Valor é obrigatório',
              min: { value: 0.01, message: 'Valor deve ser positivo' },
            })}
            error={!!errors.amount}
            helperText={errors.amount?.message}
          />

          {/* Tipo */}
          <Controller
            name="type"
            control={control}
            rules={{ required: 'Tipo é obrigatório' }}
            render={({ field }) => (
              <FormControl fullWidth error={!!errors.type}>
                <InputLabel>Tipo</InputLabel>
                <Select {...field} label="Tipo">
                  <MenuItem value="income">Receita</MenuItem>
                  <MenuItem value="expense">Despesa</MenuItem>
                </Select>
                {errors.type && <FormHelperText>{errors.type.message}</FormHelperText>}
              </FormControl>
            )}
          />

          {/* Categoria */}
          <Controller
            name="categoryId"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth>
                <InputLabel>Categoria (opcional)</InputLabel>
                <Select {...field} label="Categoria (opcional)">
                  <MenuItem value="">
                    <em>Sem categoria</em>
                  </MenuItem>
                  {categories.map((cat) => (
                    <MenuItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          />

          <TextField
            label="Data"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            {...register('date', { required: 'Data é obrigatória' })}
            error={!!errors.date}
            helperText={errors.date?.message}
          />
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={isPending}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit(onSubmit)}
          disabled={isPending}
        >
          {isPending ? 'Salvando...' : editing ? 'Salvar' : 'Criar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
