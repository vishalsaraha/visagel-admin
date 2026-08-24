'use client';
import React from 'react';
import { Box } from '@mui/material';
import { AppDataInspector } from '@/components/data-inspector/AppDataInspector';

export default function DataInspectorPage() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
      <AppDataInspector />
    </Box>
  );
}
