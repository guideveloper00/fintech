import { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
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
import { useAuthStore } from '../store/auth.store';
import { useLogout, useCurrentUser } from '../hooks/useAuth';

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

  const user = useAuthStore((s) => s.user);
  const { mutate: logout } = useLogout();

  // Keeps session in sync with the server — if the JWT cookie has expired
  // the 401 interceptor in api.ts will clear auth and redirect to /login.
  useCurrentUser();

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Brand */}
      <Toolbar>
        <Typography variant="h6" fontWeight={700} color="primary">
          FinTech
        </Typography>
      </Toolbar>
      <Divider />

      {/* Nav links */}
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

      {/* User + Logout */}
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Avatar sx={{ width: 32, height: 32, fontSize: 14, bgcolor: 'primary.main' }}>
          {user?.name?.[0]?.toUpperCase() ?? 'U'}
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
          <IconButton size="small" onClick={() => logout()}>
            <LogoutIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <CssBaseline />

      {/* Top bar — only on mobile */}
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

      {/* Sidebar */}
      <Box
        component="nav"
        sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
      >
        {/* Mobile drawer */}
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

        {/* Desktop permanent drawer */}
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

      {/* Main content */}
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
