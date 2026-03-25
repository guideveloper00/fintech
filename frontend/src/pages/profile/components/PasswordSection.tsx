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
import { useUpdateProfile } from '../../../shared/hooks/useAuth';
import { extractErrorMessage } from '../../../lib/extractErrorMessage';

interface FormValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function PasswordSection() {
  const { mutate, isPending } = useUpdateProfile();
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<FormValues>();

  const onSubmit = (data: FormValues) => {
    setSuccessMsg(null);
    setErrorMsg(null);
    mutate(
      { currentPassword: data.currentPassword, newPassword: data.newPassword },
      {
        onSuccess: () => { setSuccessMsg('Senha alterada com sucesso!'); reset(); },
        onError: (err) => setErrorMsg(extractErrorMessage(err, 'Erro ao alterar senha.')),
      },
    );
  };

  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="h6" fontWeight={700} gutterBottom>
          Segurança
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Stack spacing={2}>
          {successMsg && <Alert severity="success" onClose={() => setSuccessMsg(null)}>{successMsg}</Alert>}
          {errorMsg && <Alert severity="error" onClose={() => setErrorMsg(null)}>{errorMsg}</Alert>}
          <TextField
            label="Senha atual"
            type="password"
            fullWidth
            {...register('currentPassword', { required: 'Informe a senha atual' })}
            error={!!errors.currentPassword}
            helperText={errors.currentPassword?.message}
          />
          <TextField
            label="Nova senha"
            type="password"
            fullWidth
            {...register('newPassword', {
              required: 'Informe a nova senha',
              minLength: { value: 6, message: 'Mínimo 6 caracteres' },
            })}
            error={!!errors.newPassword}
            helperText={errors.newPassword?.message}
          />
          <TextField
            label="Confirmar nova senha"
            type="password"
            fullWidth
            {...register('confirmPassword', {
              required: 'Confirme a nova senha',
              validate: (v) => v === watch('newPassword') || 'As senhas não coincidem',
            })}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword?.message}
          />
          <Box>
            <Button variant="contained" onClick={handleSubmit(onSubmit)} disabled={isPending}>
              {isPending ? 'Salvando...' : 'Alterar senha'}
            </Button>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
