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
import { extractErrorMessage } from '@/lib/extractErrorMessage';
import { useLogin } from '@/shared/hooks/useAuth';
import { LoginPayload } from '@/services/auth.service';


export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<LoginPayload>();
  const { mutate: login, isPending, error } = useLogin();

  const onSubmit: SubmitHandler<LoginPayload> = (data) => login(data);

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <Stack spacing={2}>
        {error && (
          <Alert severity="error">
            {extractErrorMessage(error, 'Erro ao entrar. Verifique suas credenciais.')}
          </Alert>
        )}

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
          autoComplete="current-password"
          fullWidth
          {...register('password', { required: 'Senha é obrigatória' })}
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

        <Button
          type="submit"
          variant="contained"
          size="large"
          fullWidth
          disabled={isPending}
          startIcon={isPending ? <CircularProgress size={18} color="inherit" /> : undefined}
        >
          {isPending ? 'Entrando...' : 'Entrar'}
        </Button>
      </Stack>
    </Box>
  );
}

