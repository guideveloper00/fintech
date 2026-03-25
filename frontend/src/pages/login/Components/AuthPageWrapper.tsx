import { Box, Card, CardContent, Stack, Typography } from '@mui/material';
import { AuthPageWrapperProps } from '../types';

export default function AuthPageWrapper({ title, subtitle, children, footer, error }: AuthPageWrapperProps) {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        px: 2,
      }}
    >
      <Card sx={{ width: '100%', maxWidth: 420 }}>
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Stack spacing={3}>
            <Box textAlign="center">
              <Typography variant="h5" component="h1" gutterBottom>
                {title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            </Box>

            {error}
            {children}

            <Typography variant="body2" textAlign="center" color="text.secondary">
              {footer}
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
