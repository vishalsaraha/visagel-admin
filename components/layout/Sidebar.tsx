'use client';
import React, { useState, useEffect } from 'react';
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
  Code2,
} from 'lucide-react';

interface SidebarProps {
  drawerWidth: number;
  mobileOpen: boolean;
  onMobileClose: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

const MENU_ITEMS = [
  { title: 'Overview', path: '/', icon: <LayoutDashboard size={18} />, devOnly: false },
  { title: 'Organizations', path: '/organizations', icon: <Building2 size={18} />, devOnly: false },
  { title: 'Subscriptions', path: '/subscriptions', icon: <CreditCard size={18} />, devOnly: false },
  { title: 'Data Hub', path: '/data-inspector', icon: <Database size={18} />, devOnly: false },
  { title: 'Developer Hub', path: '/developer', icon: <Code2 size={18} />, devOnly: true },
  { title: 'Support', path: '/support', icon: <LifeBuoy size={18} />, devOnly: false },
  { title: 'Settings', path: '/settings', icon: <Sliders size={18} />, devOnly: false },
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

  // Developer Mode: persisted in localStorage, toggled by triple-clicking the sidebar footer
  const [devMode, setDevMode] = useState(false);
  const [footerClickCount, setFooterClickCount] = useState(0);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('visagel_dev_mode');
      if (stored === 'true') setDevMode(true);
    } catch { /* SSR safe */ }
  }, []);

  const handleFooterClick = () => {
    const newCount = footerClickCount + 1;
    setFooterClickCount(newCount);
    if (newCount >= 3) {
      const newMode = !devMode;
      setDevMode(newMode);
      localStorage.setItem('visagel_dev_mode', String(newMode));
      setFooterClickCount(0);
    }
    // Reset click counter after 1.5s
    setTimeout(() => setFooterClickCount(0), 1500);
  };

  const isSelected = (itemPath: string) => {
    if (itemPath === '/') return pathname === '/';
    return pathname.startsWith(itemPath);
  };

  const visibleMenuItems = MENU_ITEMS.filter((item) => !item.devOnly || devMode);

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
            V
          </Box>
        </Tooltip>
        {/* Mobile: logo not a toggle */}
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: 1.5,
            bgcolor: '#FF6900',
            color: '#FFF',
            display: { xs: 'flex', md: 'none' },
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '1rem',
            boxShadow: '0 2px 6px rgba(255, 105, 0, 0.3)',
            cursor: 'pointer',
            flexShrink: 0,
          }}
          onClick={() => router.push('/')}
        >
          V
        </Box>

        {!collapsed && (
          <Box sx={{ flex: 1, cursor: 'pointer', overflow: 'hidden' }} onClick={() => router.push('/')}>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 800, fontSize: '1.05rem', lineHeight: 1.1, color: '#0F172A', letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}
            >
              VISAGEL
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: '#FF6900', fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.02em', textTransform: 'uppercase', whiteSpace: 'nowrap', display: 'block' }}
            >
              Face Attendance Admin
            </Typography>
          </Box>
        )}
      </Box>

      {/* Navigation List */}
      <Box sx={{ flexGrow: 1, py: 1.5, px: 1, overflowY: 'auto' }}>
        <List disablePadding sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {visibleMenuItems.map((item) => {
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
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
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
                            {item.devOnly && (
                              <Chip
                                label="DEV"
                                size="small"
                                sx={{
                                  height: 16,
                                  fontSize: '0.55rem',
                                  fontWeight: 800,
                                  bgcolor: '#8B5CF6',
                                  color: '#FFFFFF',
                                  '& .MuiChip-label': { px: 0.6 },
                                }}
                              />
                            )}
                          </Box>
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

      {/* Footer: Powered by Branzept — Triple-click to toggle dev mode */}
      {!collapsed && (
        <Box
          sx={{
            p: 1.5,
            m: 1,
            borderRadius: 1.5,
            bgcolor: devMode ? '#F5F3FF' : '#F8FAFC',
            border: `1px solid ${devMode ? '#DDD6FE' : '#E2E8F0'}`,
            textAlign: 'center',
            cursor: 'default',
            userSelect: 'none',
            transition: 'all 0.2s',
          }}
          onClick={handleFooterClick}
        >
          <Typography variant="caption" sx={{ fontWeight: 700, color: '#FF6900', display: 'block', fontSize: '0.72rem' }}>
            Powered by Branzept
          </Typography>
          <Typography variant="caption" sx={{ color: devMode ? '#8B5CF6' : '#94A3B8', fontSize: '0.65rem', display: 'block' }}>
            {devMode ? '🔓 Developer Mode Active' : 'Developed by Branzept Team'}
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
