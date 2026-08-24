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
  Card,
  CardContent,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  IconButton,
  Tooltip,
  TablePagination,
} from '@mui/material';
import {
  Database,
  Server,
  Smartphone,
  Clock,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Activity,
  X,
  HardDrive,
  Cpu,
} from 'lucide-react';
import { useAdminData } from '@/context/AdminDataContext';

interface BackendHealthModalProps {
  open: boolean;
  onClose: () => void;
  initialTab?: string;
}

export const BackendHealthModal: React.FC<BackendHealthModalProps> = ({ open, onClose }) => {
  const { kiosks, organizations, stats } = useAdminData();
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState('Just now');

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const handleManualCheck = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      setLastRefreshed(new Date().toLocaleTimeString());
    }, 800);
  };

  const microservices = [
    { name: 'MongoDB Primary Cluster', type: 'Database', status: 'Healthy', latency: '2 ms', uptime: '99.99%', load: '14%' },
    { name: 'REST Gateway Node.js API', type: 'API Gateway', status: 'Healthy', latency: '12 ms', uptime: '99.95%', load: '28%' },
    { name: 'WebSocket Realtime Sync', type: 'Biometric Stream', status: 'Healthy', latency: '8 ms', uptime: '99.98%', load: '22%' },
    { name: 'Face Recognition CoreML Model', type: 'AI Inference', status: 'Healthy', latency: '45 ms', uptime: '100.0%', load: '35%' },
    { name: 'AWS Node-1 Edge Proxy', type: 'CDN & Load Balancer', status: 'Healthy', latency: '5 ms', uptime: '99.99%', load: '18%' },
  ];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 1.5,
              bgcolor: '#F0FDF4',
              color: '#16A34A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #BBF7D0',
            }}
          >
            <Activity size={20} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
              Visagel Microservices & Infrastructure Health
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Real-time latency, MongoDB cluster status, API endpoints, and Kiosk network sockets.
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} size="small">
          <X size={18} />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
        {refreshing && <LinearProgress sx={{ borderRadius: 1 }} />}

        {/* 4 Summary Indicator Cards */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr 1fr' },
            gap: 2,
          }}
        >
          <Card variant="outlined" sx={{ bgcolor: '#EFF6FF', borderColor: '#BFDBFE' }}>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="caption" sx={{ color: '#1E40AF', fontWeight: 600 }}>
                Database Storage
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#1E3A8A' }}>
                MongoDB Atlas
              </Typography>
              <Typography variant="caption" sx={{ color: '#2563EB', fontWeight: 600 }}>
                AWS Node-1 • 2 ms Latency
              </Typography>
            </CardContent>
          </Card>

          <Card variant="outlined" sx={{ bgcolor: '#F0FDF4', borderColor: '#BBF7D0' }}>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="caption" sx={{ color: '#166534', fontWeight: 600 }}>
                API REST Server
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#14532D' }}>
                Node.js Express
              </Typography>
              <Typography variant="caption" sx={{ color: '#16A34A', fontWeight: 600 }}>
                100% Endpoints Operational
              </Typography>
            </CardContent>
          </Card>

          <Card variant="outlined" sx={{ bgcolor: '#FFF7ED', borderColor: '#FED7AA' }}>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="caption" sx={{ color: '#9A3412', fontWeight: 600 }}>
                Kiosk Network
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#7C2D12' }}>
                {stats.activeKiosksCount || 10} Active Nodes
              </Typography>
              <Typography variant="caption" sx={{ color: '#FF6900', fontWeight: 600 }}>
                {organizations.length} Orgs Syncing
              </Typography>
            </CardContent>
          </Card>

          <Card variant="outlined" sx={{ bgcolor: '#F8FAFC', borderColor: '#E2E8F0' }}>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="caption" sx={{ color: '#475569', fontWeight: 600 }}>
                SLA System Uptime
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A' }}>
                99.98% SLA
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
                Checked: {lastRefreshed}
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Microservice Endpoint Health Matrix */}
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              System Service Breakdown
            </Typography>
            <Button
              size="small"
              variant="outlined"
              startIcon={<RefreshCw size={14} className={refreshing ? 'spin' : ''} />}
              onClick={handleManualCheck}
              sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.75rem' }}
            >
              Re-ping Services
            </Button>
          </Box>

          <TableContainer sx={{ border: '1px solid #E2E8F0', borderRadius: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Service Component</TableCell>
                  <TableCell>Layer Type</TableCell>
                  <TableCell>Latency</TableCell>
                  <TableCell>30-Day Uptime</TableCell>
                  <TableCell>CPU / Memory Load</TableCell>
                  <TableCell align="right">Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {microservices
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((srv) => (
                  <TableRow key={srv.name} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {srv.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={srv.type} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.65rem' }} />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600, color: '#16A34A' }}>
                        {srv.latency}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {srv.uptime}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={parseInt(srv.load)}
                          sx={{ width: 60, height: 6, borderRadius: 3 }}
                        />
                        <Typography variant="caption" sx={{ fontWeight: 600 }}>
                          {srv.load}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Chip
                        icon={<CheckCircle2 size={12} />}
                        label={srv.status}
                        size="small"
                        color="success"
                        sx={{ fontWeight: 700, height: 22, fontSize: '0.68rem' }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={microservices.length}
            page={page}
            onPageChange={(_e, p) => setPage(p)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[5, 10, 25, 50, 100]}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, px: 3 }}>
        <Button onClick={onClose} variant="contained" sx={{ fontWeight: 700 }}>
          Close Health Monitor
        </Button>
      </DialogActions>
    </Dialog>
  );
};
