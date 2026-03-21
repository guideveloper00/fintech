import { Link as RouterLink } from 'react-router-dom';
import { Link } from '@mui/material';
import AuthPageWrapper from './AuthPageWrapper';
import LoginForm from './LoginForm';

export default function LoginPage() {
  return (
    <AuthPageWrapper
      title="Gestão Financeira"
      subtitle="Faça login para acessar o painel"
      footer={
        <>
          Não tem uma conta?{' '}
          <Link component={RouterLink} to="/register" underline="hover">
            Criar conta
          </Link>
        </>
      }
    >
      <LoginForm />
    </AuthPageWrapper>
  );
}
