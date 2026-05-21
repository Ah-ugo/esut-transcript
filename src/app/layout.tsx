/** @format */

import type { Metadata } from 'next';
import { Sora, Playfair_Display } from 'next/font/google';
import './globals.css';
import { Providers } from '../components/Providers';

const sora = Sora({
  subsets: ['latin'],
  variable: '--font-sora',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'ESUT | Result Processing System',
  description:
    'Enugu State University of Science and Technology — Academic Result Processing and Transcript Generation System',
  icons: { icon: '/favicon.ico' },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en' className={`${sora.variable} ${playfair.variable}`}>
      <body className='font-sans antialiased bg-surface-50 text-slate-800'>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
