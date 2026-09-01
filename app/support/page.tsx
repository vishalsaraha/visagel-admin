'use client';
import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  TextField,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  Snackbar,
  Alert,
  IconButton,
  Tooltip,
  TablePagination,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Avatar,
  Paper,
  LinearProgress,
} from '@mui/material';
import {
  HelpCircle,
  ChevronDown,
  Mail,
  Phone,
  LifeBuoy,
  Send,
  Building2,
  Ticket,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Smartphone,
  Eye,
  Shield,
  UserCheck,
  RefreshCw,
  Flame,
  Wifi,
  WifiOff,
  Activity,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { useAdminData } from '@/context/AdminDataContext';
import { Organization, OrgAdmin, SupportTicket, KioskDevice, EmployeeAttendance } from '@/types';
import { CreateTicketModal } from '@/components/support/CreateTicketModal';
import { TicketDetailModal } from '@/components/support/TicketDetailModal';

export default function SupportPage() {
  const { organizations, kiosks, attendance, tickets } = useAdminData();

  // Multi-Tenant View Selector: 'VISAGEL_ADMIN' vs client view for specific orgs
  const [selectedViewMode, setSelectedViewMode] = useState<string>('VISAGEL_ADMIN');
  const [selectedOrgFilter, setSelectedOrgFilter] = useState<string>('ALL');

  // Active Main Tab: 0 -> Tickets Management, 1 -> Client Attendance & Hardware, 2 -> Client Directory & Contact, 3 -> Knowledge Base / FAQs
  const [activeMainTab, setActiveMainTab] = useState(0);

  // Ticket Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');

  // Modals
  const [openCreateTicket, setOpenCreateTicket] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [openTicketDetail, setOpenTicketDetail] = useState(false);

  // Pagination for Tickets
  const [ticketPage, setTicketPage] = useState(0);
  const [ticketRowsPerPage, setTicketRowsPerPage] = useState(10);

  // Pagination for Client Directory
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(6);

  // Quick Ticket Subject / Message (legacy fast submit)
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketCategory, setTicketCategory] = useState('Hardware Kiosk & Terminal');
  const [ticketMessage, setTicketMessage] = useState('');
  const [snackbarMsg, setSnackbarMsg] = useState<string | null>(null);

  const isClientView = selectedViewMode !== 'VISAGEL_ADMIN';
  const currentClientOrg = organizations.find((o: Organization) => o.orgId === selectedViewMode) || organizations[0];
  const effectiveOrgId = isClientView ? currentClientOrg.orgId : selectedOrgFilter;

  // Filtered tickets based on multi-tenant role isolation
  const filteredTickets = tickets.filter((t: SupportTicket) => {
    // Tenant isolation
    if (isClientView && t.orgId !== currentClientOrg.orgId) return false;
    if (!isClientView && selectedOrgFilter !== 'ALL' && t.orgId !== selectedOrgFilter) return false;

    // Search query
    if (
      searchQuery &&
      !t.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !t.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !t.description.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }

    // Status filter
    if (statusFilter !== 'ALL' && t.status !== statusFilter) return false;

    // Priority filter
    if (priorityFilter !== 'ALL' && t.priority !== priorityFilter) return false;

    return true;
  });

  // Client-specific kiosk and attendance data
  const clientKiosks = kiosks.filter((k: KioskDevice) => k.orgId === (isClientView ? currentClientOrg.orgId : 'ORG-BRAN-001'));
  const clientAttendance = attendance.filter((a: EmployeeAttendance) => a.orgId === (isClientView ? currentClientOrg.orgId : 'ORG-BRAN-001'));

  const allAdmins = organizations.flatMap((org: Organization) =>
    org.admins.map((admin: OrgAdmin) => ({
      ...admin,
      orgName: org.name,
      orgId: org.orgId,
    }))
  );

  const handleOpenTicket = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    setOpenTicketDetail(true);
  };

  const getPriorityChip = (priority: string) => {
    switch (priority) {
      case 'CRITICAL_URGENT':
        return <Chip label="CRITICAL (1h SLA)" size="small" sx={{ fontWeight: 800, fontSize: '0.62rem', height: 20, bgcolor: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA' }} />;
      case 'HIGH':
        return <Chip label="HIGH (4h SLA)" size="small" sx={{ fontWeight: 700, fontSize: '0.62rem', height: 20, bgcolor: '#FFF7ED', color: '#EA580C', border: '1px solid #FED7AA' }} />;
      case 'MEDIUM':
        return <Chip label="MEDIUM (8h SLA)" size="small" sx={{ fontWeight: 600, fontSize: '0.62rem', height: 20, bgcolor: '#FEFCE8', color: '#CA8A04' }} />;
      default:
        return <Chip label="LOW (24h SLA)" size="small" sx={{ fontWeight: 600, fontSize: '0.62rem', height: 20, bgcolor: '#F1F5F9', color: '#475569' }} />;
    }
  };

  const getStatusChip = (status: string) => {
    switch (status) {
      case 'OPEN':
        return <Chip label="Open" size="small" color="primary" sx={{ fontWeight: 700, height: 20, fontSize: '0.65rem' }} />;
      case 'IN_PROGRESS':
        return <Chip label="In Progress" size="small" color="warning" sx={{ fontWeight: 700, height: 20, fontSize: '0.65rem' }} />;
      case 'AWAITING_CLIENT_RESPONSE':
        return <Chip label="Awaiting Client" size="small" sx={{ bgcolor: '#FEF3C7', color: '#D97706', fontWeight: 700, height: 20, fontSize: '0.65rem' }} />;
      case 'RESOLVED':
        return <Chip label="Resolved" size="small" color="success" sx={{ fontWeight: 700, height: 20, fontSize: '0.65rem' }} />;
      case 'CLOSED':
        return <Chip label="Closed" size="small" sx={{ bgcolor: '#F1F5F9', color: '#64748B', fontWeight: 600, height: 20, fontSize: '0.65rem' }} />;
      default:
        return <Chip label={status} size="small" sx={{ height: 20, fontSize: '0.65rem' }} />;
    }
  };

  const faqs = [
    {
      q: 'How do employees enrol their face for biometric clock-ins?',
      a: 'Employees can register in two ways: 1) Directly standing in front of any Branzept Visagel iPad/Android kiosk in enrol mode, or 2) Via the mobile self-service link sent to their phone where they take a selfie to create their 3D vector model.',
    },
    {
      q: 'What happens when an employee forgets to clock in or out?',
      a: 'Super Admins and HR Managers can navigate to the Employee Directory or App Data Hub and log a manual verified entry.',
    },
    {
      q: 'How are tenant subscriptions renewed or upgraded?',
      a: 'Under the "Subscriptions" section, select "Adjust Plan" on any organization to switch between Starter, Growth, Enterprise, or Unlimited, with instant quota allocation for faces and terminals.',
    },
    {
      q: 'What should we do if an iPad terminal shows "Sync Offline"?',
      a: 'The terminal stores up to 10,000 punches locally in encrypted SQLite storage and will automatically push all queued attendance events as soon as internet connectivity is restored.',
    },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Top Banner & Multi-Tenant Role Switcher */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', md: 'center' },
          gap: 2,
          p: 2.5,
          bgcolor: isClientView ? '#FFF7ED' : '#FFFFFF',
          border: `1px solid ${isClientView ? '#FED7AA' : '#E2E8F0'}`,
          borderRadius: 2,
        }}
      >
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>
              {isClientView ? `${currentClientOrg.name} Support & Telemetry Portal` : 'Visagel Face Attendance Help & Ticketing Engine'}
            </Typography>
            <Chip
              label={isClientView ? 'TENANT CLIENT VIEW' : 'SUPER ADMIN MASTER'}
              size="small"
              sx={{
                bgcolor: isClientView ? '#EA580C' : '#2563EB',
                color: '#FFFFFF',
                fontWeight: 800,
                fontSize: '0.65rem',
                height: 22,
              }}
            />
          </Box>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {isClientView
              ? `Dedicated attendance diagnostics, hardware ticket submission, and real-time Visagel support engineering feed for ${currentClientOrg.name}.`
              : 'Cross-organization support desk, manual ticket dispatching, SLA tracking, and auto-flagged hardware incidents.'}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
          {/* Multi-Tenant Perspective Switcher */}
          <FormControl size="small" sx={{ minWidth: 240, bgcolor: '#FFFFFF' }}>
            <InputLabel>Portal Perspective</InputLabel>
            <Select
              value={selectedViewMode}
              label="Portal Perspective"
              onChange={(e) => {
                const val = e.target.value;
                setSelectedViewMode(val);
                if (val !== 'VISAGEL_ADMIN') {
                  setSelectedOrgFilter(val);
                } else {
                  setSelectedOrgFilter('ALL');
                }
              }}
            >
              <MenuItem value="VISAGEL_ADMIN">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Shield size={14} color="#2563EB" />
                  <strong>Visagel Core Admin (All Orgs)</strong>
                </Box>
              </MenuItem>
              {organizations.map((org: Organization) => (
                <MenuItem key={org.orgId} value={org.orgId}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Building2 size={14} color="#FF6900" />
                    <span>{org.name} Portal</span>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button
            variant="contained"
            startIcon={<Plus size={16} />}
            onClick={() => setOpenCreateTicket(true)}
            sx={{ fontWeight: 700 }}
          >
            {isClientView ? 'Raise Ticket' : 'Create Ticket'}
          </Button>
        </Box>
      </Box>

      {/* Top 4 Quick KPI Summary Cards */}
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
              {isClientView ? `${currentClientOrg.name} Tickets` : 'Global Open Tickets'}
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#2563EB', my: 0.5 }}>
              {filteredTickets.filter((t) => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length} Active
            </Typography>
            <Typography variant="caption" sx={{ color: '#16A34A', fontWeight: 600 }}>
              {filteredTickets.filter((t) => t.priority === 'CRITICAL_URGENT').length} Critical Urgency
            </Typography>
          </CardContent>
        </Card>

        <Card variant="outlined" sx={{ bgcolor: '#FFFFFF' }}>
          <CardContent sx={{ p: 2 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
              SLA Compliance
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#16A34A', my: 0.5 }}>
              99.8% On-Time
            </Typography>
            <Chip label="1h Response Guarantee" size="small" sx={{ height: 18, fontSize: '0.62rem', fontWeight: 600, bgcolor: '#F0FDF4', color: '#15803D' }} />
          </CardContent>
        </Card>

        <Card variant="outlined" sx={{ bgcolor: '#FFFFFF' }}>
          <CardContent sx={{ p: 2 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
              {isClientView ? `${currentClientOrg.name} Kiosks` : 'Connected Kiosk Fleets'}
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#FF6900', my: 0.5 }}>
              {isClientView ? `${clientKiosks.length} Terminals` : `${kiosks.length} Nodes`}
            </Typography>
            <Typography variant="caption" sx={{ color: '#16A34A', fontWeight: 600 }}>
              {isClientView
                ? `${clientKiosks.filter((k) => k.status === 'ONLINE').length} Online Sockets`
                : `${kiosks.filter((k) => k.status === 'ONLINE').length} Online Sockets`}
            </Typography>
          </CardContent>
        </Card>

        <Card variant="outlined" sx={{ bgcolor: '#FFFFFF' }}>
          <CardContent sx={{ p: 2 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
              Auto-Flagged Telemetry
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#0F172A', my: 0.5 }}>
              {filteredTickets.filter((t) => t.isAutoFlagged).length} Incidents
            </Typography>
            <Chip label="Heartbeat Socket Guard" size="small" sx={{ height: 18, fontSize: '0.62rem', fontWeight: 600, bgcolor: '#EFF6FF', color: '#1D4ED8' }} />
          </CardContent>
        </Card>
      </Box>

      {/* Main Tabs Navigation */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: '#FFFFFF', borderRadius: 2 }}>
        <Tabs
          value={activeMainTab}
          onChange={(_e, val) => setActiveMainTab(val)}
          textColor="primary"
          indicatorColor="primary"
          variant="scrollable"
          scrollButtons="auto"
          sx={{ minHeight: 48, px: 2 }}
        >
          <Tab
            icon={<Ticket size={16} />}
            iconPosition="start"
            label={`Support Tickets (${filteredTickets.length})`}
            sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.8125rem' }}
          />
          {isClientView && (
            <Tab
              icon={<Smartphone size={16} />}
              iconPosition="start"
              label={`${currentClientOrg.name} Attendance & Kiosks (${clientKiosks.length})`}
              sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.8125rem' }}
            />
          )}
          <Tab
            icon={<Building2 size={16} />}
            iconPosition="start"
            label={`Client Directory (${allAdmins.length})`}
            sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.8125rem' }}
          />
          <Tab
            icon={<HelpCircle size={16} />}
            iconPosition="start"
            label="Knowledge Base & Hardware FAQs"
            sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.8125rem' }}
          />
        </Tabs>
      </Box>

      {/* ========================================================================= */}
      {/* TAB 0: ADVANCED TICKETING WORKFLOW & TABLE */}
      {/* ========================================================================= */}
      {activeMainTab === 0 && (
        <Card variant="outlined" sx={{ bgcolor: '#FFFFFF' }}>
          <CardContent sx={{ p: 2.5 }}>
            {/* Filter Bar */}
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, justifyContent: 'space-between', mb: 2 }}>
              <TextField
                size="small"
                placeholder="Search by ticket #, title, description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                slotProps={{
                  input: {
                    startAdornment: <Search size={16} style={{ marginRight: 8, color: '#64748B' }} />,
                  },
                }}
                sx={{ width: { xs: '100%', sm: 320 } }}
              />

              <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                {!isClientView && (
                  <FormControl size="small" sx={{ minWidth: 160 }}>
                    <InputLabel>Filter Org</InputLabel>
                    <Select
                      value={selectedOrgFilter}
                      label="Filter Org"
                      onChange={(e) => setSelectedOrgFilter(e.target.value)}
                    >
                      <MenuItem value="ALL">All Organizations</MenuItem>
                      {organizations.map((org: Organization) => (
                        <MenuItem key={org.orgId} value={org.orgId}>
                          {org.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}

                <FormControl size="small" sx={{ minWidth: 140 }}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={statusFilter}
                    label="Status"
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <MenuItem value="ALL">All Statuses</MenuItem>
                    <MenuItem value="OPEN">Open</MenuItem>
                    <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                    <MenuItem value="AWAITING_CLIENT_RESPONSE">Awaiting Client</MenuItem>
                    <MenuItem value="RESOLVED">Resolved</MenuItem>
                    <MenuItem value="CLOSED">Closed</MenuItem>
                  </Select>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: 140 }}>
                  <InputLabel>Priority</InputLabel>
                  <Select
                    value={priorityFilter}
                    label="Priority"
                    onChange={(e) => setPriorityFilter(e.target.value)}
                  >
                    <MenuItem value="ALL">All Priorities</MenuItem>
                    <MenuItem value="CRITICAL_URGENT">Critical Urgent</MenuItem>
                    <MenuItem value="HIGH">High</MenuItem>
                    <MenuItem value="MEDIUM">Medium</MenuItem>
                    <MenuItem value="LOW">Low</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Box>

            {/* Ticket Table */}
            <TableContainer sx={{ border: '1px solid #E2E8F0', borderRadius: 2 }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Ticket Ref & Priority</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Issue Title & Category</TableCell>
                    {!isClientView && <TableCell sx={{ fontWeight: 700 }}>Client Organization</TableCell>}
                    <TableCell sx={{ fontWeight: 700 }}>SLA Window</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Messages</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredTickets.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={isClientView ? 6 : 7} sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                        No support tickets found matching your filter criteria.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTickets
                      .slice(ticketPage * ticketRowsPerPage, ticketPage * ticketRowsPerPage + ticketRowsPerPage)
                      .map((t: SupportTicket) => (
                        <TableRow key={t.id} hover sx={{ cursor: 'pointer' }} onClick={() => handleOpenTicket(t)}>
                          <TableCell>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                              <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 700, color: '#0F172A' }}>
                                {t.ticketNumber}
                              </Typography>
                              {getPriorityChip(t.priority)}
                            </Box>
                          </TableCell>

                          <TableCell>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.3 }}>
                              <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A' }}>
                                {t.title}
                              </Typography>
                              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                {t.category} {t.relatedDeviceId ? `• ${t.relatedDeviceId}` : ''}
                              </Typography>
                              {t.isAutoFlagged && (
                                <Chip
                                  icon={<AlertTriangle size={10} />}
                                  label="Auto-Flagged Telemetry"
                                  size="small"
                                  sx={{ height: 16, fontSize: '0.58rem', fontWeight: 700, bgcolor: '#FEF2F2', color: '#DC2626', width: 'fit-content' }}
                                />
                              )}
                            </Box>
                          </TableCell>

                          {!isClientView && (
                            <TableCell>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {t.orgName}
                              </Typography>
                              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                {t.createdBy}
                              </Typography>
                            </TableCell>
                          )}

                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: '#16A34A' }}>
                              {t.slaHours} Hours
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                              {new Date(t.createdAt).toLocaleDateString()}
                            </Typography>
                          </TableCell>

                          <TableCell>{getStatusChip(t.status)}</TableCell>

                          <TableCell>
                            <Chip
                              label={`${t.messages.length} msg${t.messages.length !== 1 ? 's' : ''}`}
                              size="small"
                              variant="outlined"
                              sx={{ height: 20, fontSize: '0.68rem', fontWeight: 600 }}
                            />
                          </TableCell>

                          <TableCell align="right">
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<Eye size={12} />}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenTicket(t);
                              }}
                              sx={{ height: 24, fontSize: '0.68rem', textTransform: 'none', fontWeight: 700 }}
                            >
                              Open Trail
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              component="div"
              count={filteredTickets.length}
              page={ticketPage}
              onPageChange={(_e, p) => setTicketPage(p)}
              rowsPerPage={ticketRowsPerPage}
              onRowsPerPageChange={(e) => {
                setTicketRowsPerPage(parseInt(e.target.value, 10));
                setTicketPage(0);
              }}
              rowsPerPageOptions={[5, 10, 25, 50]}
            />
          </CardContent>
        </Card>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: CLIENT ATTENDANCE & KIOSK DIAGNOSTICS */}
      {/* ========================================================================= */}
      {activeMainTab === 1 && isClientView && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {/* Client Kiosks Grid */}
          <Card variant="outlined" sx={{ bgcolor: '#FFFFFF' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                    {currentClientOrg.name} Biometric Kiosk Hardware Diagnostics
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Live thermal telemetry, SQLite offline punch queues, and vector models for {currentClientOrg.name} terminals.
                  </Typography>
                </Box>
                <Chip label={`Tenant: ${currentClientOrg.orgId}`} size="small" sx={{ bgcolor: '#FFF7ED', color: '#FF6900', fontWeight: 700 }} />
              </Box>

              <Grid container spacing={2}>
                {clientKiosks.map((k) => (
                  <Grid size={{ xs: 12, md: 6 }} key={k.id}>
                    <Box sx={{ p: 2, border: '1px solid #E2E8F0', borderRadius: 2, bgcolor: '#F8FAFC' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 800 }}>
                            {k.name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                            {k.deviceId} • {k.location}
                          </Typography>
                        </Box>
                        <Chip
                          icon={k.status === 'ONLINE' ? <Wifi size={12} /> : <WifiOff size={12} />}
                          label={k.status}
                          size="small"
                          color={k.status === 'ONLINE' ? 'success' : 'error'}
                          sx={{ fontWeight: 800, height: 20, fontSize: '0.65rem' }}
                        />
                      </Box>
                      <Divider sx={{ my: 1.5 }} />
                      <Grid container spacing={1.5}>
                        <Grid size={{ xs: 6 }}>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>Engine Version</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>{k.faceEngineVersion}</Typography>
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>Face Vectors</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>{k.activeFaceModelCount} Enrolled</Typography>
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>IP / Network</Typography>
                          <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>{k.ipAddress}</Typography>
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>Last Heartbeat</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>{k.lastHeartbeat}</Typography>
                        </Grid>
                      </Grid>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>

          {/* Client Synced Punches Stream */}
          <Card variant="outlined" sx={{ bgcolor: '#FFFFFF' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                    {currentClientOrg.name} Employee Daily Attendance Stream
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Real-time biometric punch logs captured at the entrance kiosks.
                  </Typography>
                </Box>
                <Chip label={`${clientAttendance.length} Records Today`} size="small" sx={{ bgcolor: '#F0FDF4', color: '#16A34A', fontWeight: 700 }} />
              </Box>

              <TableContainer sx={{ border: '1px solid #E2E8F0', borderRadius: 2 }}>
                <Table size="small">
                  <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Employee Name & ID</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Department</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Biometric Punches</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Working Hours</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {clientAttendance.map((att) => (
                      <TableRow key={att.id} hover>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>{att.name}</Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>{att.employeeId}</Typography>
                        </TableCell>
                        <TableCell>{att.department}</TableCell>
                        <TableCell>{att.date}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                            {att.punches.map((p, idx) => (
                              <Chip
                                key={idx}
                                label={`${p.type}: ${p.time}`}
                                size="small"
                                sx={{
                                  height: 18,
                                  fontSize: '0.62rem',
                                  fontWeight: 700,
                                  bgcolor: p.type === 'IN' ? '#F0FDF4' : '#EFF6FF',
                                  color: p.type === 'IN' ? '#16A34A' : '#2563EB',
                                }}
                              />
                            ))}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>{att.totalWorkingHours || '—'}</Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Chip
                            label={att.status}
                            size="small"
                            color={att.status === 'PRESENT' ? 'success' : 'warning'}
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

      {/* ========================================================================= */}
      {/* TAB 2: CLIENT DIRECTORY & CONTACT */}
      {/* ========================================================================= */}
      {activeMainTab === 2 && (
        <Card variant="outlined" sx={{ bgcolor: '#FFFFFF' }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                Client Directory & Direct Engineering Contact
              </Typography>
              <Chip label={`${allAdmins.length} Client Admins`} size="small" sx={{ bgcolor: '#F1F5F9', color: '#475569', fontWeight: 600 }} />
            </Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 2 }}>
              Connect with Organization Admins directly via Email or Phone.
            </Typography>

            <Grid container spacing={2}>
              {allAdmins.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((admin) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={admin.id}>
                  <Box sx={{ p: 2, border: '1px solid #E2E8F0', borderRadius: 2, bgcolor: '#F8FAFC' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {admin.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Building2 size={12} /> {admin.orgName}
                        </Typography>
                      </Box>
                      <Chip label={admin.role === 'SUPER_ADMIN' ? 'Admin' : 'HR'} size="small" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 600 }} />
                    </Box>
                    <Divider sx={{ my: 1.5 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1.5 }}>
                      <Tooltip title="Send Email">
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<Mail size={14} />}
                          onClick={() => (window.location.href = `mailto:${admin.email}`)}
                          sx={{ fontSize: '0.75rem', fontWeight: 600 }}
                        >
                          Email
                        </Button>
                      </Tooltip>
                      <Tooltip title="Call Phone">
                        <Button
                          size="small"
                          variant="outlined"
                          color="success"
                          startIcon={<Phone size={14} />}
                          onClick={() => (window.location.href = `tel:${admin.phone}`)}
                          sx={{ fontSize: '0.75rem', fontWeight: 600 }}
                        >
                          Call
                        </Button>
                      </Tooltip>
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid>

            <TablePagination
              component="div"
              count={allAdmins.length}
              page={page}
              onPageChange={(_e, p) => setPage(p)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
              rowsPerPageOptions={[6, 12, 24, 50, 100]}
              sx={{ mt: 2 }}
            />
          </CardContent>
        </Card>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: KNOWLEDGE BASE & HARDWARE FAQS */}
      {/* ========================================================================= */}
      {activeMainTab === 3 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {/* 3 Support Channels */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' },
              gap: 2,
            }}
          >
            <Card variant="outlined">
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                  <Box sx={{ width: 36, height: 36, borderRadius: 1, bgcolor: '#FFF7ED', color: '#FF6900', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Mail size={20} />
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      Email Support
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      support@branzept.com
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8125rem' }}>
                  Response within 2 hours for high-priority terminal alerts and subscription requests.
                </Typography>
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                  <Box sx={{ width: 36, height: 36, borderRadius: 1, bgcolor: '#F0FDF4', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Phone size={20} />
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      Emergency Helpline
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      +91 98765 43210 (Toll Free)
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8125rem' }}>
                  Direct hotline to Branzept operations engineers for urgent kiosk hardware diagnostics.
                </Typography>
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                  <Box sx={{ width: 36, height: 36, borderRadius: 1, bgcolor: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <LifeBuoy size={20} />
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      Live Diagnostics
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      AI Gateway v2.4 Status
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8125rem' }}>
                  All kiosk terminals active with 99.98% facial recognition confidence.
                </Typography>
              </CardContent>
            </Card>
          </Box>

          {/* FAQs Accordion */}
          <Card variant="outlined">
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
                Frequently Asked Questions (FAQ)
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 2 }}>
                Quick answers to common questions about biometric kiosk workflows
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {faqs.map((faq, idx) => (
                  <Accordion key={idx} elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: '6px !important', '&:before': { display: 'none' } }}>
                    <AccordionSummary expandIcon={<ChevronDown size={18} />}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {faq.q}
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{ pt: 0 }}>
                      <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8125rem' }}>
                        {faq.a}
                      </Typography>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Modals */}
      <CreateTicketModal
        open={openCreateTicket}
        onClose={() => setOpenCreateTicket(false)}
        defaultOrgId={effectiveOrgId !== 'ALL' ? effectiveOrgId : 'ORG-BRAN-001'}
        isClientMode={isClientView}
      />

      <TicketDetailModal
        ticket={selectedTicket}
        open={openTicketDetail}
        onClose={() => {
          setOpenTicketDetail(false);
          setSelectedTicket(null);
        }}
        isClientMode={isClientView}
      />

      {/* Snackbar feedback */}
      <Snackbar
        open={Boolean(snackbarMsg)}
        autoHideDuration={4000}
        onClose={() => setSnackbarMsg(null)}
      >
        <Alert severity="success" variant="filled">
          {snackbarMsg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
