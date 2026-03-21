import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useRegister } from '../../hooks/useAuth';
import { extractErrorMessage } from '../../lib/extractErrorMessage';
import type { RegisterFormData } from './types';

export default function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterFormData>();
  const { mutate: registerUser, isPending, error } = useRegister();

  const onSubmit: SubmitHandler<RegisterFormData> = ({ confirmPassword: _, ...payload }) =>
    registerUser(payload);

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <Stack spacing={2}>
        {error && (
          <Alert severity="error">
            {extractErrorMessage(error, 'Erro ao criar conta. Tente novamente.')}
          </Alert>
        )}
        <TextField
          label="Nome completo"
          autoComplete="name"
          fullWidth
          {...register('name', {
            required: 'Nome é obrigatório',
            minLength: { value: 2, message: 'Mínimo de 2 caracteres' },
          })}
          error={!!errors.name}
          helperText={errors.name?.message}
        />

        <TextField
          label="E-mail"
          type="email"
          autoComplete="email"
          fullWidth
          {...register('email', {
            required: 'E-mail é obrigatório',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'E-mail inválido',
            },
          })}
          error={!!errors.email}
          helperText={errors.email?.message}
        />

        <TextField
          label="Senha"
          type={showPassword ? 'text' : 'password'}
          autoComplete="new-password"
          fullWidth
          {...register('password', {
            required: 'Senha é obrigatória',
            minLength: { value: 6, message: 'Mínimo de 6 caracteres' },
          })}
          error={!!errors.password}
          helperText={errors.password?.message}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword((v) => !v)} edge="end">
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <TextField
          label="Confirmar senha"
          type={showPassword ? 'text' : 'password'}
          autoComplete="new-password"
          fullWidth
          {...register('confirmPassword', {
            required: 'Confirmação é obrigatória',
            validate: (val) => val === watch('password') || 'As senhas não coincidem',
          })}
          error={!!errors.confirmPassword}
          helperText={errors.confirmPassword?.message}
        />

        <Button
          type="submit"
          variant="contained"
          size="large"
          fullWidth
          disabled={isPending}
          startIcon={isPending ? <CircularProgress size={18} color="inherit" /> : undefined}
        >
          {isPending ? 'Criando conta...' : 'Criar conta'}
        </Button>
      </Stack>
    </Box>
  );
}
