import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, ShieldCheck, Truck, RotateCcw } from 'lucide-react';
import { productApi } from '../api/client';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        setLoading(true);
        const [featRes, topRes, catRes] = await Promise.all([
          productApi.getProducts({ isFeatured: 'true', limit: 8 }),
          productApi.getTopProducts({ limit: 4 }),
          productApi.getCategories(),
        ]);

        if (featRes.data.success) {
          setFeaturedProducts(featRes.data.products);
        }
        if (topRes.data.success) {
          setTopProducts(topRes.data.products);
        }
        if (catRes.data.success) {
          setCategories(catRes.data.categories);
        }
      } catch (err) {
        console.error('Failed to load homepage data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadHomeData();
  }, []);

  const categoryImages = {
    Electronics:
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80',
    Computers:
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=400&q=80',
    Accessories:
      'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=400&q=80',
    Wearables:
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80',
    Fashion:
      'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=400&q=80',
    Footwear:
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&q=80',
    'Home & Kitchen':
      'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&w=400&q=80',
    Furniture:
      'https://images.unsplash.com/photo-1580481077195-c328a37db71a?auto=format&fit=crop&w=400&q=80',
  };

  return (
    <div className="space-y-16 pb-16">
      {/* 500-560px Height Hero Section with #EFEDE8 background */}
      <section className="max-w-[1200px] mx-auto px-6 pt-6">
        <div className="bg-[#EFEDE8] border border-[#E7E5E2] rounded-[12px] min-h-[480px] lg:h-[520px] p-8 sm:p-12 lg:p-16 flex flex-col lg:flex-row items-center justify-between gap-10">
          {/* Left Column */}
          <div className="max-w-xl space-y-5">
            <span className="text-[12px] font-semibold uppercase tracking-wider text-[#6B6B6B] block">
              NEW SEASON
            </span>

            <h1 className="text-[38px] sm:text-[48px] lg:text-[54px] font-semibold text-[#171717] tracking-tight leading-[1.08]">
              Everything you <br />
              actually need.
            </h1>

            <p className="text-[15px] text-[#6B6B6B] max-w-md leading-relaxed font-normal">
              Thoughtfully curated daily essentials, high-fidelity audio, and modern apparel crafted with precision.
            </p>

            <div className="pt-2 flex items-center gap-4">
              <Link
                to="/shop"
                className="h-[42px] px-[18px] rounded-[8px] bg-[#171717] hover:bg-[#2B2B2B] text-white text-[14px] font-medium flex items-center justify-center transition-colors active:scale-95"
              >
                Shop Collection
              </Link>
              <Link
                to="/shop?sort=top-rated"
                className="text-[14px] font-medium text-[#171717] hover:text-[#E86A33] flex items-center gap-1 transition-colors px-2 py-1"
              >
                <span>View Bestsellers</span>
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>

          {/* Right Column: Hero Product Card Showcase */}
          <div className="w-full max-w-[340px] shrink-0">
            <div className="bg-[#FFFFFF] border border-[#E7E5E2] rounded-[12px] p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
              <div className="w-full h-[260px] bg-[#F2F1EE] rounded-[10px] overflow-hidden flex items-center justify-center p-4">
                <img
                  src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80"
                  alt="Sony Wireless Headphones"
                  className="max-h-full max-w-full object-contain"
                />
              </div>
              <div className="pt-3.5 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-[#6B6B6B] uppercase block">Featured Spotlight</span>
                  <h3 className="text-[15px] font-medium text-[#171717]">Sony WH-1000XM5</h3>
                </div>
                <span className="text-[16px] font-semibold text-[#171717]">₹29,990</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      {categories.length > 0 && (
        <section className="max-w-[1200px] mx-auto px-6">
          <div className="flex items-baseline justify-between mb-6 pb-2 border-b border-[#E7E5E2]">
            <h2 className="text-[26px] sm:text-[30px] font-medium text-[#171717]">
              Categories
            </h2>
            <Link
              to="/shop"
              className="text-[13px] font-medium text-[#6B6B6B] hover:text-[#171717] transition-colors"
            >
              All Categories →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-4 sm:gap-6">
            {categories.slice(0, 8).map((cat) => (
              <Link
                key={cat}
                to={`/shop?category=${encodeURIComponent(cat)}`}
                className="group bg-[#FFFFFF] border border-[#E7E5E2] rounded-[12px] p-4 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-200"
              >
                <div className="w-full h-32 bg-[#F2F1EE] rounded-[10px] overflow-hidden flex items-center justify-center p-3 mb-3">
                  <img
                    src={
                      categoryImages[cat] ||
                      'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=400&q=80'
                    }
                    alt={cat}
                    className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
                <h3 className="text-[14px] font-medium text-[#171717] capitalize group-hover:text-[#E86A33] transition-colors">
                  {cat}
                </h3>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Product Grid: 1200px max width, 4 columns, 24px gap */}
      <section className="max-w-[1200px] mx-auto px-6">
        <div className="flex items-baseline justify-between mb-6 pb-2 border-b border-[#E7E5E2]">
          <div>
            <h2 className="text-[26px] sm:text-[30px] font-medium text-[#171717]">
              Featured Collection
            </h2>
          </div>
          <Link
            to="/shop?isFeatured=true"
            className="text-[13px] font-medium text-[#6B6B6B] hover:text-[#171717] transition-colors"
          >
            Explore all ({featuredProducts.length}) →
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner text="Loading products..." />
        ) : featuredProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-[#6B6B6B] text-[14px]">No products available.</div>
        )}
      </section>

      {/* Minimal Brand Assurance Row */}
      <section className="max-w-[1200px] mx-auto px-6">
        <div className="bg-[#FFFFFF] border border-[#E7E5E2] rounded-[12px] p-6 sm:p-8 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center sm:text-left">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-[8px] bg-[#F2F1EE] flex items-center justify-center text-[#171717] shrink-0">
              <Truck size={20} />
            </div>
            <div>
              <h4 className="text-[14px] font-medium text-[#171717]">Complimentary Delivery</h4>
              <p className="text-[12px] text-[#6B6B6B]">On all orders above ₹500</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-[8px] bg-[#F2F1EE] flex items-center justify-center text-[#171717] shrink-0">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h4 className="text-[14px] font-medium text-[#171717]">Genuine & Insured</h4>
              <p className="text-[12px] text-[#6B6B6B]">100% authentic merchandise</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-[8px] bg-[#F2F1EE] flex items-center justify-center text-[#171717] shrink-0">
              <RotateCcw size={20} />
            </div>
            <div>
              <h4 className="text-[14px] font-medium text-[#171717]">7-Day Replacements</h4>
              <p className="text-[12px] text-[#6B6B6B]">Easy returns & support</p>
            </div>
          </div>
        </div>
      </section>

      {/* Top Rated Row */}
      {topProducts.length > 0 && (
        <section className="max-w-[1200px] mx-auto px-6">
          <div className="flex items-baseline justify-between mb-6 pb-2 border-b border-[#E7E5E2]">
            <h2 className="text-[26px] sm:text-[30px] font-medium text-[#171717]">
              Customer Favorites
            </h2>
            <Link
              to="/shop?sort=top-rated"
              className="text-[13px] font-medium text-[#6B6B6B] hover:text-[#171717] transition-colors"
            >
              View ratings →
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {topProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default HomePage;
