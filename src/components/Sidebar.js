'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 min-w-[16rem] max-w-[16rem] flex-shrink-0 border-r border-gray-200 p-6 h-screen fixed top-0 left-0 bg-white flex flex-col overflow-y-auto">
      <div className="mb-8 px-2">
        <img
          src="/logo.svg"
          alt="OrderPilot Logo"
          className="w-full h-12 object-contain object-left"
        />
      </div>

      <nav className="flex flex-col gap-2 flex-grow">
        <Link
          href="/dashboard"
          className={`block px-4 py-3 rounded-xl font-semibold text-sm transition-all ${
            pathname === '/dashboard'
              ? 'bg-black text-white shadow-md'
              : 'text-gray-600 hover:bg-gray-100 hover:text-black'
          }`}
        >
          Dashboard
        </Link>

        <Link
          href="/customers/new"
          className={`block px-4 py-3 rounded-xl font-semibold text-sm transition-all ${
            pathname === '/customers/new'
              ? 'bg-black text-white shadow-md'
              : 'text-gray-600 hover:bg-gray-100 hover:text-black'
          }`}
        >
          New Customer
        </Link>

        <Link
          href="/products/new"
          className={`block px-4 py-3 rounded-xl font-semibold text-sm transition-all ${
            pathname === '/products/new'
              ? 'bg-black text-white shadow-md'
              : 'text-gray-600 hover:bg-gray-100 hover:text-black'
          }`}
        >
          Products & Brands
        </Link>

        <Link
          href="/sales/orders"
          className={`block px-4 py-3 rounded-xl font-semibold text-sm transition-all ${
            pathname === '/sales/orders'
              ? 'bg-black text-white shadow-md'
              : 'text-gray-600 hover:bg-gray-100 hover:text-black'
          }`}
        >
          Order Confirmation
        </Link>

        <Link
          href="/sales/invoices"
          className={`block px-4 py-3 rounded-xl font-semibold text-sm transition-all ${
            pathname === '/sales/invoices'
              ? 'bg-black text-white shadow-md'
              : 'text-gray-600 hover:bg-gray-100 hover:text-black'
          }`}
        >
          Commercial Invoice
        </Link>

        <Link
          href="/settings"
          className={`block px-4 py-3 rounded-xl font-semibold text-sm transition-all ${
            pathname === '/settings'
              ? 'bg-black text-white shadow-md'
              : 'text-gray-600 hover:bg-gray-100 hover:text-black'
          }`}
        >
          Settings
        </Link>
      </nav>

      <div className="mt-auto pt-8 border-t border-gray-100">
        <div className="flex items-center gap-3 px-3">
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold text-gray-600">
            A
          </div>

          <div className="text-sm font-medium text-black">
            Admin User
          </div>
        </div>
      </div>
    </aside>
  );
}