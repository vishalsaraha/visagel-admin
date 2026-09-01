'use client';
import React, { useState, useEffect } from 'react';
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
  Tabs,
  Tab,
  Switch,
  FormControlLabel,
  Snackbar,
  Alert,
  Divider,
  Badge,
  Grid,
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
  Radio,
  ShieldCheck,
  RotateCcw,
  Wifi,
  WifiOff,
  Bell,
  Sliders,
  Play,
  ArrowUpRight,
  Layers,
  Terminal,
  Lock,
  Globe,
  Flame,
} from 'lucide-react';
import { useAdminData } from '@/context/AdminDataContext';

interface BackendHealthModalProps {
  open: boolean;
  onClose: () => void;
  initialTab?: number;
}

export const BackendHealthModal: React.FC<BackendHealthModalProps> = ({ open, onClose, initialTab = 0 }) => {
  const { kiosks, organizations, stats } = useAdminData();
  const [activeTab, setActiveTab] = useState<number>(initialTab);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState('Just now');
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);

  // Auto-refresh simulation (WebSocket polling toggle)
  const [liveStreamEnabled, setLiveStreamEnabled] = useState(true);
  const [liveTick, setLiveTick] = useState(0);

  // Pagination states for sub-tables
  const [dbQueryPage, setDbQueryPage] = useState(0);
  const [apiRoutePage, setApiRoutePage] = useState(0);
  const [kioskDiagPage, setKioskDiagPage] = useState(0);
  const [incidentPage, setIncidentPage] = useState(0);

  // Update active tab when initialTab changes on open
  useEffect(() => {
    if (open && initialTab !== undefined) {
      setActiveTab(initialTab);
    }
  }, [open, initialTab]);

  // Live polling simulator
  useEffect(() => {
    if (!liveStreamEnabled || !open) return;
    const interval = setInterval(() => {
      setLiveTick((prev) => prev + 1);
    }, 3000);
    return () => clearInterval(interval);
  }, [liveStreamEnabled, open]);

  const handleManualCheck = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      setLastRefreshed(new Date().toLocaleTimeString());
      setSnackbarMessage('Telemetry refreshed from AWS Node-1 & Kiosk socket gateway.');
    }, 700);
  };

  // --- TAB 1: DATABASE METRICS ---
  const dbMetrics = {
    clusterName: 'AWS Node-1 Primary Replica Set',
    region: 'ap-south-1 (Mumbai)',
    mongoVersion: 'v7.0.5 Enterprise',
    replicaLag: '< 4 ms',
    syncState: 'PRIMARY_SYNCED',
    failoverReadiness: 'READY (2 Secondaries in Hot Standby)',
    activeConnections: 42 + (liveTick % 5),
    maxPoolSize: 200,
    indexHitRatio: '99.4%',
    diskUsedGB: 18.4,
    diskTotalGB: 100,
    dailyBackupStatus: 'Verified (04:00 AM UTC)',
    backupRetention: '30 Days Automated',
  };

  const slowQueries = [
    { query: 'db.punches.aggregate([{ $match: { orgId } }, { $group }])', execTime: '42 ms', indexUsed: 'orgId_1_timestamp_1', hits: '1,420/min', status: 'Optimized' },
    { query: 'db.enrolled_employees.find({ vectorVector: { $near } })', execTime: '68 ms', indexUsed: 'face_embedding_2dsphere', hits: '890/min', status: 'Indexed' },
    { query: 'db.audit_logs.find({ timestamp: { $gte } }).sort({ -1 })', execTime: '18 ms', indexUsed: 'timestamp_-1', hits: '340/min', status: 'Fast' },
    { query: 'db.kiosks.updateOne({ deviceId }, { $set: { heartbeat } })', execTime: '4 ms', indexUsed: 'deviceId_unique', hits: '3,200/min', status: 'In-Memory Cache' },
    { query: 'db.organizations.aggregate([{ $lookup: "invoices" }])', execTime: '88 ms', indexUsed: 'orgId_composite', hits: '45/min', status: 'Cached (TTL 5m)' },
  ];

  // --- TAB 2: API SERVER METRICS ---
  const apiMetrics = {
    runtime: 'Node.js v20.11.0 LTS (Cluster Mode - 4 Workers)',
    avgLatency: `${12 + (liveTick % 4)} ms`,
    p95Latency: '24 ms',
    p99Latency: '48 ms',
    rps: 184 + (liveTick % 19),
    payloadThroughput: '4.8 MB/s',
    rateLimitRules: '1,000 req/min per Org API Key',
    blockedRequests24h: 14,
    jwtHealth: 'Active (RS256 4096-bit Key Rotation)',
    corsStatus: 'Enforced (Whitelisted Client Domains)',
  };

  const apiEndpoints = [
    { method: 'POST', path: '/api/v2/biometrics/verify-face', rps: 120, avgLatency: '22 ms', p99: '45 ms', status2xx: '99.98%', errorRate: '0.02%', status: 'HEALTHY' },
    { method: 'POST', path: '/api/v2/kiosks/heartbeat', rps: 34, avgLatency: '6 ms', p99: '12 ms', status2xx: '100%', errorRate: '0.00%', status: 'HEALTHY' },
    { method: 'GET', path: '/api/v2/organizations/sync-payload', rps: 18, avgLatency: '14 ms', p99: '28 ms', status2xx: '99.95%', errorRate: '0.05%', status: 'HEALTHY' },
    { method: 'POST', path: '/api/v2/auth/kiosk-handshake', rps: 8, avgLatency: '19 ms', p99: '35 ms', status2xx: '100%', errorRate: '0.00%', status: 'HEALTHY' },
    { method: 'GET', path: '/api/v2/reports/daily-attendance', rps: 4, avgLatency: '55 ms', p99: '110 ms', status2xx: '100%', errorRate: '0.00%', status: 'HEALTHY' },
  ];

  // --- TAB 3: KIOSK NETWORK TELEMETRY ---
  const kioskTelemetryList = kiosks.map((k, idx) => ({
    ...k,
    cpuTemp: `${38 + ((idx * 3 + liveTick) % 7)}°C`,
    ramUsage: `${42 + ((idx * 5 + liveTick) % 15)}%`,
    diskFree: `${idx % 2 === 0 ? '18.4' : '24.1'} GB`,
    firmwareVersion: 'v3.4.2-prod',
    pendingOfflineQueue: idx === 1 ? 0 : idx === 2 ? 2 : 0,
    handshakeStatus: k.status === 'ONLINE' ? 'SYNCHRONIZED' : 'OFFLINE_CACHE',
    signalStrength: idx === 0 ? 'Excellent (-52 dBm)' : idx === 1 ? 'Good (-64 dBm)' : 'Strong (-58 dBm)',
  }));

  // --- TAB 4: SLA & INFRASTRUCTURE UPTIME ---
  const uptimeMetrics = {
    targetSLA: '99.900%',
    actual30Day: '99.982%',
    totalUptimeHours: '719.87 hrs / 720 hrs',
    cpuHost: `${16 + (liveTick % 6)}%`,
    memoryHost: '4.2 GB / 16.0 GB (26%)',
    networkBandwidth: `${24.5 + (liveTick % 3).toFixed(1)} Mbps In / 68.2 Mbps Out`,
    webhookStatus: 'Configured (Slack #ops-alerts, PagerDuty, Email)',
  };

  const incidents = [
    { date: 'Aug 24, 2026', duration: '1.2 mins', title: 'Automated DB Secondary Step-Down drill', impact: 'Zero punch loss, routed to standby', severity: 'MAINTENANCE' },
    { date: 'Aug 11, 2026', duration: '3.4 mins', title: 'Edge Cloudflare Route Latency in ap-south', impact: 'Terminals buffered to SQLite and auto-flushed', severity: 'RESOLVED' },
    { date: 'Jul 29, 2026', duration: '0.8 mins', title: 'Node.js Memory GC Optimization deployment', impact: 'Zero downtime rolling update', severity: 'RESOLVED' },
  ];

  const triggerRemoteReboot = (deviceId: string) => {
    setSnackbarMessage(`Remote reboot command dispatched to ${deviceId} over encrypted WebSocket.`);
  };

  const triggerOTAUpdate = (deviceId: string) => {
    setSnackbarMessage(`OTA Firmware v3.4.3 push queued for ${deviceId}. Device will apply on idle.`);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ p: 2.5, pb: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: 2,
              bgcolor: '#F0FDF4',
              color: '#16A34A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #BBF7D0',
            }}
          >
            <Activity size={22} />
          </Box>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                Visagel Production Infrastructure Telemetry
              </Typography>
              <Chip
                label="LIVE CLUSTER"
                size="small"
                sx={{
                  bgcolor: '#DCFCE7',
                  color: '#15803D',
                  fontWeight: 700,
                  fontSize: '0.65rem',
                  height: 20,
                  border: '1px solid #86EFAC',
                }}
              />
            </Box>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Real-time monitoring across MongoDB AWS Node-1, REST API Gateway, Kiosk Edge Diagnostics, and SLA Metrics.
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FormControlLabel
            control={
              <Switch
                size="small"
                checked={liveStreamEnabled}
                onChange={(e) => setLiveStreamEnabled(e.target.checked)}
                color="success"
              />
            }
            label={
              <Typography variant="caption" sx={{ fontWeight: 600, color: liveStreamEnabled ? '#16A34A' : 'text.secondary' }}>
                {liveStreamEnabled ? 'Live Sync' : 'Paused'}
              </Typography>
            }
            sx={{ mr: 1 }}
          />
          <Tooltip title="Re-ping all microservices and edge sockets">
            <Button
              size="small"
              variant="outlined"
              startIcon={<RefreshCw size={14} className={refreshing ? 'spin' : ''} />}
              onClick={handleManualCheck}
              sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.75rem' }}
            >
              Re-ping
            </Button>
          </Tooltip>
          <IconButton onClick={onClose} size="small">
            <X size={18} />
          </IconButton>
        </Box>
      </DialogTitle>

      {refreshing && <LinearProgress sx={{ borderRadius: 0 }} />}

      {/* TABS NAVIGATION */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2.5, bgcolor: '#FAFAFA' }}>
        <Tabs
          value={activeTab}
          onChange={(_e, val) => setActiveTab(val)}
          textColor="primary"
          indicatorColor="primary"
          variant="scrollable"
          scrollButtons="auto"
          sx={{ minHeight: 48 }}
        >
          <Tab
            icon={<Database size={16} />}
            iconPosition="start"
            label="Database (MongoDB / AWS Node-1)"
            sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.8125rem' }}
          />
          <Tab
            icon={<Server size={16} />}
            iconPosition="start"
            label="API Server (Node.js / REST)"
            sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.8125rem' }}
          />
          <Tab
            icon={<Smartphone size={16} />}
            iconPosition="start"
            label={`Kiosk Network & Edge (${kiosks.length})`}
            sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.8125rem' }}
          />
          <Tab
            icon={<Clock size={16} />}
            iconPosition="start"
            label="Server Uptime & Infrastructure"
            sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.8125rem' }}
          />
        </Tabs>
      </Box>

      <DialogContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2.5, bgcolor: '#F8FAFC' }}>
        {/* ========================================================= */}
        {/* TAB 0: DATABASE (MONGODB / AWS NODE-1) */}
        {/* ========================================================= */}
        {activeTab === 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {/* Replication & Cluster Health Cards */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' },
                gap: 2,
              }}
            >
              <Card variant="outlined" sx={{ bgcolor: '#FFFFFF' }}>
                <CardContent sx={{ p: 2 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                    Replication Lag
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: '#16A34A', my: 0.5 }}>
                    {dbMetrics.replicaLag}
                  </Typography>
                  <Chip label="Target: <10ms" size="small" sx={{ height: 18, fontSize: '0.62rem', fontWeight: 600, bgcolor: '#F0FDF4', color: '#15803D' }} />
                </CardContent>
              </Card>

              <Card variant="outlined" sx={{ bgcolor: '#FFFFFF' }}>
                <CardContent sx={{ p: 2 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                    Connection Pool
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: '#2563EB', my: 0.5 }}>
                    {dbMetrics.activeConnections} / {dbMetrics.maxPoolSize}
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={(dbMetrics.activeConnections / dbMetrics.maxPoolSize) * 100}
                    sx={{ height: 4, borderRadius: 2, bgcolor: '#EFF6FF', '& .MuiLinearProgress-bar': { bgcolor: '#2563EB' } }}
                  />
                </CardContent>
              </Card>

              <Card variant="outlined" sx={{ bgcolor: '#FFFFFF' }}>
                <CardContent sx={{ p: 2 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                    Index Hit Ratio
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: '#0F172A', my: 0.5 }}>
                    {dbMetrics.indexHitRatio}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#16A34A', fontWeight: 600 }}>
                    Zero unindexed scans
                  </Typography>
                </CardContent>
              </Card>

              <Card variant="outlined" sx={{ bgcolor: '#FFFFFF' }}>
                <CardContent sx={{ p: 2 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                    Automated Backups
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', my: 0.5, fontSize: '1rem' }}>
                    {dbMetrics.dailyBackupStatus}
                  </Typography>
                  <Chip label="AWS S3 Encrypted" size="small" sx={{ height: 18, fontSize: '0.62rem', fontWeight: 600, bgcolor: '#EFF6FF', color: '#1D4ED8' }} />
                </CardContent>
              </Card>
            </Box>

            {/* Cluster Architecture & Failover Readiness */}
            <Card variant="outlined" sx={{ bgcolor: '#FFFFFF' }}>
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ShieldCheck size={18} color="#16A34A" />
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      Cluster Synchronization & Automated Failover Matrix
                    </Typography>
                  </Box>
                  <Chip label={dbMetrics.syncState} color="success" size="small" sx={{ fontWeight: 700, fontSize: '0.65rem' }} />
                </Box>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>Primary Node</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{dbMetrics.clusterName}</Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>{dbMetrics.region}</Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>Engine Version</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{dbMetrics.mongoVersion}</Typography>
                    <Typography variant="caption" sx={{ color: '#16A34A', fontWeight: 600 }}>WiredTiger Storage</Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>Storage Utilization</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{dbMetrics.diskUsedGB} GB / {dbMetrics.diskTotalGB} GB</Typography>
                    <LinearProgress variant="determinate" value={(dbMetrics.diskUsedGB / dbMetrics.diskTotalGB) * 100} sx={{ height: 4, borderRadius: 2, mt: 0.5 }} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>Failover Status</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#16A34A' }}>Active & Ready</Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>{dbMetrics.failoverReadiness}</Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Performance & Slow-Query Execution Logs */}
            <Card variant="outlined" sx={{ bgcolor: '#FFFFFF' }}>
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      Real-time Query Performance & Index Profiler
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      Monitors query execution time, memory index hits, and collection throughput.
                    </Typography>
                  </Box>
                  <Chip label="Top 5 Active Pipelines" size="small" sx={{ bgcolor: '#F1F5F9', fontWeight: 600, fontSize: '0.7rem' }} />
                </Box>

                <TableContainer sx={{ border: '1px solid #E2E8F0', borderRadius: 1.5 }}>
                  <Table size="small">
                    <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700 }}>Query Signature / Collection Pipeline</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Index Used</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Execution Latency</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Call Frequency</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700 }}>Profile</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {slowQueries
                        .slice(dbQueryPage * 5, dbQueryPage * 5 + 5)
                        .map((sq, idx) => (
                          <TableRow key={idx} hover>
                            <TableCell>
                              <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem', fontWeight: 600, color: '#0F172A' }}>
                                {sq.query}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip label={sq.indexUsed} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.65rem' }} />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 700, color: parseInt(sq.execTime) > 50 ? '#D97706' : '#16A34A' }}>
                                {sq.execTime}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="caption" sx={{ fontWeight: 600 }}>{sq.hits}</Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Chip
                                label={sq.status}
                                size="small"
                                sx={{
                                  height: 20,
                                  fontSize: '0.65rem',
                                  fontWeight: 700,
                                  bgcolor: sq.status.includes('Cached') ? '#EFF6FF' : '#F0FDF4',
                                  color: sq.status.includes('Cached') ? '#2563EB' : '#16A34A',
                                }}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Box>
        )}

        {/* ========================================================= */}
        {/* TAB 1: API SERVER (NODE.JS / REST) */}
        {/* ========================================================= */}
        {activeTab === 1 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {/* Top API Performance Indicators */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' },
                gap: 2,
              }}
            >
              <Card variant="outlined" sx={{ bgcolor: '#FFFFFF' }}>
                <CardContent sx={{ p: 2 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                    Average Throughput
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: '#16A34A', my: 0.5 }}>
                    {apiMetrics.rps} RPS
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Payload: {apiMetrics.payloadThroughput}
                  </Typography>
                </CardContent>
              </Card>

              <Card variant="outlined" sx={{ bgcolor: '#FFFFFF' }}>
                <CardContent sx={{ p: 2 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                    p95 / p99 Latency
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: '#2563EB', my: 0.5 }}>
                    {apiMetrics.p95Latency} / {apiMetrics.p99Latency}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#16A34A', fontWeight: 600 }}>
                    Avg: {apiMetrics.avgLatency}
                  </Typography>
                </CardContent>
              </Card>

              <Card variant="outlined" sx={{ bgcolor: '#FFFFFF' }}>
                <CardContent sx={{ p: 2 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                    Rate Limiter Guard
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', my: 0.5, fontSize: '1rem' }}>
                    100% Active
                  </Typography>
                  <Chip label={`${apiMetrics.blockedRequests24h} throttled (24h)`} size="small" sx={{ height: 18, fontSize: '0.62rem', fontWeight: 600, bgcolor: '#FFF7ED', color: '#C2410C' }} />
                </CardContent>
              </Card>

              <Card variant="outlined" sx={{ bgcolor: '#FFFFFF' }}>
                <CardContent sx={{ p: 2 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                    JWT & CORS Policy
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', my: 0.5, fontSize: '1rem' }}>
                    Strict Mode
                  </Typography>
                  <Chip label="RS256 Verified" size="small" sx={{ height: 18, fontSize: '0.62rem', fontWeight: 600, bgcolor: '#F0FDF4', color: '#15803D' }} />
                </CardContent>
              </Card>
            </Box>

            {/* REST Route Status Matrix */}
            <Card variant="outlined" sx={{ bgcolor: '#FFFFFF' }}>
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      REST Endpoint Health & Error Tracking Matrix
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      Real-time response codes, p99 percentiles, and traffic volume per route.
                    </Typography>
                  </Box>
                  <Chip label="Cluster: 4 Worker Nodes" size="small" sx={{ bgcolor: '#EFF6FF', color: '#1D4ED8', fontWeight: 600, fontSize: '0.7rem' }} />
                </Box>

                <TableContainer sx={{ border: '1px solid #E2E8F0', borderRadius: 1.5 }}>
                  <Table size="small">
                    <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700 }}>Method & Route</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Throughput (RPS)</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Avg / p99 Latency</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>2xx Success</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>4xx/5xx Errors</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700 }}>Route Health</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {apiEndpoints.map((ep, idx) => (
                        <TableRow key={idx} hover>
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
                              <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600, fontSize: '0.8rem' }}>
                                {ep.path}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 700 }}>{ep.rps} req/s</Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                              {ep.avgLatency} / <span style={{ color: '#D97706' }}>{ep.p99}</span>
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ color: '#16A34A', fontWeight: 700 }}>
                              {ep.status2xx}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ color: ep.errorRate === '0.00%' ? 'text.secondary' : '#DC2626', fontWeight: 600 }}>
                              {ep.errorRate}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Chip
                              icon={<CheckCircle2 size={12} />}
                              label={ep.status}
                              size="small"
                              color="success"
                              sx={{ fontWeight: 700, height: 20, fontSize: '0.65rem' }}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Box>
        )}

        {/* ========================================================= */}
        {/* TAB 2: KIOSK NETWORK & EDGE (TELEMETRY & REMOTE CONTROL) */}
        {/* ========================================================= */}
        {activeTab === 2 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {/* Kiosk Network Stats */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' },
                gap: 2,
              }}
            >
              <Card variant="outlined" sx={{ bgcolor: '#FFFFFF' }}>
                <CardContent sx={{ p: 2 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                    Connected Terminals
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: '#FF6900', my: 0.5 }}>
                    {kiosks.length} Devices
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#16A34A', fontWeight: 600 }}>
                    {kiosks.filter((k) => k.status === 'ONLINE').length} Online Sockets
                  </Typography>
                </CardContent>
              </Card>

              <Card variant="outlined" sx={{ bgcolor: '#FFFFFF' }}>
                <CardContent sx={{ p: 2 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                    Tenant Sync Handshakes
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: '#0F172A', my: 0.5 }}>
                    {organizations.length} Orgs Synced
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Zero schema discrepancies
                  </Typography>
                </CardContent>
              </Card>

              <Card variant="outlined" sx={{ bgcolor: '#FFFFFF' }}>
                <CardContent sx={{ p: 2 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                    Offline Mode Fallback
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#16A34A', my: 0.5, fontSize: '1rem' }}>
                    SQLite Resilient
                  </Typography>
                  <Chip label="Up to 10k punches local" size="small" sx={{ height: 18, fontSize: '0.62rem', fontWeight: 600, bgcolor: '#F0FDF4', color: '#15803D' }} />
                </CardContent>
              </Card>

              <Card variant="outlined" sx={{ bgcolor: '#FFFFFF' }}>
                <CardContent sx={{ p: 2 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                    OTA Firmware Channel
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#2563EB', my: 0.5, fontSize: '1rem' }}>
                    v3.4.2 (Stable)
                  </Typography>
                  <Chip label="100% Fleets on Target" size="small" sx={{ height: 18, fontSize: '0.62rem', fontWeight: 600, bgcolor: '#EFF6FF', color: '#1D4ED8' }} />
                </CardContent>
              </Card>
            </Box>

            {/* Kiosk Telemetry & Action Table */}
            <Card variant="outlined" sx={{ bgcolor: '#FFFFFF' }}>
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      Live Kiosk Hardware Vitals & Remote Command Controls
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      Real-time CPU thermal dissipation, RAM pressure, local queue buffer, and OTA remote triggers.
                    </Typography>
                  </Box>
                  <Chip label={`${kioskTelemetryList.length} Active Nodes`} size="small" sx={{ bgcolor: '#FFF7ED', color: '#FF6900', fontWeight: 700 }} />
                </Box>

                <TableContainer sx={{ border: '1px solid #E2E8F0', borderRadius: 1.5 }}>
                  <Table size="small">
                    <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700 }}>Device & Org</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Hardware Vitals (CPU/RAM)</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Storage & Signal</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Sync Queue</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700 }}>Remote Management</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {kioskTelemetryList
                        .slice(kioskDiagPage * 5, kioskDiagPage * 5 + 5)
                        .map((k) => (
                          <TableRow key={k.id} hover>
                            <TableCell>
                              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                {k.name}
                              </Typography>
                              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                                {k.deviceId} • {k.orgName}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Chip
                                  icon={<Flame size={12} />}
                                  label={k.cpuTemp}
                                  size="small"
                                  sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700, bgcolor: '#FEF2F2', color: '#DC2626' }}
                                />
                                <Chip
                                  icon={<Cpu size={12} />}
                                  label={`RAM ${k.ramUsage}`}
                                  size="small"
                                  sx={{ height: 20, fontSize: '0.65rem', fontWeight: 600, bgcolor: '#F1F5F9' }}
                                />
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8rem' }}>
                                {k.diskFree} Free
                              </Typography>
                              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                {k.signalStrength}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              {k.pendingOfflineQueue > 0 ? (
                                <Chip label={`${k.pendingOfflineQueue} Queued`} size="small" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700, bgcolor: '#FEF3C7', color: '#D97706' }} />
                              ) : (
                                <Chip label="0 In Buffer" size="small" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 600, bgcolor: '#F0FDF4', color: '#15803D' }} />
                              )}
                            </TableCell>
                            <TableCell>
                              <Chip
                                icon={k.status === 'ONLINE' ? <Wifi size={12} /> : <WifiOff size={12} />}
                                label={k.status}
                                size="small"
                                color={k.status === 'ONLINE' ? 'success' : 'error'}
                                sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700 }}
                              />
                            </TableCell>
                            <TableCell align="right">
                              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                                <Tooltip title="Trigger Over-The-Air firmware push">
                                  <Button
                                    size="small"
                                    variant="outlined"
                                    onClick={() => triggerOTAUpdate(k.deviceId)}
                                    sx={{ height: 24, fontSize: '0.65rem', textTransform: 'none', px: 1 }}
                                  >
                                    OTA Push
                                  </Button>
                                </Tooltip>
                                <Tooltip title="Send remote reboot command">
                                  <Button
                                    size="small"
                                    variant="outlined"
                                    color="warning"
                                    onClick={() => triggerRemoteReboot(k.deviceId)}
                                    sx={{ height: 24, fontSize: '0.65rem', textTransform: 'none', px: 1 }}
                                  >
                                    Reboot
                                  </Button>
                                </Tooltip>
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Box>
        )}

        {/* ========================================================= */}
        {/* TAB 3: SERVER UPTIME & INFRASTRUCTURE */}
        {/* ========================================================= */}
        {activeTab === 3 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {/* SLA Reliability Cards */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' },
                gap: 2,
              }}
            >
              <Card variant="outlined" sx={{ bgcolor: '#FFFFFF' }}>
                <CardContent sx={{ p: 2 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                    30-Day SLA Achievement
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: '#16A34A', my: 0.5 }}>
                    {uptimeMetrics.actual30Day}
                  </Typography>
                  <Chip label="Target: 99.900%" size="small" sx={{ height: 18, fontSize: '0.62rem', fontWeight: 600, bgcolor: '#F0FDF4', color: '#15803D' }} />
                </CardContent>
              </Card>

              <Card variant="outlined" sx={{ bgcolor: '#FFFFFF' }}>
                <CardContent sx={{ p: 2 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                    Host CPU Load
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: '#0F172A', my: 0.5 }}>
                    {uptimeMetrics.cpuHost}
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={parseInt(uptimeMetrics.cpuHost)}
                    sx={{ height: 4, borderRadius: 2, mt: 0.5 }}
                  />
                </CardContent>
              </Card>

              <Card variant="outlined" sx={{ bgcolor: '#FFFFFF' }}>
                <CardContent sx={{ p: 2 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                    Host Memory Footprint
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', my: 0.5, fontSize: '1rem' }}>
                    {uptimeMetrics.memoryHost}
                  </Typography>
                  <LinearProgress variant="determinate" value={26} sx={{ height: 4, borderRadius: 2, mt: 0.5 }} />
                </CardContent>
              </Card>

              <Card variant="outlined" sx={{ bgcolor: '#FFFFFF' }}>
                <CardContent sx={{ p: 2 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                    Operational Webhooks
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#16A34A', my: 0.5, fontSize: '1rem' }}>
                    3 Routes Healthy
                  </Typography>
                  <Chip label="Slack • PagerDuty • Mail" size="small" sx={{ height: 18, fontSize: '0.62rem', fontWeight: 600, bgcolor: '#F1F5F9' }} />
                </CardContent>
              </Card>
            </Box>

            {/* Network Bandwidth & Host Specs */}
            <Card variant="outlined" sx={{ bgcolor: '#FFFFFF' }}>
              <CardContent sx={{ p: 2.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
                  Real-time Host Resource Utilization & Network Bandwidth
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Box sx={{ p: 2, border: '1px solid #E2E8F0', borderRadius: 2, bgcolor: '#F8FAFC' }}>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block' }}>
                        Network I/O Bandwidth
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 700, color: '#2563EB', my: 0.5 }}>
                        {uptimeMetrics.networkBandwidth}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        Protected by AWS CloudFront DDoS Shield & Rate Limiters
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Box sx={{ p: 2, border: '1px solid #E2E8F0', borderRadius: 2, bgcolor: '#F8FAFC' }}>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block' }}>
                        Active Incident & SLA Routing Policy
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 700, color: '#16A34A', my: 0.5 }}>
                        Auto-Escalation Enabled (P1/P2/P3)
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        Critical threshold: API Latency &gt; 250ms or Kiosk packet drop &gt; 2%
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Incident History & Post-Mortems */}
            <Card variant="outlined" sx={{ bgcolor: '#FFFFFF' }}>
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      Automated Incident Logs & Maintenance Post-Mortems
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      Audit records of cluster failover events, maintenance windows, and mitigation outcomes.
                    </Typography>
                  </Box>
                  <Chip label="100% Mitigated" size="small" sx={{ bgcolor: '#DCFCE7', color: '#15803D', fontWeight: 700 }} />
                </Box>

                <TableContainer sx={{ border: '1px solid #E2E8F0', borderRadius: 1.5 }}>
                  <Table size="small">
                    <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700 }}>Date & Duration</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Incident Description</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>System Impact & Mitigation</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700 }}>Resolution</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {incidents.map((inc, idx) => (
                        <TableRow key={idx} hover>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 700 }}>{inc.date}</Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>{inc.duration}</Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{inc.title}</Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>{inc.impact}</Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Chip
                              label={inc.severity}
                              size="small"
                              sx={{
                                height: 20,
                                fontSize: '0.65rem',
                                fontWeight: 700,
                                bgcolor: inc.severity === 'MAINTENANCE' ? '#EFF6FF' : '#F0FDF4',
                                color: inc.severity === 'MAINTENANCE' ? '#2563EB' : '#16A34A',
                              }}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, px: 3, bgcolor: '#FAFAFA', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#16A34A', animation: 'pulse 2s infinite' }} />
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
            Telemetry stream active • Refreshed: {lastRefreshed}
          </Typography>
        </Box>
        <Button onClick={onClose} variant="contained" sx={{ fontWeight: 700 }}>
          Close Telemetry View
        </Button>
      </DialogActions>

      {/* Snackbar feedback for actions */}
      <Snackbar
        open={Boolean(snackbarMessage)}
        autoHideDuration={3500}
        onClose={() => setSnackbarMessage(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity="success" onClose={() => setSnackbarMessage(null)} sx={{ fontWeight: 600 }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Dialog>
  );
};
