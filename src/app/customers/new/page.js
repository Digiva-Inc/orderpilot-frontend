'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewCustomer() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    customer_type: 'Business',
    salutation: '',
    first_name: '',
    last_name: '',
    company_name: '',
    display_name: '',
    email: '',
    work_phone: '',
    mobile_phone: '',
    default_po_number: '',
    // Billing
    billing_attention: '',
    billing_country: '',
    billing_address_1: '',
    billing_address_2: '',
    billing_city: '',
    billing_state: '',
    billing_zip: '',
    // Shipping
    shipping_attention: '',
    shipping_country: '',
    shipping_address_1: '',
    shipping_address_2: '',
    shipping_city: '',
    shipping_state: '',
    shipping_zip: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const copyBillingToShipping = () => {
    setFormData({
      ...formData,
      shipping_attention: formData.billing_attention,
      shipping_country: formData.billing_country,
      shipping_address_1: formData.billing_address_1,
      shipping_address_2: formData.billing_address_2,
      shipping_city: formData.billing_city,
      shipping_state: formData.billing_state,
      shipping_zip: formData.billing_zip
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.company_name) return alert("Company Name is required");

    setIsLoading(true);
    const token = localStorage.getItem('token');
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/customers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        alert("Customer Saved!");
        router.push('/dashboard');
      } else {
        const errorData = await res.json();
        alert(errorData.message || "Failed to save customer");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = "w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:bg-white focus:border-black focus:ring-1 focus:ring-black outline-none transition-all";

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 animate-fade-in max-w-5xl mx-auto overflow-hidden">
      <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-black mb-1">New Customer</h2>
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Client Profile Setup</p>
        </div>
        <Link href="/dashboard" className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-black transition">✕</Link>
      </div>

      <form onSubmit={handleSave} className="p-8">
        
        {/* Top Section */}
        <div className="grid grid-cols-[200px_1fr] gap-x-8 gap-y-6 mb-10 items-start">
          <label className="text-sm text-gray-700 pt-3 font-semibold">Customer Type</label>
          <div className="flex gap-6 pt-3">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input type="radio" name="customer_type" value="Business" checked={formData.customer_type === 'Business'} onChange={handleChange} className="accent-black w-4 h-4 transition" />
              <span className="text-sm font-medium text-gray-800 group-hover:text-black transition">Business</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer group">
              <input type="radio" name="customer_type" value="Individual" checked={formData.customer_type === 'Individual'} onChange={handleChange} className="accent-black w-4 h-4 transition" />
              <span className="text-sm font-medium text-gray-800 group-hover:text-black transition">Individual</span>
            </label>
          </div>

          <label className="text-sm text-gray-700 pt-3 font-semibold">Primary Contact</label>
          <div className="grid grid-cols-[120px_1fr_1fr] gap-4">
            <select name="salutation" value={formData.salutation} onChange={handleChange} className={inputClass}>
              <option value="">Salutation</option>
              <option value="Mr.">Mr.</option>
              <option value="Mrs.">Mrs.</option>
              <option value="Ms.">Ms.</option>
              <option value="Dr.">Dr.</option>
            </select>
            <input type="text" name="first_name" placeholder="First Name" value={formData.first_name} onChange={handleChange} className={inputClass} />
            <input type="text" name="last_name" placeholder="Last Name" value={formData.last_name} onChange={handleChange} className={inputClass} />
          </div>

          <label className="text-sm text-gray-700 pt-3 font-semibold flex items-center gap-1">Company Name <span className="text-red-500">*</span></label>
          <input type="text" name="company_name" placeholder="Enter company name" value={formData.company_name} onChange={handleChange} required className={`${inputClass} max-w-md border-red-200 focus:border-red-500 focus:ring-red-500`} />

          <label className="text-sm text-gray-700 pt-3 font-semibold flex items-center gap-1">Display Name</label>
          <input type="text" name="display_name" placeholder="Optional for indexing" value={formData.display_name} onChange={handleChange} className={`${inputClass} max-w-md`} />

          <label className="text-sm text-gray-700 pt-3 font-semibold">Email & Phone</label>
          <div className="grid grid-cols-[1fr_120px_120px] gap-4 max-w-2xl">
            <input type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleChange} className={inputClass} />
            <input type="text" name="work_phone" placeholder="Work Phone" value={formData.work_phone} onChange={handleChange} className={inputClass} />
            <input type="text" name="mobile_phone" placeholder="Mobile" value={formData.mobile_phone} onChange={handleChange} className={inputClass} />
          </div>
          
          <label className="text-sm text-gray-700 pt-3 font-semibold">Default PO</label>
          <input type="text" name="default_po_number" placeholder="Blanket PO number (Optional)" value={formData.default_po_number} onChange={handleChange} className={`${inputClass} max-w-md bg-yellow-50/50 border-yellow-200 focus:border-yellow-400 focus:ring-yellow-400`} />
        </div>

        <hr className="border-gray-100 my-10" />

        {/* Address Content */}
        <div className="grid grid-cols-2 gap-16">
          {/* Billing Address */}
          <div className="space-y-5">
            <h3 className="font-bold text-lg text-black mb-6 tracking-tight">Billing Address</h3>
            
            <div className="grid grid-cols-[100px_1fr] items-center gap-4">
              <label className="text-sm font-medium text-gray-500">Attention</label>
              <input type="text" name="billing_attention" value={formData.billing_attention} onChange={handleChange} className={inputClass} />
            </div>
            
            <div className="grid grid-cols-[100px_1fr] items-center gap-4">
              <label className="text-sm font-medium text-gray-500">Country</label>
              <input type="text" name="billing_country" value={formData.billing_country} onChange={handleChange} className={inputClass} placeholder="Select or type to add" />
            </div>

            <div className="grid grid-cols-[100px_1fr] items-start gap-4">
              <label className="text-sm font-medium text-gray-500 pt-3">Address</label>
              <div className="space-y-3">
                <input type="text" name="billing_address_1" value={formData.billing_address_1} onChange={handleChange} className={inputClass} placeholder="Street 1" />
                <input type="text" name="billing_address_2" value={formData.billing_address_2} onChange={handleChange} className={inputClass} placeholder="Street 2 (Optional)" />
              </div>
            </div>

            <div className="grid grid-cols-[100px_1fr] items-center gap-4">
              <label className="text-sm font-medium text-gray-500">City</label>
              <input type="text" name="billing_city" value={formData.billing_city} onChange={handleChange} className={inputClass} />
            </div>

            <div className="grid grid-cols-[100px_1fr] items-center gap-4">
              <label className="text-sm font-medium text-gray-500">State / ZIP</label>
              <div className="grid grid-cols-2 gap-3">
                <input type="text" name="billing_state" placeholder="State" value={formData.billing_state} onChange={handleChange} className={inputClass} />
                <input type="text" name="billing_zip" placeholder="ZIP Code" value={formData.billing_zip} onChange={handleChange} className={inputClass} />
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="space-y-5 relative">
            <div className="absolute -left-8 top-0 bottom-0 w-px bg-gray-100 hidden lg:block"></div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg text-black tracking-tight">Shipping Address</h3>
              <button type="button" onClick={copyBillingToShipping} className="text-xs font-bold uppercase tracking-wider text-black bg-gray-100 px-3 py-1.5 rounded-md hover:bg-gray-200 transition">
                ↓ Copy Billing
              </button>
            </div>
            
            <div className="grid grid-cols-[100px_1fr] items-center gap-4">
              <label className="text-sm font-medium text-gray-500">Attention</label>
              <input type="text" name="shipping_attention" value={formData.shipping_attention} onChange={handleChange} className={inputClass} />
            </div>
            
            <div className="grid grid-cols-[100px_1fr] items-center gap-4">
              <label className="text-sm font-medium text-gray-500">Country</label>
              <input type="text" name="shipping_country" value={formData.shipping_country} onChange={handleChange} className={inputClass} placeholder="Select or type to add" />
            </div>

            <div className="grid grid-cols-[100px_1fr] items-start gap-4">
              <label className="text-sm font-medium text-gray-500 pt-3">Address</label>
              <div className="space-y-3">
                <input type="text" name="shipping_address_1" value={formData.shipping_address_1} onChange={handleChange} className={inputClass} placeholder="Street 1" />
                <input type="text" name="shipping_address_2" value={formData.shipping_address_2} onChange={handleChange} className={inputClass} placeholder="Street 2 (Optional)" />
              </div>
            </div>

            <div className="grid grid-cols-[100px_1fr] items-center gap-4">
              <label className="text-sm font-medium text-gray-500">City</label>
              <input type="text" name="shipping_city" value={formData.shipping_city} onChange={handleChange} className={inputClass} />
            </div>

            <div className="grid grid-cols-[100px_1fr] items-center gap-4">
              <label className="text-sm font-medium text-gray-500">State / ZIP</label>
              <div className="grid grid-cols-2 gap-3">
                <input type="text" name="shipping_state" placeholder="State" value={formData.shipping_state} onChange={handleChange} className={inputClass} />
                <input type="text" name="shipping_zip" placeholder="ZIP Code" value={formData.shipping_zip} onChange={handleChange} className={inputClass} />
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-12 pt-6 border-t border-gray-100 flex justify-end gap-3">
          <Link href="/dashboard" className="px-6 py-2.5 text-sm font-semibold bg-white border border-gray-300 text-black rounded-lg hover:bg-gray-50 transition">
            Cancel
          </Link>
          <button type="submit" disabled={isLoading} className="px-8 py-2.5 text-sm font-semibold bg-black text-white rounded-lg shadow-md hover:bg-gray-900 transition active:scale-95 disabled:opacity-50">
            {isLoading ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </form>
    </div>
  );
}
