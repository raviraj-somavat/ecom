import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Heart,
  Truck,
  ShieldCheck,
  RotateCcw,
  Star,
  Check,
  ArrowLeft,
} from 'lucide-react';
import { productApi } from '../api/client';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import RatingStars from '../components/RatingStars';
import LoadingSpinner from '../components/LoadingSpinner';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user, toggleWishlist, isInWishlist } = useAuth();

  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [isAdding, setIsAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewMessage, setReviewMessage] = useState({ type: '', text: '' });

  const fetchProduct = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await productApi.getProductById(id);
      if (res.data.success) {
        setProduct(res.data.product);
        setSelectedImage(res.data.product.imageUrl);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Product not found');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  const handleAddToCart = async (e, directCheckout = false) => {
    if (!user) {
      navigate('/login?redirect=' + encodeURIComponent(window.location.pathname));
      return;
    }

    try {
      setIsAdding(true);
      await addToCart(product._id, quantity);
      setAdded(true);
      setTimeout(() => setAdded(false), 1500);

      if (directCheckout) {
        navigate('/cart');
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setIsAdding(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login?redirect=' + encodeURIComponent(window.location.pathname));
      return;
    }

    try {
      setSubmittingReview(true);
      setReviewMessage({ type: '', text: '' });
      const res = await productApi.createReview(id, {
        rating: reviewRating,
        comment: reviewComment,
      });

      if (res.data.success) {
        setReviewMessage({ type: 'success', text: 'Thank you! Your review has been added.' });
        setReviewComment('');
        fetchProduct();
      }
    } catch (err) {
      setReviewMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to submit review',
      });
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading product..." />;

  if (error || !product) {
    return (
      <div className="max-w-[1200px] mx-auto px-6 py-20 text-center">
        <h2 className="text-[20px] font-medium text-[#171717] mb-2">Item Unavailable</h2>
        <p className="text-[14px] text-[#6B6B6B] mb-6">This product is no longer active in our catalog.</p>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 h-[42px] px-[18px] bg-[#171717] text-white rounded-[8px] text-[14px] font-medium"
        >
          <ArrowLeft size={16} /> Back to Catalog
        </Link>
      </div>
    );
  }

  const isFavorited = isInWishlist(product._id);
  const isOutOfStock = product.stock <= 0;
  const imageGallery =
    product.images && product.images.length > 0 ? product.images : [product.imageUrl];

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-8 space-y-12">
      {/* Breadcrumb / Back button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-[13px] text-[#6B6B6B] hover:text-[#171717] transition-colors"
      >
        <ArrowLeft size={14} /> Back
      </button>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Left: Gallery */}
        <div className="space-y-4">
          <div className="w-full h-[400px] sm:h-[460px] rounded-[10px] bg-[#F2F1EE] flex items-center justify-center p-8 overflow-hidden">
            <img
              src={selectedImage || product.imageUrl}
              alt={product.name}
              className="max-h-full max-w-full object-contain"
            />
          </div>

          {imageGallery.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-1">
              {imageGallery.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(img)}
                  className={`w-16 h-16 rounded-[8px] bg-[#F2F1EE] overflow-hidden shrink-0 border transition-all p-1.5 flex items-center justify-center ${
                    selectedImage === img ? 'border-[#171717]' : 'border-[#E7E5E2]'
                  }`}
                >
                  <img src={img} alt="Thumbnail" className="max-h-full max-w-full object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Info & Purchase Controls */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[12px] uppercase tracking-wider text-[#6B6B6B]">
                {product.category}
              </span>
              {product.brand && (
                <>
                  <span className="text-[#E7E5E2]">•</span>
                  <span className="text-[12px] uppercase text-[#6B6B6B]">{product.brand}</span>
                </>
              )}
            </div>

            <h1 className="text-[28px] sm:text-[34px] font-medium text-[#171717] tracking-tight leading-tight">
              {product.name}
            </h1>

            <div className="flex items-center gap-3 mt-3">
              <RatingStars rating={product.rating} numReviews={product.numReviews} size={15} />
              <span className="text-[#E7E5E2]">|</span>
              <span
                className={`text-[12px] font-medium h-[24px] px-2 rounded-[5px] inline-flex items-center ${
                  isOutOfStock
                    ? 'bg-[#F4F4F2] text-[#6B6B6B]'
                    : product.stock < 5
                    ? 'bg-[#FCE8E5] text-[#B9382F]'
                    : 'bg-[#EBF4EE] text-[#2A5A3C]'
                }`}
              >
                {isOutOfStock ? 'Sold Out' : `${product.stock} in Stock`}
              </span>
            </div>
          </div>

          {/* Price */}
          <div className="pb-4 border-b border-[#E7E5E2]">
            <span className="text-[26px] font-semibold text-[#171717] block">
              ₹{product.price.toLocaleString('en-IN')}
            </span>
            <span className="text-[12px] text-[#6B6B6B]">All inclusive, free delivery on eligible orders</span>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-[13px] font-semibold uppercase tracking-wider text-[#171717] mb-2">
              Overview
            </h3>
            <p className="text-[14px] text-[#6B6B6B] leading-relaxed whitespace-pre-line font-normal">
              {product.description}
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-4 pt-4 border-t border-[#E7E5E2]">
            <div className="flex items-center gap-4">
              <span className="text-[13px] font-medium text-[#171717]">Quantity:</span>
              <div className="flex items-center border border-[#E7E5E2] rounded-[8px] bg-white overflow-hidden">
                <button
                  type="button"
                  disabled={quantity <= 1 || isOutOfStock}
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-8 h-[36px] text-slate-600 hover:bg-[#F7F7F5] disabled:opacity-30 text-[14px] font-medium"
                >
                  -
                </button>
                <span className="px-3 h-[36px] flex items-center justify-center text-[13px] font-medium text-[#171717]">
                  {quantity}
                </span>
                <button
                  type="button"
                  disabled={quantity >= product.stock || isOutOfStock}
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  className="w-8 h-[36px] text-slate-600 hover:bg-[#F7F7F5] disabled:opacity-30 text-[14px] font-medium"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={(e) => handleAddToCart(e, false)}
                disabled={isOutOfStock || isAdding}
                className={`h-[42px] px-[18px] flex-1 rounded-[8px] text-[14px] font-medium transition-colors flex items-center justify-center gap-2 ${
                  added
                    ? 'bg-[#3F7D58] text-white'
                    : isOutOfStock
                    ? 'bg-[#E7E5E2] text-[#6B6B6B] cursor-not-allowed'
                    : 'bg-[#171717] hover:bg-[#262626] text-white active:scale-95'
                }`}
              >
                {added ? (
                  <>
                    <Check size={16} /> Added to Cart
                  </>
                ) : isAdding ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <span>{isOutOfStock ? 'Sold Out' : 'Add to Cart'}</span>
                )}
              </button>

              <button
                onClick={(e) => handleAddToCart(e, true)}
                disabled={isOutOfStock || isAdding}
                className="h-[42px] px-[18px] rounded-[8px] bg-[#E86A33] hover:bg-[#D55C27] text-white text-[14px] font-medium transition-colors active:scale-95 disabled:opacity-50"
              >
                Buy Now
              </button>

              <button
                onClick={() => toggleWishlist(product)}
                className={`w-[42px] h-[42px] rounded-[8px] border flex items-center justify-center transition-colors ${
                  isFavorited
                    ? 'bg-[#FCE8E5] border-[#FCE8E5] text-[#D94A4A]'
                    : 'bg-white border-[#E7E5E2] text-[#6B6B6B] hover:text-[#171717]'
                }`}
                title={isFavorited ? 'Remove from wishlist' : 'Save to wishlist'}
              >
                <Heart size={18} className={isFavorited ? 'fill-[#D94A4A]' : ''} />
              </button>
            </div>
          </div>

          {/* Guarantees */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-[#E7E5E2]">
            <div className="flex items-center gap-2 text-[12px] text-[#6B6B6B]">
              <Truck size={16} className="text-[#171717] shrink-0" />
              <span>Complimentary shipping</span>
            </div>
            <div className="flex items-center gap-2 text-[12px] text-[#6B6B6B]">
              <ShieldCheck size={16} className="text-[#171717] shrink-0" />
              <span>100% Genuine product</span>
            </div>
            <div className="flex items-center gap-2 text-[12px] text-[#6B6B6B]">
              <RotateCcw size={16} className="text-[#171717] shrink-0" />
              <span>7-Day replacements</span>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <section className="pt-10 border-t border-[#E7E5E2] space-y-6">
        <h2 className="text-[24px] font-medium text-[#171717]">Customer Reviews</h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Write a Review */}
          <div className="lg:col-span-1 bg-[#FFFFFF] p-6 rounded-[12px] border border-[#E7E5E2] space-y-4">
            <h3 className="text-[15px] font-medium text-[#171717]">Write a Review</h3>

            {reviewMessage.text && (
              <div
                className={`p-3 rounded-[6px] text-[12px] ${
                  reviewMessage.type === 'success'
                    ? 'bg-[#EBF4EE] text-[#2A5A3C]'
                    : 'bg-[#FCE8E5] text-[#B9382F]'
                }`}
              >
                {reviewMessage.text}
              </div>
            )}

            <form onSubmit={handleReviewSubmit} className="space-y-4 text-[13px]">
              <div>
                <label className="text-[12px] text-[#6B6B6B] block mb-1">Rating</label>
                <div className="flex items-center gap-1 text-[#E5A842]">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setReviewRating(star)}
                      className="p-1"
                    >
                      <Star
                        size={18}
                        className={
                          star <= reviewRating
                            ? 'fill-[#E5A842] text-[#E5A842]'
                            : 'text-[#E7E5E2] fill-[#E7E5E2]'
                        }
                      />
                    </button>
                  ))}
                  <span className="text-[12px] text-[#171717] font-medium ml-2">
                    {reviewRating} of 5
                  </span>
                </div>
              </div>

              <div>
                <label className="text-[12px] text-[#6B6B6B] block mb-1">Feedback</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Share details about durability, performance, or styling..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="w-full p-2.5 rounded-[8px] bg-[#F7F7F5] border border-[#E7E5E2] text-[13px] outline-none focus:border-[#171717] resize-none"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={submittingReview}
                className="w-full h-[38px] bg-[#171717] hover:bg-[#262626] text-white text-[13px] font-medium rounded-[8px] transition-colors disabled:opacity-50"
              >
                {submittingReview ? 'Submitting...' : 'Post Review'}
              </button>
            </form>
          </div>

          {/* Existing Reviews List */}
          <div className="lg:col-span-2 space-y-3">
            {product.reviews && product.reviews.length > 0 ? (
              product.reviews.map((rev) => (
                <div
                  key={rev._id}
                  className="p-4 rounded-[12px] bg-[#FFFFFF] border border-[#E7E5E2] space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[13px] font-medium text-[#171717] block">
                        {rev.name}
                      </span>
                      <span className="text-[11px] text-[#6B6B6B]">
                        {new Date(rev.createdAt).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                    <RatingStars rating={rev.rating} size={13} showScore={false} />
                  </div>
                  <p className="text-[13px] text-[#6B6B6B] leading-relaxed font-normal">
                    {rev.comment}
                  </p>
                </div>
              ))
            ) : (
              <div className="p-8 text-center bg-[#FFFFFF] rounded-[12px] border border-[#E7E5E2] text-[#6B6B6B] text-[13px]">
                No customer reviews yet. Be the first to review this product.
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProductDetailPage;
