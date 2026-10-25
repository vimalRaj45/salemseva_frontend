import React, { useState } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { Menu as MenuIcon, X, Sun, Moon, LogOut, ChevronRight } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useColorMode } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

const DRAWER_WIDTH = 260;

export default function AppLayout({
  navigationItems = [],
  title = 'Shazu One',
  children,
  headerExtra,
  sidebarHeader
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);

  const { mode, toggleColorMode } = useColorMode();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleUserMenuOpen = (event) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const handleLogout = () => {
    handleUserMenuClose();
    if (logout) logout();
    navigate('/login');
  };

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Brand Header */}
      <Box
        sx={{
          height: 64,
          px: 2.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}
      >
        {sidebarHeader ? (
          sidebarHeader
        ) : (
          <Box
            sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer' }}
            onClick={() => navigate('/')}
          >
            <Box
              component="img"
              src="/logo.svg"
              alt="Shazu One"
              sx={{ height: 32, width: 'auto' }}
            />
          </Box>
        )}

        {isMobile && (
          <IconButton onClick={handleDrawerToggle} size="small" aria-label="Close navigation">
            <X size={18} />
          </IconButton>
        )}
      </Box>

      {/* Navigation Links */}
      <List sx={{ px: 1.5, py: 2, flex: 1 }}>
        {navigationItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <ListItem key={item.path || item.label} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => {
                  if (item.onClick) {
                    item.onClick();
                  } else if (item.path) {
                    navigate(item.path);
                  }
                  if (isMobile) setMobileOpen(false);
                }}
                sx={{
                  borderRadius: 1.5,
                  py: 1,
                  px: 1.5,
                  bgcolor: isActive ? 'action.selected' : 'transparent',
                  color: isActive ? 'primary.main' : 'text.primary',
                  fontWeight: isActive ? 700 : 500,
                  '&:hover': {
                    bgcolor: 'action.hover'
                  }
                }}
              >
                {Icon && (
                  <ListItemIcon
                    sx={{
                      minWidth: 36,
                      color: isActive ? 'primary.main' : 'text.secondary'
                    }}
                  >
                    <Icon size={18} />
                  </ListItemIcon>
                )}
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: '0.875rem',
                    fontWeight: isActive ? 700 : 500
                  }}
                />
                {item.badge && (
                  <Box sx={{ ml: 'auto' }}>{item.badge}</Box>
                )}
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      {/* Bottom Profile / Quick Info */}
      {user && (
        <Box
          sx={{
            p: 2,
            borderTop: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            gap: 1.5
          }}
        >
          <Avatar
            sx={{
              width: 36,
              height: 36,
              bgcolor: 'primary.main',
              fontSize: '0.875rem',
              fontWeight: 700
            }}
          >
            {user.name ? user.name[0].toUpperCase() : 'U'}
          </Avatar>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="subtitle2" noWrap sx={{ fontWeight: 700, fontSize: '0.8125rem' }}>
              {user.name || 'User'}
            </Typography>
            <Typography variant="caption" noWrap sx={{ color: 'text.secondary', display: 'block', fontSize: '0.75rem' }}>
              {user.phone || user.email || ''}
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Desktop Persistent Sidebar */}
      {!isMobile && navigationItems.length > 0 && (
        <Box
          component="nav"
          sx={{
            width: DRAWER_WIDTH,
            flexShrink: 0
          }}
          aria-label="Navigation drawer"
        >
          <Drawer
            variant="permanent"
            open
            sx={{
              '& .MuiDrawer-paper': {
                width: DRAWER_WIDTH,
                boxSizing: 'border-box',
                borderRight: '1px solid',
                borderColor: 'divider'
              }
            }}
          >
            {drawerContent}
          </Drawer>
        </Box>
      )}

      {/* Mobile Temporary Drawer */}
      {isMobile && navigationItems.length > 0 && (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box'
            }
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      {/* Main Content Area */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top Bar */}
        <AppBar position="sticky" elevation={0}>
          <Toolbar sx={{ height: 64, px: { xs: 2, sm: 3 } }}>
            {isMobile && navigationItems.length > 0 && (
              <IconButton
                color="inherit"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 2 }}
                aria-label="Open navigation menu"
              >
                <MenuIcon size={20} />
              </IconButton>
            )}

            <Typography
              variant="h6"
              component="div"
              noWrap
              sx={{
                fontWeight: 800,
                color: 'text.primary',
                fontSize: { xs: '1rem', sm: '1.15rem' },
                letterSpacing: '-0.01em'
              }}
            >
              {title}
            </Typography>

            <Box sx={{ flexGrow: 1 }} />

            {headerExtra && <Box sx={{ mr: 1.5 }}>{headerExtra}</Box>}

            {/* Dark Mode Toggle */}
            <IconButton
              onClick={toggleColorMode}
              color="inherit"
              size="small"
              sx={{
                mr: 1.5,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1.5,
                p: 0.75
              }}
              aria-label={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {mode === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
            </IconButton>

            {/* User Profile Avatar */}
            {user && (
              <>
                <IconButton
                  onClick={handleUserMenuOpen}
                  size="small"
                  aria-label="User account menu"
                  aria-controls="user-menu"
                  aria-haspopup="true"
                >
                  <Avatar
                    sx={{
                      width: 34,
                      height: 34,
                      bgcolor: 'primary.main',
                      fontSize: '0.8125rem',
                      fontWeight: 700
                    }}
                  >
                    {user.name ? user.name[0].toUpperCase() : 'U'}
                  </Avatar>
                </IconButton>

                <Menu
                  id="user-menu"
                  anchorEl={userMenuAnchor}
                  open={Boolean(userMenuAnchor)}
                  onClose={handleUserMenuClose}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                  PaperProps={{
                    sx: {
                      width: 200,
                      mt: 1,
                      borderRadius: 1.5,
                      boxShadow: '0 10px 25px rgba(15, 23, 42, 0.08)'
                    }
                  }}
                >
                  <Box sx={{ px: 2, py: 1.25 }}>
                    <Typography variant="subtitle2" noWrap sx={{ fontWeight: 700 }}>
                      {user.name || 'User'}
                    </Typography>
                    <Typography variant="caption" noWrap sx={{ color: 'text.secondary', display: 'block' }}>
                      {user.phone || user.email || ''}
                    </Typography>
                  </Box>
                  <Divider />
                  <MenuItem onClick={handleLogout} sx={{ color: 'error.main', py: 1 }}>
                    <ListItemIcon sx={{ color: 'inherit', minWidth: 32 }}>
                      <LogOut size={16} />
                    </ListItemIcon>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Sign Out
                    </Typography>
                  </MenuItem>
                </Menu>
              </>
            )}
          </Toolbar>
        </AppBar>

        {/* Page Content Viewport */}
        <Box
          component="main"
          sx={{
            flex: 1,
            p: { xs: 2, sm: 3, md: 4 },
            maxWidth: 1440,
            width: '100%',
            mx: 'auto'
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}
