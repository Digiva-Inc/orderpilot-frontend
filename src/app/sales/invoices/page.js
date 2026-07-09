'use client';
import { useState, useEffect } from 'react';
import { generateDocumentPDF } from '@/utils/pdfGenerator';

export default function InvoicesList() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    const fetchInvoices = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/invoices`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) setInvoices(await res.json());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, []);

  if (loading) return <div className="p-8">Loading Commercial Invoices...</div>;

  const totalPages = Math.ceil(invoices.length / itemsPerPage);
  const paginatedInvoices = invoices.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleDownloadPDF = async (invoice) => {
    try {
      const token = localStorage.getItem('token');
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      // Use invoice.order_id to fetch the associated items
      const res = await fetch(`${API_URL}/api/orders/${invoice.order_id}/items`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const items = await res.json();
        await generateDocumentPDF("Commercial Invoice", invoice, items);
      } else {
        alert('Failed to fetch order items for PDF');
      }
    } catch (err) {
      alert('Network error while generating PDF');
    }
  };

  const handleDelete = async (invoiceId) => {
    if (!confirm("Are you sure you want to delete this invoice?")) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/invoices/${invoiceId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setInvoices(invoices.filter(i => i.invoice_id !== invoiceId));
        const totalPagesAfterDelete = Math.ceil((invoices.length - 1) / itemsPerPage);
        if (currentPage > totalPagesAfterDelete && totalPagesAfterDelete > 0) {
          setCurrentPage(totalPagesAfterDelete);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleStatus = async (invoice) => {
    const newStatus = invoice.invoice_status === 'Paid' ? 'Unpaid' : 'Paid';
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/invoices/${invoice.invoice_id}/status`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setInvoices(invoices.map(i => i.invoice_id === invoice.invoice_id ? { ...i, invoice_status: newStatus } : i));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 animate-fade-in mx-auto max-w-7xl overflow-hidden">
      <div className="px-8 py-6 bg-gray-50/50 border-b border-gray-100 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Commercial Invoices</h1>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">Receivables Pipeline</p>
        </div>
      </div>

      <div className="p-8">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 border-y border-slate-200">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-slate-600 uppercase tracking-wider text-[11px] whitespace-nowrap">Invoice ID</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600 uppercase tracking-wider text-[11px] whitespace-nowrap">Order Ref</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600 uppercase tracking-wider text-[11px] whitespace-nowrap">Client</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600 uppercase tracking-wider text-[11px] whitespace-nowrap">Date Issued</th>
              <th className="text-right px-4 py-3 font-semibold text-slate-600 uppercase tracking-wider text-[11px] whitespace-nowrap">Amount Due</th>
              <th className="text-center px-4 py-3 font-semibold text-slate-600 uppercase tracking-wider text-[11px] whitespace-nowrap">Status</th>
              <th className="text-right px-4 py-3 font-semibold text-slate-600 uppercase tracking-wider text-[11px] whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {invoices.length === 0 ? (
              <tr>
                <td colSpan="7" className="p-12 text-center text-sm font-medium text-gray-500 bg-gray-50/50">No invoices generated yet. Convert an order to populate the receivables pipeline.</td>
              </tr>
            ) : paginatedInvoices.map(invoice => (
              <tr key={invoice.invoice_id} className="hover:bg-slate-50/80 transition-colors">
                <td className="px-4 py-3 font-semibold text-slate-800 text-sm whitespace-nowrap">INV-{invoice.invoice_id}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-sm font-semibold text-slate-800">{invoice.order_number}</div>
                  <div className="text-[11px] text-slate-400">PO: {invoice.po_number || 'N/A'}</div>
                </td>
                <td className="px-4 py-3 text-slate-600 text-sm whitespace-nowrap">{invoice.customer_name}</td>
                <td className="px-4 py-3 text-slate-500 text-sm whitespace-nowrap">{new Date(invoice.invoice_date).toLocaleDateString()}</td>
                <td className="px-4 py-3 font-semibold text-slate-800 text-sm text-right whitespace-nowrap">₹{Number(invoice.total_amount).toFixed(2)}</td>
                <td className="px-4 py-3 text-center whitespace-nowrap">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    invoice.invoice_status === 'Paid' ? 'bg-slate-800 text-white' :
                    'bg-red-50 text-red-600 border border-red-100'
                  }`}>
                    {invoice.invoice_status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  <div className="flex justify-end items-center gap-1">
                    <button 
                      onClick={() => handleDownloadPDF(invoice)}
                      title="Preview PDF"
                      className="p-1.5 text-slate-400 rounded-full hover:bg-slate-100 hover:text-slate-800 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                    <button 
                      onClick={() => handleToggleStatus(invoice)}
                      title="Toggle Paid/Unpaid Status"
                      className="p-1.5 text-slate-400 rounded-full hover:bg-slate-100 hover:text-slate-800 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button 
                      onClick={() => handleDelete(invoice.invoice_id)}
                      title="Delete Invoice"
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
    </div>
  );
}
