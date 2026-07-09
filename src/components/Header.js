'use client';
import { usePathname, useRouter } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();

  const getBreadcrumb = () => {
    if (pathname === '/dashboard') return 'Dashboard';
    if (pathname.includes('/customers/new')) return 'New Customer';
    if (pathname.includes('/products/new')) return 'Products & Brands';
    if (pathname.includes('/order-confirmation')) return 'Create Order';
    if (pathname === '/sales/orders') return 'Orders List';
    if (pathname === '/sales/invoices') return 'Invoices';
    if (pathname === '/settings') return 'Settings';
    return 'Sales Operations';
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  return (
    <header className="flex justify-between items-center h-20 px-8 border-b border-gray-200 bg-white sticky top-0 z-10">
      <div className="flex items-center gap-4 text-sm font-medium text-gray-500">
        <span>Workspace</span>
        <span className="text-gray-300">/</span>
        <span className="text-black">{getBreadcrumb()}</span>
      </div>
      <nav className="flex items-center gap-4">
        <button onClick={handleLogout} className="p-2.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-all" title="Logout">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </nav>
    </header>
  );
}
