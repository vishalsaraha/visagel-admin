'use client';
import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
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
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TablePagination,
} from '@mui/material';
import {
  Building2,
  Plus,
  Search,
  KeyRound,
  ExternalLink,
  Trash2,
  Edit,
  Shield,
  Smartphone,
  Copy,
  Users,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAdminData } from '@/context/AdminDataContext';
import { OrgModal } from '@/components/organizations/OrgModal';
import { PlanBadge, PaymentStatusBadge } from '@/components/organizations/PlanStatusBadge';
import { Organization } from '@/types';

export default function OrganizationsPage() {
  const router = useRouter();
  const { organizations, deleteOrganization } = useAdminData();

  const [openModal, setOpenModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [planFilter, setPlanFilter] = useState('ALL');
  const [paymentFilter, setPaymentFilter] = useState('ALL');

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Filter organizations
  const filteredOrgs = organizations.filter((org) => {
    const matchesSearch =
      !searchQuery ||
      org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.orgId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.contactEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.contactPerson.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesPlan = planFilter === 'ALL' || org.plan === planFilter;
    const matchesPayment = paymentFilter === 'ALL' || org.paymentStatus === paymentFilter;

    return matchesSearch && matchesPlan && matchesPayment;
  });

  const handleDelete = async (org: Organization) => {
    if (confirm(`Are you sure you want to permanently delete "${org.name}" and revoke all app credentials?`)) {
      await deleteOrganization(org.id);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
      {/* Top Banner */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', md: 'center' },
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            Client Organizations & Credentials Directory
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            Issue organization IDs, generate app client login URLs, track subscription payment status, and manage scoped admin IDs.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<Plus size={18} />}
          onClick={() => setOpenModal(true)}
          sx={{ fontWeight: 700, px: 3, py: 1.2 }}
        >
          Provision New Organization
        </Button>
      </Box>

      {/* Filter and Search Bar */}
      <Card>
        <CardContent sx={{ p: 2.5 }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '2fr 1fr 1fr' },
              gap: 2,
            }}
          >
            <TextField
              size="small"
              placeholder="Search by company name, Org ID (e.g. ORG-BRAN-001), or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: <Search size={18} style={{ marginRight: 8, color: '#94A3B8' }} />,
                },
              }}
            />

            <FormControl size="small" fullWidth>
              <InputLabel>Filter by Plan</InputLabel>
              <Select value={planFilter} label="Filter by Plan" onChange={(e) => setPlanFilter(e.target.value)}>
                <MenuItem value="ALL">All Plans</MenuItem>
                <MenuItem value="STARTER">Starter</MenuItem>
                <MenuItem value="GROWTH">Growth</MenuItem>
                <MenuItem value="ENTERPRISE">Enterprise</MenuItem>
                <MenuItem value="UNLIMITED">Unlimited</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" fullWidth>
              <InputLabel>Filter by Payment</InputLabel>
              <Select value={paymentFilter} label="Filter by Payment" onChange={(e) => setPaymentFilter(e.target.value)}>
                <MenuItem value="ALL">All Payment Statuses</MenuItem>
                <MenuItem value="PAID">PAID</MenuItem>
                <MenuItem value="PENDING">PENDING</MenuItem>
                <MenuItem value="OVERDUE">OVERDUE</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </CardContent>
      </Card>

      {/* Organizations Master Table */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Company & Contact</TableCell>
                  <TableCell>Organization ID (App Login)</TableCell>
                  <TableCell>Subscribed Plan</TableCell>
                  <TableCell>Payment Status</TableCell>
                  <TableCell>Billing & Devices</TableCell>
                  <TableCell>Internal Admins</TableCell>
                  <TableCell align="right">Actions & Profile</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredOrgs
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((org: Organization) => (
                  <TableRow key={org.id} hover>
                    {/* Company */}
                    <TableCell>
                      <Typography
                        variant="subtitle2"
                        onClick={() => router.push(`/organizations/${org.id}`)}
                        sx={{ fontWeight: 800, cursor: 'pointer', '&:hover': { color: 'primary.main' } }}
                      >
                        {org.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                        {org.contactPerson} • {org.contactEmail}
                      </Typography>
                    </TableCell>

                    {/* Org ID */}
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography
                          variant="body2"
                          sx={{
                            fontFamily: 'monospace',
                            fontWeight: 800,
                            color: 'primary.main',
                            bgcolor: (t) => (t.palette.mode === 'dark' ? 'rgba(255, 105, 0, 0.15)' : 'rgba(255, 105, 0, 0.08)'),
                            px: 1,
                            py: 0.3,
                            borderRadius: 1.5,
                          }}
                        >
                          {org.orgId}
                        </Typography>
                        <Tooltip title="Copy Mobile Login URL">
                          <IconButton
                            size="small"
                            onClick={() => {
                              navigator.clipboard.writeText(org.clientAppLoginUrl);
                              alert(`Copied direct mobile login URL for ${org.name}:\n${org.clientAppLoginUrl}`);
                            }}
                          >
                            <Copy size={14} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>

                    {/* Plan */}
                    <TableCell>
                      <PlanBadge plan={org.plan} />
                    </TableCell>

                    {/* Payment Status */}
                    <TableCell>
                      <PaymentStatusBadge status={org.paymentStatus} />
                    </TableCell>

                    {/* Quotas */}
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600, textTransform: 'capitalize' }}>
                        {org.billingCycle === 'LIFETIME' ? 'Lifetime / One-Time' : org.billingCycle.toLowerCase()} Billing
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {org.activeDeviceCount} / {org.deviceQuota} Devices
                      </Typography>
                    </TableCell>

                    {/* Admins */}
                    <TableCell>
                      <Chip
                        icon={<Users size={12} />}
                        label={`${org.admins.length} Admin ID(s)`}
                        size="small"
                        variant="outlined"
                        onClick={() => router.push(`/organizations/${org.id}`)}
                        sx={{ cursor: 'pointer', fontWeight: 600 }}
                      />
                    </TableCell>

                    {/* Actions */}
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => router.push(`/organizations/${org.id}`)}
                          sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.75rem' }}
                        >
                          Full Profile
                        </Button>
                        <Tooltip title="Delete Organization">
                          <IconButton size="small" color="error" onClick={() => handleDelete(org)}>
                            <Trash2 size={16} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}

                {filteredOrgs.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                      <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                        No organizations found matching your search.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={filteredOrgs.length}
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

      {/* Provisioning Dialog */}
      <OrgModal open={openModal} onClose={() => setOpenModal(false)} />
    </Box>
  );
}
