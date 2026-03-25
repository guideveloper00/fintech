import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
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
import { formatBRL, digitsToNumber } from '../../../shared/helpers';
import type { Transaction, CreateTransactionPayload } from '../../../shared/types';
import { extractErrorMessage } from '../../../lib/extractErrorMessage';
import { useCreateTransaction, useUpdateTransaction } from '@/shared/hooks/useTransactions';
import { useCategories } from '@/shared/hooks/useCategories';

interface TransactionFormDialogProps {
  open: boolean;
  editing: Transaction | null;
  onClose: () => void;
  existingTransactions?: Transaction[];
}

type FormValues = Omit<CreateTransactionPayload, 'amount'> & { amount: number | '' };

export default function TransactionFormDialog({
  open,
  editing,
  onClose,
  existingTransactions = [],
}: TransactionFormDialogProps) {
  const { data: categories = [] } = useCategories();
  const { mutate: create, isPending: creating } = useCreateTransaction();
  const { mutate: update, isPending: updating } = useUpdateTransaction();
  const isPending = creating || updating;
  const [mutationError, setMutationError] = useState<string | null>(null);
  const [pendingPayload, setPendingPayload] = useState<CreateTransactionPayload | null>(null);

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
      const isDuplicate = existingTransactions.some(
        (t) => Number(t.amount) === Number(payload.amount) && t.date === payload.date,
      );
      if (isDuplicate) {
        setPendingPayload(payload as CreateTransactionPayload);
      } else {
        submitCreate(payload as CreateTransactionPayload);
      }
    }
  };

  const submitCreate = (payload: CreateTransactionPayload) => {
    create(payload, {
      onSuccess: () => { setPendingPayload(null); onClose(); },
      onError: (err) => setMutationError(extractErrorMessage(err, 'Erro ao criar transação.')),
    });
  };

  return (
    <>
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

          <Controller
            name="amount"
            control={control}
            rules={{
              required: 'Valor é obrigatório',
              validate: (v) => Number(v) >= 0.01 || 'Valor deve ser positivo',
            }}
            render={({ field }) => (
              <TextField
                label="Valor"
                fullWidth
                inputMode="numeric"
                value={formatBRL(field.value)}
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, '');
                  field.onChange(digitsToNumber(digits));
                }}
                onBlur={field.onBlur}
                InputProps={{
                  startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                }}
                error={!!errors.amount}
                helperText={errors.amount?.message}
              />
            )}
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

    <Dialog open={!!pendingPayload} onClose={() => setPendingPayload(null)}>
      <DialogTitle>Transação duplicada?</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Já existe uma transação com o mesmo valor e data. Deseja cadastrá-la mesmo assim?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setPendingPayload(null)}>Cancelar</Button>
        <Button
          variant="contained"
          color="warning"
          disabled={isPending}
          onClick={() => pendingPayload && submitCreate(pendingPayload)}
        >
          {isPending ? 'Salvando...' : 'Confirmar assim mesmo'}
        </Button>
      </DialogActions>
    </Dialog>
    </>
  );
}
