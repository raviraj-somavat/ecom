import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight, ArrowLeft } from 'lucide-react';
import { useCart } from '../context/CartContext';
import LoadingSpinner from '../components/LoadingSpinner';

const CartPage = () => {
  const navigate = useNavigate();
  const { cart, cartItems, cartTotal, updateQuantity, removeFromCart, clearCart, loading } =
    useCart();

  const [updatingId, setUpdatingId] = useState(null);

  const handleQtyChange = async (productId, currentQty, delta) => {
    const newQty = currentQty + delta;
    if (newQty < 1) return;

    try {
      setUpdatingId(productId);
      await updateQuantity(productId, newQty);
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Cannot update quantity');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemove = async (productId) => {
    try {
      setUpdatingId(productId);
      await removeFromCart(productId);
    } catch (err) {
      alert(err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading && (!cartItems || cartItems.length === 0)) {
    return <LoadingSpinner text="Loading cart..." />;
  }

  const shippingCost = cartTotal > 500 || cartTotal === 0 ? 0 : 50;
  const taxCost = Math.round(cartTotal * 0.18 * 100) / 100;
  const grandTotal = Math.round((cartTotal + shippingCost + taxCost) * 100) / 100;
  const freeShippingDelta = Math.max(0, 500 - cartTotal);

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="max-w-[1200px] mx-auto px-6 my-20 text-center">
        <div className="w-16 h-16 bg-[#F2F1EE] rounded-[10px] flex items-center justify-center mx-auto mb-4 text-[#171717]">
          <ShoppingBag size={28} />
        </div>
        <h2 className="text-[22px] font-medium text-[#171717] mb-1">Your cart is empty</h2>
        <p className="text-[14px] text-[#6B6B6B] mb-6">Explore our curated catalog to add products.</p>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 h-[42px] px-[18px] bg-[#171717] hover:bg-[#262626] text-white text-[14px] font-medium rounded-[8px] transition-colors"
        >
          <span>Start Shopping</span>
          <ArrowRight size={15} />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-8">
      <div className="flex items-baseline justify-between mb-8 pb-3 border-b border-[#E7E5E2]">
        <div>
          <h1 className="text-[28px] sm:text-[32px] font-medium text-[#171717] tracking-tight">
            Shopping Cart
          </h1>
          <p className="text-[13px] text-[#6B6B6B] mt-0.5">
            {cartItems.length} products in your bag
          </p>
        </div>

        <button
          onClick={clearCart}
          className="text-[13px] text-[#6B6B6B] hover:text-[#B9382F] transition-colors"
        >
          Clear bag
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Cart Items List */}
        <div className="lg:col-span-2 space-y-4">
          {/* Free Shipping Alert */}
          <div className="p-3.5 rounded-[8px] bg-[#FFFFFF] border border-[#E7E5E2] text-[13px] text-[#171717] flex items-center justify-between">
            <span>
              {freeShippingDelta === 0
                ? '✓ Your order qualifies for free delivery'
                : `Add ₹${freeShippingDelta} more to unlock free delivery`}
            </span>
            <span className="text-[12px] text-[#6B6B6B]">
              {Math.min(100, Math.round((cartTotal / 500) * 100))}%
            </span>
          </div>

          <div className="bg-[#FFFFFF] rounded-[12px] border border-[#E7E5E2] divide-y divide-[#E7E5E2]">
            {cartItems.map((item) => {
              const product = item.product || {};
              const isBusy = updatingId === (product._id || item._id);

              return (
                <div
                  key={product._id || item._id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center gap-4"
                >
                  <Link
                    to={`/products/${product._id}`}
                    className="w-20 h-20 bg-[#F2F1EE] rounded-[8px] p-2 flex items-center justify-center shrink-0"
                  >
                    <img
                      src={
                        product.imageUrl ||
                        'https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&w=300&q=80'
                      }
                      alt={product.name || 'Product'}
                      className="max-h-full max-w-full object-contain"
                    />
                  </Link>

                  <div className="flex-1 min-w-0">
                    <span className="text-[11px] text-[#6B6B6B] uppercase block">
                      {product.category || 'Item'}
                    </span>
                    <Link to={`/products/${product._id}`}>
                      <h3 className="text-[14px] font-medium text-[#171717] hover:text-[#E86A33] truncate">
                        {product.name}
                      </h3>
                    </Link>
                    <span className="text-[13px] text-[#6B6B6B] block mt-0.5">
                      ₹{(item.price || product.price || 0).toLocaleString('en-IN')}
                    </span>
                  </div>

                  {/* Quantity and Price */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center border border-[#E7E5E2] rounded-[8px] bg-[#FFFFFF] overflow-hidden">
                      <button
                        disabled={item.quantity <= 1 || isBusy}
                        onClick={() => handleQtyChange(product._id, item.quantity, -1)}
                        className="w-7 h-8 text-slate-600 hover:bg-[#F2F1EE] disabled:opacity-30 text-[13px]"
                      >
                        -
                      </button>
                      <span className="px-2.5 h-8 flex items-center justify-center text-[12px] font-medium text-[#171717]">
                        {item.quantity}
                      </span>
                      <button
                        disabled={isBusy}
                        onClick={() => handleQtyChange(product._id, item.quantity, 1)}
                        className="w-7 h-8 text-slate-600 hover:bg-[#F2F1EE] disabled:opacity-30 text-[13px]"
                      >
                        +
                      </button>
                    </div>

                    <span className="text-[15px] font-semibold text-[#171717] min-w-[70px] text-right">
                      ₹{((item.price || product.price || 0) * item.quantity).toLocaleString('en-IN')}
                    </span>

                    <button
                      onClick={() => handleRemove(product._id)}
                      disabled={isBusy}
                      title="Remove item"
                      className="text-[#6B6B6B] hover:text-[#B9382F] p-1.5 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <Link
            to="/shop"
            className="inline-flex items-center gap-1.5 text-[13px] text-[#6B6B6B] hover:text-[#171717] pt-2"
          >
            <ArrowLeft size={14} /> Continue Shopping
          </Link>
        </div>

        {/* Order Summary Box */}
        <div className="lg:col-span-1">
          <div className="bg-[#FFFFFF] rounded-[12px] border border-[#E7E5E2] p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] sticky top-28 space-y-4">
            <h2 className="text-[15px] font-medium text-[#171717] pb-3 border-b border-[#E7E5E2]">
              Order Summary
            </h2>

            <div className="space-y-2 text-[13px]">
              <div className="flex justify-between text-[#6B6B6B]">
                <span>Items Subtotal</span>
                <span className="text-[#171717] font-medium">₹{cartTotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-[#6B6B6B]">
                <span>Delivery</span>
                <span className="text-[#171717] font-medium">
                  {shippingCost === 0 ? 'Free' : `₹${shippingCost}`}
                </span>
              </div>
              <div className="flex justify-between text-[#6B6B6B]">
                <span>GST (18%)</span>
                <span className="text-[#171717] font-medium">₹{taxCost.toLocaleString('en-IN')}</span>
              </div>

              <div className="pt-3 border-t border-[#E7E5E2] flex justify-between text-[15px]">
                <span className="font-medium text-[#171717]">Total</span>
                <span className="font-semibold text-[#171717]">
                  ₹{grandTotal.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full h-[42px] rounded-[8px] bg-[#171717] hover:bg-[#262626] text-white text-[14px] font-medium transition-colors flex items-center justify-center gap-2 active:scale-95"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
