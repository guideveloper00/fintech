import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Box,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Avatar,
  Tooltip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  SwapHoriz as TransactionsIcon,
  Category as CategoryIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { useLogout, useCurrentUser } from '../hooks/useAuth';
import { useAuthStore } from '@/store/auth.store';

const DRAWER_WIDTH = 240;

const navItems = [
  { label: 'Dashboard', path: '/', icon: <DashboardIcon /> },
  { label: 'Transações', path: '/transactions', icon: <TransactionsIcon /> },
  { label: 'Categorias', path: '/categories', icon: <CategoryIcon /> },
];

export default function AppLayout() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const user = useAuthStore((s) => s.user);
  const { mutate: logout } = useLogout();

  useCurrentUser();

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Logo / marca */}
      <Toolbar>
        <Typography variant="h6" fontWeight={700} color="primary">
          FinTech
        </Typography>
      </Toolbar>
      <Divider />

      {/* Links de navegação */}
      <List sx={{ flex: 1, pt: 1 }}>
        {navItems.map(({ label, path, icon }) => (
          <ListItem key={path} disablePadding>
            <ListItemButton
              component={NavLink}
              to={path}
              end={path === '/'}
              onClick={() => setMobileOpen(false)}
              sx={{
                borderRadius: 2,
                mx: 1,
                '&.active': {
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  '& .MuiListItemIcon-root': {
                    color: 'primary.contrastText',
                  },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>{icon}</ListItemIcon>
              <ListItemText primary={label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider />

      {/* Usuário + Logout */}
      <Box
        sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer' }}
        onClick={() => navigate('/profile')}
      >
        <Avatar
          src={user?.avatarUrl ?? undefined}
          sx={{ width: 32, height: 32, fontSize: 14, bgcolor: 'primary.main' }}
        >
          {!user?.avatarUrl && (user?.name?.[0]?.toUpperCase() ?? 'U')}
        </Avatar>
        <Box sx={{ flex: 1, overflow: 'hidden' }}>
          <Typography variant="body2" fontWeight={600} noWrap>
            {user?.name ?? 'Usuário'}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            {user?.email}
          </Typography>
        </Box>
        <Tooltip title="Sair">
          <IconButton size="small" onClick={(e) => { e.stopPropagation(); logout(); }}>
            <LogoutIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <CssBaseline />

      {/* Barra superior — somente mobile */}
      {isMobile && (
        <AppBar
          position="fixed"
          sx={{ zIndex: theme.zIndex.drawer + 1 }}
          elevation={1}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              edge="start"
              onClick={() => setMobileOpen((v) => !v)}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" fontWeight={700}>
              FinTech
            </Typography>
          </Toolbar>
        </AppBar>
      )}

      {/* Barra lateral */}
      <Box
        component="nav"
        sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
      >
        {/* Drawer mobile */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' },
          }}
        >
          {drawerContent}
        </Drawer>

        {/* Drawer permanente (desktop) */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
              borderRight: `1px solid ${theme.palette.divider}`,
            },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>

      {/* Conteúdo principal */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          mt: { xs: 7, md: 0 },
          minHeight: '100vh',
          bgcolor: 'background.default',
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
