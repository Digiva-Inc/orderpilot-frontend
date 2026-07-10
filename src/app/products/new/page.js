'use client';
import { useState, useEffect } from 'react';

export default function NewProduct() {
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);

  // Filtered Options
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [filteredSubCategories, setFilteredSubCategories] = useState([]);

  // Product Form
  const [productData, setProductData] = useState({
    brand_id: '',
    category_id: '',
    sub_category_id: '',
    sap_no: '',
    upc_no: '',
    name: '',
    size: '',
    units_per_case: 1,
    list_unit_price: ''
  });
  const [productImage, setProductImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      try {
        const [brandRes, catRes, subCatRes] = await Promise.all([
          fetch(`${API_URL}/api/products/brands`, { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(`${API_URL}/api/products/categories`, { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(`${API_URL}/api/products/sub-categories`, { headers: { 'Authorization': `Bearer ${token}` } })
        ]);
        if (brandRes.ok) setBrands(await brandRes.json());
        if (catRes.ok) setCategories(await catRes.json());
        if (subCatRes.ok) setSubCategories(await subCatRes.json());
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  // Handle Cascading Changes
  const handleBrandChange = (e) => {
    const bId = e.target.value;
    setProductData({ ...productData, brand_id: bId, category_id: '', sub_category_id: '' });
    setFilteredCategories(categories.filter(c => c.brand_id == bId));
    setFilteredSubCategories([]);
  };

  const handleCategoryChange = (e) => {
    const cId = e.target.value;
    setProductData({ ...productData, category_id: cId, sub_category_id: '' });
    setFilteredSubCategories(subCategories.filter(sc => sc.category_id == cId));
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    const token = localStorage.getItem('token');
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    try {
      const formData = new FormData();
      Object.keys(productData).forEach(key => formData.append(key, productData[key]));
      formData.append('variant_name', productData.name);
      if (productImage) {
        formData.append('image', productImage);
      }
      
      const res = await fetch(`${API_URL}/api/products`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }, // Do not set Content-Type for FormData
        body: formData
      });
      if (res.ok) {
        alert("Product Added successfully!");
        setProductData({ brand_id: '', category_id: '', sub_category_id: '', sap_no: '', upc_no: '', name: '', size: '', units_per_case: 1, list_unit_price: '' });
        setProductImage(null);
        setImagePreview(null);
      } else {
        const errData = await res.json();
        alert(`Error: ${errData.message || 'Failed to add product'}`);
      }
    } catch (err) {
      alert(`Network error: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const inputClass = "w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:bg-white focus:border-black focus:ring-1 focus:ring-black outline-none transition-all";

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 animate-fade-in mx-auto max-w-5xl overflow-hidden">
      <div className="px-8 py-6 bg-gray-50/50 border-b border-gray-100 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-black mb-1">New Product</h2>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Catalog Management</p>
        </div>
      </div>
      
      <div className="p-8">
        <form onSubmit={handleAddProduct} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 border-b border-gray-100 pb-8">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">1. Brand</label>
              <select value={productData.brand_id} onChange={handleBrandChange} className={inputClass}>
                <option value="" disabled>Select Brand</option>
                {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">2. Category</label>
              <select value={productData.category_id} onChange={handleCategoryChange} className={inputClass} disabled={!productData.brand_id}>
                <option value="" disabled>Select Category</option>
                {filteredCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">3. Sub-Category</label>
              <select value={productData.sub_category_id} onChange={(e) => setProductData({...productData, sub_category_id: e.target.value})} className={inputClass} disabled={!productData.category_id}>
                <option value="" disabled>Select Sub-Category</option>
                {filteredSubCategories.map(sc => <option key={sc.id} value={sc.id}>{sc.name}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Product Name Variant / Description</label>
              <input 
                type="text" 
                required
                placeholder="e.g. 50g Pack, Family Size"
                value={productData.name}
                onChange={(e) => setProductData({...productData, name: e.target.value})}
                className={inputClass}
              />
              <p className="text-xs text-gray-400 mt-2">This is appended to the full name. Example result: "Balaji Wafers Salted - Family Size"</p>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">SAP #</label>
              <input 
                type="text" 
                value={productData.sap_no}
                onChange={(e) => setProductData({...productData, sap_no: e.target.value})}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">UPC #</label>
              <input 
                type="text" 
                value={productData.upc_no}
                onChange={(e) => setProductData({...productData, upc_no: e.target.value})}
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Units per Case</label>
              <input 
                type="number" 
                min="1"
                required
                value={productData.units_per_case}
                onChange={(e) => setProductData({...productData, units_per_case: e.target.value})}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">List Unit Price ($)</label>
              <input 
                type="number" 
                step="0.01"
                required
                value={productData.list_unit_price}
                onChange={(e) => setProductData({...productData, list_unit_price: e.target.value})}
                className={`${inputClass} bg-yellow-50/50 border-yellow-200 focus:border-yellow-400 focus:ring-yellow-400`}
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Product Image</label>
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      setProductImage(file);
                      if (file) {
                        setImagePreview(URL.createObjectURL(file));
                      } else {
                        setImagePreview(null);
                      }
                    }}
                    className={inputClass}
                  />
                  <p className="mt-2 text-xs text-gray-500">Upload a high-quality product image (JPG, PNG).</p>
                </div>
                {imagePreview && (
                  <div className="w-24 h-24 rounded-lg border border-gray-200 overflow-hidden bg-gray-50 flex-shrink-0 relative">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-100 flex justify-end">
            <button 
              type="submit" 
              disabled={isSaving}
              className={`px-8 py-3 bg-[#0f172a] text-white font-bold rounded-lg shadow-lg hover:bg-black transition-all active:scale-95 flex items-center gap-2 ${isSaving ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isSaving ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving Product...
                </>
              ) : 'Save Full Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
