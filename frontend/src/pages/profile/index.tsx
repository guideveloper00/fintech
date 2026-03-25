import { Box, Stack, Typography } from '@mui/material';
import AvatarSection from './components/AvatarSection';
import InfoSection from './components/InfoSection';
import PasswordSection from './components/PasswordSection';

export default function ProfilePage() {
  return (
    <Box>
      <Box mb={4}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Meu perfil
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Gerencie suas informações pessoais e segurança da conta
        </Typography>
      </Box>

      <Stack spacing={3} sx={{ maxWidth: 560 }}>
        <AvatarSection />
        <InfoSection />
        <PasswordSection />
      </Stack>
    </Box>
  );
}

