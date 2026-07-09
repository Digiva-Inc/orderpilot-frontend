import { Inter } from 'next/font/google';
import './globals.css';
import AppLayout from '../components/AppLayout';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata = {
  title: 'OrderPilot | Professional ERP',
  description: 'Premium order management dashboard',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased min-h-screen flex flex-col bg-[#FAFAFA] text-black font-sans selection:bg-black selection:text-white">
        <AppLayout>
          {children}
        </AppLayout>
      </body>
    </html>
  );
}
