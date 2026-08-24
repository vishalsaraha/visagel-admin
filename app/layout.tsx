import type { Metadata } from 'next';
import ThemeRegistry from '@/theme/EmotionRegistry';
import { AppThemeProvider } from '@/theme/ThemeContext';
import { AdminDataProvider } from '@/context/AdminDataContext';
import { MainLayout } from '@/components/layout/MainLayout';
import './globals.css';

export const metadata: Metadata = {
  title: 'Visagel Super Admin & Tenant Portal',
  description: 'Multi-Tenant Organization Credential Provisioning, Billing, and Face Recognition Attendance Audit Hub',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ThemeRegistry>
          <AppThemeProvider>
            <AdminDataProvider>
              <MainLayout>{children}</MainLayout>
            </AdminDataProvider>
          </AppThemeProvider>
        </ThemeRegistry>
      </body>
    </html>
  );
}
