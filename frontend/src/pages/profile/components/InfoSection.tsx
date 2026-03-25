import { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useUpdateProfile } from '@/shared/hooks/useAuth';
import { useAuthStore } from '@/store/auth.store';
import { extractErrorMessage } from '@/lib/extractErrorMessage';

interface FormValues {
  name: string;
}

export default function InfoSection() {
  const user = useAuthStore((s) => s.user);
  const { mutate, isPending } = useUpdateProfile();
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    defaultValues: { name: user?.name ?? '' },
  });

  const onSubmit = (data: FormValues) => {
    setSuccessMsg(null);
    setErrorMsg(null);
    mutate(
      { name: data.name },
      {
        onSuccess: () => setSuccessMsg('Nome atualizado com sucesso!'),
        onError: (err) => setErrorMsg(extractErrorMessage(err, 'Erro ao atualizar nome.')),
      },
    );
  };

  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="h6" fontWeight={700} gutterBottom>
          Informações pessoais
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Stack spacing={2}>
          {successMsg && <Alert severity="success" onClose={() => setSuccessMsg(null)}>{successMsg}</Alert>}
          {errorMsg && <Alert severity="error" onClose={() => setErrorMsg(null)}>{errorMsg}</Alert>}
          <TextField
            label="Nome"
            fullWidth
            {...register('name', {
              required: 'Nome é obrigatório',
              minLength: { value: 2, message: 'Mínimo 2 caracteres' },
              maxLength: { value: 100, message: 'Máximo 100 caracteres' },
            })}
            error={!!errors.name}
            helperText={errors.name?.message}
          />
          <TextField
            label="E-mail"
            fullWidth
            value={user?.email ?? ''}
            disabled
            helperText="O e-mail não pode ser alterado"
          />
          <Box>
            <Button variant="contained" onClick={handleSubmit(onSubmit)} disabled={isPending}>
              {isPending ? 'Salvando...' : 'Salvar nome'}
            </Button>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
