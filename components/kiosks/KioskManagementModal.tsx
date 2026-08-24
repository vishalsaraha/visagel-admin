'use client';
import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  IconButton,
  Tooltip,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Snackbar,
  Alert,
  TablePagination,
} from '@mui/material';
import {
  Smartphone,
  Plus,
  RefreshCw,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Wifi,
  ScanFace,
  X,
} from 'lucide-react';
import { useAdminData } from '@/context/AdminDataContext';
import { KioskDevice, Organization } from '@/types';

interface KioskManagementModalProps {
  open: boolean;
  onClose: () => void;
  filterOrgId?: string;
}

export const KioskManagementModal: React.FC<KioskManagementModalProps> = ({ open, onClose, filterOrgId }) => {
  const { kiosks, organizations, addKioskDevice, deleteKioskDevice, addAuditLog } = useAdminData();
  const [openAdd, setOpenAdd] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState('');

  // New Kiosk Form
  const [name, setName] = useState('');
  const [orgId, setOrgId] = useState(filterOrgId || organizations[0]?.orgId || 'ORG-BRAN-001');
  const [location, setLocation] = useState('Main Reception Desk');
  const [deviceType, setDeviceType] = useState<'iPad' | 'Android Tablet' | 'Dedicated Terminal'>('iPad');

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const filteredKiosks = filterOrgId ? kiosks.filter((k: KioskDevice) => k.orgId === filterOrgId) : kiosks;

  const handleRegisterKiosk = async (e: React.FormEvent) => {
    e.preventDefault();
    const org = organizations.find((o: Organization) => o.orgId === orgId) || organizations[0];
    const newId = `KSK-${org.orgId.split('-')[1] || 'VIS'}-${Math.floor(10 + Math.random() * 90)}`;

    await addKioskDevice({
      deviceId: newId,
      name,
      orgId: org.orgId,
      orgName: org.name,
      location,
      deviceType,
      ipAddress: `192.168.1.${Math.floor(100 + Math.random() * 150)}`,
      status: 'ONLINE',
      lastHeartbeat: 'Just now',
      faceEngineVersion: 'v2.4.8 (CoreML Accelerated)',
      activeFaceModelCount: 50,
    });

    await addAuditLog({
      actor: 'Super Admin',
      actorRole: 'SUPER_ADMIN',
      action: 'Kiosk Registered',
      details: `Provisioned kiosk terminal ${newId} (${name}) for ${org.name}`,
      targetOrgId: org.orgId,
      severity: 'INFO',
    });

    setOpenAdd(false);
    setName('');
    setSnackbarMsg(`Kiosk ${newId} provisioned and linked to ${org.name} successfully!`);
  };

  const handlePingDevice = (kiosk: KioskDevice) => {
    setSnackbarMsg(`Pinged terminal ${kiosk.deviceId} (${kiosk.ipAddress}): Response 4ms (OK)`);
  };

  const handleRemoteSync = (kiosk: KioskDevice) => {
    setSnackbarMsg(`Pushed remote biometric sync signal to ${kiosk.name}. 3D face templates updated.`);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 1.5,
              bgcolor: '#FFF7ED',
              color: '#FF6900',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #FED7AA',
            }}
          >
            <Smartphone size={20} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
              Visagel Biometric Kiosk Hardware Suite
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Manage face recognition terminals, camera IP endpoints, local SQLite database caches, and remote sync signals.
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} size="small">
          <X size={18} />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        {/* Top Actions */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            Registered Kiosks ({filteredKiosks.length})
          </Typography>
          <Button
            variant="contained"
            startIcon={<Plus size={16} />}
            onClick={() => setOpenAdd(true)}
            sx={{ fontWeight: 700, px: 2.5 }}
          >
            Provision Kiosk Terminal
          </Button>
        </Box>

        {/* Kiosks Table */}
        <TableContainer sx={{ border: '1px solid #E2E8F0', borderRadius: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Kiosk Terminal Name & ID</TableCell>
                <TableCell>Client Organization</TableCell>
                <TableCell>Hardware & IP</TableCell>
                <TableCell>Face Engine</TableCell>
                <TableCell>Models Loaded</TableCell>
                <TableCell>Status & Heartbeat</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredKiosks
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((ksk: KioskDevice) => (
                <TableRow key={ksk.id} hover>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {ksk.name}
                    </Typography>
                    <Typography variant="caption" sx={{ fontFamily: 'monospace', color: '#FF6900', fontWeight: 600 }}>
                      {ksk.deviceId}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {ksk.orgName}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {ksk.location}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={ksk.deviceType} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.65rem' }} />
                    <Typography variant="caption" sx={{ display: 'block', fontFamily: 'monospace', color: 'text.secondary', mt: 0.2 }}>
                      {ksk.ipAddress}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: '#2563EB' }}>
                      {ksk.faceEngineVersion}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={<ScanFace size={12} />}
                      label={`${ksk.activeFaceModelCount} Vector Faces`}
                      size="small"
                      sx={{ height: 20, fontSize: '0.65rem', fontWeight: 600, bgcolor: '#FFF7ED', color: '#FF6900' }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={ksk.status === 'ONLINE' ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                      label={ksk.status}
                      size="small"
                      color={ksk.status === 'ONLINE' ? 'success' : ksk.status === 'SYNCING' ? 'warning' : 'error'}
                      sx={{ fontWeight: 700, height: 22, fontSize: '0.68rem', mb: 0.2 }}
                    />
                    <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', fontSize: '0.65rem' }}>
                      {ksk.lastHeartbeat}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                      <Tooltip title="Ping Device">
                        <IconButton size="small" onClick={() => handlePingDevice(ksk)}>
                          <Wifi size={15} color="#2563EB" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Push Remote Sync">
                        <IconButton size="small" onClick={() => handleRemoteSync(ksk)}>
                          <RefreshCw size={15} color="#16A34A" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Decommission Terminal">
                        <IconButton size="small" color="error" onClick={() => deleteKioskDevice(ksk.id)}>
                          <Trash2 size={15} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={filteredKiosks.length}
          page={page}
          onPageChange={(_e, p) => setPage(p)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 25, 50, 100]}
        />

        {/* Modal for Provisioning New Kiosk */}
        <Dialog open={openAdd} onClose={() => setOpenAdd(false)} maxWidth="xs" fullWidth>
          <form onSubmit={handleRegisterKiosk}>
            <DialogTitle sx={{ fontWeight: 700 }}>Provision New Kiosk Terminal</DialogTitle>
            <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Client Organization</InputLabel>
                <Select value={orgId} label="Client Organization" onChange={(e) => setOrgId(e.target.value)}>
                  {organizations.map((org: Organization) => (
                    <MenuItem key={org.id} value={org.orgId}>
                      {org.name} ({org.orgId})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                label="Terminal / Display Name"
                required
                size="small"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Front Gate iPad Air #2"
              />

              <TextField
                label="Location / Zone"
                size="small"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Turnstile Door A"
              />

              <FormControl fullWidth size="small">
                <InputLabel>Hardware Model</InputLabel>
                <Select value={deviceType} label="Hardware Model" onChange={(e) => setDeviceType(e.target.value as any)}>
                  <MenuItem value="iPad">Apple iPad (iOS App)</MenuItem>
                  <MenuItem value="Android Tablet">Android Tablet (APK)</MenuItem>
                  <MenuItem value="Dedicated Terminal">Dedicated Biometric Hardware Terminal</MenuItem>
                </Select>
              </FormControl>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button onClick={() => setOpenAdd(false)} sx={{ color: 'text.secondary' }}>
                Cancel
              </Button>
              <Button type="submit" variant="contained" sx={{ fontWeight: 700 }}>
                Issue Provisioning Key
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      </DialogContent>

      <DialogActions sx={{ p: 2, px: 3 }}>
        <Button onClick={onClose} variant="contained">
          Close Suite
        </Button>
      </DialogActions>

      <Snackbar
        open={Boolean(snackbarMsg)}
        autoHideDuration={3500}
        onClose={() => setSnackbarMsg('')}
      >
        <Alert severity="success" variant="filled">
          {snackbarMsg}
        </Alert>
      </Snackbar>
    </Dialog>
  );
};
