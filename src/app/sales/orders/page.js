'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { generateDocumentPDF } from '@/utils/pdfGenerator';

export default function OrdersList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [viewOrder, setViewOrder] = useState(null);
  const [viewItems, setViewItems] = useState([]);
  const [convertOrder, setConvertOrder] = useState(null);
  const [convertItems, setConvertItems] = useState([]);
  const [verifiedItems, setVerifiedItems] = useState([]);

  const fetchOrders = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setOrders(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleDownloadPDF = async (order) => {
    try {
      const token = localStorage.getItem('token');
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const res = await fetch(`${API_URL}/api/orders/${order.id}/items`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const items = await res.json();
        await generateDocumentPDF("Order Confirmation", order, items);
      } else {
        alert('Failed to fetch order items for PDF');
      }
    } catch (err) {
      alert('Network error while generating PDF');
    }
  };

  const handleOpenConvertModal = async (order) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${order.id}/items`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setConvertItems(await res.json());
        setConvertOrder(order);
        setVerifiedItems([]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleConfirmConvert = async () => {
    if (!convertOrder) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${convertOrder.id}/convert`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        alert("Converted successfully!");
        setConvertOrder(null);
        fetchOrders();
      } else {
        alert(data.message || "Conversion failed");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (orderId) => {
    if (!confirm("Are you sure you want to delete this order?")) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${orderId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setOrders(orders.filter(o => o.id !== orderId));
        // Reset page if needed
        const totalPagesAfterDelete = Math.ceil((orders.length - 1) / itemsPerPage);
        if (currentPage > totalPagesAfterDelete && totalPagesAfterDelete > 0) {
          setCurrentPage(totalPagesAfterDelete);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleView = async (order) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${order.id}/items`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setViewItems(await res.json());
        setViewOrder(order);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-8">Loading Orders...</div>;

  const totalPages = Math.ceil(orders.length / itemsPerPage);
  const paginatedOrders = orders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 animate-fade-in mx-auto max-w-7xl overflow-hidden">
      <div className="px-8 py-6 bg-gray-50/50 border-b border-gray-100 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Order Confirmations</h1>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">Manage Sales Pipeline</p>
        </div>
        <Link href="/sales/order-confirmation/new" className="bg-slate-800 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-slate-700 transition shadow-sm flex items-center gap-2 active:scale-95">
          + Create Order
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 border-y border-slate-200">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-slate-600 uppercase tracking-wider text-[11px] whitespace-nowrap">Order Ref</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600 uppercase tracking-wider text-[11px] whitespace-nowrap">Client</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600 uppercase tracking-wider text-[11px] whitespace-nowrap">PO Number</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600 uppercase tracking-wider text-[11px] whitespace-nowrap">Date Issued</th>
              <th className="text-right px-4 py-3 font-semibold text-slate-600 uppercase tracking-wider text-[11px] whitespace-nowrap">Amount</th>
              <th className="text-center px-4 py-3 font-semibold text-slate-600 uppercase tracking-wider text-[11px] whitespace-nowrap">Status</th>
              <th className="text-right px-4 py-3 font-semibold text-slate-600 uppercase tracking-wider text-[11px] whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orders.length === 0 ? (
              <tr>
                <td colSpan="7" className="p-12 text-center text-sm font-medium text-gray-500 bg-gray-50/50">No orders found. Create your first order to populate the pipeline.</td>
              </tr>
            ) : paginatedOrders.map(order => (
              <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="px-4 py-3 font-semibold text-slate-800 text-sm whitespace-nowrap">{order.order_number}</td>
                <td className="px-4 py-3 text-slate-600 text-sm whitespace-nowrap">{order.customer_name}</td>
                <td className="px-4 py-3 text-slate-500 text-sm whitespace-nowrap">{order.po_number || 'N/A'}</td>
                <td className="px-4 py-3 text-slate-500 text-sm whitespace-nowrap">{new Date(order.created_at).toLocaleDateString()}</td>
                <td className="px-4 py-3 font-semibold text-slate-800 text-sm text-right whitespace-nowrap">${Number(order.total_amount).toFixed(2)}</td>
                <td className="px-4 py-3 text-center whitespace-nowrap">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    order.status === 'Invoiced' ? 'bg-slate-800 text-white' :
                    order.status === 'Confirmed' ? 'bg-slate-200 text-slate-800' :
                    'bg-amber-100 text-amber-800'
                  }`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  <div className="flex justify-end items-center gap-1">
                    <button 
                      onClick={() => handleView(order)}
                      title="View Details"
                      className="p-1.5 text-slate-400 rounded-full hover:bg-slate-100 hover:text-slate-800 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                    <button 
                      onClick={() => handleDownloadPDF(order)}
                      title="Download/Preview PDF"
                      className="p-1.5 text-slate-400 rounded-full hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                      </svg>
                    </button>
                    <Link 
                      href={`/sales/order-confirmation/edit/${order.id}`}
                      title="Edit Order"
                      className="p-1.5 text-slate-400 rounded-full hover:bg-slate-100 hover:text-slate-800 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </Link>
                    {order.status !== 'Invoiced' && (
                      <button 
                        onClick={() => handleOpenConvertModal(order)}
                        title="Convert to Invoice"
                        className="p-1.5 text-slate-400 rounded-full hover:bg-slate-800 hover:text-white transition-all active:scale-95"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </button>
                    )}
                    <button 
                      onClick={() => handleDelete(order.id)}
                      title="Delete Order"
                      className="p-1.5 text-slate-400 rounded-full hover:bg-red-50 hover:text-red-500 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-8 py-4 border-t border-gray-100 bg-gray-50/50">
          <button 
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50 transition-colors"
          >
            Previous
          </button>
          <span className="text-sm font-medium text-slate-500">Page {currentPage} of {totalPages}</span>
          <button 
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50 transition-colors"
          >
            Next
          </button>
        </div>
      )}

      {/* View Order Modal */}
      {viewOrder && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden animate-fade-in flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold text-slate-800">Order {viewOrder.order_number}</h3>
                <p className="text-sm text-slate-500 mt-1">{viewOrder.customer_name} • {new Date(viewOrder.created_at).toLocaleDateString()}</p>
              </div>
              <button onClick={() => setViewOrder(null)} className="p-2 bg-slate-50 text-slate-400 hover:text-slate-700 rounded-full transition">✕</button>
            </div>
            <div className="p-6 overflow-y-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-y border-slate-200">
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-600">Item & Description</th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-600 text-center">Qty</th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-600 text-right">Unit Cost</th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-600 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {viewItems.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3">
                        <div className="text-sm font-semibold text-slate-800">{item.product_name}</div>
                        <div className="text-[11px] text-slate-400">SAP: {item.sap_no || 'N/A'} | UPC: {item.upc_no || 'N/A'}</div>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600 text-center">{item.total_units}</td>
                      <td className="px-4 py-3 text-sm text-slate-600 text-right">${Number(item.unit_price).toFixed(2)}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-slate-800 text-right">${Number(item.sub_total).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-6 flex justify-end">
                <div className="text-right">
                  <div className="text-sm text-slate-500 mb-1">Total Amount</div>
                  <div className="text-2xl font-bold text-slate-800">${Number(viewOrder.total_amount).toFixed(2)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Convert to Invoice Modal */}
      {convertOrder && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl overflow-hidden animate-fade-in flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 flex justify-between items-start bg-blue-50/50">
              <div>
                <h3 className="text-xl font-bold text-blue-900">Preview & Convert to Invoice</h3>
                <p className="text-sm text-blue-700 mt-1">Review the order items carefully before converting {convertOrder.order_number} to a Commercial Invoice.</p>
              </div>
              <button onClick={() => setConvertOrder(null)} className="p-2 bg-white text-slate-400 hover:text-slate-700 rounded-full transition shadow-sm">✕</button>
            </div>
            
            <div className="p-6 overflow-y-auto bg-slate-50/30">
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-600 w-12 text-center">Verify</th>
                      <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-600">Product Code</th>
                      <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-600">Description</th>
                      <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-600 text-center">Cases</th>
                      <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-600 text-center">Total Qty</th>
                      <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-600 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {convertItems.length === 0 ? (
                      <tr><td colSpan="6" className="p-8 text-center text-red-500 font-semibold">No items found in this order! Conversion blocked.</td></tr>
                    ) : convertItems.map(item => (
                      <tr key={item.id} className={`transition-colors ${verifiedItems.includes(item.id) ? 'bg-green-50/40' : 'hover:bg-slate-50/50'}`}>
                        <td className="px-4 py-3 text-center">
                          <input 
                            type="checkbox" 
                            className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                            checked={verifiedItems.includes(item.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setVerifiedItems([...verifiedItems, item.id]);
                              } else {
                                setVerifiedItems(verifiedItems.filter(id => id !== item.id));
                              }
                            }}
                          />
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-slate-800">{item.sap_no || 'N/A'}</td>
                        <td className="px-4 py-3 text-sm text-slate-600">{item.product_name}</td>
                        <td className="px-4 py-3 text-sm text-slate-600 text-center">{item.cases_ordered || 0}</td>
                        <td className="px-4 py-3 text-sm font-semibold text-slate-800 text-center">{item.total_units} pcs</td>
                        <td className="px-4 py-3 text-sm font-semibold text-slate-800 text-right">${Number(item.sub_total).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 bg-white flex items-center justify-between">
              <div className="text-slate-600 text-sm">
                <span className="font-semibold text-slate-800">Total Value: </span>
                ${Number(convertOrder.total_amount).toFixed(2)}
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => setConvertOrder(null)} 
                  className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleConfirmConvert}
                  disabled={convertItems.length === 0 || verifiedItems.length !== convertItems.length}
                  title={verifiedItems.length !== convertItems.length ? "Please verify all items first" : ""}
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 rounded-lg transition-colors shadow-sm flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                  Confirm & Convert to Invoice
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
