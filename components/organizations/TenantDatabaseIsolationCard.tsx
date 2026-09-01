'use client';
import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Divider,
  Grid,
  Alert,
  Tooltip,
} from '@mui/material';
import { Database, ShieldCheck, Server, HardDrive, Layers, Lock, Cpu, CheckCircle2, ArrowRight } from 'lucide-react';
import { Organization, DbIsolationMode, TenantDatabaseConfig } from '@/types';
import { useAdminData } from '@/context/AdminDataContext';

interface TenantDatabaseIsolationCardProps {
  organization: Organization;
}

export const TenantDatabaseIsolationCard: React.FC<TenantDatabaseIsolationCardProps> = ({ organization }) => {
  const { updateOrgDatabaseConfig } = useAdminData();

  const currentConfig: TenantDatabaseConfig = organization.databaseConfig || {
    isolationMode: 'SHARED_INDEXED',
    databaseName: 'visagel_production_primary',
    collectionPrefix: `punches_${organization.orgId.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}`,
    vectorIndexName: `idx_vector_${organization.orgId.toLowerCase()}`,
    clusterEndpoint: 'cluster-ap-south-1.mongodb.net',
    backupS3Bucket: `s3://visagel-backups-ap-south-1/tenants/${organization.orgId}`,
  };

  const [mode, setMode] = useState<DbIsolationMode>(currentConfig.isolationMode);
  const [dbName, setDbName] = useState(currentConfig.databaseName);
  const [collectionPrefix, setCollectionPrefix] = useState(currentConfig.collectionPrefix || '');
  const [vectorIndex, setVectorIndex] = useState(currentConfig.vectorIndexName);
  const [isSaved, setIsSaved] = useState(false);

  const handleSaveConfig = async () => {
    let updatedConfig: TenantDatabaseConfig;
    if (mode === 'SHARED_INDEXED') {
      updatedConfig = {
        isolationMode: 'SHARED_INDEXED',
        databaseName: 'visagel_production_primary',
        collectionPrefix: undefined,
        vectorIndexName: `idx_vector_shared_${organization.orgId.toLowerCase()}`,
        clusterEndpoint: 'cluster-ap-south-1.mongodb.net (Shared Replica Set)',
        backupS3Bucket: `s3://visagel-backups/shared-partitions/${organization.orgId}`,
      };
    } else if (mode === 'DEDICATED_SCHEMA') {
      updatedConfig = {
        isolationMode: 'DEDICATED_SCHEMA',
        databaseName: 'visagel_production_primary',
        collectionPrefix: `punches_${organization.orgId.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}`,
        vectorIndexName: `idx_vector_${organization.orgId.toLowerCase()}`,
        clusterEndpoint: 'cluster-ap-south-1.mongodb.net (Dedicated Table Schema)',
        backupS3Bucket: `s3://visagel-backups/schemas/${organization.orgId}`,
      };
    } else {
      updatedConfig = {
        isolationMode: 'ISOLATED_CLUSTER',
        databaseName: `visagel_tenant_${organization.slug || organization.orgId.toLowerCase()}`,
        collectionPrefix: 'punches',
        vectorIndexName: 'idx_face_vectors_primary',
        clusterEndpoint: `dedicated-node-${organization.slug || 'tenant'}.visagel.internal:27017`,
        backupS3Bucket: `s3://visagel-enterprise-isolated/${organization.orgId}`,
        readOnlyReplicaUri: `mongodb://readonly-node.${organization.slug}.internal:27017`,
      };
    }

    await updateOrgDatabaseConfig(organization.id, updatedConfig);
    setDbName(updatedConfig.databaseName);
    setCollectionPrefix(updatedConfig.collectionPrefix || '');
    setVectorIndex(updatedConfig.vectorIndexName);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const getModeDetails = (m: DbIsolationMode) => {
    switch (m) {
      case 'SHARED_INDEXED':
        return {
          title: 'Shared Database & Indexed Table (Standard SaaS)',
          desc: 'Stores all punches in the primary `punches` collection with an indexed `orgId` tag. Fastest provisioning, optimal memory sharing, and zero operational overhead.',
          color: '#2563EB',
          bg: '#EFF6FF',
          badge: 'Standard / High Scale',
        };
      case 'DEDICATED_SCHEMA':
        return {
          title: 'Dedicated Table / Collection Schema',
          desc: `Creates an isolated table (\`${collectionPrefix || `punches_${organization.orgId}`}\`) exclusively for ${organization.name}. Eliminates table-level row lock contention during shift peak.`,
          color: '#FF6900',
          bg: '#FFF7ED',
          badge: 'Isolated Collection',
        };
      case 'ISOLATED_CLUSTER':
        return {
          title: 'Dedicated Database & Isolated AWS Node',
          desc: `Full physical isolation. Direct dedicated database (\`${dbName}\`) with its own encryption keys, isolated memory buffer, and dedicated S3 backup bucket for HIPAA/Gov compliance.`,
          color: '#16A34A',
          bg: '#F0FDF4',
          badge: 'Physical Isolation',
        };
    }
  };

  const details = getModeDetails(mode);

  return (
    <Card variant="outlined" sx={{ bgcolor: '#FFFFFF' }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2, flexWrap: 'wrap', gap: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: 2,
                bgcolor: details.bg,
                color: details.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: `1px solid ${details.color}33`,
              }}
            >
              <Database size={20} />
            </Box>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                  Multi-Tenant Database Storage & Isolation Architecture
                </Typography>
                <Chip label={details.badge} size="small" sx={{ bgcolor: details.bg, color: details.color, fontWeight: 700, fontSize: '0.65rem' }} />
              </Box>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Configure whether {organization.name} punches are stored in the shared index table or partitioned into a dedicated database table.
              </Typography>
            </Box>
          </Box>

          <Button
            variant="contained"
            onClick={handleSaveConfig}
            sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.8125rem' }}
          >
            Apply Storage Architecture
          </Button>
        </Box>

        {isSaved && (
          <Alert severity="success" sx={{ mb: 2, fontWeight: 600 }}>
            Database partition and collection routing updated successfully for {organization.name}!
          </Alert>
        )}

        <Grid container spacing={2.5}>
          {/* Isolation Mode Selector */}
          <Grid size={{ xs: 12, md: 4 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Database Multi-Tenancy Architecture</InputLabel>
              <Select
                value={mode}
                label="Database Multi-Tenancy Architecture"
                onChange={(e) => setMode(e.target.value as DbIsolationMode)}
              >
                <MenuItem value="SHARED_INDEXED">
                  <Box sx={{ py: 0.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>1. Shared DB + Indexed orgId</Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>Default multi-tenant pool</Typography>
                  </Box>
                </MenuItem>
                <MenuItem value="DEDICATED_SCHEMA">
                  <Box sx={{ py: 0.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>2. Dedicated Table / Collection</Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>Separate collection per tenant</Typography>
                  </Box>
                </MenuItem>
                <MenuItem value="ISOLATED_CLUSTER">
                  <Box sx={{ py: 0.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>3. Dedicated Isolated Database</Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>Physical database & AWS node</Typography>
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>

            <Box sx={{ mt: 2, p: 2, bgcolor: details.bg, borderRadius: 2, border: `1px solid ${details.color}22` }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: details.color, display: 'block', mb: 0.5 }}>
                {details.title}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem', lineHeight: 1.4, display: 'block' }}>
                {details.desc}
              </Typography>
            </Box>
          </Grid>

          {/* Technical Connection Details */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Box sx={{ p: 2, border: '1px solid #E2E8F0', borderRadius: 2, bgcolor: '#F8FAFC' }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', display: 'block', mb: 1.5 }}>
                Active Routing Matrix & Vector Metadata
              </Typography>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>Target Database</Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 700, color: '#0F172A' }}>
                    {mode === 'ISOLATED_CLUSTER' ? `visagel_tenant_${organization.slug}` : 'visagel_production_primary'}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>Punch Collection / Table</Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 700, color: '#FF6900' }}>
                    {mode === 'SHARED_INDEXED' ? 'punches (indexed by orgId)' : `punches_${organization.orgId.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}`}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>Biometric Vector Index</Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                    {mode === 'ISOLATED_CLUSTER' ? 'idx_face_vectors_primary (2dsphere)' : `idx_vector_${organization.orgId.toLowerCase()}`}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>Backup Retention & Path</Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#16A34A', fontWeight: 600 }}>
                    s3://visagel-backups/tenants/{organization.orgId}/daily.tar.gz
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};
