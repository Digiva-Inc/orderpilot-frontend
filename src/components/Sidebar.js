import Link from 'next/link';

export default function Sidebar() {
  return (
    <aside className="w-64 border-r border-gray-200 p-6 h-full bg-white flex flex-col">
      <div className="mb-8 px-2">
        <img src="/logo.svg" alt="OrderPilot Logo" className="w-full h-12 object-contain object-left" />
      </div>
      <nav className="flex flex-col gap-1 flex-grow">
        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-3 mt-4">Overview</div>
        <Link href="/dashboard" className="block px-3 py-2 rounded-lg text-gray-600 hover:bg-black hover:text-white transition-all font-medium text-sm">Dashboard</Link>
        
        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-3 mt-8">CRM</div>
        <Link href="/customers/new" className="block px-3 py-2 rounded-lg text-gray-600 hover:bg-black hover:text-white transition-all font-medium text-sm">New Customer</Link>

        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-3 mt-8">Sales & Inventory</div>
        <Link href="/products/new" className="block px-3 py-2 rounded-lg text-gray-600 hover:bg-black hover:text-white transition-all font-medium text-sm">Products & Brands</Link>
        <Link href="/sales/order-confirmation/new" className="block px-3 py-2 rounded-lg text-gray-600 hover:bg-black hover:text-white transition-all font-medium text-sm">Create Order</Link>
        <Link href="/sales/orders" className="block px-3 py-2 rounded-lg text-gray-600 hover:bg-black hover:text-white transition-all font-medium text-sm">Orders List</Link>
        <Link href="/sales/invoices" className="block px-3 py-2 rounded-lg text-gray-600 hover:bg-black hover:text-white transition-all font-medium text-sm">Invoices</Link>
        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-3 mt-8">System</div>
        <Link href="/settings" className="block px-3 py-2 rounded-lg text-gray-600 hover:bg-black hover:text-white transition-all font-medium text-sm">Settings</Link>
      </nav>
      
      <div className="mt-auto pt-8 border-t border-gray-100">
        <div className="flex items-center gap-3 px-3">
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold text-gray-600">A</div>
          <div className="text-sm font-medium text-black">Admin User</div>
        </div>
      </div>
    </aside>
  );
}
