'use client';
import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';

export default function EditOrder({ params }) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const orderId = unwrappedParams.id;
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [orderNumber, setOrderNumber] = useState('');
  const [poNumber, setPoNumber] = useState('');
  
  // Grid State
  const [items, setItems] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      try {
        const [custRes, prodRes, orderRes, itemsRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/customers`, { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/products`, { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${orderId}`, { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${orderId}/items`, { headers: { 'Authorization': `Bearer ${token}` } })
        ]);
        
        const custs = await custRes.json();
        const prods = await prodRes.json();
        setCustomers(custs);
        setProducts(prods);

        if (orderRes.ok && itemsRes.ok) {
          const order = await orderRes.json();
          const orderItems = await itemsRes.json();

          setOrderNumber(order.order_number);
          setPoNumber(order.po_number || '');
          const cust = custs.find(c => c.id == order.customer_id);
          setSelectedCustomer(cust || null);

          const mappedItems = orderItems.map(item => ({
            id: item.id,
            product_id: item.product_id,
            sap_no: item.sap_no,
            upc_no: item.upc_no,
            image_url: item.image_url || '',
            units_per_case: prods.find(p => p.id == item.product_id)?.units_per_case || 1,
            cases: item.cases_ordered,
            qty: item.total_units,
            unit_cost: item.unit_price,
            amount: Number(item.sub_total)
          }));
          setItems(mappedItems.length ? mappedItems : [{ id: 1, product_id: '', sap_no: '', upc_no: '', image_url: '', units_per_case: 1, cases: 1, qty: 1, unit_cost: 0, amount: 0 }]);
        }
      } catch (err) {
        console.error('Failed to fetch data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [orderId]);

  const handleCustomerChange = (e) => {
    const custId = e.target.value;
    const cust = customers.find(c => c.id == custId);
    setSelectedCustomer(cust);
    if (cust && cust.default_po_number) {
      setPoNumber(cust.default_po_number);
    }
  };

  const addRow = () => {
    setItems([...items, { id: Date.now(), product_id: '', sap_no: '', upc_no: '', image_url: '', units_per_case: 1, cases: 1, qty: 1, unit_cost: 0, amount: 0 }]);
  };

  const removeRow = (id) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    const item = newItems[index];
    
    if (field === 'product_id') {
      const prod = products.find(p => p.id == value);
      if (prod) {
        item.product_id = prod.id;
        item.sap_no = prod.sap_no || '';
        item.upc_no = prod.upc_no || '';
        item.image_url = prod.image_url || '';
        item.units_per_case = prod.units_per_case || 1;
        item.unit_cost = prod.list_unit_price || 0;
        item.qty = item.cases * item.units_per_case;
        item.amount = item.qty * item.unit_cost;
      }
    } else if (field === 'cases') {
      const caseVal = parseInt(value) || 0;
      item.cases = caseVal;
      item.qty = caseVal * item.units_per_case;
      item.amount = item.qty * item.unit_cost;
    } else if (field === 'unit_cost') {
      const cost = parseFloat(value) || 0;
      item.unit_cost = cost;
      item.amount = item.qty * cost;
    }

    setItems(newItems);
  };

  const subTotal = items.reduce((sum, item) => sum + item.amount, 0);

  const handleSave = async () => {
    if (!selectedCustomer) return alert("Please select a customer");
    
    const token = localStorage.getItem('token');
    const orderData = {
      customer_id: selectedCustomer.id,
      order_number: orderNumber,
      po_number: poNumber,
      total_amount: subTotal,
      items: items.filter(i => i.product_id).map(i => ({
        product_id: i.product_id,
        cases_ordered: i.cases,
        total_units: i.qty,
        unit_price: i.unit_cost,
        sub_total: i.amount
      }))
    };

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(orderData)
      });
      if (res.ok) {
        alert("Order Updated!");
        router.push('/sales/orders');
      } else {
        alert("Failed to update order");
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <div className="p-8">Loading Order Configuration...</div>;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm animate-fade-in mx-auto max-w-7xl overflow-hidden">
      <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-100 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight mb-1">Edit Order Configuration</h2>
          <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Update Existing Order</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => router.push('/sales/orders')} className="px-4 py-2 text-sm font-semibold bg-white border border-gray-300 text-slate-700 rounded-md hover:bg-gray-50 transition shadow-sm">Cancel</button>
          <button onClick={handleSave} className="px-4 py-2 text-sm font-semibold bg-slate-800 text-white rounded-md hover:bg-slate-700 transition active:scale-95 shadow-sm">Update Order</button>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 tracking-wide">Client Profile</label>
              <select 
                className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-slate-800 outline-none font-medium transition"
                onChange={handleCustomerChange}
                value={selectedCustomer ? selectedCustomer.id : ''}
              >
                <option value="" disabled>Select a Customer</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.display_name}</option>)}
              </select>
            </div>

            {selectedCustomer && (
              <div className="p-4 bg-slate-800 rounded-lg text-white shadow-sm relative overflow-hidden">
                <div className="absolute -right-4 -top-4 w-20 h-20 bg-white/10 rounded-full"></div>
                <h4 className="font-bold text-base mb-1">{selectedCustomer.display_name}</h4>
                <div className="text-gray-300 text-xs space-y-1">
                  <p>{selectedCustomer.email} | {selectedCustomer.work_phone}</p>
                  <p className="pt-2 border-t border-white/20 mt-2 font-medium tracking-wide uppercase">Billing Address</p>
                  <p>{selectedCustomer.billing_address_1}, {selectedCustomer.billing_city}</p>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 tracking-wide">System Order Ref</label>
              <input 
                type="text" 
                value={orderNumber}
                onChange={e => setOrderNumber(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-slate-800 outline-none font-medium text-slate-700 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 tracking-wide">Client PO Number</label>
              <input 
                type="text" 
                value={poNumber}
                onChange={e => setPoNumber(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-yellow-50 border border-yellow-200 rounded-lg focus:bg-white focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400 outline-none font-medium text-slate-800 placeholder-slate-400 transition"
                placeholder="e.g. LX6620J-1"
              />
            </div>
          </div>
        </div>

        <div className="overflow-hidden border border-gray-200 rounded-lg mb-8 shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600">
                <th className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider w-12 text-center border-b border-gray-200">#</th>
                <th className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider w-16 text-center border-b border-gray-200 border-l border-gray-200">Img</th>
                <th className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider w-32 border-b border-gray-200 border-l border-gray-200">SAP #</th>
                <th className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider w-40 border-b border-gray-200 border-l border-gray-200">UPC #</th>
                <th className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider border-b border-gray-200 border-l border-gray-200">Item & Description</th>
                <th className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider w-24 border-b border-gray-200 border-l border-gray-200 text-center">Case</th>
                <th className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider w-24 border-b border-gray-200 border-l border-gray-200 text-center">Qty</th>
                <th className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider w-32 border-b border-gray-200 border-l border-gray-200 text-right">Unit Cost</th>
                <th className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider w-32 border-b border-gray-200 border-l border-gray-200 text-right bg-slate-100">Amount</th>
                <th className="px-4 py-2.5 border-b border-gray-200 border-l border-gray-200 w-12 text-center"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={item.id} className="border-b border-gray-100 hover:bg-slate-50/50 transition">
                  <td className="px-4 py-2 text-center text-xs font-medium text-slate-400 border-r border-gray-100">{index + 1}</td>
                  <td className="px-2 py-2 border-r border-gray-100 flex justify-center items-center">
                    {item.image_url ? (
                      <img src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${item.image_url}`} alt="Product" className="w-8 h-8 object-cover rounded border border-gray-200" />
                    ) : (
                      <div className="w-8 h-8 bg-gray-100 rounded border border-gray-200 flex items-center justify-center text-[8px] text-gray-400">N/A</div>
                    )}
                  </td>
                  <td className="px-4 py-2 border-r border-gray-100 text-xs font-medium text-slate-500">{item.sap_no || '-'}</td>
                  <td className="px-4 py-2 border-r border-gray-100 text-xs font-medium text-slate-500">{item.upc_no || '-'}</td>
                  <td className="px-4 py-2 border-r border-gray-100">
                    <select 
                      className="w-full bg-transparent outline-none text-slate-800 font-semibold text-xs appearance-none cursor-pointer"
                      value={item.product_id}
                      onChange={(e) => updateItem(index, 'product_id', e.target.value)}
                    >
                      <option value="" disabled>Select Product...</option>
                      {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.units_per_case} units/case)</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-2 border-r border-gray-100">
                    <input 
                      type="number" 
                      min="1"
                      className="w-full bg-transparent outline-none text-center text-slate-800 font-bold text-xs"
                      value={item.cases}
                      onChange={(e) => updateItem(index, 'cases', e.target.value)}
                    />
                  </td>
                  <td className="px-4 py-2 text-center text-slate-800 border-r border-gray-100 bg-slate-50 font-bold text-xs">
                    {item.qty}
                  </td>
                  <td className="px-4 py-2 border-r border-gray-100">
                    <div className="flex items-center justify-end">
                      <span className="text-slate-400 text-[10px] font-bold mr-1">$</span>
                      <input 
                        type="number" 
                        className="w-16 bg-transparent outline-none text-right text-slate-800 font-bold text-xs"
                        value={item.unit_cost}
                        onChange={(e) => updateItem(index, 'unit_cost', e.target.value)}
                      />
                    </div>
                  </td>
                  <td className="px-4 py-2 text-right text-slate-800 font-extrabold border-r border-gray-100 bg-slate-50/80 text-xs">
                    ${item.amount.toFixed(2)}
                  </td>
                  <td className="px-4 py-2 text-center">
                    <button onClick={() => removeRow(item.id)} className="w-5 h-5 flex items-center justify-center rounded text-red-400 hover:text-red-600 hover:bg-red-50 transition text-xs">✕</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="p-2 bg-white border-t border-gray-200 flex justify-center">
            <button onClick={addRow} className="text-xs font-bold tracking-wide uppercase text-slate-600 hover:text-slate-800 hover:bg-slate-100 px-3 py-1.5 rounded transition">+ Add Row</button>
          </div>
        </div>

        <div className="flex justify-end">
          <div className="w-72 bg-slate-50 p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex justify-between mb-3 text-xs font-semibold text-slate-500">
              <span>Sub-total</span>
              <span className="text-slate-800">${subTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between mb-3 text-xs font-semibold text-slate-500">
              <span>Tax (0%)</span>
              <span className="text-slate-800">$0.00</span>
            </div>
            <div className="flex justify-between pt-3 border-t border-slate-200 text-xl font-extrabold text-slate-800">
              <span>Total</span>
              <span>${subTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
