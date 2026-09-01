'use client';
import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Tooltip,
  Alert,
  Snackbar,
  Grid,
} from '@mui/material';
import {
  Key,
  Plus,
  Trash2,
  Copy,
  Check,
  CheckCircle2,
  Globe,
  Sliders,
  ShieldCheck,
  Zap,
  Activity,
  X,
  ExternalLink,
  Code2,
} from 'lucide-react';
import { Organization, OrgApiKey, OrgApiEndpoint } from '@/types';
import { useAdminData } from '@/context/AdminDataContext';

interface OrgApiGatewayCardProps {
  organization: Organization;
}

export const OrgApiGatewayCard: React.FC<OrgApiGatewayCardProps> = ({ organization }) => {
  const { addOrgApiKey, revokeOrgApiKey, toggleOrgApiEndpoint } = useAdminData();

  const apiKeys: OrgApiKey[] = organization.apiKeys || [
    {
      id: 'key-default-01',
      name: 'Default Kiosk Biometric Gateway',
      keyPrefix: `${organization.secretApiKey.slice(0, 14)}...`,
      fullKeySecret: organization.secretApiKey,
      scope: 'KIOSK_STREAM',
      rateLimitPerMin: 1000,
      status: 'ACTIVE',
      createdAt: organization.createdAt,
      lastUsedAt: 'Just now',
      totalCalls24h: 1420,
    },
  ];

  const endpoints: OrgApiEndpoint[] = organization.customEndpoints || [
    { id: 'ep-1', route: '/api/v2/punch/verify-face', method: 'POST', rateLimit: 1000, isEnabled: true, avgLatencyMs: 22, successRate: '99.98%' },
    { id: 'ep-2', route: '/api/v2/roster/sync-employees', method: 'POST', rateLimit: 300, isEnabled: true, avgLatencyMs: 35, successRate: '100%' },
    { id: 'ep-3', route: '/api/v2/kiosks/heartbeat', method: 'POST', rateLimit: 600, isEnabled: true, avgLatencyMs: 6, successRate: '100%' },
    { id: 'ep-4', route: '/api/v2/reports/daily-attendance', method: 'GET', rateLimit: 120, isEnabled: true, avgLatencyMs: 48, successRate: '99.90%' },
  ];

  // Modals & State
  const [openCreateKey, setOpenCreateKey] = useState(false);
  const [keyName, setKeyName] = useState('');
  const [keyScope, setKeyScope] = useState<'READ_ONLY' | 'READ_WRITE' | 'ADMIN_FULL' | 'KIOSK_STREAM'>('READ_WRITE');
  const [keyRateLimit, setKeyRateLimit] = useState(1000);
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<OrgApiKey | null>(null);

  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);
  const [snackbarMsg, setSnackbarMsg] = useState<string | null>(null);

  const handleGenerateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyName) return;

    const generated = await addOrgApiKey(organization.id, {
      name: keyName,
      scope: keyScope,
      rateLimitPerMin: keyRateLimit,
      status: 'ACTIVE',
    });

    setNewlyCreatedKey(generated);
    setKeyName('');
    setSnackbarMsg(`Provisioned API Key for ${organization.name}`);
  };

  const handleCopyKey = (keyText: string, id: string) => {
    navigator.clipboard.writeText(keyText);
    setCopiedKeyId(id);
    setTimeout(() => setCopiedKeyId(null), 2500);
  };

  const handleRevoke = async (keyId: string) => {
    if (confirm('Are you sure you want to revoke this API key? Applications and kiosks using this token will be disconnected immediately.')) {
      await revokeOrgApiKey(organization.id, keyId);
      setSnackbarMsg('API Key revoked successfully.');
    }
  };

  const handleToggleEndpoint = async (epId: string, currentEnabled: boolean) => {
    await toggleOrgApiEndpoint(organization.id, epId, !currentEnabled);
    setSnackbarMsg(`Route status updated.`);
  };

  return (
    <Card variant="outlined" sx={{ bgcolor: '#FFFFFF' }}>
      <CardContent sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2, flexWrap: 'wrap', gap: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: 2,
                bgcolor: '#FFF7ED',
                color: '#FF6900',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #FED7AA',
              }}
            >
              <Key size={20} />
            </Box>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                  Organization API Gateway & Rate Limit Routing
                </Typography>
                <Chip label={`${apiKeys.filter((k) => k.status === 'ACTIVE').length} Active Keys`} size="small" sx={{ bgcolor: '#F0FDF4', color: '#16A34A', fontWeight: 700, fontSize: '0.65rem' }} />
              </Box>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Manage scoped API tokens, webhook endpoints, and per-tenant rate throttling for {organization.name}.
              </Typography>
            </Box>
          </Box>

          <Button
            variant="contained"
            startIcon={<Plus size={16} />}
            onClick={() => {
              setNewlyCreatedKey(null);
              setOpenCreateKey(true);
            }}
            sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.8125rem' }}
          >
            Provision API Key
          </Button>
        </Box>

        {/* 1. API Keys Table */}
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <ShieldCheck size={16} color="#2563EB" /> Scoped Client API Keys
        </Typography>

        <TableContainer sx={{ border: '1px solid #E2E8F0', borderRadius: 1.5, mb: 3 }}>
          <Table size="small">
            <TableHead sx={{ bgcolor: '#F8FAFC' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Key Label & Secret Token</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Access Scope</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Rate Limit (req/min)</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>24h Volume</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Last Active</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {apiKeys.map((key) => (
                <TableRow key={key.id} hover>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {key.name}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.2 }}>
                      <Typography variant="caption" sx={{ fontFamily: 'monospace', color: '#64748B', fontWeight: 600 }}>
                        {key.keyPrefix}
                      </Typography>
                      {key.fullKeySecret && (
                        <Tooltip title={copiedKeyId === key.id ? 'Copied!' : 'Copy API Secret Token'}>
                          <IconButton size="small" onClick={() => handleCopyKey(key.fullKeySecret!, key.id)} sx={{ p: 0.2 }}>
                            {copiedKeyId === key.id ? <Check size={12} color="#16A34A" /> : <Copy size={12} />}
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>

                  <TableCell>
                    <Chip
                      label={key.scope}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: '0.62rem',
                        fontWeight: 700,
                        bgcolor: key.scope === 'KIOSK_STREAM' ? '#FFF7ED' : key.scope === 'ADMIN_FULL' ? '#FEF2F2' : '#EFF6FF',
                        color: key.scope === 'KIOSK_STREAM' ? '#FF6900' : key.scope === 'ADMIN_FULL' ? '#DC2626' : '#2563EB',
                      }}
                    />
                  </TableCell>

                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: 'monospace' }}>
                      {key.rateLimitPerMin} req/m
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A' }}>
                      {key.totalCalls24h || 0} reqs
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {key.lastUsedAt || 'Never'}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Chip
                      label={key.status}
                      size="small"
                      color={key.status === 'ACTIVE' ? 'success' : 'default'}
                      sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700 }}
                    />
                  </TableCell>

                  <TableCell align="right">
                    {key.status === 'ACTIVE' && (
                      <Tooltip title="Revoke API Token Access">
                        <IconButton size="small" color="error" onClick={() => handleRevoke(key.id)}>
                          <Trash2 size={14} />
                        </IconButton>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* 2. Organization REST Endpoint Matrices */}
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Globe size={16} color="#16A34A" /> Active Organization API Endpoints & Route Policies
        </Typography>

        <TableContainer sx={{ border: '1px solid #E2E8F0', borderRadius: 1.5 }}>
          <Table size="small">
            <TableHead sx={{ bgcolor: '#F8FAFC' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>HTTP Method & Route</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Rate Throttle Guard</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Avg Latency</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Success Ratio</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>Endpoint State</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {endpoints.map((ep) => (
                <TableRow key={ep.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip
                        label={ep.method}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: '0.65rem',
                          fontWeight: 800,
                          bgcolor: ep.method === 'POST' ? '#EFF6FF' : '#F0FDF4',
                          color: ep.method === 'POST' ? '#2563EB' : '#16A34A',
                        }}
                      />
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.8rem' }}>
                        {ep.route}
                      </Typography>
                    </Box>
                  </TableCell>

                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {ep.rateLimit} req/min
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 700, color: '#16A34A' }}>
                      {ep.avgLatencyMs} ms
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#2563EB' }}>
                      {ep.successRate}
                    </Typography>
                  </TableCell>

                  <TableCell align="right">
                    <FormControlLabel
                      control={
                        <Switch
                          size="small"
                          checked={ep.isEnabled}
                          onChange={() => handleToggleEndpoint(ep.id, ep.isEnabled)}
                          color="success"
                        />
                      }
                      label={
                        <Typography variant="caption" sx={{ fontWeight: 700, color: ep.isEnabled ? '#16A34A' : 'text.secondary' }}>
                          {ep.isEnabled ? 'Active' : 'Disabled'}
                        </Typography>
                      }
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>

      {/* Provision API Key Modal */}
      <Dialog open={openCreateKey} onClose={() => setOpenCreateKey(false)} maxWidth="sm" fullWidth>
        {newlyCreatedKey ? (
          <Box sx={{ p: 3 }}>
            <DialogTitle sx={{ p: 0, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <CheckCircle2 color="#16A34A" /> API Key Generated Successfully!
            </DialogTitle>
            <Alert severity="warning" sx={{ mb: 2, fontWeight: 600 }}>
              Please copy this key now. For security purposes, this full token secret will not be displayed again.
            </Alert>
            <Box sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: 2, border: '1px solid #E2E8F0', mb: 2 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>Key Secret Token</Typography>
              <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 700, wordBreak: 'break-all', my: 0.5, color: '#FF6900' }}>
                {newlyCreatedKey.fullKeySecret}
              </Typography>
              <Button
                size="small"
                variant="outlined"
                startIcon={copiedKeyId === newlyCreatedKey.id ? <Check size={14} /> : <Copy size={14} />}
                onClick={() => handleCopyKey(newlyCreatedKey.fullKeySecret!, newlyCreatedKey.id)}
                sx={{ mt: 1 }}
              >
                {copiedKeyId === newlyCreatedKey.id ? 'Copied Token' : 'Copy Token'}
              </Button>
            </Box>
            <Button fullWidth variant="contained" onClick={() => setOpenCreateKey(false)}>
              Done
            </Button>
          </Box>
        ) : (
          <form onSubmit={handleGenerateKey}>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                Generate Organization API Key
              </Typography>
              <IconButton onClick={() => setOpenCreateKey(false)} size="small">
                <X size={18} />
              </IconButton>
            </DialogTitle>

            <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, p: 3 }}>
              <TextField
                label="API Key Description / Identifier"
                required
                fullWidth
                size="small"
                value={keyName}
                onChange={(e) => setKeyName(e.target.value)}
                placeholder="e.g. HR Workday Webhook Sync Key"
              />

              <FormControl fullWidth size="small">
                <InputLabel>Permission Scope</InputLabel>
                <Select
                  value={keyScope}
                  label="Permission Scope"
                  onChange={(e) => setKeyScope(e.target.value as any)}
                >
                  <MenuItem value="KIOSK_STREAM">KIOSK_STREAM (Biometric punch streaming & liveness verification)</MenuItem>
                  <MenuItem value="READ_WRITE">READ_WRITE (Attendance & roster management)</MenuItem>
                  <MenuItem value="READ_ONLY">READ_ONLY (Read-only analytics and audit logs)</MenuItem>
                  <MenuItem value="ADMIN_FULL">ADMIN_FULL (Full root tenant privileges)</MenuItem>
                </Select>
              </FormControl>

              <TextField
                label="Rate Limit (Requests per minute)"
                type="number"
                fullWidth
                size="small"
                value={keyRateLimit}
                onChange={(e) => setKeyRateLimit(Number(e.target.value))}
                slotProps={{ htmlInput: { min: 60, max: 10000 } }}
              />
            </DialogContent>

            <DialogActions sx={{ p: 2, px: 3 }}>
              <Button onClick={() => setOpenCreateKey(false)}>Cancel</Button>
              <Button type="submit" variant="contained" disabled={!keyName}>
                Generate Token
              </Button>
            </DialogActions>
          </form>
        )}
      </Dialog>

      {/* Snackbar feedback */}
      <Snackbar
        open={Boolean(snackbarMsg)}
        autoHideDuration={3000}
        onClose={() => setSnackbarMsg(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity="success" onClose={() => setSnackbarMsg(null)} sx={{ fontWeight: 600 }}>
          {snackbarMsg}
        </Alert>
      </Snackbar>
    </Card>
  );
};
