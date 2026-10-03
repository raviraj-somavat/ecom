import Order from '../models/order.model.js';
import Product from '../models/product.model.js';
import User from '../models/user.model.js';

// @desc    Get dashboard analytics (Admin)
// @route   GET /api/analytics/dashboard
export const getDashboardAnalytics = async (req, res) => {
  try {
    // 1. Basic counts
    const totalUsers = await User.countDocuments({});
    const totalProducts = await Product.countDocuments({});
    const totalOrders = await Order.countDocuments({});
    const outOfStockCount = await Product.countDocuments({ stock: { $lte: 0 } });
    const lowStockCount = await Product.countDocuments({ stock: { $gt: 0, $lte: 5 } });

    // 2. Total revenue from paid orders
    const salesAggregate = await Order.aggregate([
      { $match: { isPaid: true } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalPrice' } } },
    ]);
    const totalRevenue = salesAggregate.length > 0 ? Math.round(salesAggregate[0].totalRevenue * 100) / 100 : 0;

    // 3. Orders by Status
    const ordersByStatusAggregate = await Order.aggregate([
      { $group: { _id: '$orderStatus', count: { $sum: 1 } } },
    ]);
    const ordersByStatus = {
      Pending: 0,
      Processing: 0,
      Shipped: 0,
      Delivered: 0,
      Cancelled: 0,
    };
    ordersByStatusAggregate.forEach((item) => {
      if (item._id && ordersByStatus.hasOwnProperty(item._id)) {
        ordersByStatus[item._id] = item.count;
      }
    });

    // 4. Monthly sales for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const monthlySalesAggregate = await Order.aggregate([
      {
        $match: {
          isPaid: true,
          createdAt: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          totalSales: { $sum: '$totalPrice' },
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // 5. Recent 5 orders
    const recentOrders = await Order.find({})
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    // 6. Top 5 selling products
    const topProductsAggregate = await Order.aggregate([
      { $unwind: '$orderItems' },
      {
        $group: {
          _id: '$orderItems.product',
          name: { $first: '$orderItems.name' },
          totalSold: { $sum: '$orderItems.qty' },
          revenue: { $sum: { $multiply: ['$orderItems.qty', '$orderItems.price'] } },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
    ]);

    return res.status(200).json({
      success: true,
      analytics: {
        totalRevenue,
        totalOrders,
        totalProducts,
        totalUsers,
        outOfStockCount,
        lowStockCount,
        ordersByStatus,
        monthlySales: monthlySalesAggregate,
        recentOrders,
        topProducts: topProductsAggregate,
      },
    });
  } catch (error) {
    console.error('Analytics dashboard error:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
