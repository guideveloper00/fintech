import { useRef, useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { CameraAlt, DeleteOutline } from '@mui/icons-material';
import { useAuthStore } from '../../../store/auth.store';
import { useUpdateProfile } from '../../../shared/hooks/useAuth';
import { extractErrorMessage } from '../../../lib/extractErrorMessage';

export default function AvatarSection() {
  const user = useAuthStore((s) => s.user);
  const { mutate, isPending } = useUpdateProfile();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const currentAvatar = preview ?? user?.avatarUrl ?? null;
  const initials = user?.name?.[0]?.toUpperCase() ?? 'U';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
    // Limpa o input para permitir re-seleção do mesmo arquivo
    e.target.value = '';
  };

  const handleSave = () => {
    if (!preview) return;
    setSuccessMsg(null);
    setErrorMsg(null);
    mutate(
      { avatarUrl: preview },
      {
        onSuccess: () => { setSuccessMsg('Avatar atualizado!'); setPreview(null); },
        onError: (err) => setErrorMsg(extractErrorMessage(err, 'Erro ao atualizar avatar.')),
      },
    );
  };

  const handleRemove = () => {
    setSuccessMsg(null);
    setErrorMsg(null);
    setPreview(null);
    mutate(
      { avatarUrl: null },
      {
        onSuccess: () => setSuccessMsg('Avatar removido!'),
        onError: (err) => setErrorMsg(extractErrorMessage(err, 'Erro ao remover avatar.')),
      },
    );
  };

  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="h6" fontWeight={700} gutterBottom>
          Avatar
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Stack spacing={2}>
          {successMsg && <Alert severity="success" onClose={() => setSuccessMsg(null)}>{successMsg}</Alert>}
          {errorMsg && <Alert severity="error" onClose={() => setErrorMsg(null)}>{errorMsg}</Alert>}

          <Stack direction="row" alignItems="center" spacing={3}>
            <Box sx={{ position: 'relative', display: 'inline-flex' }}>
              <Avatar
                src={currentAvatar ?? undefined}
                sx={{ width: 96, height: 96, fontSize: 36, bgcolor: 'primary.main' }}
              >
                {!currentAvatar && initials}
              </Avatar>
              <Tooltip title="Selecionar imagem">
                <IconButton
                  size="small"
                  onClick={() => fileInputRef.current?.click()}
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    bgcolor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider',
                    '&:hover': { bgcolor: 'action.hover' },
                  }}
                >
                  <CameraAlt fontSize="small" />
                </IconButton>
              </Tooltip>
              <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleFileChange} />
            </Box>

            <Stack spacing={1}>
              <Typography variant="body2" color="text.secondary">
                Formatos suportados: JPG, PNG, GIF, WebP
              </Typography>
              <Stack direction="row" spacing={1}>
                {preview && (
                  <Button
                    variant="contained"
                    size="small"
                    onClick={handleSave}
                    disabled={isPending}
                    startIcon={isPending ? <CircularProgress size={14} /> : undefined}
                  >
                    {isPending ? 'Salvando...' : 'Salvar avatar'}
                  </Button>
                )}
                {(user?.avatarUrl || preview) && (
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    startIcon={<DeleteOutline />}
                    onClick={handleRemove}
                    disabled={isPending}
                  >
                    Remover
                  </Button>
                )}
              </Stack>
            </Stack>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
