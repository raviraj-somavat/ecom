import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  Package,
  Boxes,
  Users,
  ArrowRight,
} from 'lucide-react';
import { analyticsApi } from '../../api/client';
import LoadingSpinner from '../../components/LoadingSpinner';

const AdminDashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const res = await analyticsApi.getDashboardAnalytics();
        if (res.data.success) {
          setData(res.data.analytics);
        }
      } catch (err) {
        console.error('Failed to load analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) return <LoadingSpinner text="Generating reports..." />;

  const {
    totalRevenue = 0,
    totalOrders = 0,
    totalProducts = 0,
    totalUsers = 0,
    outOfStockCount = 0,
    ordersByStatus = {},
    recentOrders = [],
    topProducts = [],
  } = data || {};

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-8 space-y-6">
      {/* Admin Nav Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E7E5E2]">
        <div>
          <h1 className="text-[28px] sm:text-[32px] font-medium text-[#171717] tracking-tight">
            Store Administration
          </h1>
          <p className="text-[13px] text-[#6B6B6B] mt-0.5">
            Operational dashboard, order processing, and inventory control
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/admin/products"
            className="h-[36px] px-3 rounded-[8px] bg-[#FFFFFF] border border-[#E7E5E2] text-[13px] font-medium text-[#171717] hover:bg-[#F2F1EE] flex items-center transition-colors"
          >
            Products
          </Link>
          <Link
            to="/admin/orders"
            className="h-[36px] px-3 rounded-[8px] bg-[#FFFFFF] border border-[#E7E5E2] text-[13px] font-medium text-[#171717] hover:bg-[#F2F1EE] flex items-center transition-colors"
          >
            Orders
          </Link>
          <Link
            to="/admin/users"
            className="h-[36px] px-3 rounded-[8px] bg-[#FFFFFF] border border-[#E7E5E2] text-[13px] font-medium text-[#171717] hover:bg-[#F2F1EE] flex items-center transition-colors"
          >
            Users
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 rounded-[12px] bg-[#FFFFFF] border border-[#E7E5E2] shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <span className="text-[12px] text-[#6B6B6B] block">Total Verified Sales</span>
          <h3 className="text-[22px] font-semibold text-[#171717] mt-1">
            ₹{totalRevenue.toLocaleString('en-IN')}
          </h3>
          <span className="text-[11px] text-[#3F7D58] block mt-1">From settled orders</span>
        </div>

        <div className="p-5 rounded-[12px] bg-[#FFFFFF] border border-[#E7E5E2] shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <span className="text-[12px] text-[#6B6B6B] block">Total Orders</span>
          <h3 className="text-[22px] font-semibold text-[#171717] mt-1">{totalOrders}</h3>
          <span className="text-[11px] text-[#6B6B6B] block mt-1">
            {ordersByStatus.Delivered || 0} delivered
          </span>
        </div>

        <div className="p-5 rounded-[12px] bg-[#FFFFFF] border border-[#E7E5E2] shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <span className="text-[12px] text-[#6B6B6B] block">Active Catalog</span>
          <h3 className="text-[22px] font-semibold text-[#171717] mt-1">{totalProducts}</h3>
          <span className="text-[11px] text-[#B9382F] block mt-1">
            {outOfStockCount} out of stock
          </span>
        </div>

        <div className="p-5 rounded-[12px] bg-[#FFFFFF] border border-[#E7E5E2] shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <span className="text-[12px] text-[#6B6B6B] block">Registered Accounts</span>
          <h3 className="text-[22px] font-semibold text-[#171717] mt-1">{totalUsers}</h3>
          <span className="text-[11px] text-[#6B6B6B] block mt-1">Customers & staff</span>
        </div>
      </div>

      {/* Row 2: Status Breakdown & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-[#FFFFFF] rounded-[12px] border border-[#E7E5E2] p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] space-y-3">
          <h3 className="text-[14px] font-medium text-[#171717]">Fulfillment Pipeline</h3>
          <div className="space-y-2 pt-1 text-[13px]">
            {[
              { label: 'Pending', count: ordersByStatus.Pending || 0, bg: 'bg-[#B9382F]' },
              { label: 'Processing', count: ordersByStatus.Processing || 0, bg: 'bg-[#E86A33]' },
              { label: 'Shipped', count: ordersByStatus.Shipped || 0, bg: 'bg-[#171717]' },
              { label: 'Delivered', count: ordersByStatus.Delivered || 0, bg: 'bg-[#3F7D58]' },
              { label: 'Cancelled', count: ordersByStatus.Cancelled || 0, bg: 'bg-[#9E9E9E]' },
            ].map((st) => (
              <div key={st.label} className="flex justify-between items-center py-1">
                <span className="flex items-center gap-2 text-[#6B6B6B]">
                  <span className={`w-2 h-2 rounded-full ${st.bg}`}></span>
                  {st.label}
                </span>
                <span className="font-medium text-[#171717]">{st.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 bg-[#FFFFFF] rounded-[12px] border border-[#E7E5E2] p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#E7E5E2]">
            <h3 className="text-[14px] font-medium text-[#171717]">Top Selling Products</h3>
            <Link
              to="/admin/products"
              className="text-[12px] text-[#6B6B6B] hover:text-[#171717]"
            >
              All products →
            </Link>
          </div>

          <div className="divide-y divide-[#E7E5E2]">
            {topProducts.length > 0 ? (
              topProducts.map((p, i) => (
                <div key={i} className="py-2.5 flex items-center justify-between text-[13px]">
                  <span className="font-medium text-[#171717]">{p.name}</span>
                  <div className="text-right">
                    <span className="font-semibold text-[#171717] block">{p.totalSold} sold</span>
                    <span className="text-[11px] text-[#6B6B6B]">
                      ₹{p.revenue?.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="py-4 text-center text-[13px] text-[#6B6B6B]">No sales data recorded yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-[#FFFFFF] rounded-[12px] border border-[#E7E5E2] p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-[#E7E5E2]">
          <h3 className="text-[14px] font-medium text-[#171717]">Recent Customer Orders</h3>
          <Link to="/admin/orders" className="text-[12px] text-[#6B6B6B] hover:text-[#171717]">
            Full order log →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead className="text-[#6B6B6B] border-b border-[#E7E5E2] text-[12px]">
              <tr>
                <th className="py-2.5 px-3">Order</th>
                <th className="py-2.5 px-3">Customer</th>
                <th className="py-2.5 px-3">Amount</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Payment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7E5E2]">
              {recentOrders.map((ord) => (
                <tr key={ord._id} className="hover:bg-[#F7F7F5]">
                  <td className="py-2.5 px-3 font-mono text-[12px] text-[#171717]">
                    #{ord._id.slice(-6)}
                  </td>
                  <td className="py-2.5 px-3 text-[#171717]">
                    {ord.user?.name || 'Customer'}
                  </td>
                  <td className="py-2.5 px-3 font-medium text-[#171717]">
                    ₹{ord.totalPrice.toLocaleString('en-IN')}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="h-[22px] px-2 rounded-[5px] bg-[#F2F1EE] text-[#171717] text-[11px] font-medium inline-flex items-center">
                      {ord.orderStatus}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-[12px] text-[#6B6B6B]">
                    {ord.isPaid ? 'Paid' : 'Unpaid (COD)'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
