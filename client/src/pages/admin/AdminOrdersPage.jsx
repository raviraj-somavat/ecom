import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { orderApi } from '../../api/client';
import LoadingSpinner from '../../components/LoadingSpinner';

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await orderApi.getAllOrders({
        status: statusFilter || undefined,
        limit: 100,
      });
      if (res.data.success) {
        setOrders(res.data.orders);
      }
    } catch (err) {
      console.error('Error fetching admin orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setUpdatingId(orderId);
      const res = await orderApi.updateOrderStatus(orderId, newStatus);
      if (res.data.success) {
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? { ...o, orderStatus: newStatus } : o))
        );
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update order status');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E7E5E2]">
        <div>
          <Link
            to="/admin"
            className="inline-flex items-center gap-1.5 text-[13px] text-[#6B6B6B] hover:text-[#171717] mb-1"
          >
            <ArrowLeft size={14} /> Back to Dashboard
          </Link>
          <h1 className="text-[28px] sm:text-[32px] font-medium text-[#171717] tracking-tight">
            Order Fulfillment
          </h1>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {['', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`h-[34px] px-3 rounded-[6px] text-[12px] font-medium transition-colors ${
              statusFilter === st
                ? 'bg-[#171717] text-white'
                : 'bg-[#FFFFFF] border border-[#E7E5E2] text-[#6B6B6B] hover:text-[#171717]'
            }`}
          >
            {st || 'All Orders'}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <div className="bg-[#FFFFFF] rounded-[12px] border border-[#E7E5E2] shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Loading orders..." />
        ) : orders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead className="bg-[#F7F7F5] text-[#6B6B6B] border-b border-[#E7E5E2] text-[12px]">
                <tr>
                  <th className="py-3 px-4">Order Ref</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Total</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4">Fulfillment Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7E5E2]">
                {orders.map((ord) => {
                  const isBusy = updatingId === ord._id;

                  return (
                    <tr key={ord._id} className="hover:bg-[#F7F7F5] transition-colors">
                      <td className="py-3 px-4 font-mono text-[12px] text-[#171717]">
                        #{ord._id.slice(-8)}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium text-[#171717] block">
                          {ord.user?.name || 'Customer'}
                        </span>
                        <span className="text-[11px] text-[#6B6B6B]">{ord.user?.email}</span>
                      </td>
                      <td className="py-3 px-4 text-[#6B6B6B]">
                        {ord.shippingAddress?.city || 'India'}
                      </td>
                      <td className="py-3 px-4 font-medium text-[#171717]">
                        ₹{ord.totalPrice.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-[12px] text-[#171717] font-medium block">
                          {ord.isPaid ? 'Paid' : 'Unpaid (COD)'}
                        </span>
                        <span className="text-[11px] text-[#6B6B6B]">{ord.paymentMethod}</span>
                      </td>
                      <td className="py-3 px-4">
                        <select
                          disabled={isBusy}
                          value={ord.orderStatus}
                          onChange={(e) => handleStatusChange(ord._id, e.target.value)}
                          className="h-[32px] px-2 bg-[#F7F7F5] border border-[#E7E5E2] rounded-[6px] text-[12px] font-medium text-[#171717] outline-none cursor-pointer"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Processing">Processing</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-[#6B6B6B] text-[13px]">No orders in this status.</div>
        )}
      </div>
    </div>
  );
};

export default AdminOrdersPage;
