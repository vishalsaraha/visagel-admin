'use client';
import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tabs,
  Tab,
  Tooltip,
  Switch,
  FormControlLabel,
  Grid,
  Divider,
  Alert,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Code2,
  Key,
  Globe,
  Zap,
  Shield,
  Copy,
  Check,
  CheckCircle2,
  Plus,
  Trash2,
  Activity,
  Terminal,
  Webhook,
  ArrowRight,
  ExternalLink,
  Lock,
  Cpu,
  X,
  Building2,
  RefreshCw,
} from 'lucide-react';
import { useAdminData } from '@/context/AdminDataContext';
import { Organization, OrgApiKey, OrgApiEndpoint } from '@/types';
import { GitBranch, FileJson, Tag, ArrowUpCircle, ArrowDownCircle, Clock } from 'lucide-react';

// ─── Version Changelog Data ─────────────────────────────────────────────────
const VERSION_HISTORY = [
  {
    version: '2.4.1',
    date: '2026-09-01',
    tag: 'LATEST',
    type: 'patch' as const,
    summary: 'Developer Hub & API Control Panel release',
    added: [
      'Developer Hub page with global API route registry',
      'Cross-org API token management console',
      'SDK code snippets (cURL, Node.js, Python, Flutter)',
      'Webhook event type documentation with HMAC payloads',
      'Version changelog & raw data inspector (dev-only)',
      'Organization-scoped API key provisioning & revocation',
      'Tenant database isolation architecture selector (Shared / Dedicated / Isolated)',
    ],
    changed: [
      'Support page perspective selector now lists all orgs dynamically',
      'Invoice header updated to Visagel Cloud Biometrics branding',
      'Data Inspector privacy banner text updated to Visagel Super Admin',
    ],
    removed: [
      'Hardcoded Branzept-only client view in Support page',
    ],
    breaking: [],
  },
  {
    version: '2.3.0',
    date: '2026-08-24',
    tag: 'STABLE',
    type: 'minor' as const,
    summary: 'Multi-Tenant Ticketing Engine & System Metrics Suite',
    added: [
      'Full 4-tab Backend Health Modal (Database, API Server, Kiosk Network, Infrastructure)',
      'Support ticket lifecycle management (Create, Assign, Escalate, Resolve)',
      'Threaded ticket conversations with internal staff notes',
      'Auto-flagged hardware incident tickets from kiosk heartbeat watchdog',
      'Multi-tenant perspective switcher on Support page',
    ],
    changed: [
      'Dashboard quick-cards now deep-link into Backend Health Modal tabs',
      'Sidebar branding updated to VISAGEL with Face Attendance Admin subtitle',
    ],
    removed: [],
    breaking: [],
  },
  {
    version: '2.2.0',
    date: '2026-08-10',
    tag: 'STABLE',
    type: 'minor' as const,
    summary: 'Subscription Management & Invoice System',
    added: [
      'Subscription tier management with plan upgrade/downgrade modal',
      'Printable tax invoice viewer with GST compliance',
      'MRR growth trend chart (Recharts BarChart)',
      'Plan tier distribution pie chart',
      'CSV invoice export functionality',
    ],
    changed: [
      'Organization detail page restructured with credential cards',
    ],
    removed: [],
    breaking: [],
  },
  {
    version: '2.1.0',
    date: '2026-07-20',
    tag: 'STABLE',
    type: 'minor' as const,
    summary: 'Data Hub & Biometric Audit Inspector',
    added: [
      'App Data Inspector with 5 filterable tabs (Attendance, Employees, Shifts, Kiosks, Audit Logs)',
      'JSON export for all data categories',
      'Cross-org data privacy guard with temporary access grants',
      'Shift schedule management and conflict detection',
    ],
    changed: [],
    removed: [],
    breaking: [],
  },
  {
    version: '2.0.0',
    date: '2026-06-01',
    tag: 'MAJOR',
    type: 'major' as const,
    summary: 'Visagel Admin Panel v2 — Complete Architecture Rewrite',
    added: [
      'Next.js 16 + MUI v6 + TypeScript foundation',
      'Multi-tenant organization CRUD with nested admin accounts',
      'Collapsible sidebar with mobile responsive drawer',
      'Dashboard KPI overview cards with real-time stats',
      'Organization credential deep-link generator',
    ],
    changed: [],
    removed: [
      'Legacy PHP admin panel (deprecated)',
    ],
    breaking: [
      'All REST API endpoints migrated from v1 to v2 namespace',
      'Authentication switched from session cookies to JWT bearer tokens',
    ],
  },
];

// ─── Global Platform REST API Route Registry ────────────────────────────────
const PLATFORM_API_ROUTES = [
  { method: 'POST', route: '/api/v2/auth/login', desc: 'Authenticate admin or tenant user and return JWT bearer token', rateLimit: 30, latencyMs: 22, uptime: '100%', auth: 'Public' },
  { method: 'POST', route: '/api/v2/auth/refresh-token', desc: 'Refresh an expiring JWT session token', rateLimit: 60, latencyMs: 8, uptime: '100%', auth: 'Bearer JWT' },
  { method: 'POST', route: '/api/v2/punch/verify-face', desc: 'Submit biometric face frame for liveness + vector embedding match', rateLimit: 1200, latencyMs: 18, uptime: '99.99%', auth: 'KIOSK_STREAM key' },
  { method: 'GET', route: '/api/v2/punch/daily-log/:orgId', desc: 'Retrieve all punch-in/out records for a tenant org for today', rateLimit: 300, latencyMs: 14, uptime: '99.98%', auth: 'READ_ONLY+' },
  { method: 'POST', route: '/api/v2/roster/enroll-employee', desc: 'Enroll new employee face vector into biometric index', rateLimit: 120, latencyMs: 340, uptime: '99.97%', auth: 'READ_WRITE+' },
  { method: 'GET', route: '/api/v2/roster/list/:orgId', desc: 'List all enrolled employees with vector status', rateLimit: 300, latencyMs: 12, uptime: '100%', auth: 'READ_ONLY+' },
  { method: 'POST', route: '/api/v2/kiosks/heartbeat', desc: 'Edge kiosk posts health vitals (CPU, RAM, cam, battery)', rateLimit: 600, latencyMs: 4, uptime: '100%', auth: 'KIOSK_STREAM key' },
  { method: 'GET', route: '/api/v2/kiosks/status/:orgId', desc: 'Retrieve kiosk fleet status for a tenant', rateLimit: 120, latencyMs: 9, uptime: '100%', auth: 'READ_ONLY+' },
  { method: 'POST', route: '/api/v2/kiosks/ota-push', desc: 'Push OTA firmware update payload to a kiosk', rateLimit: 10, latencyMs: 820, uptime: '99.95%', auth: 'ADMIN_FULL' },
  { method: 'GET', route: '/api/v2/reports/attendance-csv/:orgId', desc: 'Export daily attendance as CSV for payroll integration', rateLimit: 60, latencyMs: 45, uptime: '99.90%', auth: 'READ_ONLY+' },
  { method: 'POST', route: '/api/v2/webhooks/register', desc: 'Register a webhook URL for real-time punch event streaming', rateLimit: 30, latencyMs: 12, uptime: '100%', auth: 'ADMIN_FULL' },
  { method: 'DELETE', route: '/api/v2/webhooks/:hookId', desc: 'Unregister an active webhook subscription', rateLimit: 30, latencyMs: 8, uptime: '100%', auth: 'ADMIN_FULL' },
  { method: 'GET', route: '/api/v2/admin/orgs', desc: 'List all tenant organizations (Super Admin only)', rateLimit: 60, latencyMs: 18, uptime: '100%', auth: 'Super Admin' },
  { method: 'PUT', route: '/api/v2/admin/orgs/:orgId/plan', desc: 'Update subscription tier and billing cycle for a tenant', rateLimit: 30, latencyMs: 25, uptime: '100%', auth: 'Super Admin' },
];

const METHOD_COLORS: Record<string, { bg: string; color: string }> = {
  GET: { bg: '#F0FDF4', color: '#16A34A' },
  POST: { bg: '#EFF6FF', color: '#2563EB' },
  PUT: { bg: '#FFF7ED', color: '#FF6900' },
  DELETE: { bg: '#FEF2F2', color: '#DC2626' },
};

// ─── Code Snippet Templates ─────────────────────────────────────────────────
const CODE_SNIPPETS = {
  curl_punch: `curl -X POST https://api.visagel.ai/api/v2/punch/verify-face \\
  -H "Authorization: Bearer vg_live_YOUR_KIOSK_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "orgId": "ORG-BRAN-001",
    "kioskId": "KSK-BRAN-01",
    "frameBase64": "<BASE64_FACE_FRAME>",
    "livenessCheck": true,
    "timestamp": "2026-09-01T08:42:09Z"
  }'`,

  curl_enroll: `curl -X POST https://api.visagel.ai/api/v2/roster/enroll-employee \\
  -H "Authorization: Bearer vg_live_YOUR_API_KEY" \\
  -H "Content-Type: multipart/form-data" \\
  -F "orgId=ORG-BRAN-001" \\
  -F "employeeId=BR-142" \\
  -F "fullName=Priya Sharma" \\
  -F "department=Engineering" \\
  -F "facePhoto=@/path/to/face.jpg"`,

  webhook_register: `curl -X POST https://api.visagel.ai/api/v2/webhooks/register \\
  -H "Authorization: Bearer vg_live_YOUR_ADMIN_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "orgId": "ORG-BRAN-001",
    "eventTypes": ["PUNCH_IN", "PUNCH_OUT", "KIOSK_OFFLINE"],
    "targetUrl": "https://erp.branzept.com/webhooks/visagel",
    "secret": "whsec_your_signing_secret"
  }'`,

  node_sdk: `import { VisagelClient } from '@visagel/sdk';

const client = new VisagelClient({
  apiKey: 'vg_live_YOUR_API_KEY',
  orgId: 'ORG-BRAN-001',
  environment: 'production',
});

// Verify a face punch
const result = await client.punch.verifyFace({
  kioskId: 'KSK-BRAN-01',
  frameBase64: faceFrameBuffer.toString('base64'),
  livenessCheck: true,
});

console.log(result.matched, result.employeeId, result.confidence);
// true, "BR-001", 0.9982`,

  python_sdk: `from visagel import VisagelClient

client = VisagelClient(
    api_key="vg_live_YOUR_API_KEY",
    org_id="ORG-BRAN-001"
)

# Fetch today's attendance
records = client.attendance.daily_log()
for r in records:
    print(f"{r.employee_name}: {r.punch_in} → {r.punch_out}")

# Export CSV
csv_data = client.reports.export_csv(date="2026-09-01")
with open("attendance.csv", "w") as f:
    f.write(csv_data)`,
};

export default function DeveloperHubPage() {
  const { organizations, attendance, employees, kiosks, invoices, tickets, auditLogs, shifts } = useAdminData();

  const [activeTab, setActiveTab] = useState(0);
  const [selectedSnippet, setSelectedSnippet] = useState<keyof typeof CODE_SNIPPETS>('curl_punch');
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [routeSearch, setRouteSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState('ALL');
  const [selectedCollection, setSelectedCollection] = useState('organizations');
  const [rawDataExpanded, setRawDataExpanded] = useState(false);

  // Raw data collections map
  const dataCollections: Record<string, { label: string; data: unknown[]; count: number }> = {
    organizations: { label: 'Organizations', data: organizations, count: organizations.length },
    attendance: { label: 'Attendance Records', data: attendance, count: attendance.length },
    employees: { label: 'Enrolled Employees', data: employees, count: employees.length },
    kiosks: { label: 'Kiosk Devices', data: kiosks, count: kiosks.length },
    invoices: { label: 'Payment Invoices', data: invoices, count: invoices.length },
    tickets: { label: 'Support Tickets', data: tickets, count: tickets.length },
    auditLogs: { label: 'Audit Logs', data: auditLogs, count: auditLogs.length },
    shifts: { label: 'Shift Entries', data: shifts, count: shifts.length },
  };

  // Aggregate all API keys across all orgs
  const allApiKeys: (OrgApiKey & { orgName: string; orgId: string })[] = organizations.flatMap((org: Organization) =>
    (org.apiKeys || []).map((key: OrgApiKey) => ({ ...key, orgName: org.name, orgId: org.orgId }))
  );

  // Aggregate all custom endpoints across all orgs
  const allEndpoints: (OrgApiEndpoint & { orgName: string; orgId: string })[] = organizations.flatMap((org: Organization) =>
    (org.customEndpoints || []).map((ep: OrgApiEndpoint) => ({ ...ep, orgName: org.name, orgId: org.orgId }))
  );

  const filteredRoutes = PLATFORM_API_ROUTES.filter((r) => {
    if (methodFilter !== 'ALL' && r.method !== methodFilter) return false;
    if (routeSearch && !r.route.toLowerCase().includes(routeSearch.toLowerCase()) && !r.desc.toLowerCase().includes(routeSearch.toLowerCase())) return false;
    return true;
  });

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2500);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Page Header */}
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            Developer Hub & API Control Panel
          </Typography>
          <Chip label="REST v2" size="small" sx={{ bgcolor: '#EFF6FF', color: '#2563EB', fontWeight: 700 }} />
          <Chip label="WebSocket" size="small" sx={{ bgcolor: '#F0FDF4', color: '#16A34A', fontWeight: 700 }} />
        </Box>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Global API route registry, cross-organization token management, SDK integration samples, and real-time endpoint health monitoring.
        </Typography>
      </Box>

      {/* Quick Stats */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: '1fr 1fr 1fr 1fr 1fr' }, gap: 2 }}>
        <Card variant="outlined">
          <CardContent sx={{ p: 2 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>Platform Routes</Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#2563EB', my: 0.5 }}>{PLATFORM_API_ROUTES.length}</Typography>
            <Chip label="REST v2 Stable" size="small" sx={{ height: 18, fontSize: '0.6rem', fontWeight: 600, bgcolor: '#EFF6FF', color: '#2563EB' }} />
          </CardContent>
        </Card>
        <Card variant="outlined">
          <CardContent sx={{ p: 2 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>Active API Keys</Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#16A34A', my: 0.5 }}>{allApiKeys.filter((k) => k.status === 'ACTIVE').length}</Typography>
            <Chip label={`${allApiKeys.filter((k) => k.status === 'REVOKED').length} Revoked`} size="small" sx={{ height: 18, fontSize: '0.6rem', fontWeight: 600, bgcolor: '#FEF2F2', color: '#DC2626' }} />
          </CardContent>
        </Card>
        <Card variant="outlined">
          <CardContent sx={{ p: 2 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>Org Endpoints</Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#FF6900', my: 0.5 }}>{allEndpoints.length}</Typography>
            <Chip label={`${allEndpoints.filter((e) => e.isEnabled).length} Enabled`} size="small" sx={{ height: 18, fontSize: '0.6rem', fontWeight: 600, bgcolor: '#F0FDF4', color: '#16A34A' }} />
          </CardContent>
        </Card>
        <Card variant="outlined">
          <CardContent sx={{ p: 2 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>Avg API Latency</Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#0F172A', my: 0.5 }}>
              {Math.round(PLATFORM_API_ROUTES.reduce((a, r) => a + r.latencyMs, 0) / PLATFORM_API_ROUTES.length)} ms
            </Typography>
            <Chip label="p95 < 50ms" size="small" sx={{ height: 18, fontSize: '0.6rem', fontWeight: 600, bgcolor: '#F0FDF4', color: '#16A34A' }} />
          </CardContent>
        </Card>
        <Card variant="outlined">
          <CardContent sx={{ p: 2 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>Global Uptime</Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#16A34A', my: 0.5 }}>99.98%</Typography>
            <Chip label="30-Day SLA" size="small" sx={{ height: 18, fontSize: '0.6rem', fontWeight: 600, bgcolor: '#EFF6FF', color: '#2563EB' }} />
          </CardContent>
        </Card>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: '#FFFFFF', borderRadius: 2 }}>
        <Tabs value={activeTab} onChange={(_e, v) => setActiveTab(v)} variant="scrollable" scrollButtons="auto" sx={{ px: 2, minHeight: 48 }}>
          <Tab icon={<Globe size={16} />} iconPosition="start" label={`API Routes (${PLATFORM_API_ROUTES.length})`} sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.8125rem' }} />
          <Tab icon={<Key size={16} />} iconPosition="start" label={`Token Registry (${allApiKeys.length})`} sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.8125rem' }} />
          <Tab icon={<Terminal size={16} />} iconPosition="start" label="SDK & Code Snippets" sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.8125rem' }} />
          <Tab icon={<Webhook size={16} />} iconPosition="start" label="Webhooks & Events" sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.8125rem' }} />
          <Tab icon={<Tag size={16} />} iconPosition="start" label={`Changelog (${VERSION_HISTORY.length})`} sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.8125rem' }} />
          <Tab icon={<FileJson size={16} />} iconPosition="start" label="Raw Data Inspector" sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.8125rem' }} />
        </Tabs>
      </Box>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* TAB 0: PLATFORM API ROUTE REGISTRY */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {activeTab === 0 && (
        <Card variant="outlined">
          <CardContent sx={{ p: 2.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1.5 }}>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                  Visagel Platform REST API v2 Route Registry
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  All authenticated endpoints available for biometric verification, roster management, kiosk telemetry, and admin operations.
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1.5 }}>
                <TextField
                  size="small"
                  placeholder="Search routes..."
                  value={routeSearch}
                  onChange={(e) => setRouteSearch(e.target.value)}
                  sx={{ minWidth: 200 }}
                />
                <FormControl size="small" sx={{ minWidth: 100 }}>
                  <InputLabel>Method</InputLabel>
                  <Select value={methodFilter} label="Method" onChange={(e) => setMethodFilter(e.target.value)}>
                    <MenuItem value="ALL">All</MenuItem>
                    <MenuItem value="GET">GET</MenuItem>
                    <MenuItem value="POST">POST</MenuItem>
                    <MenuItem value="PUT">PUT</MenuItem>
                    <MenuItem value="DELETE">DELETE</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Box>

            <TableContainer sx={{ border: '1px solid #E2E8F0', borderRadius: 1.5 }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Method & Endpoint Route</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Rate Limit</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Avg Latency</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Uptime</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>Auth Required</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredRoutes.map((r, i) => {
                    const mc = METHOD_COLORS[r.method] || METHOD_COLORS.GET;
                    return (
                      <TableRow key={i} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip label={r.method} size="small" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 800, bgcolor: mc.bg, color: mc.color, minWidth: 56 }} />
                            <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.8rem' }}>{r.route}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>{r.desc}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>{r.rateLimit} req/m</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 700, color: r.latencyMs > 100 ? '#FF6900' : '#16A34A' }}>
                            {r.latencyMs} ms
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip label={r.uptime} size="small" color="success" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700 }} />
                        </TableCell>
                        <TableCell align="right">
                          <Chip
                            icon={<Lock size={10} />}
                            label={r.auth}
                            size="small"
                            sx={{ height: 20, fontSize: '0.6rem', fontWeight: 700, bgcolor: r.auth === 'Public' ? '#F0FDF4' : '#EFF6FF', color: r.auth === 'Public' ? '#16A34A' : '#2563EB' }}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* TAB 1: CROSS-ORG API TOKEN REGISTRY */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {activeTab === 1 && (
        <Card variant="outlined">
          <CardContent sx={{ p: 2.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1.5 }}>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                  Global API Token Registry (All Organizations)
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Cross-tenant view of every provisioned API key, their scoped permissions, and 24-hour request volume. Manage keys per-org from the Organization detail page.
                </Typography>
              </Box>
              <Chip label={`${allApiKeys.length} Total Keys`} sx={{ bgcolor: '#FFF7ED', color: '#FF6900', fontWeight: 700 }} />
            </Box>

            {allApiKeys.length === 0 ? (
              <Alert severity="info" sx={{ fontWeight: 600 }}>
                No API keys have been provisioned for any organization yet. Visit an organization&apos;s detail page to generate keys.
              </Alert>
            ) : (
              <TableContainer sx={{ border: '1px solid #E2E8F0', borderRadius: 1.5 }}>
                <Table size="small">
                  <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Organization</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Key Name & Token Prefix</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Scope</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Rate Limit</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>24h Volume</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Last Used</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {allApiKeys.map((key) => (
                      <TableRow key={key.id} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Building2 size={14} color="#FF6900" />
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.8rem' }}>{key.orgName}</Typography>
                              <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: 'monospace' }}>{key.orgId}</Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>{key.name}</Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.2 }}>
                            <Typography variant="caption" sx={{ fontFamily: 'monospace', color: '#64748B' }}>{key.keyPrefix}</Typography>
                            {key.fullKeySecret && (
                              <Tooltip title={copiedText === key.id ? 'Copied!' : 'Copy secret'}>
                                <IconButton size="small" onClick={() => handleCopy(key.fullKeySecret!, key.id)} sx={{ p: 0.2 }}>
                                  {copiedText === key.id ? <Check size={10} color="#16A34A" /> : <Copy size={10} />}
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
                              height: 20, fontSize: '0.6rem', fontWeight: 700,
                              bgcolor: key.scope === 'KIOSK_STREAM' ? '#FFF7ED' : key.scope === 'ADMIN_FULL' ? '#FEF2F2' : '#EFF6FF',
                              color: key.scope === 'KIOSK_STREAM' ? '#FF6900' : key.scope === 'ADMIN_FULL' ? '#DC2626' : '#2563EB',
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>{key.rateLimitPerMin} /m</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>{key.totalCalls24h || 0}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>{key.lastUsedAt || 'Never'}</Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Chip label={key.status} size="small" color={key.status === 'ACTIVE' ? 'success' : 'default'} sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700 }} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* TAB 2: SDK & CODE SNIPPETS */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {activeTab === 2 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {/* Snippet Selector */}
          <Card variant="outlined">
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1.5 }}>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                    SDK Integration & Code Samples
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Ready-to-use cURL commands, Node.js SDK, and Python SDK examples. Copy & paste directly into your application.
                  </Typography>
                </Box>
                <FormControl size="small" sx={{ minWidth: 280 }}>
                  <InputLabel>Code Snippet Template</InputLabel>
                  <Select
                    value={selectedSnippet}
                    label="Code Snippet Template"
                    onChange={(e) => setSelectedSnippet(e.target.value as keyof typeof CODE_SNIPPETS)}
                  >
                    <MenuItem value="curl_punch">cURL — Verify Face Punch</MenuItem>
                    <MenuItem value="curl_enroll">cURL — Enroll New Employee</MenuItem>
                    <MenuItem value="webhook_register">cURL — Register Webhook</MenuItem>
                    <MenuItem value="node_sdk">Node.js SDK — Face Verification</MenuItem>
                    <MenuItem value="python_sdk">Python SDK — Attendance Export</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              <Box sx={{ position: 'relative' }}>
                <Box
                  component="pre"
                  sx={{
                    p: 2.5,
                    bgcolor: '#0F172A',
                    color: '#E2E8F0',
                    borderRadius: 2,
                    fontFamily: '"JetBrains Mono", "Fira Code", monospace',
                    fontSize: '0.8rem',
                    lineHeight: 1.6,
                    overflow: 'auto',
                    maxHeight: 400,
                    border: '1px solid #1E293B',
                  }}
                >
                  {CODE_SNIPPETS[selectedSnippet]}
                </Box>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={copiedText === 'snippet' ? <Check size={14} /> : <Copy size={14} />}
                  onClick={() => handleCopy(CODE_SNIPPETS[selectedSnippet], 'snippet')}
                  sx={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    textTransform: 'none',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    bgcolor: copiedText === 'snippet' ? '#16A34A' : '#2563EB',
                  }}
                >
                  {copiedText === 'snippet' ? 'Copied!' : 'Copy Code'}
                </Button>
              </Box>
            </CardContent>
          </Card>

          {/* SDK Packages */}
          <Grid container spacing={2}>
            {[
              { name: '@visagel/sdk', lang: 'Node.js / TypeScript', version: '2.4.1', icon: '📦', desc: 'Official Visagel Node.js SDK for server-side biometric verification, roster management, and attendance exports.', install: 'npm install @visagel/sdk' },
              { name: 'visagel-python', lang: 'Python 3.8+', version: '1.2.0', icon: '🐍', desc: 'Python SDK for data science teams running attendance analytics, face vector clustering, and payroll CSV automation.', install: 'pip install visagel' },
              { name: 'visagel-flutter', lang: 'Flutter / Dart', version: '0.9.3', icon: '📱', desc: 'Cross-platform mobile SDK for building custom kiosk and employee self-service check-in applications.', install: 'flutter pub add visagel_sdk' },
            ].map((pkg) => (
              <Grid size={{ xs: 12, md: 4 }} key={pkg.name}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent sx={{ p: 2.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Typography variant="h6">{pkg.icon}</Typography>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 800 }}>{pkg.name}</Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>{pkg.lang} • v{pkg.version}</Typography>
                      </Box>
                    </Box>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1.5 }}>{pkg.desc}</Typography>
                    <Box
                      sx={{ p: 1.5, bgcolor: '#0F172A', color: '#E2E8F0', borderRadius: 1.5, fontFamily: 'monospace', fontSize: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                    >
                      <span>{pkg.install}</span>
                      <Tooltip title="Copy install command">
                        <IconButton size="small" onClick={() => handleCopy(pkg.install, pkg.name)} sx={{ color: '#94A3B8' }}>
                          {copiedText === pkg.name ? <Check size={12} color="#16A34A" /> : <Copy size={12} />}
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* TAB 3: WEBHOOKS & EVENTS */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {activeTab === 3 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {/* Webhook Event Types */}
          <Card variant="outlined">
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                    Webhook Event Types & Real-Time Streaming
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Configure organizations to receive real-time HTTP POST callbacks when biometric events occur. All payloads are HMAC-SHA256 signed.
                  </Typography>
                </Box>
                <Chip label="HMAC-SHA256 Signed" size="small" sx={{ bgcolor: '#F0FDF4', color: '#16A34A', fontWeight: 700 }} />
              </Box>

              <Grid container spacing={2}>
                {[
                  { event: 'punch.verified', desc: 'Fired when an employee successfully verifies their face at a kiosk. Includes employeeId, confidence score, kioskId, and timestamp.', color: '#2563EB' },
                  { event: 'punch.failed', desc: 'Fired when a face verification attempt fails (no match, spoof detected, or confidence below threshold).', color: '#DC2626' },
                  { event: 'kiosk.offline', desc: 'Fired when a kiosk misses 3 consecutive heartbeats (>90 seconds). Includes last known IP and battery level.', color: '#FF6900' },
                  { event: 'kiosk.online', desc: 'Fired when an offline kiosk reconnects. Includes buffered offline punch count ready for sync.', color: '#16A34A' },
                  { event: 'roster.employee_enrolled', desc: 'Fired when a new employee face vector is enrolled into the biometric index. Includes vector ID and embedding dimensions.', color: '#8B5CF6' },
                  { event: 'billing.payment_overdue', desc: 'Fired when an organization misses a payment deadline. Includes grace period countdown and suspension risk.', color: '#DC2626' },
                ].map((evt) => (
                  <Grid size={{ xs: 12, md: 6 }} key={evt.event}>
                    <Box sx={{ p: 2, border: '1px solid #E2E8F0', borderRadius: 2, bgcolor: '#FAFAFA' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Zap size={14} color={evt.color} />
                        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 800, color: evt.color }}>{evt.event}</Typography>
                      </Box>
                      <Typography variant="caption" sx={{ color: 'text.secondary', lineHeight: 1.4 }}>{evt.desc}</Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>

          {/* Sample Webhook Payload */}
          <Card variant="outlined">
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                  Sample Webhook Payload (punch.verified)
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={copiedText === 'payload' ? <Check size={14} /> : <Copy size={14} />}
                  onClick={() => handleCopy(JSON.stringify({
                    event: 'punch.verified',
                    timestamp: '2026-09-01T08:42:09.124Z',
                    orgId: 'ORG-BRAN-001',
                    data: {
                      employeeId: 'BR-001',
                      employeeName: 'Kiran Kumar',
                      department: 'Engineering',
                      punchType: 'IN',
                      confidence: 0.9982,
                      kioskId: 'KSK-BRAN-01',
                      livenessPass: true,
                      faceVectorId: 'vec_89fa21980cf2',
                    },
                    signature: 'sha256=a1b2c3d4e5f6...',
                  }, null, 2), 'payload')}
                  sx={{ textTransform: 'none', fontWeight: 700 }}
                >
                  {copiedText === 'payload' ? 'Copied!' : 'Copy JSON'}
                </Button>
              </Box>

              <Box
                component="pre"
                sx={{
                  p: 2.5,
                  bgcolor: '#0F172A',
                  color: '#E2E8F0',
                  borderRadius: 2,
                  fontFamily: '"JetBrains Mono", "Fira Code", monospace',
                  fontSize: '0.78rem',
                  lineHeight: 1.5,
                  overflow: 'auto',
                  border: '1px solid #1E293B',
                }}
              >
{`{
  "event": "punch.verified",
  "timestamp": "2026-09-01T08:42:09.124Z",
  "orgId": "ORG-BRAN-001",
  "data": {
    "employeeId": "BR-001",
    "employeeName": "Kiran Kumar",
    "department": "Engineering",
    "punchType": "IN",
    "confidence": 0.9982,
    "kioskId": "KSK-BRAN-01",
    "livenessPass": true,
    "faceVectorId": "vec_89fa21980cf2"
  },
  "signature": "sha256=a1b2c3d4e5f6..."
}`}
              </Box>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* TAB 4: VERSION CHANGELOG */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {activeTab === 4 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {VERSION_HISTORY.map((release, idx) => (
            <Card key={release.version} variant="outlined" sx={{ bgcolor: '#FFFFFF' }}>
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box
                      sx={{
                        width: 36, height: 36, borderRadius: 2,
                        bgcolor: release.type === 'major' ? '#FEF2F2' : release.type === 'minor' ? '#EFF6FF' : '#F0FDF4',
                        color: release.type === 'major' ? '#DC2626' : release.type === 'minor' ? '#2563EB' : '#16A34A',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      <GitBranch size={18} />
                    </Box>
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>v{release.version}</Typography>
                        <Chip
                          label={release.tag}
                          size="small"
                          sx={{
                            height: 18, fontSize: '0.6rem', fontWeight: 800,
                            bgcolor: release.tag === 'LATEST' ? '#F0FDF4' : release.tag === 'MAJOR' ? '#FEF2F2' : '#F8FAFC',
                            color: release.tag === 'LATEST' ? '#16A34A' : release.tag === 'MAJOR' ? '#DC2626' : '#64748B',
                          }}
                        />
                        <Chip
                          label={release.type.toUpperCase()}
                          size="small"
                          sx={{
                            height: 18, fontSize: '0.6rem', fontWeight: 700,
                            bgcolor: release.type === 'major' ? '#FEF2F2' : release.type === 'minor' ? '#EFF6FF' : '#F0FDF4',
                            color: release.type === 'major' ? '#DC2626' : release.type === 'minor' ? '#2563EB' : '#16A34A',
                          }}
                        />
                      </Box>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {release.summary}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Clock size={12} color="#94A3B8" />
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>{release.date}</Typography>
                  </Box>
                </Box>

                {release.added.length > 0 && (
                  <Box sx={{ mb: 1.5 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#16A34A', display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                      <ArrowUpCircle size={12} /> Added
                    </Typography>
                    {release.added.map((item, i) => (
                      <Typography key={i} variant="caption" sx={{ color: 'text.secondary', display: 'block', pl: 2, lineHeight: 1.6 }}>• {item}</Typography>
                    ))}
                  </Box>
                )}

                {release.changed.length > 0 && (
                  <Box sx={{ mb: 1.5 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#FF6900', display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                      <RefreshCw size={12} /> Changed
                    </Typography>
                    {release.changed.map((item, i) => (
                      <Typography key={i} variant="caption" sx={{ color: 'text.secondary', display: 'block', pl: 2, lineHeight: 1.6 }}>• {item}</Typography>
                    ))}
                  </Box>
                )}

                {release.removed.length > 0 && (
                  <Box sx={{ mb: 1.5 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#DC2626', display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                      <ArrowDownCircle size={12} /> Removed
                    </Typography>
                    {release.removed.map((item, i) => (
                      <Typography key={i} variant="caption" sx={{ color: 'text.secondary', display: 'block', pl: 2, lineHeight: 1.6 }}>• {item}</Typography>
                    ))}
                  </Box>
                )}

                {release.breaking.length > 0 && (
                  <Alert severity="warning" sx={{ mt: 1, fontSize: '0.75rem' }}>
                    <strong>Breaking Changes:</strong>
                    {release.breaking.map((item, i) => (
                      <Typography key={i} variant="caption" sx={{ display: 'block', mt: 0.3 }}>⚠️ {item}</Typography>
                    ))}
                  </Alert>
                )}
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* TAB 5: RAW DATA INSPECTOR */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {activeTab === 5 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {/* Collection Selector */}
          <Card variant="outlined">
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1.5 }}>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>Raw Data Collection Inspector</Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Browse the raw JSON structure and live data of each collection in the admin state store. Useful for debugging, migration verification, and schema auditing.
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                  <FormControl size="small" sx={{ minWidth: 220 }}>
                    <InputLabel>Data Collection</InputLabel>
                    <Select value={selectedCollection} label="Data Collection" onChange={(e) => setSelectedCollection(e.target.value)}>
                      {Object.entries(dataCollections).map(([key, val]) => (
                        <MenuItem key={key} value={key}>{val.label} ({val.count})</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={copiedText === 'raw-json' ? <Check size={14} /> : <Copy size={14} />}
                    onClick={() => handleCopy(JSON.stringify(dataCollections[selectedCollection].data, null, 2), 'raw-json')}
                    sx={{ textTransform: 'none', fontWeight: 700 }}
                  >
                    {copiedText === 'raw-json' ? 'Copied!' : 'Copy JSON'}
                  </Button>
                </Box>
              </Box>

              {/* Schema Overview */}
              <Box sx={{ p: 2, bgcolor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 2, mb: 2 }}>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 6, md: 3 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>Collection</Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 700 }}>{selectedCollection}</Typography>
                  </Grid>
                  <Grid size={{ xs: 6, md: 3 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>Total Documents</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 800, color: '#2563EB' }}>{dataCollections[selectedCollection].count}</Typography>
                  </Grid>
                  <Grid size={{ xs: 6, md: 3 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>Fields per Document</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {dataCollections[selectedCollection].data.length > 0
                        ? Object.keys(dataCollections[selectedCollection].data[0] as object).length
                        : 0}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 6, md: 3 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>Approx. Size</Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                      {(JSON.stringify(dataCollections[selectedCollection].data).length / 1024).toFixed(1)} KB
                    </Typography>
                  </Grid>
                </Grid>
              </Box>

              {/* Field Schema Table */}
              {dataCollections[selectedCollection].data.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', display: 'block', mb: 1 }}>Document Field Schema</Typography>
                  <TableContainer sx={{ border: '1px solid #E2E8F0', borderRadius: 1.5 }}>
                    <Table size="small">
                      <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 700 }}>Field Name</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Sample Value (First Record)</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {Object.entries(dataCollections[selectedCollection].data[0] as object).map(([key, value]) => (
                          <TableRow key={key} hover>
                            <TableCell>
                              <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.8rem' }}>{key}</Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={Array.isArray(value) ? `Array[${value.length}]` : typeof value}
                                size="small"
                                sx={{
                                  height: 20, fontSize: '0.6rem', fontWeight: 700,
                                  bgcolor: typeof value === 'string' ? '#F0FDF4' : typeof value === 'number' ? '#EFF6FF' : typeof value === 'boolean' ? '#FFF7ED' : '#F8FAFC',
                                  color: typeof value === 'string' ? '#16A34A' : typeof value === 'number' ? '#2563EB' : typeof value === 'boolean' ? '#FF6900' : '#64748B',
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="caption" sx={{ fontFamily: 'monospace', color: '#64748B', wordBreak: 'break-all', maxWidth: 400, display: 'block' }}>
                                {typeof value === 'object' ? JSON.stringify(value).slice(0, 120) + (JSON.stringify(value).length > 120 ? '...' : '') : String(value).slice(0, 120)}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}

              {/* Raw JSON Output */}
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', display: 'block', mb: 1 }}>Raw JSON Data (Live State)</Typography>
              <Box
                component="pre"
                sx={{
                  p: 2.5,
                  bgcolor: '#0F172A',
                  color: '#E2E8F0',
                  borderRadius: 2,
                  fontFamily: '"JetBrains Mono", "Fira Code", monospace',
                  fontSize: '0.72rem',
                  lineHeight: 1.5,
                  overflow: 'auto',
                  maxHeight: rawDataExpanded ? 'none' : 400,
                  border: '1px solid #1E293B',
                }}
              >
                {JSON.stringify(dataCollections[selectedCollection].data, null, 2)}
              </Box>
              <Button
                size="small"
                onClick={() => setRawDataExpanded(!rawDataExpanded)}
                sx={{ mt: 1, textTransform: 'none', fontWeight: 600 }}
              >
                {rawDataExpanded ? 'Collapse JSON' : 'Expand Full JSON'}
              </Button>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Snackbar feedback */}
      <Snackbar
        open={Boolean(copiedText)}
        autoHideDuration={2500}
        onClose={() => setCopiedText(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity="success" onClose={() => setCopiedText(null)} sx={{ fontWeight: 600 }}>
          Copied to clipboard!
        </Alert>
      </Snackbar>
    </Box>
  );
}
