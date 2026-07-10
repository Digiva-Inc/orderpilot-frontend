'use client';
import { useState, useEffect } from 'react';

export default function Settings() {
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [inputBrand, setInputBrand] = useState('');
  const [inputCategory, setInputCategory] = useState('');
  const [inputSubCategory, setInputSubCategory] = useState('');

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    try {
      const [brandRes, catRes, subCatRes, prodRes] = await Promise.all([
        fetch(`${API_URL}/api/products/brands`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_URL}/api/products/categories`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_URL}/api/products/sub-categories`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_URL}/api/products`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      if (brandRes.ok) setBrands(await brandRes.json());
      if (catRes.ok) setCategories(await catRes.json());
      if (subCatRes.ok) setSubCategories(await subCatRes.json());
      if (prodRes.ok) setProducts(await prodRes.json());
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddHierarchy = async (e) => {
    e.preventDefault();
    if (!inputBrand && !inputCategory && !inputSubCategory) {
      return alert("Please enter at least one level to add to the catalog.");
    }

    setIsLoading(true);
    const token = localStorage.getItem('token');
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };

    try {
      let currentBrandId = null;
      let currentCategoryId = null;

      // 1. Resolve or Create Brand
      if (inputBrand) {
        const existingBrand = brands.find(b => b.name.toLowerCase() === inputBrand.trim().toLowerCase());
        if (existingBrand) {
          currentBrandId = existingBrand.id;
        } else {
          const res = await fetch(`${API_URL}/api/products/brands`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ name: inputBrand.trim() })
          });
          if (!res.ok) throw new Error("Failed to create Brand");
          const data = await res.json();
          currentBrandId = data.id;
        }
      }

      // 2. Resolve or Create Category
      if (inputCategory) {
        if (!currentBrandId) throw new Error("A Category requires a Brand. Please specify a Brand.");
        const existingCategory = categories.find(c => 
          c.name.toLowerCase() === inputCategory.trim().toLowerCase() && 
          c.brand_id === currentBrandId
        );
        if (existingCategory) {
          currentCategoryId = existingCategory.id;
        } else {
          const res = await fetch(`${API_URL}/api/products/categories`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ brand_id: currentBrandId, name: inputCategory.trim() })
          });
          if (!res.ok) throw new Error("Failed to create Category");
          const data = await res.json();
          currentCategoryId = data.id;
        }
      }

      // 3. Resolve or Create Sub-Category
      if (inputSubCategory) {
        if (!currentCategoryId) throw new Error("A Sub-Category requires a Category. Please specify a Category.");
        const existingSubCat = subCategories.find(sc => 
          sc.name.toLowerCase() === inputSubCategory.trim().toLowerCase() && 
          sc.category_id === currentCategoryId
        );
        if (!existingSubCat) {
          const res = await fetch(`${API_URL}/api/products/sub-categories`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ category_id: currentCategoryId, name: inputSubCategory.trim() })
          });
          if (!res.ok) throw new Error("Failed to create Sub-Category");
        }
      }

      alert("Catalog hierarchy updated successfully!");
      setInputBrand('');
      setInputCategory('');
      setInputSubCategory('');
      fetchData(); // Refresh all dropdowns and tables
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = "w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-black focus:ring-1 focus:ring-black outline-none transition-all";
  
  // Filter suggestions based on higher-level selection
  const matchedBrand = brands.find(b => b.name.toLowerCase() === inputBrand.trim().toLowerCase());
  const filteredCategories = matchedBrand ? categories.filter(c => c.brand_id === matchedBrand.id) : categories;
  const matchedCategory = filteredCategories.find(c => c.name.toLowerCase() === inputCategory.trim().toLowerCase());
  const filteredSubCats = matchedCategory ? subCategories.filter(sc => sc.category_id === matchedCategory.id) : subCategories;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 animate-fade-in mx-auto max-w-5xl overflow-hidden">
      <div className="px-8 py-6 bg-gray-50/50 border-b border-gray-100 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-black mb-1">System Settings</h2>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Manage Brands, Categories & Sub-Categories</p>
        </div>
      </div>

      <div className="p-8">
        
        {/* Unified Add Hierarchy Section */}
        <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6 mb-10 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-black rounded-l-2xl"></div>
          <h3 className="font-bold text-lg text-black mb-1">Add to Catalog Hierarchy</h3>
          <p className="text-xs text-gray-500 mb-6">Type to search existing items, or type a new name to create it automatically. They are dependent on each other.</p>
          
          <form onSubmit={handleAddHierarchy} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">1. Brand</label>
              <input 
                list="brands-list"
                value={inputBrand}
                onChange={(e) => setInputBrand(e.target.value)}
                placeholder="Select or Type Brand"
                className={inputClass}
              />
              <datalist id="brands-list">
                {brands.map(b => <option key={b.id} value={b.name} />)}
              </datalist>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">2. Category</label>
              <input 
                list="categories-list"
                value={inputCategory}
                onChange={(e) => setInputCategory(e.target.value)}
                placeholder="Select or Type Category"
                className={inputClass}
                disabled={!inputBrand}
                title={!inputBrand ? "Please select a brand first" : ""}
              />
              <datalist id="categories-list">
                {filteredCategories.map(c => <option key={c.id} value={c.name} />)}
              </datalist>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">3. Sub-Category</label>
              <input 
                list="subcategories-list"
                value={inputSubCategory}
                onChange={(e) => setInputSubCategory(e.target.value)}
                placeholder="Select or Type Sub-Category"
                className={inputClass}
                disabled={!inputCategory}
                title={!inputCategory ? "Please select a category first" : ""}
              />
              <datalist id="subcategories-list">
                {filteredSubCats.map(sc => <option key={sc.id} value={sc.name} />)}
              </datalist>
            </div>

            <button 
              type="submit" 
              disabled={isLoading || (!inputBrand && !inputCategory && !inputSubCategory)}
              className="w-full py-3 bg-black text-white rounded-xl text-sm font-semibold hover:bg-gray-900 transition shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Adding...' : 'Add to Catalog'}
            </button>
          </form>
        </div>

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
