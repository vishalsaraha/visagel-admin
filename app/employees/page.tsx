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
  TablePagination,
  TextField,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Users,
  Plus,
  Search,
  Trash2,
  Phone,
  Calendar,
  CheckCircle2,
  Download,
  Building2,
  Clock,
  ScanFace,
  HelpCircle,
} from 'lucide-react';
import { useAdminData } from '@/context/AdminDataContext';
import { EnrolledEmployee } from '@/types';

export default function EmployeesPage() {
  const { employees, organizations, addEmployeeRecord, deleteEmployeeRecord, addAttendanceRecord } = useAdminData();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrgFilter, setSelectedOrgFilter] = useState('ALL');
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openPunchModal, setOpenPunchModal] = useState(false);
  const [punchEmployee, setPunchEmployee] = useState<EnrolledEmployee | null>(null);
  const [punchType, setPunchType] = useState<'IN' | 'OUT'>('IN');
  const [snackbarMsg, setSnackbarMsg] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Form states for new employee
  const [name, setName] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [orgId, setOrgId] = useState(organizations[0]?.orgId || 'ORG-BRAN-001');
  const [department, setDepartment] = useState('Engineering');
  const [phone, setPhone] = useState('');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [emergencyContact, setEmergencyContact] = useState('');

  // Filter employees
  const filteredEmployees = employees.filter((emp) => {
    const matchesOrg = selectedOrgFilter === 'ALL' || emp.orgId === selectedOrgFilter;
    const matchesQuery =
      !searchQuery ||
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.phone.includes(searchQuery);
    return matchesOrg && matchesQuery;
  });

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    const org = organizations.find((o) => o.orgId === orgId) || organizations[0];
    await addEmployeeRecord({
      orgId,
      orgName: org.name,
      employeeId: employeeId || `BR-${Math.floor(100 + Math.random() * 900)}`,
      name,
      department,
      phone: phone || '+91 98765 43210',
      joiningDate: new Date().toISOString().split('T')[0],
      photoUri: null,
      status: 'ACTIVE',
      customData: {
        BloodGroup: bloodGroup,
        EmergencyContact: emergencyContact || phone,
      },
    });

    setOpenAddModal(false);
    setName('');
    setEmployeeId('');
    setPhone('');
    setSnackbarMsg(`Employee ${name} registered with Biometric profile successfully!`);
  };

  const handleLogManualPunch = async () => {
    if (!punchEmployee) return;
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });

    await addAttendanceRecord({
      orgId: punchEmployee.orgId,
      orgName: punchEmployee.orgName,
      employeeId: punchEmployee.employeeId,
      name: punchEmployee.name,
      department: punchEmployee.department,
      date: now.toISOString().split('T')[0],
      punches: [
        {
          id: `p-${Date.now()}`,
          type: punchType,
          time: timeStr,
          timestamp: Date.now(),
        },
      ],
      totalWorkingHours: punchType === 'IN' ? 'In Progress' : '8 hrs 00 mins',
      status: 'PRESENT',
    });

    setOpenPunchModal(false);
    setSnackbarMsg(`Manual ${punchType} attendance punch logged for ${punchEmployee.name}!`);
  };

  const exportEmployeeCSV = () => {
    const headers = ['Employee ID', 'Name', 'Organization', 'Department', 'Phone', 'Joining Date', 'Status'];
    const rows = filteredEmployees.map((e) => [
      e.employeeId,
      `"${e.name}"`,
      `"${e.orgName}"`,
      `"${e.department}"`,
      e.phone,
      e.joiningDate,
      e.status,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `branzept_employees_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Header */}
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              Employee Directory & Biometrics
            </Typography>
            <Chip
              label="Branzept Staff & Tenants"
              size="small"
              sx={{ bgcolor: '#FFF7ED', color: '#FF6900', fontWeight: 600, border: '1px solid #FED7AA' }}
            />
          </Box>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            Manage staff profiles, face biometric enrolments, manual attendance punch adjustments, and department rosters.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button
            variant="outlined"
            startIcon={<Download size={16} />}
            onClick={exportEmployeeCSV}
          >
            Export
          </Button>
          <Button
            variant="contained"
            startIcon={<Plus size={16} />}
            onClick={() => setOpenAddModal(true)}
          >
            Add
          </Button>
        </Box>
      </Box>

      {/* Filter Toolbar */}
      <Card>
        <CardContent sx={{ p: 2 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '2fr 1fr' }, gap: 2 }}>
            <TextField
              size="small"
              placeholder="Search by employee name, ID (e.g. BR-001), department, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: <Search size={18} style={{ marginRight: 8, color: '#94A3B8' }} />,
                },
              }}
            />

            <FormControl size="small" fullWidth>
              <InputLabel>Filter By Organization</InputLabel>
              <Select
                value={selectedOrgFilter}
                label="Filter By Organization"
                onChange={(e) => setSelectedOrgFilter(e.target.value)}
              >
                <MenuItem value="ALL">All Organizations ({organizations.length})</MenuItem>
                {organizations.map((org) => (
                  <MenuItem key={org.id} value={org.orgId}>
                    {org.name} ({org.orgId})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </CardContent>
      </Card>

      {/* Employee Master Table */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Organization</TableCell>
                  <TableCell>Department</TableCell>
                  <TableCell>Contact</TableCell>
                  <TableCell>Joined</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Details</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredEmployees
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((emp) => (
                  <TableRow key={emp.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar
                          sx={{
                            width: 34,
                            height: 34,
                            bgcolor: '#FFF7ED',
                            color: '#FF6900',
                            border: '1px solid #FED7AA',
                            fontSize: '0.84rem',
                            fontWeight: 700,
                          }}
                        >
                          {emp.name.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {emp.name}
                          </Typography>
                          <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 600, color: '#FF6900' }}>
                            {emp.employeeId}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {emp.orgName}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {emp.orgId}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Chip label={emp.department} size="small" sx={{ bgcolor: '#F1F5F9', color: '#475569', fontWeight: 500 }} />
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontSize: '0.8125rem' }}>
                        <Phone size={13} color="#64748B" /> {emp.phone}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {emp.joiningDate}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={emp.status}
                        size="small"
                        sx={{
                          bgcolor: emp.status === 'ACTIVE' ? '#F0FDF4' : '#FFF7ED',
                          color: emp.status === 'ACTIVE' ? '#16A34A' : '#FF6900',
                          fontWeight: 600,
                          border: `1px solid ${emp.status === 'ACTIVE' ? '#BBF7D0' : '#FED7AA'}`,
                        }}
                      />
                    </TableCell>

                    <TableCell>
                      {emp.customData ? (
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                          {Object.entries(emp.customData).map(([k, v]) => (
                            <Chip
                              key={k}
                              label={`${k}: ${v}`}
                              size="small"
                              sx={{ height: 20, fontSize: '0.68rem', bgcolor: '#F8FAFC', border: '1px solid #E2E8F0' }}
                            />
                          ))}
                        </Box>
                      ) : (
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>—</Typography>
                      )}
                    </TableCell>

                    <TableCell align="right">
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                        <Tooltip title="Log punch">
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<Clock size={13} />}
                            onClick={() => {
                              setPunchEmployee(emp);
                              setOpenPunchModal(true);
                            }}
                            sx={{ fontSize: '0.75rem', py: 0.3, px: 1 }}
                          >
                            Punch
                          </Button>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={async () => {
                              if (confirm(`Remove ${emp.name}?`)) {
                                await deleteEmployeeRecord(emp.id);
                                setSnackbarMsg(`${emp.name} removed.`);
                              }
                            }}
                          >
                            <Trash2 size={16} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}

                {filteredEmployees.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        No employees found.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={filteredEmployees.length}
            page={page}
            onPageChange={(_e, p) => setPage(p)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
            rowsPerPageOptions={[5, 10, 25]}
          />
        </CardContent>
      </Card>

      {/* Modal: Enrol New Employee */}
      <Dialog open={openAddModal} onClose={() => setOpenAddModal(false)} maxWidth="sm" fullWidth>
        <form onSubmit={handleAddEmployee}>
          <DialogTitle sx={{ fontWeight: 700 }}>Add Employee</DialogTitle>
          <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Company</InputLabel>
              <Select value={orgId} label="Company" onChange={(e) => setOrgId(e.target.value)}>
                {organizations.map((org) => (
                  <MenuItem key={org.id} value={org.orgId}>
                    {org.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box sx={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 2 }}>
              <TextField
                label="Full Employee Name"
                required
                size="small"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ramesh Sharma"
              />
              <TextField
                label="Employee ID (BR-XXX)"
                size="small"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                placeholder="BR-035"
              />
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Department</InputLabel>
                <Select value={department} label="Department" onChange={(e) => setDepartment(e.target.value)}>
                  <MenuItem value="Engineering">Engineering</MenuItem>
                  <MenuItem value="HR & Admin">HR & Admin</MenuItem>
                  <MenuItem value="Design">Design</MenuItem>
                  <MenuItem value="Marketing & Sales">Marketing & Sales</MenuItem>
                  <MenuItem value="Operations">Operations</MenuItem>
                  <MenuItem value="Finance">Finance</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="Contact Phone"
                size="small"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
              />
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextField
                label="Blood Group"
                size="small"
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                placeholder="O+"
              />
              <TextField
                label="Emergency Contact"
                size="small"
                value={emergencyContact}
                onChange={(e) => setEmergencyContact(e.target.value)}
                placeholder="+91 98765 00000"
              />
            </Box>

            <Box sx={{ p: 1.5, bgcolor: '#FFF7ED', borderRadius: 1, border: '1px solid #FED7AA' }}>
              <Typography variant="caption" sx={{ color: '#C2410C', fontWeight: 600, display: 'block' }}>
                Note:
              </Typography>
              <Typography variant="caption" sx={{ color: '#9A3412' }}>
                Employee can register at any company kiosk terminal or via mobile self-service link.
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setOpenAddModal(false)} sx={{ color: 'text.secondary' }}>
              Cancel
            </Button>
            <Button type="submit" variant="contained">
              Save
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Modal: Manual Attendance Punch */}
      <Dialog open={openPunchModal} onClose={() => setOpenPunchModal(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Log Attendance</DialogTitle>
        <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant="body2">
            Record punch for <strong>{punchEmployee?.name}</strong> ({punchEmployee?.employeeId})
          </Typography>

          <FormControl fullWidth size="small">
            <InputLabel>Punch Direction</InputLabel>
            <Select value={punchType} label="Punch Direction" onChange={(e) => setPunchType(e.target.value as 'IN' | 'OUT')}>
              <MenuItem value="IN">Clock IN (Start Shift / Break Return)</MenuItem>
              <MenuItem value="OUT">Clock OUT (Break / Shift End)</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenPunchModal(false)} sx={{ color: 'text.secondary' }}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleLogManualPunch}>
            Log
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={Boolean(snackbarMsg)}
        autoHideDuration={3000}
        onClose={() => setSnackbarMsg('')}
      >
        <Alert severity="success" variant="filled" sx={{ fontSize: '0.84rem' }}>
          {snackbarMsg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
