'use client';
import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
  Divider,
  Button,
} from '@mui/material';
import {
  Copy,
  Check,
  KeyRound,
  Smartphone,
  Globe,
} from 'lucide-react';
import { Organization } from '@/types';

interface OrgCredentialsCardProps {
  organization: Organization;
}

export const OrgCredentialsCard: React.FC<OrgCredentialsCardProps> = ({ organization }) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showKey, setShowKey] = useState(false);

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2500);
  };

  return (
    <Card>
      <CardContent sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: 1,
                bgcolor: '#EFF6FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#2563EB',
              }}
            >
              <KeyRound size={18} />
            </Box>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                App Credentials & Deep Links
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Access parameters required for client app kiosks
              </Typography>
            </Box>
          </Box>

          <Button
            size="small"
            variant="outlined"
            startIcon={<Copy size={14} />}
            onClick={() => {
              const fullBundle = `=== VISAGEL CLIENT APP CREDENTIALS ===\nOrganization Name: ${organization.name}\nOrganization ID: ${organization.orgId}\nDirect Mobile Login URL: ${organization.clientAppLoginUrl}\nSecret API Key: ${organization.secretApiKey}\nWeb Portal URL: ${organization.webPortalUrl}\nPrimary Admin ID: ${organization.admins[0]?.loginId || 'admin'}\nPrimary Admin Password: ${organization.admins[0]?.password || '***'}\n=======================================`;
              copyToClipboard(fullBundle, 'All Credentials Package');
            }}
            sx={{ fontSize: '0.8125rem' }}
          >
            Copy Setup Pack
          </Button>
        </Box>

        {/* 4 Key Credential Blocks */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
            gap: 1.5,
          }}
        >
          {/* Organization ID */}
          <Box
            sx={{
              p: 1.5,
              borderRadius: 1,
              bgcolor: '#F8FAFC',
              border: '1px solid #E2E8F0',
            }}
          >
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.68rem' }}>
              Unique Organization ID
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 0.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#2563EB', fontFamily: 'monospace' }}>
                {organization.orgId}
              </Typography>
              <Tooltip title="Copy Org ID">
                <IconButton size="small" onClick={() => copyToClipboard(organization.orgId, 'Organization ID')}>
                  {copiedField === 'Organization ID' ? <Check size={14} color="#16A34A" /> : <Copy size={14} />}
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* Client Mobile App Deep Link URL */}
          <Box
            sx={{
              p: 1.5,
              borderRadius: 1,
              bgcolor: '#F8FAFC',
              border: '1px solid #E2E8F0',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Smartphone size={14} color="#2563EB" />
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.68rem' }}>
                Mobile Direct Login URL
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 0.5 }}>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 500,
                  fontFamily: 'monospace',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: '85%',
                  fontSize: '0.8125rem',
                }}
              >
                {organization.clientAppLoginUrl}
              </Typography>
              <Tooltip title="Copy Mobile Direct URL">
                <IconButton
                  size="small"
                  onClick={() => copyToClipboard(organization.clientAppLoginUrl, 'Mobile App Deep Link URL')}
                >
                  {copiedField === 'Mobile App Deep Link URL' ? <Check size={14} color="#16A34A" /> : <Copy size={14} />}
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* Secret API Key */}
          <Box
            sx={{
              p: 1.5,
              borderRadius: 1,
              bgcolor: '#F8FAFC',
              border: '1px solid #E2E8F0',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.68rem' }}>
                Secret API Key
              </Typography>
              <Typography
                variant="caption"
                onClick={() => setShowKey(!showKey)}
                sx={{ color: '#2563EB', cursor: 'pointer', fontWeight: 600 }}
              >
                {showKey ? 'Hide' : 'Reveal'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 0.5 }}>
              <Typography variant="body2" sx={{ fontWeight: 500, fontFamily: 'monospace', fontSize: '0.8125rem' }}>
                {showKey ? organization.secretApiKey : '••••••••••••••••••••••••••••••••'}
              </Typography>
              <Tooltip title="Copy API Key">
                <IconButton
                  size="small"
                  onClick={() => copyToClipboard(organization.secretApiKey, 'Secret API Key')}
                >
                  {copiedField === 'Secret API Key' ? <Check size={14} color="#16A34A" /> : <Copy size={14} />}
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* Organization Web Portal URL */}
          <Box
            sx={{
              p: 1.5,
              borderRadius: 1,
              bgcolor: '#F8FAFC',
              border: '1px solid #E2E8F0',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Globe size={14} color="#475569" />
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.68rem' }}>
                Web Portal Link
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 0.5 }}>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 500,
                  fontFamily: 'monospace',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: '85%',
                  fontSize: '0.8125rem',
                }}
              >
                {organization.webPortalUrl}
              </Typography>
              <Tooltip title="Copy Web Portal Link">
                <IconButton
                  size="small"
                  onClick={() => copyToClipboard(organization.webPortalUrl, 'Web Portal Link')}
                >
                  {copiedField === 'Web Portal Link' ? <Check size={14} color="#16A34A" /> : <Copy size={14} />}
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </Box>

        <Snackbar
          open={Boolean(copiedField)}
          autoHideDuration={2500}
          onClose={() => setCopiedField(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert severity="success" variant="filled" sx={{ width: '100%' }}>
            {copiedField} copied to clipboard!
          </Alert>
        </Snackbar>
      </CardContent>
    </Card>
  );
};

