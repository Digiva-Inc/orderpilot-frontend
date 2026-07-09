'use client';
import { useState, useEffect } from 'react';

export default function Settings() {
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);

  const [newBrandName, setNewBrandName] = useState('');
  
  const [newCatBrandId, setNewCatBrandId] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');

  const [newSubCatId, setNewSubCatId] = useState('');
  const [newSubCategoryName, setNewSubCategoryName] = useState('');

  const [products, setProducts] = useState([]);

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    try {
      const [brandRes, catRes, prodRes] = await Promise.all([
        fetch(`${API_URL}/api/products/brands`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_URL}/api/products/categories`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_URL}/api/products`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      if (brandRes.ok) setBrands(await brandRes.json());
      if (catRes.ok) setCategories(await catRes.json());
      if (prodRes.ok) setProducts(await prodRes.json());
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddBrand = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    try {
      const res = await fetch(`${API_URL}/api/products/brands`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ name: newBrandName })
      });
      if (res.ok) {
        alert("Brand Added successfully");
        setNewBrandName('');
        fetchData();
      } else {
        const errorData = await res.json();
        alert(`Error: ${errorData.message || 'Failed to add brand. Are you logged in?'}`);
      }
    } catch (err) {
      alert(`Network error: ${err.message}`);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    try {
      const res = await fetch(`${API_URL}/api/products/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ brand_id: newCatBrandId, name: newCategoryName })
      });
      if (res.ok) {
        alert("Category Added successfully");
        setNewCategoryName('');
        fetchData();
      } else {
        const errorData = await res.json();
        alert(`Error: ${errorData.message || 'Failed to add category'}`);
      }
    } catch (err) {
      alert(`Network error: ${err.message}`);
    }
  };

  const handleAddSubCategory = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    try {
      const res = await fetch(`${API_URL}/api/products/sub-categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ category_id: newSubCatId, name: newSubCategoryName })
      });
      if (res.ok) {
        alert("Sub-Category Added successfully");
        setNewSubCategoryName('');
      } else {
        const errorData = await res.json();
        alert(`Error: ${errorData.message || 'Failed to add sub-category'}`);
      }
    } catch (err) {
      alert(`Network error: ${err.message}`);
    }
  };

  const inputClass = "flex-grow bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:bg-white focus:border-black focus:ring-1 focus:ring-black outline-none transition-all";
  const btnClass = "px-5 py-2.5 bg-black text-white rounded-xl text-sm font-semibold hover:bg-gray-900 transition shadow-sm active:scale-95";

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 animate-fade-in mx-auto max-w-5xl overflow-hidden">
      <div className="px-8 py-6 bg-gray-50/50 border-b border-gray-100">
        <h2 className="text-2xl font-extrabold tracking-tight text-black mb-1">System Settings</h2>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Manage Brands, Categories & Sub-Categories</p>
      </div>

      <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Brand Section */}
        <div className="space-y-4">
          <h3 className="font-bold text-lg text-black mb-4">1. Add Brand</h3>
          <form onSubmit={handleAddBrand} className="flex gap-2">
            <input 
              type="text" 
              placeholder="e.g. Balaji" 
              required
              value={newBrandName}
              onChange={(e) => setNewBrandName(e.target.value)}
              className={inputClass}
            />
            <button type="submit" className={btnClass}>Add</button>
          </form>
          <p className="text-xs text-gray-500">Add top-level brands.</p>
        </div>

        {/* Category Section */}
        <div className="space-y-4">
          <h3 className="font-bold text-lg text-black mb-4">2. Add Category</h3>
          <form onSubmit={handleAddCategory} className="space-y-4">
            <select 
              required
              value={newCatBrandId}
              onChange={(e) => setNewCatBrandId(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:bg-white focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
            >
              <option value="" disabled>Select Parent Brand</option>
              {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="e.g. Wafers" 
                required
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className={inputClass}
              />
              <button type="submit" className={btnClass}>Add</button>
            </div>
          </form>
        </div>

        {/* Sub-Category Section */}
        <div className="space-y-4">
          <h3 className="font-bold text-lg text-black mb-4">3. Add Sub-Category</h3>
          <form onSubmit={handleAddSubCategory} className="space-y-4">
            <select 
              required
              value={newSubCatId}
              onChange={(e) => setNewSubCatId(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:bg-white focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
            >
              <option value="" disabled>Select Parent Category</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="e.g. Salted, Masala" 
                required
                value={newSubCategoryName}
                onChange={(e) => setNewSubCategoryName(e.target.value)}
                className={inputClass}
              />
              <button type="submit" className={btnClass}>Add</button>
            </div>
          </form>
        </div>
      </div>

      <div className="px-8 pb-8">
        <h3 className="font-bold text-lg text-black mb-4">Product Catalog Mappings</h3>
        <div className="overflow-x-auto rounded-xl border border-gray-100 shadow-sm">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50/80 text-xs uppercase text-gray-500 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 font-semibold">Image</th>
                <th className="px-6 py-4 font-semibold">Brand</th>
                <th className="px-6 py-4 font-semibold">Category</th>
                <th className="px-6 py-4 font-semibold">Sub-Category</th>
                <th className="px-6 py-4 font-semibold">Product Name</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 bg-white">
              {products.length === 0 ? (
                <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-400">No products configured yet.</td></tr>
              ) : products.map(product => (
                <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-3">
                    {product.image_url ? (
                      <img src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${product.image_url}`} alt={product.product_name} className="w-10 h-10 object-cover rounded-lg border border-gray-100" />
                    ) : (
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-xs">No Img</div>
                    )}
                  </td>
                  <td className="px-6 py-3 font-medium text-gray-900">{product.brand_name || '-'}</td>
                  <td className="px-6 py-3">{product.category_name || '-'}</td>
                  <td className="px-6 py-3">{product.sub_category_name || '-'}</td>
                  <td className="px-6 py-3 font-semibold text-gray-800">{product.product_name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
