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
  
  // Shipping & Export Metadata
  const [brand, setBrand] = useState('');
  const [countryOfExport, setCountryOfExport] = useState('');
  const [deliveryNumber, setDeliveryNumber] = useState('');
  const [countryOfFinalDestination, setCountryOfFinalDestination] = useState('');
  const [hpPo, setHpPo] = useState('');
  const [shippingMethod, setShippingMethod] = useState('');
  const [shippingTerms, setShippingTerms] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('');
  const [dueDate, setDueDate] = useState('');
  
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
          setBrand(order.brand || '');
          setCountryOfExport(order.country_of_export || '');
          setDeliveryNumber(order.delivery_number || '');
          setCountryOfFinalDestination(order.country_of_final_destination || '');
          setHpPo(order.hp_po || '');
          setShippingMethod(order.shipping_method || '');
          setShippingTerms(order.shipping_terms || '');
          setPaymentTerms(order.payment_terms || '');
          setDueDate(order.due_date || '');

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
          setItems(mappedItems.length ? mappedItems : [{ id: 1, product_id: '', sap_no: '', upc_no: '', image_url: '', units_per_case: 1, cases: '', qty: '', unit_cost: '', amount: '' }]);
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
    setItems([...items, { id: Date.now(), product_id: '', sap_no: '', upc_no: '', image_url: '', units_per_case: 1, cases: '', qty: '', unit_cost: '', amount: '' }]);
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
        item.unit_cost = prod.list_unit_price || '';
        item.cases = '';
        item.qty = '';
        item.amount = '';
      }
    } else if (field === 'cases') {
      if (value === '') {
        item.cases = '';
        item.qty = '';
        item.amount = '';
      } else {
        const caseVal = parseFloat(value) || 0;
        item.cases = caseVal;
        item.qty = caseVal * item.units_per_case;
        item.amount = item.qty * (parseFloat(item.unit_cost) || 0);
      }
    } else if (field === 'qty') {
      if (value === '') {
        item.qty = '';
        item.cases = '';
        item.amount = '';
      } else {
        const qtyVal = parseFloat(value) || 0;
        item.qty = qtyVal;
        item.cases = qtyVal / item.units_per_case;
        item.amount = qtyVal * (parseFloat(item.unit_cost) || 0);
      }
    } else if (field === 'unit_cost') {
      if (value === '') {
        item.unit_cost = '';
        item.amount = '';
      } else {
        const cost = parseFloat(value) || 0;
        item.unit_cost = cost;
        item.amount = (parseFloat(item.qty) || 0) * cost;
      }
    } else if (field === 'amount') {
      if (value === '') {
        item.amount = '';
        item.unit_cost = '';
      } else {
        const amt = parseFloat(value) || 0;
        item.amount = amt;
        item.unit_cost = (parseFloat(item.qty) || 0) > 0 ? amt / parseFloat(item.qty) : '';
      }
    }

    setItems(newItems);
  };

  const subTotal = items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);

  const handleSave = async () => {
    if (!selectedCustomer) return alert("Please select a customer");
    if (!items.length || items.every(i => !i.product_id)) return alert("Please add at least one product");

    const hasInvalidQty = items.some(item => item.product_id && item.qty !== '' && item.qty % item.units_per_case !== 0);
    if (hasInvalidQty) {
      return alert("One or more quantities are not multiples of their case size. Please fix the red highlighted fields.");
    }
    
    const token = localStorage.getItem('token');
    const orderData = {
      customer_id: selectedCustomer.id,
      order_number: orderNumber,
      po_number: poNumber,
      total_amount: subTotal,
      brand, 
      country_of_export: countryOfExport, 
      delivery_number: deliveryNumber, 
      country_of_final_destination: countryOfFinalDestination, 
      hp_po: hpPo, 
      shipping_method: shippingMethod, 
      shipping_terms: shippingTerms, 
      payment_terms: paymentTerms, 
      due_date: dueDate,
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
              <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-lg text-slate-800 shadow-sm relative overflow-hidden">
                <div className="absolute -right-4 -top-4 w-20 h-20 bg-blue-100/50 rounded-full"></div>
                <h4 className="font-bold text-base mb-1 text-blue-900">{selectedCustomer.display_name}</h4>
                <div className="text-slate-600 text-xs space-y-1">
                  <p>{selectedCustomer.email} <span className="mx-1 text-slate-300">|</span> {selectedCustomer.work_phone}</p>
                  <p className="pt-2 border-t border-blue-100 mt-2 font-bold tracking-wide uppercase text-blue-800/70">Billing Address</p>
                  <p className="font-medium text-slate-700">{selectedCustomer.billing_address_1}, {selectedCustomer.billing_city}</p>
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

        {/* Shipping & Export Metadata */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-1 tracking-wider uppercase">Brand</label>
            <input type="text" value={brand} onChange={e => setBrand(e.target.value)} className="w-full px-2 py-1.5 text-xs bg-white border border-gray-200 rounded focus:ring-1 focus:ring-slate-800 outline-none" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-1 tracking-wider uppercase">Country of Export</label>
            <input type="text" value={countryOfExport} onChange={e => setCountryOfExport(e.target.value)} className="w-full px-2 py-1.5 text-xs bg-white border border-gray-200 rounded focus:ring-1 focus:ring-slate-800 outline-none" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-1 tracking-wider uppercase">Delivery #</label>
            <input type="text" value={deliveryNumber} onChange={e => setDeliveryNumber(e.target.value)} className="w-full px-2 py-1.5 text-xs bg-white border border-gray-200 rounded focus:ring-1 focus:ring-slate-800 outline-none" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-1 tracking-wider uppercase">Final Destination</label>
            <input type="text" value={countryOfFinalDestination} onChange={e => setCountryOfFinalDestination(e.target.value)} className="w-full px-2 py-1.5 text-xs bg-white border border-gray-200 rounded focus:ring-1 focus:ring-slate-800 outline-none" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-1 tracking-wider uppercase">HP PO #</label>
            <input type="text" value={hpPo} onChange={e => setHpPo(e.target.value)} className="w-full px-2 py-1.5 text-xs bg-white border border-gray-200 rounded focus:ring-1 focus:ring-slate-800 outline-none" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-1 tracking-wider uppercase">Shipping Method</label>
            <input type="text" value={shippingMethod} onChange={e => setShippingMethod(e.target.value)} className="w-full px-2 py-1.5 text-xs bg-white border border-gray-200 rounded focus:ring-1 focus:ring-slate-800 outline-none" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-1 tracking-wider uppercase">Shipping Terms</label>
            <input type="text" value={shippingTerms} onChange={e => setShippingTerms(e.target.value)} className="w-full px-2 py-1.5 text-xs bg-white border border-gray-200 rounded focus:ring-1 focus:ring-slate-800 outline-none" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-1 tracking-wider uppercase">Payment Terms</label>
            <input type="text" value={paymentTerms} onChange={e => setPaymentTerms(e.target.value)} className="w-full px-2 py-1.5 text-xs bg-white border border-gray-200 rounded focus:ring-1 focus:ring-slate-800 outline-none" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-1 tracking-wider uppercase">Due Date</label>
            <input type="text" value={dueDate} onChange={e => setDueDate(e.target.value)} placeholder="e.g. 2026" className="w-full px-2 py-1.5 text-xs bg-white border border-gray-200 rounded focus:ring-1 focus:ring-slate-800 outline-none" />
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
                  <td className="px-4 py-2 border-r border-gray-100 align-middle">
                    {(() => {
                      const isCaseInvalid = item.cases !== '' && item.cases % 1 !== 0;
                      return (
                        <input 
                          type="number" 
                          min="0.01"
                          step="any"
                          placeholder="0"
                          className={`w-16 mx-auto block border ${isCaseInvalid ? 'border-red-500 bg-red-50 text-red-700 focus:border-red-500 focus:ring-red-500' : 'bg-white border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-blue-500 text-slate-800'} outline-none focus:ring-1 rounded-md py-1.5 text-center font-bold text-xs placeholder-slate-400 shadow-sm transition-all`}
                          value={item.cases}
                          onChange={(e) => updateItem(index, 'cases', e.target.value)}
                        />
                      );
                    })()}
                  </td>
                  <td className="px-4 py-2 border-r border-gray-100 bg-slate-50 align-middle">
                    {(() => {
                      const isQtyInvalid = item.qty !== '' && item.qty % item.units_per_case !== 0;
                      return (
                        <input 
                          type="number" 
                          min={item.units_per_case}
                          step={item.units_per_case}
                          placeholder="0"
                          className={`w-20 mx-auto block border ${isQtyInvalid ? 'border-red-500 bg-red-50 text-red-700 focus:border-red-500 focus:ring-red-500' : 'bg-white border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-blue-500 text-slate-800'} outline-none focus:ring-1 rounded-md py-1.5 text-center font-bold text-xs placeholder-slate-400 shadow-sm transition-all`}
                          value={item.qty}
                          onChange={(e) => updateItem(index, 'qty', e.target.value)}
                        />
                      );
                    })()}
                  </td>
                  <td className="px-4 py-2 border-r border-gray-100 align-middle">
                    <div className="relative w-24 ml-auto">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[10px] font-bold pointer-events-none">$</span>
                      <input 
                        type="number" 
                        step="0.01"
                        placeholder="0.00"
                        className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-md pl-6 pr-2 py-1.5 text-right text-slate-800 font-bold text-xs placeholder-slate-400 shadow-sm transition-all outline-none"
                        value={item.unit_cost}
                        onChange={(e) => updateItem(index, 'unit_cost', e.target.value)}
                      />
                    </div>
                  </td>
                  <td className="px-4 py-2 border-r border-gray-100 bg-slate-50 align-middle">
                    <div className="relative w-28 ml-auto">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[10px] font-bold pointer-events-none">$</span>
                      <input 
                        type="number" 
                        step="0.01"
                        placeholder="0.00"
                        className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-md pl-6 pr-2 py-1.5 text-right text-slate-800 font-extrabold text-xs placeholder-slate-400 shadow-sm transition-all outline-none"
                        value={item.amount}
                        onChange={(e) => updateItem(index, 'amount', e.target.value)}
                      />
                    </div>
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
