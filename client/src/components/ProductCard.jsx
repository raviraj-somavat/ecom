import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Check, Plus } from 'lucide-react';
import RatingStars from './RatingStars';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user, toggleWishlist, isInWishlist } = useAuth();
  const [isAdding, setIsAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const isFavorited = isInWishlist(product._id);
  const isOutOfStock = product.stock <= 0;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      navigate('/login?redirect=' + encodeURIComponent(window.location.pathname));
      return;
    }

    if (isOutOfStock) return;

    try {
      setIsAdding(true);
      await addToCart(product._id, 1);
      setAdded(true);
      setTimeout(() => setAdded(false), 1500);
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to add item to cart');
    } finally {
      setIsAdding(false);
    }
  };

  const handleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      navigate('/login');
      return;
    }

    try {
      await toggleWishlist(product);
    } catch (err) {
      alert(err.message);
    }
  };

  const fallbackImage =
    'https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&w=600&q=80';

  return (
    <div className="group relative bg-[#FFFFFF] border border-[#E7E5E2] rounded-[12px] p-[14px] shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between w-full h-[418px]">
      <div>
        {/* Image Area: 270x260px area, #F2F1EE, rounded 10px, space around image */}
        <div className="relative w-full h-[240px] sm:h-[250px] bg-[#F2F1EE] rounded-[10px] overflow-hidden flex items-center justify-center">
          {/* Badges */}
          <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1 pointer-events-none">
            {product.isFeatured && (
              <span className="h-[24px] px-2 rounded-[5px] bg-[#FCE8E5] text-[#B9382F] text-[11px] font-medium tracking-wide flex items-center">
                FEATURED
              </span>
            )}
            {isOutOfStock && (
              <span className="h-[24px] px-2 rounded-[5px] bg-[#F4F4F2] text-[#6B6B6B] text-[11px] font-medium flex items-center">
                SOLD OUT
              </span>
            )}
          </div>

          {/* Wishlist Button */}
          <button
            onClick={handleWishlist}
            title={isFavorited ? 'Remove from wishlist' : 'Add to wishlist'}
            className={`absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-[8px] flex items-center justify-center transition-colors shadow-xs ${
              isFavorited
                ? 'bg-white text-[#D94A4A]'
                : 'bg-white/90 text-[#6B6B6B] hover:text-[#171717] hover:bg-white'
            }`}
          >
            <Heart size={16} className={isFavorited ? 'fill-[#D94A4A]' : ''} />
          </button>

          {/* Product Image with breathing room around it */}
          <Link to={`/products/${product._id}`} className="w-full h-full flex items-center justify-center p-4">
            <img
              src={imgError ? fallbackImage : product.imageUrl || fallbackImage}
              alt={product.name}
              onError={() => setImgError(true)}
              className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          </Link>
        </div>

        {/* Product Meta */}
        <div className="pt-3">
          <div className="flex items-center justify-between text-[12px] text-[#6B6B6B]">
            <span className="capitalize">{product.category}</span>
            {product.brand && <span>{product.brand}</span>}
          </div>

          <Link to={`/products/${product._id}`} className="block mt-1">
            <h3 className="text-[15px] font-medium text-[#171717] line-clamp-1 hover:text-[#E86A33] transition-colors">
              {product.name}
            </h3>
          </Link>

          <div className="mt-1 flex items-center gap-1.5">
            <RatingStars rating={product.rating} numReviews={product.numReviews} size={13} />
          </div>
        </div>
      </div>

      {/* Bottom Row: Price & Action */}
      <div className="pt-3 border-t border-[#E7E5E2] flex items-center justify-between">
        <div>
          <span className="text-[11px] text-[#6B6B6B] block">Price</span>
          <span className="text-[17px] font-semibold text-[#171717]">
            ₹{product.price.toLocaleString('en-IN')}
          </span>
        </div>

        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock || isAdding}
          className={`h-[36px] px-3.5 rounded-[8px] text-[13px] font-medium transition-colors flex items-center justify-center gap-1.5 ${
            added
              ? 'bg-[#3F7D58] text-white'
              : isOutOfStock
              ? 'bg-[#E7E5E2] text-[#6B6B6B] cursor-not-allowed'
              : 'bg-[#171717] hover:bg-[#2B2B2B] text-white active:scale-95'
          }`}
        >
          {added ? (
            <>
              <Check size={14} /> Added
            </>
          ) : isAdding ? (
            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              <Plus size={14} /> Add
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
