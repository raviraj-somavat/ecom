import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PackageCheck, ArrowRight } from 'lucide-react';
import { orderApi } from '../api/client';
import LoadingSpinner from '../components/LoadingSpinner';

const MyOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await orderApi.getMyOrders();
      if (res.data.success) {
        setOrders(res.data.orders);
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;

    try {
      setCancellingId(orderId);
      const res = await orderApi.cancelOrder(orderId);
      if (res.data.success) {
        alert('Order has been cancelled.');
        fetchOrders();
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Cannot cancel order');
    } finally {
      setCancellingId(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Delivered':
        return (
          <span className="h-[24px] px-2 rounded-[5px] bg-[#EBF4EE] text-[#2A5A3C] text-[11px] font-medium inline-flex items-center">
            Delivered
          </span>
        );
      case 'Shipped':
        return (
          <span className="h-[24px] px-2 rounded-[5px] bg-[#F2F1EE] text-[#171717] text-[11px] font-medium inline-flex items-center">
            Shipped
          </span>
        );
      case 'Processing':
        return (
          <span className="h-[24px] px-2 rounded-[5px] bg-[#F2F1EE] text-[#171717] text-[11px] font-medium inline-flex items-center">
            Processing
          </span>
        );
      case 'Cancelled':
        return (
          <span className="h-[24px] px-2 rounded-[5px] bg-[#FCE8E5] text-[#B9382F] text-[11px] font-medium inline-flex items-center">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="h-[24px] px-2 rounded-[5px] bg-[#F7F7F5] border border-[#E7E5E2] text-[#6B6B6B] text-[11px] font-medium inline-flex items-center">
            Pending
          </span>
        );
    }
  };

  if (loading) return <LoadingSpinner text="Loading orders..." />;

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-8 space-y-6">
      <div className="pb-3 border-b border-[#E7E5E2]">
        <h1 className="text-[28px] sm:text-[32px] font-medium text-[#171717] tracking-tight">
          My Orders
        </h1>
        <p className="text-[13px] text-[#6B6B6B] mt-0.5">
          View shipment status, delivery details, and order receipts
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-[#FFFFFF] rounded-[12px] border border-[#E7E5E2] p-12 text-center max-w-sm mx-auto my-12">
          <h2 className="text-[16px] font-medium text-[#171717] mb-1">No orders yet</h2>
          <p className="text-[13px] text-[#6B6B6B] mb-6">
            When you purchase items, their status and history will appear here.
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-1.5 h-[42px] px-[18px] bg-[#171717] text-white text-[13px] font-medium rounded-[8px]"
          >
            <span>Start Shopping</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-[#FFFFFF] rounded-[12px] border border-[#E7E5E2] p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] space-y-4"
            >
              {/* Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#E7E5E2]">
                <div className="space-y-0.5">
                  <span className="text-[12px] font-mono text-[#6B6B6B]">
                    Order #{order._id}
                  </span>
                  <span className="text-[12px] text-[#6B6B6B] block">
                    Placed on{' '}
                    {new Date(order.createdAt).toLocaleDateString('en-IN', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {getStatusBadge(order.orderStatus)}
                  <span className="text-[11px] font-medium text-[#6B6B6B]">
                    {order.isPaid ? '• Paid' : '• Unpaid (COD)'}
                  </span>
                </div>
              </div>

              {/* Items Preview */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {order.orderItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-2 rounded-[8px] bg-[#F7F7F5] border border-[#E7E5E2]"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-12 h-12 rounded-[6px] object-contain bg-white p-1 shrink-0"
                    />
                    <div className="min-w-0 flex-1 text-[13px]">
                      <p className="font-medium text-[#171717] truncate">{item.name}</p>
                      <p className="text-[12px] text-[#6B6B6B]">
                        {item.qty} × ₹{item.price.toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-[#E7E5E2]">
                <div>
                  <span className="text-[11px] text-[#6B6B6B] block">Total</span>
                  <span className="text-[16px] font-semibold text-[#171717]">
                    ₹{order.totalPrice.toLocaleString('en-IN')}
                  </span>
                </div>

                {order.orderStatus !== 'Delivered' && order.orderStatus !== 'Cancelled' && (
                  <button
                    onClick={() => handleCancelOrder(order._id)}
                    disabled={cancellingId === order._id}
                    className="h-[36px] px-3.5 rounded-[8px] border border-[#E7E5E2] text-[12px] font-medium text-[#B9382F] hover:bg-[#FCE8E5] transition-colors disabled:opacity-50"
                  >
                    {cancellingId === order._id ? 'Cancelling...' : 'Cancel Order'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrdersPage;
