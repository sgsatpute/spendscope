import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SpendScope — Free AI Tool Spend Audit',
  description: 'Find out in 2 minutes where your team is overspending on AI tools. Free audit. No login required.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://spendscope.app'),
  openGraph: {
    title: 'SpendScope — Free AI Tool Spend Audit',
    description: 'Find out in 2 minutes where your team is overspending on AI tools. Free audit. No login required.',
    type: 'website',
    images: ['/og-image.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SpendScope — Free AI Tool Spend Audit',
    description: 'Find out in 2 minutes where your team is overspending on AI tools.',
    images: ['/og-image.png'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="grain min-h-screen">
        {children}
      </body>
    </html>
  );
}
