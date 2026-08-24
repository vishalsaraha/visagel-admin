'use client';
import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Badge,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Chip,
  Tooltip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Bell,
  LogOut,
  UserCheck,
  Shield,
  RefreshCw,
} from 'lucide-react';
import { useAdminData } from '@/context/AdminDataContext';

interface NavbarProps {
  onMobileToggle: () => void;
  collapsed: boolean;
  drawerWidth: number;
}

export const Navbar: React.FC<NavbarProps> = ({ onMobileToggle }) => {
  const { stats, resetToMockData } = useAdminData();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notifAnchorEl, setNotifAnchorEl] = useState<null | HTMLElement>(null);

  const handleProfileOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileClose = () => {
    setAnchorEl(null);
  };

  const handleNotifOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotifAnchorEl(event.currentTarget);
  };

  const handleNotifClose = () => {
    setNotifAnchorEl(null);
  };

  const overdueCount = stats.overduePaymentsCount;

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid #E2E8F0',
        color: '#0F172A',
        zIndex: (t) => t.zIndex.drawer + 1,
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', minHeight: 64, px: { xs: 2, sm: 3 } }}>
        {/* Left: Mobile Toggle & Context */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="open drawer"
            onClick={onMobileToggle}
            sx={{ display: { md: 'none' } }}
          >
            <MenuIcon size={20} />
          </IconButton>

          <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0F172A', mr: 0.5 }}>
              Branzept
            </Typography>

            {/* HQ Live status */}
            <Chip
              label="● HQ Live"
              size="small"
              sx={{ fontWeight: 700, fontSize: '0.7rem', bgcolor: '#F0FDF4', color: '#16A34A', border: '1px solid #BBF7D0', borderRadius: 1 }}
            />

            {/* DB Server */}
            <Chip
              label="DB Online"
              size="small"
              sx={{ fontWeight: 600, fontSize: '0.68rem', bgcolor: '#EFF6FF', color: '#2563EB', border: '1px solid #BFDBFE', borderRadius: 1, display: { xs: 'none', lg: 'flex' } }}
            />

            {/* API Health */}
            <Chip
              label="API Healthy"
              size="small"
              sx={{ fontWeight: 600, fontSize: '0.68rem', bgcolor: '#F0FDF4', color: '#16A34A', border: '1px solid #BBF7D0', borderRadius: 1, display: { xs: 'none', lg: 'flex' } }}
            />

            {/* Active kiosks */}
            <Chip
              label={`${stats.activeOrganizations * 2} Kiosks`}
              size="small"
              sx={{ fontWeight: 600, fontSize: '0.68rem', bgcolor: '#FFF7ED', color: '#FF6900', border: '1px solid #FED7AA', borderRadius: 1, display: { xs: 'none', xl: 'flex' } }}
            />

            {/* Uptime */}
            <Chip
              label="99.9% Uptime"
              size="small"
              sx={{ fontWeight: 600, fontSize: '0.68rem', bgcolor: '#F8FAFC', color: '#64748B', border: '1px solid #E2E8F0', borderRadius: 1, display: { xs: 'none', xl: 'flex' } }}
            />
          </Box>
        </Box>

        {/* Right Actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Quick Refresh */}
          <Tooltip title="Reset mock data to defaults">
            <IconButton
              size="small"
              onClick={() => {
                if (confirm('Reset system data to default mock records?')) {
                  resetToMockData();
                }
              }}
              sx={{
                color: '#64748B',
                '&:hover': { color: '#FF6900', bgcolor: '#FFF7ED' },
              }}
            >
              <RefreshCw size={17} />
            </IconButton>
          </Tooltip>

          {/* Notifications */}
          <Tooltip title="System Alerts">
            <IconButton
              size="small"
              onClick={handleNotifOpen}
              sx={{
                color: '#64748B',
                '&:hover': { color: '#FF6900', bgcolor: '#FFF7ED' },
              }}
            >
              <Badge badgeContent={overdueCount > 0 ? overdueCount : 0} color="error">
                <Bell size={18} />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* Notifications Menu */}
          <Menu
            anchorEl={notifAnchorEl}
            open={Boolean(notifAnchorEl)}
            onClose={handleNotifClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            slotProps={{
              paper: {
                sx: { width: 320, p: 0.5, mt: 1, borderRadius: 1.5, border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' },
              },
            }}
          >
            <Box sx={{ p: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                System Alerts
              </Typography>
              {overdueCount > 0 && (
                <Chip label={`${overdueCount} Pending`} size="small" color="error" sx={{ height: 20, fontSize: '0.65rem' }} />
              )}
            </Box>
            <Divider />
            {overdueCount > 0 ? (
              <MenuItem onClick={handleNotifClose} sx={{ py: 1 }}>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: 'error.main' }}>
                    Payment Overdue
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Apex Logistics subscription payment is overdue.
                  </Typography>
                </Box>
              </MenuItem>
            ) : (
              <MenuItem onClick={handleNotifClose} sx={{ py: 1 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  All client services and kiosks operating normally.
                </Typography>
              </MenuItem>
            )}
          </Menu>

          <Divider orientation="vertical" flexItem sx={{ height: 20, my: 'auto', mx: 0.5, borderColor: '#E2E8F0' }} />

          {/* Super Admin Profile */}
          <Box
            onClick={handleProfileOpen}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              p: 0.5,
              px: 1,
              borderRadius: 1.5,
              cursor: 'pointer',
              '&:hover': { bgcolor: '#FFF7ED' },
            }}
          >
            <Avatar
              sx={{
                width: 28,
                height: 28,
                bgcolor: '#FF6900',
                color: '#FFF',
                fontWeight: 700,
                fontSize: '0.75rem',
              }}
            >
              BP
            </Avatar>
            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
              <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2, color: '#0F172A' }}>
                Branzept Admin
              </Typography>
            </Box>
          </Box>

          {/* Profile Menu */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleProfileClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            slotProps={{
              paper: {
                sx: { width: 200, p: 0.5, mt: 1, borderRadius: 1.5, border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' },
              },
            }}
          >
            <Box sx={{ p: 1.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                Super Administrator
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                super@visagel.ai
              </Typography>
            </Box>
            <Divider />
            <MenuItem onClick={handleProfileClose} sx={{ py: 0.8 }}>
              <ListItemIcon>
                <UserCheck size={16} />
              </ListItemIcon>
              <ListItemText primary={<Typography sx={{ fontSize: '0.84rem' }}>Account Profile</Typography>} />
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleProfileClose();
                alert('Session locked.');
              }}
              sx={{ py: 0.8, color: 'error.main' }}
            >
              <ListItemIcon sx={{ color: 'error.main' }}>
                <LogOut size={16} />
              </ListItemIcon>
              <ListItemText primary={<Typography sx={{ fontSize: '0.84rem' }}>Sign Out</Typography>} />
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

