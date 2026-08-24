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
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  UserPlus,
  Shield,
  KeyRound,
  Trash2,
  Edit,
  Eye,
  EyeOff,
  UserCheck,
  CheckCircle2,
} from 'lucide-react';
import { OrgAdmin, AdminRole } from '@/types';
import { useAdminData } from '@/context/AdminDataContext';

interface OrgAdminListProps {
  orgId: string;
  admins: OrgAdmin[];
}

export const OrgAdminList: React.FC<OrgAdminListProps> = ({ orgId, admins }) => {
  const { addOrgAdmin, updateOrgAdmin, deleteOrgAdmin } = useAdminData();
  const [openModal, setOpenModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<OrgAdmin | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<AdminRole>('HR_MANAGER');
  const [isActive, setIsActive] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const handleOpenAdd = () => {
    setEditingAdmin(null);
    setName('');
    setLoginId('');
    setPassword(`Admin@${Math.floor(1000 + Math.random() * 9000)}`);
    setEmail('');
    setPhone('');
    setRole('HR_MANAGER');
    setIsActive(true);
    setOpenModal(true);
  };

  const handleOpenEdit = (admin: OrgAdmin) => {
    setEditingAdmin(admin);
    setName(admin.name);
    setLoginId(admin.loginId);
    setPassword(admin.password);
    setEmail(admin.email);
    setPhone(admin.phone || '');
    setRole(admin.role);
    setIsActive(admin.isActive);
    setOpenModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !loginId || !password) return;

    if (editingAdmin) {
      await updateOrgAdmin(orgId, editingAdmin.id, {
        name,
        loginId,
        password,
        email,
        phone,
        role,
        isActive,
      });
    } else {
      await addOrgAdmin(orgId, {
        name,
        loginId,
        password,
        email,
        phone,
        role,
        isActive,
      });
    }
    setOpenModal(false);
  };

  const handleDelete = async (adminId: string, adminName: string) => {
    if (admins.length <= 1) {
      alert('Every organization must keep at least one primary admin account.');
      return;
    }
    if (confirm(`Are you sure you want to remove admin access for "${adminName}"?`)) {
      await deleteOrgAdmin(orgId, adminId);
    }
  };

  const getRoleBadge = (r: AdminRole) => {
    switch (r) {
      case 'SUPER_ADMIN':
        return <Chip label="Super Admin" size="small" color="primary" sx={{ fontWeight: 700 }} />;
      case 'HR_MANAGER':
        return <Chip label="HR Manager" size="small" color="secondary" sx={{ fontWeight: 700 }} />;
      case 'HR_STAFF':
        return <Chip label="HR Staff" size="small" variant="outlined" sx={{ fontWeight: 600 }} />;
      default:
        return <Chip label={r} size="small" />;
    }
  };

  return (
    <Card>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
              <UserCheck size={20} color="#FF6900" />
              Organization Internal Admins & HR Accounts
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Create and manage admin credentials scoped inside this organization profile to allow their HR team to log in.
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<UserPlus size={16} />}
            onClick={handleOpenAdd}
            sx={{ fontWeight: 600 }}
          >
            Create Admin ID
          </Button>
        </Box>

        <TableContainer sx={{ borderRadius: 2, border: (t) => `1px solid ${t.palette.divider}` }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Admin Name & Email</TableCell>
                <TableCell>Login ID</TableCell>
                <TableCell>Password</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created Date</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {admins.map((adm) => (
                <TableRow key={adm.id} hover>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {adm.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {adm.email || 'No email specified'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 700, color: 'primary.main' }}>
                      {adm.loginId}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                      {adm.password}
                    </Typography>
                  </TableCell>
                  <TableCell>{getRoleBadge(adm.role)}</TableCell>
                  <TableCell>
                    <Chip
                      label={adm.isActive ? 'Active' : 'Disabled'}
                      size="small"
                      color={adm.isActive ? 'success' : 'default'}
                      variant={adm.isActive ? 'filled' : 'outlined'}
                      sx={{ height: 22, fontSize: '0.7rem', fontWeight: 600 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {new Date(adm.createdAt).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit Admin">
                      <IconButton size="small" onClick={() => handleOpenEdit(adm)}>
                        <Edit size={16} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Admin">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(adm.id, adm.name)}
                        disabled={admins.length <= 1}
                      >
                        <Trash2 size={16} />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Modal for Add / Edit Admin */}
        <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
          <form onSubmit={handleSave}>
            <DialogTitle sx={{ fontWeight: 700 }}>
              {editingAdmin ? `Edit Admin Account (${editingAdmin.loginId})` : 'Create Organization Admin ID'}
            </DialogTitle>
            <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 2 }}>
              <TextField
                label="Full Name"
                required
                fullWidth
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Sarah Connor"
              />
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <TextField
                  label="Login ID / Username"
                  required
                  fullWidth
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value.toLowerCase().replace(/\s+/g, '_'))}
                  helperText="Unique login ID inside this organization"
                  placeholder="e.g. hr_sarah"
                />
                <TextField
                  label="Password"
                  required
                  fullWidth
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  slotProps={{
                    input: {
                      endAdornment: (
                        <IconButton size="small" onClick={() => setShowPassword(!showPassword)}>
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </IconButton>
                      ),
                    },
                  }}
                />
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <TextField
                  label="Email Address"
                  type="email"
                  fullWidth
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="sarah@company.com"
                />
                <TextField
                  label="Phone / Mobile"
                  fullWidth
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 00000"
                />
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, alignItems: 'center' }}>
                <FormControl fullWidth>
                  <InputLabel>Role Level</InputLabel>
                  <Select
                    value={role}
                    label="Role Level"
                    onChange={(e) => setRole(e.target.value as AdminRole)}
                  >
                    <MenuItem value="SUPER_ADMIN">SUPER_ADMIN (Full Settings)</MenuItem>
                    <MenuItem value="HR_MANAGER">HR_MANAGER (Attendance & Enrolment)</MenuItem>
                    <MenuItem value="HR_STAFF">HR_STAFF (View & Reports Only)</MenuItem>
                  </Select>
                </FormControl>

                <FormControlLabel
                  control={
                    <Switch
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Account Active"
                />
              </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button onClick={() => setOpenModal(false)} sx={{ color: 'text.secondary' }}>
                Cancel
              </Button>
              <Button type="submit" variant="contained" sx={{ fontWeight: 600 }}>
                {editingAdmin ? 'Save Changes' : 'Create Admin ID'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      </CardContent>
    </Card>
  );
};
