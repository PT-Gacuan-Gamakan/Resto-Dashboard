import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
const baseUrl = siteUrl
  ? siteUrl.startsWith('http')
    ? siteUrl
    : `https://${siteUrl}`
  : 'http://localhost:3000';
const appTitle = 'Resto Dashboard | Monitoring Pengunjung Real-time';
const appDescription = 'Pantau jumlah pengunjung restoran secara real-time dengan dasbor interaktif.';

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: appTitle,
    template: '%s | Resto Dashboard',
  },
  description: appDescription,
  keywords: [
    'restoran',
    'dashboard',
    'monitoring pengunjung',
    'occupancy',
    'MQTT',
    'analytics',
  ],
  authors: [{ name: 'Resto Dashboard Team' }],
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: baseUrl,
    siteName: 'Resto Dashboard',
    title: appTitle,
    description: appDescription,
    images: [
      {
        url: '/icon.png',
        width: 512,
        height: 512,
        alt: 'Logo Resto Dashboard',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: appTitle,
    description: appDescription,
    images: ['/icon.png'],
  },
  alternates: {
    canonical: baseUrl,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  icons: {
    icon: '/icon.png',
    apple: '/icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
