import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'GALACTIC STRIKER',
  description: '宇宙人の侵略を阻止せよ',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
