import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  SlidersHorizontal,
  X,
  RotateCcw,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { productApi } from '../api/client';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';

const ShopPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const keyword = searchParams.get('keyword') || '';
  const selectedCategory = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || 'newest';
  const page = Number(searchParams.get('page')) || 1;
  const inStock = searchParams.get('inStock') === 'true';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';

  const [localMin, setLocalMin] = useState(minPrice);
  const [localMax, setLocalMax] = useState(maxPrice);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await productApi.getCategories();
        if (res.data.success) {
          setCategories(res.data.categories);
        }
      } catch (e) {}
    };
    fetchCats();
  }, []);

  useEffect(() => {
    const fetchFilteredProducts = async () => {
      try {
        setLoading(true);
        const params = {
          page,
          limit: 12,
          keyword,
          category: selectedCategory,
          sort,
          inStock: inStock ? 'true' : undefined,
          minPrice: minPrice || undefined,
          maxPrice: maxPrice || undefined,
        };

        const res = await productApi.getProducts(params);
        if (res.data.success) {
          setProducts(res.data.products);
          setTotalPages(res.data.pages || 1);
          setTotalProducts(res.data.totalProducts || 0);
        }
      } catch (err) {
        console.error('Failed to load products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFilteredProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [keyword, selectedCategory, sort, page, inStock, minPrice, maxPrice]);

  const updateParam = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value !== undefined && value !== null && value !== '') {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handlePriceApply = (e) => {
    e.preventDefault();
    const newParams = new URLSearchParams(searchParams);
    if (localMin) newParams.set('minPrice', localMin);
    else newParams.delete('minPrice');
    if (localMax) newParams.set('maxPrice', localMax);
    else newParams.delete('maxPrice');
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const resetAllFilters = () => {
    setLocalMin('');
    setLocalMax('');
    setSearchParams(new URLSearchParams());
  };

  const hasActiveFilters =
    Boolean(keyword) ||
    Boolean(selectedCategory) ||
    inStock ||
    Boolean(minPrice) ||
    Boolean(maxPrice) ||
    sort !== 'newest';

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Category Filter */}
      <div>
        <h4 className="text-[12px] font-semibold uppercase tracking-wider text-[#171717] mb-2.5">
          Departments
        </h4>
        <div className="space-y-1">
          <button
            onClick={() => updateParam('category', '')}
            className={`w-full text-left px-2.5 py-1.5 rounded-[6px] text-[13px] transition-colors ${
              !selectedCategory
                ? 'bg-[#F2F1EE] text-[#171717] font-medium'
                : 'text-[#6B6B6B] hover:text-[#171717]'
            }`}
          >
            All Products
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => updateParam('category', cat)}
              className={`w-full text-left px-2.5 py-1.5 rounded-[6px] text-[13px] capitalize transition-colors ${
                selectedCategory.toLowerCase() === cat.toLowerCase()
                  ? 'bg-[#F2F1EE] text-[#171717] font-medium'
                  : 'text-[#6B6B6B] hover:text-[#171717]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <hr className="border-[#E7E5E2]" />

      {/* Price Range */}
      <div>
        <h4 className="text-[12px] font-semibold uppercase tracking-wider text-[#171717] mb-2.5">
          Price Range (₹)
        </h4>
        <form onSubmit={handlePriceApply} className="space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="Min"
              value={localMin}
              onChange={(e) => setLocalMin(e.target.value)}
              className="w-full px-2.5 h-[36px] bg-[#F7F7F5] border border-[#E7E5E2] rounded-[8px] text-[13px] outline-none focus:border-[#171717]"
            />
            <span className="text-[#6B6B6B] text-[12px]">-</span>
            <input
              type="number"
              placeholder="Max"
              value={localMax}
              onChange={(e) => setLocalMax(e.target.value)}
              className="w-full px-2.5 h-[36px] bg-[#F7F7F5] border border-[#E7E5E2] rounded-[8px] text-[13px] outline-none focus:border-[#171717]"
            />
          </div>
          <button
            type="submit"
            className="w-full h-[36px] bg-[#171717] hover:bg-[#2B2B2B] text-white text-[13px] font-medium rounded-[8px] transition-colors"
          >
            Apply
          </button>
        </form>
      </div>

      <hr className="border-[#E7E5E2]" />

      {/* Availability */}
      <div>
        <h4 className="text-[12px] font-semibold uppercase tracking-wider text-[#171717] mb-2.5">
          Availability
        </h4>
        <label className="flex items-center gap-2 text-[13px] text-[#171717] cursor-pointer">
          <input
            type="checkbox"
            checked={inStock}
            onChange={(e) => updateParam('inStock', e.target.checked ? 'true' : '')}
            className="w-4 h-4 rounded-[4px] border-[#E7E5E2] text-[#171717] focus:ring-0"
          />
          <span>In Stock Only</span>
        </label>
      </div>

      {hasActiveFilters && (
        <button
          onClick={resetAllFilters}
          className="w-full flex items-center justify-center gap-1.5 h-[36px] text-[13px] font-medium text-[#B9382F] bg-[#FCE8E5] rounded-[8px] hover:bg-[#F9D6D1] transition-colors"
        >
          <RotateCcw size={13} /> Reset Filters
        </button>
      )}
    </div>
  );

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-8">
      {/* Header & Sorting Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-[#E7E5E2]">
        <div>
          <h1 className="text-[28px] sm:text-[32px] font-medium text-[#171717] tracking-tight">
            {selectedCategory || (keyword ? `Search: "${keyword}"` : 'Catalog')}
          </h1>
          <p className="text-[13px] text-[#6B6B6B] mt-0.5">
            {totalProducts} products available
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden flex items-center gap-2 h-[38px] px-3.5 bg-[#FFFFFF] border border-[#E7E5E2] rounded-[8px] text-[13px] text-[#171717]"
          >
            <Filter size={15} />
            <span>Filters</span>
          </button>

          <div className="flex items-center gap-2 bg-[#FFFFFF] border border-[#E7E5E2] h-[38px] px-3 rounded-[8px]">
            <span className="text-[12px] text-[#6B6B6B]">Sort:</span>
            <select
              value={sort}
              onChange={(e) => updateParam('sort', e.target.value)}
              className="text-[13px] font-medium text-[#171717] bg-transparent outline-none cursor-pointer"
            >
              <option value="newest">Newest</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="top-rated">Rating</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2-Column Desktop Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filters */}
        <div className="hidden lg:block lg:col-span-1">
          <div className="bg-[#FFFFFF] rounded-[12px] border border-[#E7E5E2] p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] sticky top-28">
            <FilterContent />
          </div>
        </div>

        {/* Product Grid Area (3 cols in content area = 4 col total grid look) */}
        <div className="lg:col-span-3">
          {loading ? (
            <LoadingSpinner text="Loading products..." />
          ) : products.length > 0 ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-1.5 mt-12">
                  <button
                    disabled={page <= 1}
                    onClick={() => updateParam('page', page - 1)}
                    className="w-9 h-9 rounded-[8px] border border-[#E7E5E2] bg-[#FFFFFF] text-[#171717] hover:bg-[#F2F1EE] disabled:opacity-40 flex items-center justify-center"
                  >
                    <ChevronLeft size={16} />
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => updateParam('page', p)}
                      className={`w-9 h-9 rounded-[8px] text-[13px] font-medium transition-colors ${
                        p === page
                          ? 'bg-[#171717] text-white'
                          : 'bg-[#FFFFFF] border border-[#E7E5E2] text-[#171717] hover:bg-[#F2F1EE]'
                      }`}
                    >
                      {p}
                    </button>
                  ))}

                  <button
                    disabled={page >= totalPages}
                    onClick={() => updateParam('page', page + 1)}
                    className="w-9 h-9 rounded-[8px] border border-[#E7E5E2] bg-[#FFFFFF] text-[#171717] hover:bg-[#F2F1EE] disabled:opacity-40 flex items-center justify-center"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="bg-[#FFFFFF] rounded-[12px] border border-[#E7E5E2] p-12 text-center max-w-sm mx-auto my-8">
              <h3 className="text-[16px] font-medium text-[#171717] mb-1">No products found</h3>
              <p className="text-[13px] text-[#6B6B6B] mb-5">
                Try changing your search terms or resetting filters.
              </p>
              <button
                onClick={resetAllFilters}
                className="h-[38px] px-4 bg-[#171717] hover:bg-[#2B2B2B] text-white text-[13px] font-medium rounded-[8px] transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-[#171717]/40"
            onClick={() => setMobileFilterOpen(false)}
          ></div>
          <div className="relative ml-auto w-full max-w-xs bg-[#FFFFFF] h-full p-6 flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[#E7E5E2] mb-5">
                <span className="font-medium text-[15px] text-[#171717]">Filters</span>
                <button onClick={() => setMobileFilterOpen(false)} className="text-[#6B6B6B]">
                  <X size={18} />
                </button>
              </div>
              <FilterContent />
            </div>
            <button
              onClick={() => setMobileFilterOpen(false)}
              className="w-full h-[42px] bg-[#171717] text-white text-[13px] font-medium rounded-[8px] mt-6"
            >
              Show {totalProducts} Results
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopPage;
