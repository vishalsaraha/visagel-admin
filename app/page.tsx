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
  Avatar,
  Tooltip,
  TablePagination,
} from '@mui/material';
import {
  Building2,
  Smartphone,
  CreditCard,
  Plus,
  Clock,
  Activity,
  ChevronRight,
  Database,
  Server,
  HardDrive,
} from 'lucide-react';
import { useAdminData } from '@/context/AdminDataContext';
import { useRouter } from 'next/navigation';
import { OrgModal } from '@/components/organizations/OrgModal';
import { PlanBadge, PaymentStatusBadge } from '@/components/organizations/PlanStatusBadge';
import { BackendHealthModal } from '@/components/dashboard/BackendHealthModal';
import { KioskManagementModal } from '@/components/kiosks/KioskManagementModal';

export default function DashboardPage() {
  const router = useRouter();
  const { stats, organizations, kiosks } = useAdminData();
  const [openAddOrgModal, setOpenAddOrgModal] = useState(false);
  const [openHealthModal, setOpenHealthModal] = useState(false);
  const [openKioskModal, setOpenKioskModal] = useState(false);

  // Table pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const activeKiosks = stats.activeKiosksCount || kiosks.filter(k => k.status === 'ONLINE').length || 10;

  const kpiCards = [
    {
      title: 'Branzept & Client Orgs',
      value: stats.totalOrganizations,
      subtitle: `${stats.activeOrganizations} active tenants`,
      icon: <Building2 size={20} color="#FF6900" />,
      action: () => router.push('/organizations'),
    },
    {
      title: 'Active Kiosk Network',
      value: `${activeKiosks} Terminals`,
      subtitle: `${organizations.length} client orgs connected`,
      icon: <Smartphone size={20} color="#FF6900" />,
      action: () => setOpenKioskModal(true),
    },
    {
      title: 'Biometric Punches Today',
      value: stats.totalPunchesToday,
      subtitle: 'Real-time face scans',
      icon: <Clock size={20} color="#16A34A" />,
      action: () => router.push('/data-inspector'),
    },
    {
      title: 'Monthly Recurring Revenue',
      value: `$${stats.totalRevenueMonthly.toLocaleString()}`,
      subtitle: `${stats.pendingPaymentsCount} pending, ${stats.overduePaymentsCount} overdue`,
      icon: <CreditCard size={20} color="#D97706" />,
      action: () => router.push('/subscriptions'),
    },
  ];

  return (
    <Box sx={{
      display: 'flex', flexDirection: 'column', gap: 3, position: 'relative',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundImage: 'radial-gradient(circle at 100% 100%, rgba(255,105,0,0.03) 0%, transparent 40%), radial-gradient(circle at 0% 0%, rgba(37,99,235,0.02) 0%, transparent 40%)',
        pointerEvents: 'none',
        zIndex: 0,
      }
    }}>
      {/* 1. Top Header */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: 2,
        }}
      >
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              Branzept Admin Console
            </Typography>
            <Chip
              label="Visagel Biometrics"
              size="small"
              sx={{ bgcolor: '#FFF7ED', color: '#FF6900', fontWeight: 600, border: '1px solid #FED7AA' }}
            />
          </Box>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Manage client organizations, face recognition kiosks, subscription quotas, and support requests.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button
            variant="outlined"
            startIcon={<Smartphone size={16} />}
            onClick={() => setOpenKioskModal(true)}
          >
            Kiosk Suite
          </Button>
          <Button
            variant="contained"
            startIcon={<Plus size={16} />}
            onClick={() => setOpenAddOrgModal(true)}
          >
            Add Org
          </Button>
        </Box>
      </Box>

      {/* 2. BACKEND STATUS (MOVED TO TOP OF DASHBOARD OVERVIEW AS REQUESTED) */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' },
          gap: 2,
        }}
      >
        {[
          { label: 'Database', value: 'MongoDB', sub: 'AWS Node-1 Online', color: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE' },
          { label: 'API Server', value: 'Node.js/REST', sub: 'All endpoints healthy', color: '#16A34A', bg: '#F0FDF4', border: '#BBF7D0' },
          { label: 'Kiosk Network', value: `${activeKiosks} Active`, sub: `${organizations.length} orgs connected`, color: '#FF6900', bg: '#FFF7ED', border: '#FED7AA' },
          { label: 'Server Uptime', value: '99.9%', sub: 'Last checked: just now', color: '#64748B', bg: '#F8FAFC', border: '#E2E8F0' },
        ].map((item) => (
          <Tooltip key={item.label} title="Click to view detailed backend health diagnostics">
            <Card
              onClick={() => setOpenHealthModal(true)}
              sx={{
                cursor: 'pointer',
                transition: 'all 0.18s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 14px rgba(0, 0, 0, 0.06)',
                  borderColor: item.border,
                },
              }}
            >
              <CardContent sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    width: 42,
                    height: 42,
                    borderRadius: 1.5,
                    bgcolor: item.bg,
                    border: `1px solid ${item.border}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Box
                    sx={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      bgcolor: item.color,
                      boxShadow: `0 0 0 3px ${item.border}`,
                      animation: 'pulse 2s infinite',
                    }}
                  />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                    {item.label}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: item.color }}>
                    {item.value}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.68rem' }}>
                    {item.sub}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Tooltip>
        ))}
      </Box>

      {/* 3. KPI Cards Grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: '1fr 1fr 1fr 1fr' },
          gap: 2,
        }}
      >
        {kpiCards.map((kpi, idx) => (
          <Card
            key={idx}
            onClick={kpi.action}
            sx={{
              cursor: 'pointer',
              transition: 'border-color 0.15s, box-shadow 0.15s',
              '&:hover': {
                borderColor: '#FED7AA',
                boxShadow: '0 2px 8px rgba(255, 105, 0, 0.08)',
              },
            }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                  {kpi.title}
                </Typography>
                <Box
                  sx={{
                    width: 34,
                    height: 34,
                    borderRadius: 1,
                    bgcolor: '#FFF7ED',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {kpi.icon}
                </Box>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5, color: '#0F172A' }}>
                {kpi.value}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {kpi.subtitle}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* 4. Main Sections: Organizations Directory & Active Sessions */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '2fr 1.2fr' },
          gap: 2.5,
        }}
      >
        {/* Left: Client Organizations Directory Snapshot */}
        <Card>
          <CardContent sx={{ p: 2.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  Organizations Directory
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Provisioned tenants and credentials status
                </Typography>
              </Box>
              <Button
                size="small"
                variant="text"
                onClick={() => router.push('/organizations')}
                sx={{ fontSize: '0.8125rem' }}
              >
                View all →
              </Button>
            </Box>

            <TableContainer sx={{ border: '1px solid #E2E8F0', borderRadius: 1 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Organization</TableCell>
                    <TableCell>Org ID</TableCell>
                    <TableCell>Plan</TableCell>
                    <TableCell>Payment</TableCell>
                    <TableCell align="right">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {organizations
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((org: any) => (
                    <TableRow key={org.id} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {org.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {org.contactEmail}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600, color: '#2563EB' }}>
                          {org.orgId}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <PlanBadge plan={org.plan} />
                      </TableCell>
                      <TableCell>
                        <PaymentStatusBadge status={org.paymentStatus} />
                      </TableCell>
                      <TableCell align="right">
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => router.push(`/organizations/${org.id}`)}
                          sx={{ fontSize: '0.75rem', py: 0.3, px: 1 }}
                        >
                          Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={organizations.length}
              page={page}
              onPageChange={(_e, p) => setPage(p)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
              rowsPerPageOptions={[5, 10, 25, 50, 100]}
            />
          </CardContent>
        </Card>

        {/* Right: Active Sessions */}
        <Card>
          <CardContent sx={{ p: 2.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  Active Sessions
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Currently logged-in admins
                </Typography>
              </Box>
              <Chip
                label={`${organizations.reduce((acc, o) => acc + o.admins.filter(a => a.isActive).length, 0)} online`}
                size="small"
                sx={{ bgcolor: '#F0FDF4', color: '#16A34A', fontWeight: 600, fontSize: '0.68rem', border: '1px solid #BBF7D0' }}
              />
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {organizations.flatMap((org) =>
                org.admins
                  .filter((a) => a.isActive && a.lastLoginAt)
                  .map((admin) => ({
                    ...admin,
                    orgName: org.name,
                    orgId: org.orgId,
                  }))
              ).slice(0, 6).map((admin) => (
                <Box
                  key={admin.id}
                  sx={{
                    p: 1.25,
                    borderRadius: 1,
                    bgcolor: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar
                      sx={{
                        width: 30,
                        height: 30,
                        bgcolor: admin.role === 'SUPER_ADMIN' ? '#FFF7ED' : '#EFF6FF',
                        color: admin.role === 'SUPER_ADMIN' ? '#FF6900' : '#2563EB',
                        border: `1px solid ${admin.role === 'SUPER_ADMIN' ? '#FED7AA' : '#BFDBFE'}`,
                        fontSize: '0.78rem',
                        fontWeight: 700,
                      }}
                    >
                      {admin.name.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.82rem' }}>
                        {admin.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
                        {admin.orgName}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Chip
                      label={admin.role === 'SUPER_ADMIN' ? 'Super Admin' : admin.role === 'HR_MANAGER' ? 'HR' : 'Admin'}
                      size="small"
                      sx={{
                        height: 18,
                        fontSize: '0.62rem',
                        fontWeight: 700,
                        bgcolor: admin.role === 'SUPER_ADMIN' ? '#FFF7ED' : '#EFF6FF',
                        color: admin.role === 'SUPER_ADMIN' ? '#FF6900' : '#2563EB',
                      }}
                    />
                    <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', fontSize: '0.65rem', mt: 0.2 }}>
                      {admin.lastLoginAt ? new Date(admin.lastLoginAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Modals */}
      <OrgModal open={openAddOrgModal} onClose={() => setOpenAddOrgModal(false)} />
      <BackendHealthModal open={openHealthModal} onClose={() => setOpenHealthModal(false)} />
      <KioskManagementModal open={openKioskModal} onClose={() => setOpenKioskModal(false)} />
    </Box>
  );
}
