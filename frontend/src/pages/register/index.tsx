import { Link as RouterLink } from 'react-router-dom';
import { Link } from '@mui/material';
import RegisterForm from './components/RegisterForm';
import AuthPageWrapper from '../login/Components/AuthPageWrapper';

export default function RegisterPage() {
  return (
    <AuthPageWrapper
      title="Criar Conta"
      subtitle="Preencha os dados para se cadastrar"
      footer={
        <>
          Já tem uma conta?{' '}
          <Link component={RouterLink} to="/login" underline="hover">
            Entrar
          </Link>
        </>
      }
    >
      <RegisterForm />
    </AuthPageWrapper>
  );
}
