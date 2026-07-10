'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';

const BRAND_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

export default function Dashboard() {
  const [stats, setStats] = useState({ 
    total_customers: 0, 
    total_products: 0, 
    total_orders: 0, 
    total_revenue: 0,
    average_order_value: 0,
    paid_revenue: 0,
    unpaid_revenue: 0,
    brand_breakdown: [],
    top_products: [],
    order_status_breakdown: [],
    top_customers: []
  });
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
    <div className="animate-fade-in max-w-[1400px] w-full mx-auto space-y-3 pb-8">
      <div className="mb-3 pt-2">
        <h2 className="text-xl font-bold tracking-tight text-slate-800 mb-0.5">Command Center</h2>
        <p className="text-slate-500 text-xs font-medium">Real-time operational analytics</p>
      </div>
      
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {[1,2,3,4,5].map(i => <div key={i} className="h-20 bg-white border border-slate-100 animate-pulse rounded-xl shadow-sm"></div>)}
        </div>
      ) : (
        <>
          {/* Key Metrics Row (Light Colorful Theme) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <div className="p-3 bg-blue-50/50 border border-blue-100/50 rounded-xl shadow-sm relative overflow-hidden group hover:border-blue-200 transition-colors">
              <h3 className="text-blue-600 font-bold text-[9px] uppercase tracking-wider mb-0.5">Total Revenue</h3>
              <p className="text-xl font-extrabold tracking-tight text-blue-950">${Number(stats.total_revenue || 0).toLocaleString()}</p>
              <svg className="absolute -right-2 -bottom-2 w-12 h-12 text-blue-200/50 group-hover:text-blue-200 transition-colors" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
            </div>

            <div className="p-3 bg-emerald-50/50 border border-emerald-100/50 rounded-xl shadow-sm relative overflow-hidden group hover:border-emerald-200 transition-colors">
              <h3 className="text-emerald-600 font-bold text-[9px] uppercase tracking-wider mb-0.5">Paid (Invoiced)</h3>
              <p className="text-xl font-extrabold tracking-tight text-emerald-950">${Number(stats.paid_revenue || 0).toLocaleString()}</p>
              <svg className="absolute -right-2 -bottom-2 w-12 h-12 text-emerald-200/50 group-hover:text-emerald-200 transition-colors" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15l-4-4 1.41-1.41L11 14.17l6.59-6.59L19 9l-8 8z"/></svg>
            </div>

            <div className="p-3 bg-amber-50/50 border border-amber-100/50 rounded-xl shadow-sm relative overflow-hidden group hover:border-amber-200 transition-colors">
              <h3 className="text-amber-600 font-bold text-[9px] uppercase tracking-wider mb-0.5">Unpaid Receivables</h3>
              <p className="text-xl font-extrabold tracking-tight text-amber-950">${Number(stats.unpaid_revenue || 0).toLocaleString()}</p>
              <svg className="absolute -right-2 -bottom-2 w-12 h-12 text-amber-200/50 group-hover:text-amber-200 transition-colors" fill="currentColor" viewBox="0 0 24 24"><path d="M11 15h2v2h-2zm0-8h2v6h-2zm.99-5C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/></svg>
            </div>

            <div className="p-3 bg-purple-50/50 border border-purple-100/50 rounded-xl shadow-sm relative overflow-hidden group hover:border-purple-200 transition-colors">
              <h3 className="text-purple-600 font-bold text-[9px] uppercase tracking-wider mb-0.5">Avg Order Value</h3>
              <p className="text-xl font-extrabold tracking-tight text-purple-950">${Number(stats.average_order_value || 0).toLocaleString()}</p>
              <svg className="absolute -right-2 -bottom-2 w-12 h-12 text-purple-200/50 group-hover:text-purple-200 transition-colors" fill="currentColor" viewBox="0 0 24 24"><path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/></svg>
            </div>

            <div className="p-3 bg-indigo-50/50 border border-indigo-100/50 rounded-xl shadow-sm relative overflow-hidden group hover:border-indigo-200 transition-colors">
              <h3 className="text-indigo-600 font-bold text-[9px] uppercase tracking-wider mb-0.5">Active Customers</h3>
              <p className="text-xl font-extrabold tracking-tight text-indigo-950">{stats.total_customers}</p>
              <svg className="absolute -right-2 -bottom-2 w-12 h-12 text-indigo-200/50 group-hover:text-indigo-200 transition-colors" fill="currentColor" viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
            </div>
          </div>

          {/* Charts & Leaderboards Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-6 gap-3">
            
            {/* Revenue Area Chart */}
            <div className="lg:col-span-4 bg-white border border-slate-100 rounded-xl shadow-sm p-3 flex flex-col">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Revenue Trend (30 Days)</h3>
              <div className="flex-1 min-h-[160px] w-full -ml-3">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 9}} dy={5} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 9}} tickFormatter={(val) => `$${val/1000}k`} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '6px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '11px', padding: '6px 10px' }}
                        itemStyle={{ color: '#6366f1', fontWeight: 'bold' }}
                        formatter={(value) => [`$${value}`, 'Revenue']}
                      />
                      <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRev)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-400 text-xs font-medium">No data available</div>
                )}
              </div>
            </div>

            {/* Order Status Breakdown */}
            <div className="lg:col-span-2 bg-white border border-slate-100 rounded-xl shadow-sm p-3 flex flex-col">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Pipeline Status</h3>
              <div className="flex-1 flex flex-col justify-center">
                {stats.order_status_breakdown && stats.order_status_breakdown.length > 0 ? (
                  <div className="space-y-3 mt-1">
                    {stats.order_status_breakdown.map((status, idx) => (
                      <div key={idx} className="flex flex-col">
                        <div className="flex justify-between items-end mb-1 text-[10px] uppercase tracking-wider">
                          <span className="font-semibold text-slate-600">{status.status}</span>
                          <span className="text-slate-500 font-bold">${Number(status.revenue).toLocaleString()} <span className="text-slate-400">({status.count})</span></span>
                        </div>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className={`h-1.5 rounded-full ${status.status === 'Invoiced' ? 'bg-emerald-500' : status.status === 'Confirmed' ? 'bg-blue-500' : 'bg-amber-400'}`}
                            style={{ width: `${Math.min(100, (Number(status.revenue) / (stats.total_revenue || 1)) * 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-400 text-xs font-medium">No status data</div>
                )}
              </div>
            </div>
          </div>

          {/* Charts & Leaderboards Row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
            
            {/* Top Products Leaderboard */}
            <div className="bg-white border border-slate-100 rounded-xl shadow-sm p-3 flex flex-col col-span-1">
              <h3 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2 flex justify-between items-center border-b border-slate-50 pb-1.5">
                Top Products
                <span className="text-[8px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-bold">VOL</span>
              </h3>
              <div className="flex-1 overflow-auto">
                {stats.top_products && stats.top_products.length > 0 ? (
                  <div className="space-y-0.5">
                    {stats.top_products.map((prod, idx) => (
                      <div key={idx} className="flex items-center justify-between p-1.5 hover:bg-slate-50 rounded-lg group transition-colors">
                        <div className="flex items-center gap-2">
                          <div className={`w-4 text-[10px] font-bold ${idx === 0 ? 'text-amber-500' : idx === 1 ? 'text-slate-400' : idx === 2 ? 'text-orange-400' : 'text-slate-300'}`}>
                            {idx + 1}.
                          </div>
                          <p className="font-semibold text-slate-700 text-[11px] truncate max-w-[120px]">{prod.product_name}</p>
                        </div>
                        <span className="text-[10px] font-bold text-slate-600 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100 group-hover:border-slate-200">
                          {Number(prod.total_sold).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-400 text-[10px]">No data</div>
                )}
              </div>
            </div>

            {/* Top Customers Leaderboard */}
            <div className="bg-white border border-slate-100 rounded-xl shadow-sm p-3 flex flex-col col-span-1">
              <h3 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2 flex justify-between items-center border-b border-slate-50 pb-1.5">
                Top Clients
                <span className="text-[8px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-bold">REV</span>
              </h3>
              <div className="flex-1 overflow-auto">
                {stats.top_customers && stats.top_customers.length > 0 ? (
                  <div className="space-y-0.5">
                    {stats.top_customers.map((cust, idx) => (
                      <div key={idx} className="flex items-center justify-between p-1.5 hover:bg-slate-50 rounded-lg group transition-colors">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 flex items-center justify-center rounded text-[9px] font-bold bg-indigo-50 text-indigo-600 uppercase">
                            {cust.display_name.charAt(0)}
                          </div>
                          <p className="font-semibold text-slate-700 text-[11px] truncate max-w-[100px]">{cust.display_name}</p>
                        </div>
                        <span className="text-[10px] font-bold text-slate-700">
                          ${Number(cust.revenue).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-400 text-[10px]">No data</div>
                )}
              </div>
            </div>

            {/* Catalog Brands Graph */}
            <div className="bg-white border border-slate-100 rounded-xl shadow-sm p-3 flex flex-col col-span-1 overflow-hidden relative">
              <h3 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1 z-10">Brand Distribution</h3>
              <div className="flex-1 w-full h-[120px] -mt-2">
                {stats.brand_breakdown && stats.brand_breakdown.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.brand_breakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={30}
                        outerRadius={45}
                        paddingAngle={5}
                        dataKey="count"
                        nameKey="brand"
                        stroke="none"
                        isAnimationActive={true}
                      >
                        {stats.brand_breakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={BRAND_COLORS[index % BRAND_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ borderRadius: '6px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '10px', padding: '4px 8px' }}
                        formatter={(value) => [`${value} SKUs`, 'Count']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-400 text-[10px]">No data</div>
                )}
              </div>
              {/* Legend overlay at the bottom */}
              <div className="absolute bottom-2 left-0 w-full flex justify-center gap-2 flex-wrap px-2">
                {(stats.brand_breakdown || []).slice(0, 3).map((brand, idx) => (
                  <div key={idx} className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: BRAND_COLORS[idx % BRAND_COLORS.length] }}></div>
                    <span className="text-[8px] font-bold text-slate-500 truncate max-w-[45px]">{brand.brand}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Orders Compact */}
            <div className="bg-white border border-slate-100 rounded-xl shadow-sm p-3 flex flex-col col-span-1">
              <h3 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2 flex justify-between items-center border-b border-slate-50 pb-1.5">
                Recent Log
                <button onClick={() => router.push('/sales/orders')} className="text-[9px] text-blue-500 hover:text-blue-700 font-bold hover:underline">All</button>
              </h3>
              <div className="flex-1 overflow-auto">
                {recentOrders.length > 0 ? (
                  <div className="space-y-1">
                    {recentOrders.slice(0, 4).map(order => (
                      <div key={order.id} onClick={() => router.push(`/sales/order-confirmation/edit/${order.id}`)} className="flex items-center justify-between p-1.5 bg-white border border-slate-50 hover:border-blue-100 rounded-lg cursor-pointer group hover:bg-blue-50/30 transition-all">
                        <div>
                          <p className="font-bold text-slate-700 text-[10px] group-hover:text-blue-600">{order.order_number}</p>
                          <p className="text-[9px] text-slate-400 truncate max-w-[90px]">{order.customer_name}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-slate-700 text-[10px]">${Number(order.total_amount).toLocaleString()}</p>
                          <span className={`text-[8px] font-bold uppercase tracking-widest ${
                            order.status === 'Invoiced' ? 'text-emerald-500' :
                            order.status === 'Confirmed' ? 'text-blue-500' :
                            'text-amber-500'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-400 text-[10px]">No data</div>
                )}
              </div>
            </div>

          </div>
        </>
      )}
    </div>
  );
}
