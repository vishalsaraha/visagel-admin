'use client';
import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Avatar,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Button,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Clock,
  Users,
  Calendar,
  Layers,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Download,
  Shield,
} from 'lucide-react';
import { useAdminData } from '@/context/AdminDataContext';
import { EmployeeAttendance, EnrolledEmployee, ShiftEntry } from '@/types';

export const AppDataInspector: React.FC = () => {
  const { attendance, employees, shifts, organizations } = useAdminData();
  const [tabIndex, setTabIndex] = useState(0);
  const [selectedOrgFilter, setSelectedOrgFilter] = useState('');
  const [authorizedOrgs, setAuthorizedOrgs] = useState<string[]>([]);
  const [requestingAccess, setRequestingAccess] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Filtered datasets (require organization selection)
  const filteredAttendance = selectedOrgFilter ? attendance.filter((item) => {
    const matchesOrg = item.orgId === selectedOrgFilter;
    const matchesQuery =
      !searchQuery ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.department?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesOrg && matchesQuery;
  }) : [];

  const filteredEmployees = selectedOrgFilter ? employees.filter((item) => {
    const matchesOrg = item.orgId === selectedOrgFilter;
    const matchesQuery =
      !searchQuery ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.phone.includes(searchQuery);
    return matchesOrg && matchesQuery;
  }) : [];

  const filteredShifts = selectedOrgFilter ? shifts.filter((item) => {
    return item.orgId === selectedOrgFilter;
  }) : [];

  const exportData = (type: string, data: any) => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `visagel_${type}_export.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleRequestAccess = () => {
    setRequestingAccess(true);
    // Simulate an approval delay
    setTimeout(() => {
      setAuthorizedOrgs((prev) => [...prev, selectedOrgFilter]);
      setRequestingAccess(false);
    }, 1200);
  };

  const hasAccess = authorizedOrgs.includes(selectedOrgFilter);
  const selectedOrgData = organizations.find((o) => o.orgId === selectedOrgFilter);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Header & Filter Toolbar */}
      <Card>
        <CardContent sx={{ p: 3 }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              justifyContent: 'space-between',
              alignItems: { xs: 'stretch', md: 'center' },
              gap: 2,
              mb: 2.5,
            }}
          >
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>
                App Biometric & Attendance Data Hub
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Full administrative visibility into all face detection punches, enrolled staff records, and shifts across client companies.
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Button
                variant="outlined"
                startIcon={<Download size={16} />}
                onClick={() => {
                  if (tabIndex === 0) exportData('attendance', filteredAttendance);
                  else if (tabIndex === 1) exportData('employees', filteredEmployees);
                  else exportData('shifts', filteredShifts);
                }}
                sx={{ textTransform: 'none', fontWeight: 600 }}
              >
                Export JSON Log
              </Button>
            </Box>
          </Box>

          {/* Filters */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 2 }}>
            <TextField
              size="small"
              placeholder="Search by employee name, employee ID (e.g. BR-001), or department..."
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
                <MenuItem value="" disabled>Select a client organization</MenuItem>
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

      {/* Tabs & Data Table */}
      {selectedOrgFilter && !hasAccess ? (
        <Card>
          <CardContent sx={{ p: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2.5 }}>
            <Box sx={{ width: 64, height: 64, borderRadius: '50%', bgcolor: '#FFF1F2', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #FFE4E6' }}>
              <Shield size={32} color="#E11D48" />
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#0F172A', mb: 1 }}>
                Data Privacy Restriction
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 450, mx: 'auto', mb: 2 }}>
                As a Branzept Admin, you need explicit temporary permission to view the biometric profiles and attendance logs for <strong>{selectedOrgData?.name}</strong>.
              </Typography>
              <Button
                variant="contained"
                onClick={handleRequestAccess}
                disabled={requestingAccess}
                sx={{ fontWeight: 600, px: 3, py: 1 }}
              >
                {requestingAccess ? 'Requesting Access...' : 'Request Temporary Access'}
              </Button>
            </Box>
          </CardContent>
        </Card>
      ) : selectedOrgFilter && hasAccess ? (
        <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
          <Tabs
            value={tabIndex}
            onChange={(_, val) => setTabIndex(val)}
            textColor="primary"
            indicatorColor="primary"
          >
            <Tab
              icon={<Clock size={18} />}
              iconPosition="start"
              label={`Live Punch Logs (${filteredAttendance.length})`}
              sx={{ fontWeight: 700, textTransform: 'none', py: 2 }}
            />
            <Tab
              icon={<Users size={18} />}
              iconPosition="start"
              label={`Enrolled Biometric Staff (${filteredEmployees.length})`}
              sx={{ fontWeight: 700, textTransform: 'none', py: 2 }}
            />
            <Tab
              icon={<Layers size={18} />}
              iconPosition="start"
              label={`Tenant Shifts & Rules (${filteredShifts.length})`}
              sx={{ fontWeight: 700, textTransform: 'none', py: 2 }}
            />
          </Tabs>
        </Box>

        <CardContent sx={{ p: 0 }}>
          {/* TAB 0: Attendance Logs */}
          {tabIndex === 0 && (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Employee Details</TableCell>
                    <TableCell>Organization</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Punch Sequence (IN / OUT)</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Total Working Time</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredAttendance.map((rec) => (
                    <TableRow key={rec.id} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {rec.name}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                          <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 600, color: 'primary.main' }}>
                            {rec.employeeId}
                          </Typography>
                          {rec.department && (
                            <Chip label={rec.department} size="small" sx={{ height: 18, fontSize: '0.65rem' }} />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {rec.orgName}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {rec.orgId}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{rec.date}</Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
                          {rec.punches.map((p) => (
                            <Chip
                              key={p.id}
                              label={`${p.type}: ${p.time}`}
                              size="small"
                              color={p.type === 'IN' ? 'success' : 'secondary'}
                              variant={p.type === 'IN' ? 'filled' : 'outlined'}
                              sx={{ fontWeight: 600, fontSize: '0.72rem' }}
                            />
                          ))}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={rec.status}
                          size="small"
                          color={rec.status === 'PRESENT' ? 'success' : rec.status === 'LATE' ? 'warning' : 'default'}
                          sx={{ fontWeight: 700, fontSize: '0.7rem' }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {rec.totalWorkingHours || 'Ongoing'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredAttendance.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          No attendance punch records found for the selected criteria.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* TAB 1: Enrolled Employees */}
          {tabIndex === 1 && (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Employee Name</TableCell>
                    <TableCell>Organization</TableCell>
                    <TableCell>Department</TableCell>
                    <TableCell>Contact Phone</TableCell>
                    <TableCell>Enrolled Date</TableCell>
                    <TableCell>Biometric Status</TableCell>
                    <TableCell>Custom Fields</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredEmployees.map((emp) => (
                    <TableRow key={emp.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar sx={{ width: 34, height: 34, bgcolor: 'primary.main', fontSize: '0.85rem', fontWeight: 700 }}>
                            {emp.name.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 700 }}>
                              {emp.name}
                            </Typography>
                            <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'primary.main' }}>
                              {emp.employeeId}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {emp.orgName}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {emp.orgId}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={emp.department} size="small" variant="outlined" sx={{ fontWeight: 600 }} />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{emp.phone}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{emp.joiningDate}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={<CheckCircle2 size={12} />}
                          label="Face Model Enrolled"
                          size="small"
                          color="success"
                          sx={{ height: 22, fontSize: '0.68rem', fontWeight: 700 }}
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
                                sx={{ height: 20, fontSize: '0.65rem' }}
                              />
                            ))}
                          </Box>
                        ) : (
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            Standard
                          </Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* TAB 2: Shift Configurations */}
          {tabIndex === 2 && (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Shift Name</TableCell>
                    <TableCell>Organization ID</TableCell>
                    <TableCell>Working Window</TableCell>
                    <TableCell>Late Mark Cutoff</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredShifts.map((shift) => (
                    <TableRow key={shift.id} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {shift.name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace', color: 'primary.main' }}>
                          {shift.orgId}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {String(shift.startHour).padStart(2, '0')}:{String(shift.startMin).padStart(2, '0')} -{' '}
                          {String(shift.endHour).padStart(2, '0')}:{String(shift.endMin).padStart(2, '0')}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: 'warning.main', fontWeight: 600 }}>
                          {String(shift.lateCutoffHour).padStart(2, '0')}:{String(shift.lateCutoffMin).padStart(2, '0')}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={shift.isActive ? 'Active Shift' : 'Inactive'}
                          size="small"
                          color={shift.isActive ? 'success' : 'default'}
                          sx={{ fontWeight: 700 }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
      ) : (
        <Card>
          <CardContent sx={{ p: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
            <Box sx={{ width: 64, height: 64, borderRadius: '50%', bgcolor: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Layers size={32} color="#64748B" />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#334155' }}>
              No Organization Selected
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 400, textAlign: 'center' }}>
              Please select a client organization from the dropdown above to view their biometric attendance logs, enrolled staff, and shift configurations.
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};
