'use client';
import React from 'react';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Chip,
  Tooltip,
} from '@mui/material';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Building2,
  Users,
  CreditCard,
  Database,
  Sliders,
  LifeBuoy,
} from 'lucide-react';

interface SidebarProps {
  drawerWidth: number;
  mobileOpen: boolean;
  onMobileClose: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

const MENU_ITEMS = [
  { title: 'Overview', path: '/', icon: <LayoutDashboard size={18} /> },
  { title: 'Employees', path: '/employees', icon: <Users size={18} /> },
  { title: 'Organizations', path: '/organizations', icon: <Building2 size={18} /> },
  { title: 'Subscriptions', path: '/subscriptions', icon: <CreditCard size={18} /> },
  { title: 'Data Hub', path: '/data-inspector', icon: <Database size={18} /> },
  { title: 'Support', path: '/support', icon: <LifeBuoy size={18} /> },
  { title: 'Settings', path: '/settings', icon: <Sliders size={18} /> },
];

export const Sidebar: React.FC<SidebarProps> = ({
  drawerWidth,
  mobileOpen,
  onMobileClose,
  collapsed,
  onToggleCollapse,
}) => {
  const pathname = usePathname();
  const router = useRouter();

  const isSelected = (itemPath: string) => {
    if (itemPath === '/') return pathname === '/';
    return pathname.startsWith(itemPath);
  };

  const drawerContent = (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#FFFFFF',
        borderRight: '1px solid #E2E8F0',
      }}
    >
      {/* Brand Header — click logo to toggle collapse */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          minHeight: 64,
          borderBottom: '1px solid #F1F5F9',
          gap: 1.5,
        }}
      >
        {/* Logo — click to collapse/expand (desktop only) */}
        <Tooltip title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} placement="right">
          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: 1.5,
              bgcolor: '#FF6900',
              display: { xs: 'none', md: 'flex' },
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              flexShrink: 0,
              fontWeight: 800,
              fontSize: '1rem',
              cursor: 'pointer',
              userSelect: 'none',
              transition: 'opacity 0.15s',
              '&:hover': { opacity: 0.82 },
            }}
            onClick={onToggleCollapse}
          >
            B
          </Box>
        </Tooltip>
        {/* Mobile: logo not a toggle */}
        <Box
          sx={{
            width: 34,
            height: 34,
            borderRadius: 1.5,
            bgcolor: '#FF6900',
            display: { xs: 'flex', md: 'none' },
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            flexShrink: 0,
            fontWeight: 800,
            fontSize: '1rem',
            cursor: 'pointer',
          }}
          onClick={() => router.push('/')}
        >
          B
        </Box>

        {!collapsed && (
          <Box sx={{ flex: 1, cursor: 'pointer', overflow: 'hidden' }} onClick={() => router.push('/')}>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 800, fontSize: '1.05rem', lineHeight: 1.1, color: '#0F172A', letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}
            >
              BRANZEPT
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: '#FF6900', fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}
            >
              Visagel Admin
            </Typography>
          </Box>
        )}
      </Box>

      {/* Navigation List */}
      <Box sx={{ flexGrow: 1, py: 1.5, px: 1, overflowY: 'auto' }}>
        <List disablePadding sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {MENU_ITEMS.map((item) => {
            const active = isSelected(item.path);
            return (
              <ListItem key={item.path} disablePadding>
                <Tooltip title={collapsed ? item.title : ''} placement="right" arrow>
                  <ListItemButton
                    onClick={() => {
                      router.push(item.path);
                      onMobileClose();
                    }}
                    sx={{
                      borderRadius: 1.5,
                      minHeight: 40,
                      px: collapsed ? 1 : 1.5,
                      justifyContent: collapsed ? 'center' : 'initial',
                      backgroundColor: active ? '#FFF7ED' : 'transparent',
                      color: active ? '#FF6900' : '#475569',
                      borderLeft: active ? '3px solid #FF6900' : '3px solid transparent',
                      '&:hover': {
                        backgroundColor: active ? '#FFF7ED' : '#F8FAFC',
                        color: active ? '#FF6900' : '#0F172A',
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 0,
                        mr: collapsed ? 0 : 1.5,
                        justifyContent: 'center',
                        color: active ? '#FF6900' : '#64748B',
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    {!collapsed && (
                      <ListItemText
                        primary={
                          <Typography
                            variant="body2"
                            sx={{
                              fontSize: '0.84rem',
                              fontWeight: active ? 600 : 500,
                              color: active ? '#FF6900' : '#334155',
                            }}
                          >
                            {item.title}
                          </Typography>
                        }
                      />
                    )}
                  </ListItemButton>
                </Tooltip>
              </ListItem>
            );
          })}
        </List>
      </Box>

      {/* Footer: Powered by Branzept */}
      {!collapsed && (
        <Box
          sx={{
            p: 1.5,
            m: 1,
            borderRadius: 1.5,
            bgcolor: '#F8FAFC',
            border: '1px solid #E2E8F0',
            textAlign: 'center',
          }}
        >
          <Typography variant="caption" sx={{ fontWeight: 700, color: '#FF6900', display: 'block', fontSize: '0.72rem' }}>
            Powered by Branzept
          </Typography>
          <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '0.65rem', display: 'block' }}>
            Developed by Branzept Team
          </Typography>
        </Box>
      )}
    </Box>
  );

  return (
    <>
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          width: collapsed ? 68 : drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: collapsed ? 68 : drawerWidth,
            transition: (t) =>
              t.transitions.create('width', {
                easing: t.transitions.easing.sharp,
                duration: t.transitions.duration.enteringScreen,
              }),
            overflowX: 'hidden',
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </>
  );
};

