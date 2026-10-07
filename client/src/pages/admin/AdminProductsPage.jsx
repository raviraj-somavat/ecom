import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, Search, X, Upload, ArrowLeft } from 'lucide-react';
import { productApi } from '../../api/client';
import LoadingSpinner from '../../components/LoadingSpinner';

const AdminProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [brand, setBrand] = useState('');
  const [stock, setStock] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [isFeatured, setIsFeatured] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const [prodRes, catRes] = await Promise.all([
        productApi.getProducts({
          limit: 100,
          keyword,
          category: selectedCategory,
        }),
        productApi.getCategories(),
      ]);

      if (prodRes.data.success) {
        setProducts(prodRes.data.products);
      }
      if (catRes.data.success) {
        setCategories(catRes.data.categories);
      }
    } catch (err) {
      console.error('Error fetching admin products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [keyword, selectedCategory]);

  const openAddModal = () => {
    setEditingProduct(null);
    setName('');
    setDescription('');
    setPrice('');
    setCategory(categories[0] || 'Electronics');
    setBrand('');
    setStock('');
    setImageUrl('');
    setImageFile(null);
    setIsFeatured(false);
    setModalOpen(true);
  };

  const openEditModal = (p) => {
    setEditingProduct(p);
    setName(p.name);
    setDescription(p.description);
    setPrice(p.price);
    setCategory(p.category);
    setBrand(p.brand || '');
    setStock(p.stock);
    setImageUrl(p.imageUrl);
    setImageFile(null);
    setIsFeatured(p.isFeatured || false);
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product permanently?')) return;

    try {
      const res = await productApi.deleteProduct(id);
      if (res.data.success) {
        alert('Product removed');
        fetchProducts();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete product');
    }
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      formData.append('price', price);
      formData.append('category', category);
      formData.append('brand', brand);
      formData.append('stock', stock);
      formData.append('isFeatured', isFeatured);

      if (imageFile) {
        formData.append('image', imageFile);
      } else if (imageUrl) {
        formData.append('imageUrl', imageUrl);
      }

      if (editingProduct) {
        await productApi.updateProduct(editingProduct._id, formData);
        alert('Product updated successfully');
      } else {
        await productApi.createProduct(formData);
        alert('Product created successfully');
      }

      setModalOpen(false);
      fetchProducts();
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Operation failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E7E5E2]">
        <div>
          <Link
            to="/admin"
            className="inline-flex items-center gap-1.5 text-[13px] text-[#6B6B6B] hover:text-[#171717] mb-1"
          >
            <ArrowLeft size={14} /> Back to Dashboard
          </Link>
          <h1 className="text-[28px] sm:text-[32px] font-medium text-[#171717] tracking-tight">
            Product Inventory
          </h1>
        </div>

        <button
          onClick={openAddModal}
          className="h-[40px] px-4 rounded-[8px] bg-[#171717] hover:bg-[#262626] text-white text-[13px] font-medium flex items-center gap-1.5 self-start transition-colors"
        >
          <Plus size={16} />
          <span>Add Product</span>
        </button>
      </div>

      {/* Filter toolbar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-[#FFFFFF] p-3 rounded-[8px] border border-[#E7E5E2]">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            placeholder="Search catalog..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="w-full pl-8 pr-3 h-[36px] text-[13px] bg-[#F7F7F5] border border-[#E7E5E2] rounded-[6px] outline-none focus:border-[#171717]"
          />
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#6B6B6B]" />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="h-[36px] px-3 text-[13px] font-medium bg-[#F7F7F5] border border-[#E7E5E2] rounded-[6px] outline-none cursor-pointer"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-[#FFFFFF] rounded-[12px] border border-[#E7E5E2] shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Loading products..." />
        ) : products.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead className="bg-[#F7F7F5] text-[#6B6B6B] border-b border-[#E7E5E2] text-[12px]">
                <tr>
                  <th className="py-3 px-4">Item</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Units</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7E5E2]">
                {products.map((p) => (
                  <tr key={p._id} className="hover:bg-[#F7F7F5] transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.imageUrl}
                          alt={p.name}
                          className="w-10 h-10 rounded-[6px] object-contain bg-[#F2F1EE] p-1 shrink-0"
                        />
                        <div className="min-w-0">
                          <span className="font-medium text-[#171717] block truncate max-w-xs">
                            {p.name}
                          </span>
                          <span className="text-[11px] text-[#6B6B6B]">{p.brand || '—'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-[#6B6B6B] capitalize">{p.category}</td>
                    <td className="py-3 px-4 font-semibold text-[#171717]">
                      ₹{p.price.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`h-[22px] px-2 rounded-[5px] text-[11px] font-medium inline-flex items-center ${
                          p.stock <= 0
                            ? 'bg-[#FCE8E5] text-[#B9382F]'
                            : p.stock < 10
                            ? 'bg-[#FDF3E7] text-[#E86A33]'
                            : 'bg-[#EBF4EE] text-[#2A5A3C]'
                        }`}
                      >
                        {p.stock <= 0 ? 'Out of stock' : `${p.stock} units`}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditModal(p)}
                          className="p-1.5 text-[#6B6B6B] hover:text-[#171717]"
                          title="Edit"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(p._id)}
                          className="p-1.5 text-[#6B6B6B] hover:text-[#B9382F]"
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-[#6B6B6B] text-[13px]">No products found.</div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-[#171717]/40"
            onClick={() => setModalOpen(false)}
          ></div>

          <div className="relative w-full max-w-lg bg-[#FFFFFF] rounded-[12px] border border-[#E7E5E2] shadow-[0_8px_24px_rgba(0,0,0,0.08)] p-6 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E7E5E2]">
              <h2 className="text-[16px] font-medium text-[#171717]">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button onClick={() => setModalOpen(false)} className="text-[#6B6B6B]">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3 text-[13px]">
              <div>
                <label className="text-[#6B6B6B] block mb-1">Product Title *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-[38px] px-3 rounded-[8px] bg-[#F7F7F5] border border-[#E7E5E2] outline-none focus:border-[#171717]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#6B6B6B] block mb-1">Department *</label>
                  <input
                    type="text"
                    required
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full h-[38px] px-3 rounded-[8px] bg-[#F7F7F5] border border-[#E7E5E2] outline-none focus:border-[#171717]"
                  />
                </div>

                <div>
                  <label className="text-[#6B6B6B] block mb-1">Brand</label>
                  <input
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full h-[38px] px-3 rounded-[8px] bg-[#F7F7F5] border border-[#E7E5E2] outline-none focus:border-[#171717]"
                  />
                </div>

                <div>
                  <label className="text-[#6B6B6B] block mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full h-[38px] px-3 rounded-[8px] bg-[#F7F7F5] border border-[#E7E5E2] outline-none focus:border-[#171717]"
                  />
                </div>

                <div>
                  <label className="text-[#6B6B6B] block mb-1">Stock (Units) *</label>
                  <input
                    type="number"
                    required
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="w-full h-[38px] px-3 rounded-[8px] bg-[#F7F7F5] border border-[#E7E5E2] outline-none focus:border-[#171717]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[#6B6B6B] block mb-1">Description *</label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2.5 rounded-[8px] bg-[#F7F7F5] border border-[#E7E5E2] outline-none focus:border-[#171717] resize-none"
                ></textarea>
              </div>

              <div>
                <label className="text-[#6B6B6B] block mb-1">Image URL / Upload</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="https://..."
                    value={imageUrl}
                    onChange={(e) => {
                      setImageUrl(e.target.value);
                      setImageFile(null);
                    }}
                    className="flex-1 h-[38px] px-3 rounded-[8px] bg-[#F7F7F5] border border-[#E7E5E2] outline-none focus:border-[#171717]"
                  />
                  <label className="h-[38px] px-3 rounded-[8px] border border-[#E7E5E2] bg-[#F2F1EE] text-[#171717] font-medium cursor-pointer flex items-center gap-1 shrink-0 text-[12px]">
                    <Upload size={13} />
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setImageFile(e.target.files[0])}
                      className="hidden"
                    />
                  </label>
                </div>
                {imageFile && (
                  <span className="text-[11px] text-[#3F7D58] block mt-1">✓ {imageFile.name}</span>
                )}
              </div>

              <div className="pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-[#171717]">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="w-4 h-4 rounded-[4px] border-[#E7E5E2] text-[#171717] focus:ring-0"
                  />
                  <span>Feature on homepage</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#E7E5E2]">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="h-[38px] px-4 rounded-[8px] border border-[#E7E5E2] text-[#6B6B6B]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="h-[38px] px-4 rounded-[8px] bg-[#171717] hover:bg-[#262626] text-white font-medium"
                >
                  {saving ? 'Saving...' : editingProduct ? 'Save Changes' : 'Create Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProductsPage;
