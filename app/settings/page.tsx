'use client';
import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  Snackbar,
} from '@mui/material';
import { Sliders, Shield, Key, RefreshCw, Smartphone, Server } from 'lucide-react';
import { useAdminData } from '@/context/AdminDataContext';

export default function SettingsPage() {
  const { resetToMockData } = useAdminData();
  const [globalKey, setGlobalKey] = useState('vg_master_root_998124fa09c812');
  const [allowPublicSelfEnroll, setAllowPublicSelfEnroll] = useState(false);
  const [autoSuspendOverdue, setAutoSuspendOverdue] = useState(true);
  const [dailyDigestEmail, setDailyDigestEmail] = useState('super@visagel.ai');
  const [snackbarMsg, setSnackbarMsg] = useState('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSnackbarMsg('Global system settings updated successfully!');
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          Super Admin Global Settings & Security
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
          Master API keys, tenant security policies, automated payment grace periods, and backend synchronization.
        </Typography>
      </Box>

      <form onSubmit={handleSave}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Master API Gateway */}
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <Key size={20} color="#FF6900" />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Master Gateway API Key
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                Used by cloud microservices and mobile application edge servers to validate tenant organization access tokens.
              </Typography>
              <TextField
                fullWidth
                label="Master Super Admin Token"
                value={globalKey}
                onChange={(e) => setGlobalKey(e.target.value)}
                sx={{ fontFamily: 'monospace' }}
              />
            </CardContent>
          </Card>

          {/* Tenant Policies */}
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <Shield size={20} color="#6366F1" />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Tenant Access & Automated Suspension Policies
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={autoSuspendOverdue}
                      onChange={(e) => setAutoSuspendOverdue(e.target.checked)}
                      color="primary"
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        Auto-Suspend Terminals on Overdue Payment
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        Automatically deny biometric clock-in scans if the organization's invoice is overdue past 7 days.
                      </Typography>
                    </Box>
                  }
                />
                <Divider />
                <FormControlLabel
                  control={
                    <Switch
                      checked={allowPublicSelfEnroll}
                      onChange={(e) => setAllowPublicSelfEnroll(e.target.checked)}
                      color="primary"
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        Allow Employee QR Self-Enrolment
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        Allow client companies to let employees upload their biometric face model via self-service QR code.
                      </Typography>
                    </Box>
                  }
                />
              </Box>
            </CardContent>
          </Card>

          {/* Super Admin Digest */}
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <Server size={20} color="#10B981" />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  System Notification Recipient
                </Typography>
              </Box>
              <TextField
                fullWidth
                label="Super Admin Daily Digest Email"
                type="email"
                value={dailyDigestEmail}
                onChange={(e) => setDailyDigestEmail(e.target.value)}
              />
            </CardContent>
          </Card>

          {/* Factory Reset Data */}
          <Card sx={{ border: '1px solid rgba(239, 68, 68, 0.3)' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: 'error.main', mb: 1 }}>
                Danger Zone & Demo Reset
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                Reset all organizations, punch records, employees, and invoices back to initial mock presets.
              </Typography>
              <Button
                variant="outlined"
                color="error"
                startIcon={<RefreshCw size={16} />}
                onClick={() => {
                  if (confirm('Reset entire system database to default mock state?')) {
                    resetToMockData();
                    setSnackbarMsg('System data reset to defaults!');
                  }
                }}
                sx={{ fontWeight: 600 }}
              >
                Reset System State to Default Mock
              </Button>
            </CardContent>
          </Card>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button type="submit" variant="contained" sx={{ fontWeight: 700, px: 4, py: 1.2 }}>
              Save Settings
            </Button>
          </Box>
        </Box>
      </form>

      <Snackbar
        open={Boolean(snackbarMsg)}
        autoHideDuration={3000}
        onClose={() => setSnackbarMsg('')}
      >
        <Alert severity="success" variant="filled">
          {snackbarMsg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
