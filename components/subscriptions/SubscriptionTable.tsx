'use client';
import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  TablePagination,
} from '@mui/material';
import {
  CreditCard,
  TrendingUp,
  Receipt,
  FileText,
  Download,
  Printer,
  PieChart as PieIcon,
  X,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from 'recharts';
import { Organization, PaymentInvoice, OrgPlanTier, PaymentStatus } from '@/types';
import { useAdminData } from '@/context/AdminDataContext';
import { PlanBadge, PaymentStatusBadge } from '@/components/organizations/PlanStatusBadge';

export const SubscriptionTable: React.FC = () => {
  const { organizations, invoices, updateOrgSubscription, updateInvoiceStatus } = useAdminData();

  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [openPlanModal, setOpenPlanModal] = useState(false);
  const [newPlan, setNewPlan] = useState<OrgPlanTier>('GROWTH');
  const [newCycle, setNewCycle] = useState<'MONTHLY' | 'ANNUAL'>('MONTHLY');
  const [newStatus, setNewStatus] = useState<PaymentStatus>('PAID');

  // Invoice Print Modal State
  const [selectedInvoice, setSelectedInvoice] = useState<PaymentInvoice | null>(null);

  // Organization Scoping Filter
  const [selectedOrgFilter, setSelectedOrgFilter] = useState<string>('ALL');

  // Filtered organizations and invoices strictly scoped by tenant
  const filteredOrgs = selectedOrgFilter === 'ALL'
    ? organizations
    : organizations.filter((o: Organization) => o.orgId === selectedOrgFilter || o.id === selectedOrgFilter);

  const filteredInvoices = selectedOrgFilter === 'ALL'
    ? invoices
    : invoices.filter((i: PaymentInvoice) => i.orgId === selectedOrgFilter);

  // Pagination state
  const [orgPage, setOrgPage] = useState(0);
  const [orgRowsPerPage, setOrgRowsPerPage] = useState(5);
  const [invPage, setInvPage] = useState(0);
  const [invRowsPerPage, setInvRowsPerPage] = useState(5);

  const handleOpenUpgrade = (org: Organization) => {
    setSelectedOrg(org);
    setNewPlan(org.plan);
    setNewCycle(org.billingCycle === 'LIFETIME' ? 'MONTHLY' : org.billingCycle);
    setNewStatus(org.paymentStatus);
    setOpenPlanModal(true);
  };

  const handleSavePlan = async () => {
    if (!selectedOrg) return;
    await updateOrgSubscription(selectedOrg.id, newPlan, newCycle, newStatus);
    setOpenPlanModal(false);
  };

  const handleToggleInvoicePaid = async (inv: PaymentInvoice) => {
    const nextStatus = inv.status === 'PAID' ? 'PENDING' : 'PAID';
    await updateInvoiceStatus(inv.id, nextStatus);
  };

  // Recharts Chart Data
  const planTierDistribution = [
    { name: 'Starter', count: filteredOrgs.filter((o: Organization) => o.plan === 'STARTER').length, color: '#3B82F6' },
    { name: 'Growth', count: filteredOrgs.filter((o: Organization) => o.plan === 'GROWTH').length, color: '#FF6900' },
    { name: 'Enterprise', count: filteredOrgs.filter((o: Organization) => o.plan === 'ENTERPRISE').length, color: '#8B5CF6' },
    { name: 'Unlimited', count: filteredOrgs.filter((o: Organization) => o.plan === 'UNLIMITED').length, color: '#10B981' },
  ];

  const revenueMonthlyTrend = [
    { month: 'Apr', revenue: 2100 },
    { month: 'May', revenue: 2450 },
    { month: 'Jun', revenue: 2900 },
    { month: 'Jul', revenue: 3400 },
    { month: 'Aug', revenue: filteredOrgs.reduce((acc: number, o: Organization) => acc + (o.planPrice || 0), 0) },
  ];

  const exportInvoicesCSV = () => {
    const headers = ['Invoice #', 'Organization', 'Amount', 'Currency', 'Plan', 'Payment Method', 'Status', 'Due Date'];
    const rows = filteredInvoices.map((inv: PaymentInvoice) => [
      inv.invoiceNumber,
      `"${inv.orgName}"`,
      inv.amount,
      inv.currency,
      inv.planTier,
      `"${inv.paymentMethod}"`,
      inv.status,
      inv.dueDate,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r: (string | number)[]) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `visagel_invoices_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
      {/* Top Organization Filter & Tenant Scoping Banner */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', md: 'center' },
          gap: 2,
          p: 2.5,
          bgcolor: selectedOrgFilter === 'ALL' ? '#FFFFFF' : '#FFF7ED',
          border: `1px solid ${selectedOrgFilter === 'ALL' ? '#E2E8F0' : '#FED7AA'}`,
          borderRadius: 2,
        }}
      >
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              {selectedOrgFilter === 'ALL' ? 'Platform Billing & Subscriptions' : `${filteredOrgs[0]?.name || 'Organization'} Subscription Portal`}
            </Typography>
            <Chip
              label={selectedOrgFilter === 'ALL' ? 'GLOBAL LEDGER' : `TENANT: ${selectedOrgFilter}`}
              size="small"
              sx={{
                bgcolor: selectedOrgFilter === 'ALL' ? '#2563EB' : '#EA580C',
                color: '#FFFFFF',
                fontWeight: 800,
                fontSize: '0.65rem',
                height: 22,
              }}
            />
          </Box>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {selectedOrgFilter === 'ALL'
              ? 'Multi-tenant subscription tiers, device quota allocations, and payment invoice audits.'
              : `Strictly scoped billing plan, device capacity, and payment invoice history for ${filteredOrgs[0]?.name}.`}
          </Typography>
        </Box>

        <FormControl size="small" sx={{ minWidth: 260, bgcolor: '#FFFFFF' }}>
          <InputLabel>Filter By Organization</InputLabel>
          <Select
            value={selectedOrgFilter}
            label="Filter By Organization"
            onChange={(e) => {
              setSelectedOrgFilter(e.target.value);
              setOrgPage(0);
              setInvPage(0);
            }}
          >
            <MenuItem value="ALL">
              <strong>All Organizations (Global View)</strong>
            </MenuItem>
            {organizations.map((org: Organization) => (
              <MenuItem key={org.id} value={org.orgId}>
                {org.name} ({org.orgId})
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Visual Analytics Charts Section */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '1.6fr 1fr' },
          gap: 2.5,
        }}
      >
        {/* Revenue Growth Trend */}
        <Card>
          <CardContent sx={{ p: 2.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TrendingUp size={18} color="#FF6900" />
                  Monthly Recurring Revenue (MRR) Growth
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {selectedOrgFilter === 'ALL' ? 'Total platform revenue performance over the last 5 months' : `Subscription billing performance for ${filteredOrgs[0]?.name}`}
                </Typography>
              </Box>
              <Chip
                label={`$${filteredOrgs.reduce((acc: number, o: Organization) => acc + (o.planPrice || 0), 0)} / mo`}
                size="small"
                sx={{ bgcolor: '#FFF7ED', color: '#FF6900', fontWeight: 700, border: '1px solid #FED7AA' }}
              />
            </Box>
            <Box sx={{ height: 180, width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueMonthlyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="month" stroke="#94A3B8" fontSize={12} tickLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} tickFormatter={(val) => `$${val}`} />
                  <RechartsTooltip
                    formatter={(val) => [`$${val}`, 'MRR Revenue']}
                    contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                  />
                  <Bar dataKey="revenue" fill="#FF6900" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>

        {/* Plan Tier Distribution */}
        <Card>
          <CardContent sx={{ p: 2.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PieIcon size={18} color="#8B5CF6" />
                  Plan Tier Distribution
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Breakdown of tenant active subscription plans
                </Typography>
              </Box>
              <Chip label={`${filteredOrgs.length} Tenants`} size="small" sx={{ bgcolor: '#F5F3FF', color: '#8B5CF6', fontWeight: 700 }} />
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 180 }}>
              <Box sx={{ width: 140, height: 140 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={planTierDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={35}
                      outerRadius={60}
                      paddingAngle={3}
                      dataKey="count"
                    >
                      {planTierDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, flex: 1, ml: 2 }}>
                {planTierDistribution.map((item) => (
                  <Box key={item.name} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: item.color }} />
                      <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                        {item.name}
                      </Typography>
                    </Box>
                    <Typography variant="caption" sx={{ fontWeight: 800 }}>
                      {item.count} Orgs
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Organizations Subscription & Device Quota Overview */}
      <Card>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                <CreditCard size={20} color="#FF6900" />
                Active Organization Subscriptions & App Quotas
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Manage live billing status, face quota limits, and app sync permissions per tenant.
              </Typography>
            </Box>
          </Box>

          <TableContainer sx={{ borderRadius: 2, border: (t) => `1px solid ${t.palette.divider}` }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Organization</TableCell>
                  <TableCell>Assigned Plan</TableCell>
                  <TableCell>Billing Cycle</TableCell>
                  <TableCell>Monthly / Annual Rate</TableCell>
                  <TableCell>Employee / Face Limit</TableCell>
                  <TableCell>Payment Status</TableCell>
                  <TableCell>Next Billing Date</TableCell>
                  <TableCell align="right">Manage Plan</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredOrgs
                  .slice(orgPage * orgRowsPerPage, orgPage * orgRowsPerPage + orgRowsPerPage)
                  .map((org: Organization) => (
                  <TableRow key={org.id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {org.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: 'monospace' }}>
                        {org.orgId}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <PlanBadge plan={org.plan} />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600, textTransform: 'capitalize' }}>
                        {org.billingCycle.toLowerCase()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        ${org.planPrice}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {org.enrolledEmployeeCount} / {org.employeeQuota}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                        {org.activeDeviceCount} / {org.deviceQuota} Devices
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <PaymentStatusBadge status={org.paymentStatus} />
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>
                        {org.nextBillingDate}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleOpenUpgrade(org)}
                        sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }}
                      >
                        Adjust Plan
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={filteredOrgs.length}
            page={orgPage}
            onPageChange={(_e, p) => setOrgPage(p)}
            rowsPerPage={orgRowsPerPage}
            onRowsPerPageChange={(e) => {
              setOrgRowsPerPage(parseInt(e.target.value, 10));
              setOrgPage(0);
            }}
            rowsPerPageOptions={[5, 10, 25, 50, 100]}
          />
        </CardContent>
      </Card>

      {/* Invoice & Payment History Log */}
      <Card>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Receipt size={20} color="#6366F1" />
                Payment Ledger & Invoice Audit Log
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Track payment receipts, wire transfers, and pending collections across all organizations.
              </Typography>
            </Box>
            <Button
              variant="outlined"
              size="small"
              startIcon={<Download size={15} />}
              onClick={exportInvoicesCSV}
              sx={{ textTransform: 'none', fontWeight: 600 }}
            >
              Export CSV Ledger
            </Button>
          </Box>

          <TableContainer sx={{ borderRadius: 2, border: (t) => `1px solid ${t.palette.divider}` }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Invoice #</TableCell>
                  <TableCell>Organization</TableCell>
                  <TableCell>Billing Tier</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Payment Mode</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Due Date</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredInvoices
                  .slice(invPage * invRowsPerPage, invPage * invRowsPerPage + invRowsPerPage)
                  .map((inv: PaymentInvoice) => (
                  <TableRow key={inv.id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 700 }}>
                        {inv.invoiceNumber}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        Date: {inv.paymentDate}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {inv.orgName}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: 'monospace' }}>
                        {inv.orgId}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <PlanBadge plan={inv.planTier} />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 800 }}>
                        ${inv.amount} {inv.currency}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                        {inv.paymentMethod.replace('_', ' ')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <PaymentStatusBadge status={inv.status} />
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>
                        {inv.dueDate}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                        <Button
                          size="small"
                          variant="text"
                          startIcon={<FileText size={14} />}
                          onClick={() => setSelectedInvoice(inv)}
                          sx={{ textTransform: 'none', fontWeight: 600 }}
                        >
                          View Receipt
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color={inv.status === 'PAID' ? 'inherit' : 'success'}
                          onClick={() => handleToggleInvoicePaid(inv)}
                          sx={{ textTransform: 'none', fontWeight: 600 }}
                        >
                          {inv.status === 'PAID' ? 'Mark Pending' : 'Mark Paid'}
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={filteredInvoices.length}
            page={invPage}
            onPageChange={(_e, p) => setInvPage(p)}
            rowsPerPage={invRowsPerPage}
            onRowsPerPageChange={(e) => {
              setInvRowsPerPage(parseInt(e.target.value, 10));
              setInvPage(0);
            }}
            rowsPerPageOptions={[5, 10, 25, 50, 100]}
          />
        </CardContent>
      </Card>

      {/* Modal for adjusting plan & payment */}
      <Dialog open={openPlanModal} onClose={() => setOpenPlanModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          Adjust Subscription: {selectedOrg?.name}
        </DialogTitle>
        <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 2 }}>
          <FormControl fullWidth>
            <InputLabel>Subscription Tier</InputLabel>
            <Select value={newPlan} label="Subscription Tier" onChange={(e) => setNewPlan(e.target.value as OrgPlanTier)}>
              <MenuItem value="STARTER">Starter ($49/mo - 50 Faces, 2 Devices)</MenuItem>
              <MenuItem value="GROWTH">Growth ($129/mo - 250 Faces, 6 Devices)</MenuItem>
              <MenuItem value="ENTERPRISE">Enterprise ($299/mo - 1000 Faces, 25 Devices)</MenuItem>
              <MenuItem value="UNLIMITED">Unlimited ($599/mo - 10k Faces, 100 Devices)</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Billing Cycle</InputLabel>
            <Select value={newCycle} label="Billing Cycle" onChange={(e) => setNewCycle(e.target.value as 'MONTHLY' | 'ANNUAL')}>
              <MenuItem value="MONTHLY">Monthly Billing</MenuItem>
              <MenuItem value="ANNUAL">Annual Billing (20% Savings)</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Payment Status</InputLabel>
            <Select value={newStatus} label="Payment Status" onChange={(e) => setNewStatus(e.target.value as PaymentStatus)}>
              <MenuItem value="PAID">PAID (Active Access)</MenuItem>
              <MenuItem value="PENDING">PENDING (Grace Period)</MenuItem>
              <MenuItem value="OVERDUE">OVERDUE (Suspended Access)</MenuItem>
              <MenuItem value="GRACE_PERIOD">GRACE_PERIOD</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenPlanModal(false)} sx={{ color: 'text.secondary' }}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSavePlan} sx={{ fontWeight: 600 }}>
            Apply Subscription Updates
          </Button>
        </DialogActions>
      </Dialog>

      {/* Printable Invoice Viewer Modal */}
      {selectedInvoice && (
        <Dialog open={Boolean(selectedInvoice)} onClose={() => setSelectedInvoice(null)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              Official Tax Invoice
            </Typography>
            <IconButton size="small" onClick={() => setSelectedInvoice(null)}>
              <X size={18} />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#FF6900' }}>
                  VISAGEL CLOUD BIOMETRICS
                </Typography>
                <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>
                  Face Attendance Enterprise SaaS (by Branzept)
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  GST/Tax ID: 29AAAAA0000A1Z5
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, fontFamily: 'monospace' }}>
                  {selectedInvoice.invoiceNumber}
                </Typography>
                <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>
                  Due: {selectedInvoice.dueDate}
                </Typography>
                <PaymentStatusBadge status={selectedInvoice.status} />
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ mb: 3 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase' }}>
                Billed To:
              </Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                {selectedInvoice.orgName}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Org ID: {selectedInvoice.orgId}
              </Typography>
            </Box>

            <Box sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: 2, border: '1px solid #E2E8F0', mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Visagel {selectedInvoice.planTier} License Subscription
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 800 }}>
                  ${selectedInvoice.amount} {selectedInvoice.currency}
                </Typography>
              </Box>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Billing Cycle: {selectedInvoice.billingCycle} • Payment Method: {selectedInvoice.paymentMethod}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                Total Amount Paid:
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#FF6900' }}>
                ${selectedInvoice.amount} {selectedInvoice.currency}
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2, px: 3 }}>
            <Button
              variant="outlined"
              startIcon={<Printer size={16} />}
              onClick={() => window.print()}
              sx={{ fontWeight: 600 }}
            >
              Print / Save PDF
            </Button>
            <Button variant="contained" onClick={() => setSelectedInvoice(null)}>
              Close Invoice
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};
