'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

export default function Dashboard() {
  const [stats, setStats] = useState({ total_customers: 0, total_products: 0, total_orders: 0, total_revenue: 0 });
  const [chartData, setChartData] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchDashboardData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        const headers = { 'Authorization': `Bearer ${token}` };
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

        const [summaryRes, chartRes, ordersRes] = await Promise.all([
          fetch(`${apiUrl}/api/dashboard/summary`, { headers }),
          fetch(`${apiUrl}/api/dashboard/chart`, { headers }),
          fetch(`${apiUrl}/api/dashboard/recent-orders`, { headers })
        ]);

        if (summaryRes.status === 401 || summaryRes.status === 403) {
          localStorage.removeItem('token');
          router.push('/login');
          return;
        }

        if (summaryRes.ok) setStats(await summaryRes.json());
        if (chartRes.ok) setChartData(await chartRes.json());
        if (ordersRes.ok) setRecentOrders(await ordersRes.json());
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [router]);

  return (
    <div className="animate-fade-in max-w-7xl mx-auto space-y-6">
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-800 mb-1">Overview</h2>
        <p className="text-slate-500 text-sm">Welcome back. Here is what is happening with your operations today.</p>
      </div>
      
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => <div key={i} className="h-32 bg-white border border-slate-100 animate-pulse rounded-2xl shadow-sm"></div>)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="p-5 bg-white border border-slate-100 rounded-xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
            <h3 className="text-slate-500 font-semibold text-[10px] uppercase tracking-wider mb-1">Total Pipeline Revenue</h3>
            <div className="flex items-end gap-2">
              <p className="text-2xl font-extrabold text-slate-800 tracking-tight">${Number(stats.total_revenue || 0).toLocaleString()}</p>
            </div>
            <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-blue-50 rounded-full opacity-50 pointer-events-none"></div>
          </div>

          <div className="p-5 bg-white border border-slate-100 rounded-xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
            <h3 className="text-slate-500 font-semibold text-[10px] uppercase tracking-wider mb-1">Paid Revenue (Invoiced)</h3>
            <div className="flex items-end gap-2">
              <p className="text-2xl font-extrabold text-slate-800 tracking-tight">${Number(stats.paid_revenue || 0).toLocaleString()}</p>
            </div>
            <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-green-50 rounded-full opacity-50 pointer-events-none"></div>
          </div>

          <div className="p-5 bg-white border border-slate-100 rounded-xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
            <h3 className="text-slate-500 font-semibold text-[10px] uppercase tracking-wider mb-1">Unpaid Receivables</h3>
            <div className="flex items-end gap-2">
              <p className="text-2xl font-extrabold text-slate-800 tracking-tight">${Number(stats.unpaid_revenue || 0).toLocaleString()}</p>
            </div>
            <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-amber-50 rounded-full opacity-50 pointer-events-none"></div>
          </div>

          <div className="p-5 bg-white border border-slate-100 rounded-xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
            <h3 className="text-slate-500 font-semibold text-[10px] uppercase tracking-wider mb-1">Active Customers</h3>
            <div className="flex items-end gap-2">
              <p className="text-2xl font-extrabold text-slate-800 tracking-tight">{stats.total_customers}</p>
            </div>
            <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-purple-50 rounded-full opacity-50 pointer-events-none"></div>
          </div>
        </div>
      )}

      {/* Charts & Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-6">
        
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white border border-slate-100 rounded-2xl shadow-sm p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Revenue Trend (30 Days)</h3>
          {loading ? (
            <div className="h-[300px] bg-slate-50 animate-pulse rounded-xl"></div>
          ) : (
            <div className="h-[300px] w-full">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} tickFormatter={(value) => `$${value}`} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      formatter={(value) => [`$${value}`, 'Revenue']}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400">No data available for the last 30 days</div>
              )}
            </div>
          )}
        </div>

        {/* Recent Orders */}
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 overflow-hidden flex flex-col">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Recent Orders</h3>
          <div className="flex-1 overflow-auto">
            {loading ? (
              <div className="space-y-4">
                {[1,2,3].map(i => <div key={i} className="h-12 bg-slate-50 animate-pulse rounded-lg"></div>)}
              </div>
            ) : recentOrders.length > 0 ? (
              <div className="space-y-4">
                {recentOrders.map(order => (
                  <div key={order.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer" onClick={() => router.push(`/sales/order-confirmation/edit/${order.id}`)}>
                    <div>
                      <p className="font-semibold text-slate-800 text-sm">{order.order_number}</p>
                      <p className="text-xs text-slate-500 truncate max-w-[150px]">{order.customer_name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-800 text-sm">${Number(order.total_amount).toFixed(2)}</p>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        order.status === 'Invoiced' ? 'bg-amber-100 text-amber-700' :
                        order.status === 'Confirmed' ? 'bg-green-100 text-green-700' :
                        order.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400">No recent orders found</div>
            )}
          </div>
          <button 
            onClick={() => router.push('/sales/orders')}
            className="w-full mt-4 py-2.5 text-sm font-semibold text-amber-600 bg-amber-50 hover:bg-amber-100 rounded-xl transition-colors"
          >
            View All Orders
          </button>
        </div>

        {/* Brand Catalog Breakdown */}
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 overflow-hidden flex flex-col">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Catalog by Brand</h3>
          <div className="flex-1 overflow-auto">
            {loading ? (
              <div className="space-y-4">
                {[1,2,3].map(i => <div key={i} className="h-12 bg-slate-50 animate-pulse rounded-lg"></div>)}
              </div>
            ) : stats.brand_breakdown && stats.brand_breakdown.length > 0 ? (
              <div className="space-y-4">
                {stats.brand_breakdown.map((brand, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                    <p className="font-semibold text-slate-800 text-sm">{brand.brand}</p>
                    <span className="text-xs font-bold text-slate-500 bg-white px-2 py-1 rounded shadow-sm border border-slate-100">
                      {brand.count} Products
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400">No brands configured</div>
            )}
          </div>
          <button 
            onClick={() => router.push('/settings')}
            className="w-full mt-4 py-2.5 text-sm font-semibold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors"
          >
            Manage Catalog
          </button>
        </div>

      </div>
    </div>
  );
}
