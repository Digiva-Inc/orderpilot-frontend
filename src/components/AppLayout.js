'use client';
import { usePathname } from 'next/navigation';
import Header from './Header';
import Sidebar from './Sidebar';

export default function AppLayout({ children }) {
  const pathname = usePathname();

  // Pages that should not have the Sidebar and Header
  const noLayoutPages = ['/login'];

  if (noLayoutPages.includes(pathname)) {
    return <main>{children}</main>;
  }

  return (
    <div className="flex flex-grow min-h-screen w-full">
      <Sidebar />
      <div className="flex-grow flex flex-col">
        <Header />
        <main className="p-8 flex-grow">
          {children}
        </main>
      </div>
    </div>
  );
}
