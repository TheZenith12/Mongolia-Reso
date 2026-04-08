import type { Metadata } from 'next';
import { Toaster } from 'react-hot-toast';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Монгол Нутаг — Амралт & Байгалийн Үзэсгэлэн',
    template: '%s | Монгол Нутаг',
  },
  description:
    'Монгол Улсын хамгийн сайхан амралтын газрууд, байгалийн үзэсгэлэнт газруудыг нэг дороос хайх, захиалах платформ.',
  keywords: ['монгол амралт', 'байгалийн үзэсгэлэн', 'аяллын газар', 'resort mongolia'],
  authors: [{ name: 'Монгол Нутаг' }],
  openGraph: {
    type: 'website',
    locale: 'mn_MN',
    url: 'https://mongolnudag.mn',
    siteName: 'Монгол Нутаг',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="mn" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              fontFamily: "'Outfit', sans-serif",
              fontSize: '14px',
              borderRadius: '12px',
              background: '#0f2d1e',
              color: '#f9f4ed',
              border: '1px solid rgba(255,255,255,0.08)',
            },
            success: { iconTheme: { primary: '#4fa377', secondary: '#f9f4ed' } },
            error:   { iconTheme: { primary: '#ef4444', secondary: '#f9f4ed' } },
          }}
        />
      </body>
    </html>
  );
}
