import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/client';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';

const WishlistPage = () => {
  const { user } = useAuth();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const res = await authApi.getWishlist();
      if (res.data.success) {
        setWishlistItems(res.data.wishlist || []);
      }
    } catch (e) {
      console.error('Failed to fetch wishlist:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  if (loading) return <LoadingSpinner text="Loading saved items..." />;

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-8 space-y-6">
      <div className="pb-3 border-b border-[#E7E5E2]">
        <h1 className="text-[28px] sm:text-[32px] font-medium text-[#171717] tracking-tight">
          Saved Wishlist
        </h1>
        <p className="text-[13px] text-[#6B6B6B] mt-0.5">
          {wishlistItems.length} products bookmarked for later
        </p>
      </div>

      {wishlistItems.length === 0 ? (
        <div className="bg-[#FFFFFF] rounded-[12px] border border-[#E7E5E2] p-12 text-center max-w-sm mx-auto my-12">
          <div className="w-12 h-12 bg-[#F2F1EE] text-[#6B6B6B] rounded-full flex items-center justify-center mx-auto mb-3">
            <Heart size={22} />
          </div>
          <h2 className="text-[16px] font-medium text-[#171717] mb-1">Your wishlist is empty</h2>
          <p className="text-[13px] text-[#6B6B6B] mb-6">
            Tap the heart icon on any product to save items you love.
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-1.5 h-[42px] px-[18px] bg-[#171717] text-white text-[13px] font-medium rounded-[8px]"
          >
            <span>Browse Catalog</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlistItems.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
