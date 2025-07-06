import './globals.css';
import type { Metadata } from 'next';
import { Space_Grotesk, Karla } from 'next/font/google';

const spaceGrotesk = Space_Grotesk({ 
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const karla = Karla({ 
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'FinanceOS - Personal Finance Dashboard',
  description: 'Advanced Financial Intelligence System - Track your income, expenses, and financial goals with beautiful visualizations',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${karla.variable}`}>
      <body className={karla.className}>{children}</body>
    </html>
  );
}