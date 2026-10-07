import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CreditCard, Truck, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { orderApi, paymentApi } from '../api/client';

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cartItems, cartTotal, clearCart } = useCart();
  const { user } = useAuth();

  const [address, setAddress] = useState({
    street: user?.addresses?.[0]?.street || '',
    city: user?.addresses?.[0]?.city || '',
    state: user?.addresses?.[0]?.state || '',
    postalCode: user?.addresses?.[0]?.postalCode || '',
    country: user?.addresses?.[0]?.country || 'India',
    phone: user?.phone || '',
  });

  const [paymentMethod, setPaymentMethod] = useState('Razorpay');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!cartItems || cartItems.length === 0) {
      navigate('/cart');
    }
  }, [cartItems, navigate]);

  const shippingCost = cartTotal > 500 ? 0 : 50;
  const taxCost = Math.round(cartTotal * 0.18 * 100) / 100;
  const grandTotal = Math.round((cartTotal + shippingCost + taxCost) * 100) / 100;

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!address.street || !address.city || !address.postalCode || !address.phone) {
      setErrorMsg('Please fill in all required shipping address fields.');
      return;
    }

    try {
      setSubmitting(true);

      const orderPayload = {
        orderItems: cartItems.map((item) => ({
          product: item.product._id,
          qty: item.quantity,
        })),
        shippingAddress: {
          address: address.street,
          city: address.city,
          state: address.state,
          postalCode: address.postalCode,
          country: address.country,
          phone: address.phone,
        },
        paymentMethod,
        itemsPrice: cartTotal,
        shippingPrice: shippingCost,
        taxPrice: taxCost,
        totalPrice: grandTotal,
      };

      const res = await orderApi.createOrder(orderPayload);
      if (!res.data.success) {
        throw new Error(res.data.message || 'Failed to place order');
      }

      const createdOrder = res.data.order;

      if (paymentMethod === 'COD') {
        await clearCart();
        navigate(`/order-success/${createdOrder._id}`);
        return;
      }

      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        throw new Error('Razorpay SDK failed to load. Check your internet connection.');
      }

      const keyRes = await paymentApi.getRazorpayKey();
      const razorpayKey = keyRes.data.key;

      if (!razorpayKey || razorpayKey === 'rzp_test_your_key_id') {
        alert('Notice: Using test mode. Simulating instant successful payment verification.');
        await clearCart();
        navigate(`/order-success/${createdOrder._id}`);
        return;
      }

      const rzpOrderRes = await paymentApi.createRazorpayOrder(createdOrder._id);
      const rzpOrder = rzpOrderRes.data.razorpayOrder;

      const options = {
        key: razorpayKey,
        amount: rzpOrder.amount,
        currency: rzpOrder.currency,
        name: 'NovaCart',
        description: `Order #${createdOrder._id}`,
        order_id: rzpOrder.id,
        prefill: {
          name: user.name,
          email: user.email,
          contact: address.phone,
        },
        theme: {
          color: '#171717',
        },
        handler: async (response) => {
          try {
            const verifyRes = await paymentApi.verifyPayment({
              orderId: createdOrder._id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyRes.data.success) {
              await clearCart();
              navigate(`/order-success/${createdOrder._id}`);
            }
          } catch (vErr) {
            setErrorMsg('Payment verification failed. Please contact customer support.');
          }
        },
        modal: {
          ondismiss: () => {
            setSubmitting(false);
          },
        },
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.open();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Order creation failed');
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-8 space-y-6">
      <div>
        <Link
          to="/cart"
          className="inline-flex items-center gap-1.5 text-[13px] text-[#6B6B6B] hover:text-[#171717] mb-2"
        >
          <ArrowLeft size={14} /> Back to Bag
        </Link>
        <h1 className="text-[28px] sm:text-[32px] font-medium text-[#171717] tracking-tight">
          Checkout
        </h1>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-[8px] bg-[#FCE8E5] border border-[#E7E5E2] text-[13px] text-[#B9382F] flex items-center gap-2">
          <AlertCircle size={15} className="shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Shipping Form & Payment Method */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#FFFFFF] rounded-[12px] border border-[#E7E5E2] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] space-y-4">
            <h2 className="text-[15px] font-medium text-[#171717] pb-3 border-b border-[#E7E5E2]">
              1. Delivery Address
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[13px]">
              <div className="sm:col-span-2">
                <label className="text-[#6B6B6B] block mb-1">Street Address *</label>
                <input
                  type="text"
                  required
                  placeholder="Street / House Number / Landmark"
                  value={address.street}
                  onChange={(e) => setAddress({ ...address, street: e.target.value })}
                  className="w-full h-[40px] px-3 rounded-[8px] bg-[#F7F7F5] border border-[#E7E5E2] outline-none focus:border-[#171717]"
                />
              </div>

              <div>
                <label className="text-[#6B6B6B] block mb-1">City *</label>
                <input
                  type="text"
                  required
                  placeholder="City"
                  value={address.city}
                  onChange={(e) => setAddress({ ...address, city: e.target.value })}
                  className="w-full h-[40px] px-3 rounded-[8px] bg-[#F7F7F5] border border-[#E7E5E2] outline-none focus:border-[#171717]"
                />
              </div>

              <div>
                <label className="text-[#6B6B6B] block mb-1">State</label>
                <input
                  type="text"
                  placeholder="State"
                  value={address.state}
                  onChange={(e) => setAddress({ ...address, state: e.target.value })}
                  className="w-full h-[40px] px-3 rounded-[8px] bg-[#F7F7F5] border border-[#E7E5E2] outline-none focus:border-[#171717]"
                />
              </div>

              <div>
                <label className="text-[#6B6B6B] block mb-1">Postal PIN Code *</label>
                <input
                  type="text"
                  required
                  placeholder="6-digit PIN"
                  value={address.postalCode}
                  onChange={(e) => setAddress({ ...address, postalCode: e.target.value })}
                  className="w-full h-[40px] px-3 rounded-[8px] bg-[#F7F7F5] border border-[#E7E5E2] outline-none focus:border-[#171717]"
                />
              </div>

              <div>
                <label className="text-[#6B6B6B] block mb-1">Contact Phone *</label>
                <input
                  type="tel"
                  required
                  placeholder="+91..."
                  value={address.phone}
                  onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                  className="w-full h-[40px] px-3 rounded-[8px] bg-[#F7F7F5] border border-[#E7E5E2] outline-none focus:border-[#171717]"
                />
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-[#FFFFFF] rounded-[12px] border border-[#E7E5E2] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] space-y-4">
            <h2 className="text-[15px] font-medium text-[#171717] pb-3 border-b border-[#E7E5E2]">
              2. Payment Method
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[13px]">
              <label
                className={`p-4 rounded-[8px] border cursor-pointer transition-colors flex items-center justify-between ${
                  paymentMethod === 'Razorpay'
                    ? 'border-[#171717] bg-[#F7F7F5]'
                    : 'border-[#E7E5E2] hover:border-[#CCCCCC]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <input
                    type="radio"
                    name="pay"
                    checked={paymentMethod === 'Razorpay'}
                    onChange={() => setPaymentMethod('Razorpay')}
                    className="w-4 h-4 text-[#171717] focus:ring-0"
                  />
                  <div>
                    <span className="font-medium text-[#171717] block">Online Payment</span>
                    <span className="text-[11px] text-[#6B6B6B]">UPI, Cards, NetBanking</span>
                  </div>
                </div>
                <CreditCard size={18} className="text-[#6B6B6B]" />
              </label>

              <label
                className={`p-4 rounded-[8px] border cursor-pointer transition-colors flex items-center justify-between ${
                  paymentMethod === 'COD'
                    ? 'border-[#171717] bg-[#F7F7F5]'
                    : 'border-[#E7E5E2] hover:border-[#CCCCCC]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <input
                    type="radio"
                    name="pay"
                    checked={paymentMethod === 'COD'}
                    onChange={() => setPaymentMethod('COD')}
                    className="w-4 h-4 text-[#171717] focus:ring-0"
                  />
                  <div>
                    <span className="font-medium text-[#171717] block">Cash on Delivery</span>
                    <span className="text-[11px] text-[#6B6B6B]">Pay upon arrival</span>
                  </div>
                </div>
                <Truck size={18} className="text-[#6B6B6B]" />
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-[#FFFFFF] rounded-[12px] border border-[#E7E5E2] p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] sticky top-28 space-y-4">
            <h2 className="text-[15px] font-medium text-[#171717] pb-3 border-b border-[#E7E5E2]">
              Order Summary
            </h2>

            <div className="space-y-2.5 text-[13px]">
              <div className="flex justify-between text-[#6B6B6B]">
                <span>Items ({cartItems.length})</span>
                <span className="text-[#171717] font-medium">₹{cartTotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-[#6B6B6B]">
                <span>Shipping</span>
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
              type="submit"
              disabled={submitting}
              className="w-full h-[42px] rounded-[8px] bg-[#171717] hover:bg-[#262626] text-white text-[14px] font-medium transition-colors active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <CheckCircle2 size={16} />
                  <span>{paymentMethod === 'COD' ? 'Confirm Order' : 'Pay & Confirm'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CheckoutPage;
