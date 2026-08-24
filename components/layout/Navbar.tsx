'use client';
import React, { useState, useEffect } from 'react';
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
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  List,
  ListItemButton,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Bell,
  LogOut,
  UserCheck,
  RefreshCw,
  Search,
  Building2,
  Smartphone,
  CreditCard,
  ArrowRight,
} from 'lucide-react';
import { useAdminData } from '@/context/AdminDataContext';
import { useRouter } from 'next/navigation';
import { Organization, KioskDevice, PaymentInvoice } from '@/types';

interface NavbarProps {
  onMobileToggle: () => void;
  collapsed: boolean;
  drawerWidth: number;
}

export const Navbar: React.FC<NavbarProps> = ({ onMobileToggle }) => {
  const router = useRouter();
  const { stats, resetToMockData, organizations, kiosks, invoices } = useAdminData();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notifAnchorEl, setNotifAnchorEl] = useState<null | HTMLElement>(null);

  // Global Search State
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Keyboard shortcut Ctrl+K / Cmd+K handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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

  // Search Results
  const matchedOrgs = searchQuery
    ? organizations.filter(
        (o: Organization) =>
          o.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          o.orgId.toLowerCase().includes(searchQuery.toLowerCase()) ||
          o.contactEmail.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const matchedKiosks = searchQuery
    ? kiosks.filter(
        (k: KioskDevice) =>
          k.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          k.deviceId.toLowerCase().includes(searchQuery.toLowerCase()) ||
          k.ipAddress.includes(searchQuery)
      )
    : [];

  const matchedInvoices = searchQuery
    ? invoices.filter(
        (i: PaymentInvoice) =>
          i.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          i.orgName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <>
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
          {/* Left: Mobile Toggle & Brand Context */}
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
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0F172A', mr: 0.5, letterSpacing: '-0.02em' }}>
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
            </Box>
          </Box>

          {/* Center: Global Search Input / Command Launcher */}
          <Box
            onClick={() => setSearchOpen(true)}
            sx={{
              display: { xs: 'none', md: 'flex' },
              alignItems: 'center',
              gap: 1.5,
              bgcolor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: 2,
              px: 2,
              py: 0.8,
              width: { md: 280, lg: 360 },
              cursor: 'pointer',
              transition: 'all 0.15s',
              '&:hover': { borderColor: '#FF6900', bgcolor: '#FFF' },
            }}
          >
            <Search size={16} color="#64748B" />
            <Typography variant="body2" sx={{ color: '#94A3B8', flex: 1, fontSize: '0.84rem' }}>
              Search Orgs, Kiosks, Invoices...
            </Typography>
            <Chip label="Ctrl + K" size="small" sx={{ height: 18, fontSize: '0.62rem', fontWeight: 700, bgcolor: '#E2E8F0', color: '#475569' }} />
          </Box>

          {/* Right Actions */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Mobile Search Icon */}
            <IconButton
              size="small"
              onClick={() => setSearchOpen(true)}
              sx={{ display: { xs: 'flex', md: 'none' }, color: '#64748B' }}
            >
              <Search size={18} />
            </IconButton>

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

      {/* Global Search Dialog */}
      <Dialog open={searchOpen} onClose={() => setSearchOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ p: 2 }}>
          <TextField
            autoFocus
            fullWidth
            placeholder="Search client organizations, Org IDs, Kiosks, Invoices..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            slotProps={{
              input: {
                startAdornment: <Search size={20} style={{ marginRight: 12, color: '#FF6900' }} />,
              },
            }}
          />
        </DialogTitle>
        <DialogContent dividers sx={{ p: 1, maxHeight: 400 }}>
          {!searchQuery && (
            <Typography variant="body2" sx={{ p: 3, fontStyle: 'italic', textAlign: 'center', color: 'text.secondary' }}>
              Type to search across tenants, kiosks, and invoices...
            </Typography>
          )}

          {searchQuery && (
            <List disablePadding>
              {/* Orgs */}
              {matchedOrgs.length > 0 && (
                <Box sx={{ px: 2, pt: 1, pb: 0.5 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase' }}>
                    Organizations ({matchedOrgs.length})
                  </Typography>
                </Box>
              )}
              {matchedOrgs.map((org: Organization) => (
                <ListItemButton
                  key={org.id}
                  onClick={() => {
                    setSearchOpen(false);
                    router.push(`/organizations/${org.id}`);
                  }}
                  sx={{ borderRadius: 1, my: 0.2 }}
                >
                  <ListItemIcon sx={{ minWidth: 36, color: '#FF6900' }}>
                    <Building2 size={18} />
                  </ListItemIcon>
                  <ListItemText
                    primary={<Typography variant="body2" sx={{ fontWeight: 700 }}>{org.name}</Typography>}
                    secondary={<Typography variant="caption" sx={{ color: 'text.secondary' }}>{`${org.orgId} • ${org.contactEmail}`}</Typography>}
                  />
                  <ArrowRight size={16} color="#94A3B8" />
                </ListItemButton>
              ))}

              {/* Kiosks */}
              {matchedKiosks.length > 0 && (
                <Box sx={{ px: 2, pt: 1, pb: 0.5 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase' }}>
                    Kiosks & Terminals ({matchedKiosks.length})
                  </Typography>
                </Box>
              )}
              {matchedKiosks.map((ksk: KioskDevice) => (
                <ListItemButton
                  key={ksk.id}
                  onClick={() => {
                    setSearchOpen(false);
                    router.push('/data-inspector');
                  }}
                  sx={{ borderRadius: 1, my: 0.2 }}
                >
                  <ListItemIcon sx={{ minWidth: 36, color: '#16A34A' }}>
                    <Smartphone size={18} />
                  </ListItemIcon>
                  <ListItemText
                    primary={<Typography variant="body2" sx={{ fontWeight: 700 }}>{ksk.name}</Typography>}
                    secondary={<Typography variant="caption" sx={{ color: 'text.secondary' }}>{`${ksk.deviceId} (${ksk.orgName}) • IP: ${ksk.ipAddress}`}</Typography>}
                  />
                  <ArrowRight size={16} color="#94A3B8" />
                </ListItemButton>
              ))}

              {/* Invoices */}
              {matchedInvoices.length > 0 && (
                <Box sx={{ px: 2, pt: 1, pb: 0.5 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase' }}>
                    Invoices ({matchedInvoices.length})
                  </Typography>
                </Box>
              )}
              {matchedInvoices.map((inv: PaymentInvoice) => (
                <ListItemButton
                  key={inv.id}
                  onClick={() => {
                    setSearchOpen(false);
                    router.push('/subscriptions');
                  }}
                  sx={{ borderRadius: 1, my: 0.2 }}
                >
                  <ListItemIcon sx={{ minWidth: 36, color: '#6366F1' }}>
                    <CreditCard size={18} />
                  </ListItemIcon>
                  <ListItemText
                    primary={<Typography variant="body2" sx={{ fontWeight: 700 }}>{`${inv.invoiceNumber} — $${inv.amount}`}</Typography>}
                    secondary={<Typography variant="caption" sx={{ color: 'text.secondary' }}>{`${inv.orgName} • Status: ${inv.status}`}</Typography>}
                  />
                  <ArrowRight size={16} color="#94A3B8" />
                </ListItemButton>
              ))}

              {matchedOrgs.length === 0 && matchedKiosks.length === 0 && matchedInvoices.length === 0 && (
                <Typography variant="body2" sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>
                  No matching items found for "{searchQuery}".
                </Typography>
              )}
            </List>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
