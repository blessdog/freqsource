import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'freqsource',
  description: 'Topic radar for the bleeding edge of AI / tech',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
