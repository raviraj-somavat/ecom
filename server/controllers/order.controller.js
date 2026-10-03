import Order from '../models/order.model.js';
import Product from '../models/product.model.js';
import Cart from '../models/cart.model.js';
import sendEmail from '../utils/sendmail.js';

// @desc    Create new order
// @route   POST /api/orders
export const createOrder = async (req, res) => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ success: false, message: 'No order items provided' });
    }

    if (!shippingAddress || !shippingAddress.address || !shippingAddress.city || !shippingAddress.postalCode) {
      return res.status(400).json({ success: false, message: 'Complete shipping address is required' });
    }

    // Verify stock and fetch fresh product data
    const validatedItems = [];
    let calculatedItemsPrice = 0;

    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product with ID ${item.product} not found`,
        });
      }

      const qty = Number(item.qty) || 1;
      if (product.stock < qty) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${product.name}". Available: ${product.stock}, Requested: ${qty}`,
        });
      }

      // Deduct stock
      product.stock -= qty;
      await product.save();

      calculatedItemsPrice += product.price * qty;

      validatedItems.push({
        product: product._id,
        name: product.name,
        qty,
        image: product.imageUrl,
        price: product.price,
      });
    }

    const finalShippingPrice = shippingPrice !== undefined ? Number(shippingPrice) : (calculatedItemsPrice > 500 ? 0 : 50);
    const finalTaxPrice = taxPrice !== undefined ? Number(taxPrice) : Math.round(calculatedItemsPrice * 0.18 * 100) / 100;
    const finalTotalPrice = totalPrice !== undefined ? Number(totalPrice) : Math.round((calculatedItemsPrice + finalShippingPrice + finalTaxPrice) * 100) / 100;

    const order = await Order.create({
      user: req.user._id,
      orderItems: validatedItems,
      shippingAddress,
      paymentMethod: paymentMethod || 'COD',
      itemsPrice: calculatedItemsPrice,
      shippingPrice: finalShippingPrice,
      taxPrice: finalTaxPrice,
      totalPrice: finalTotalPrice,
      orderStatus: 'Pending',
      isPaid: paymentMethod === 'COD' ? false : false,
    });

    // Clear items from user's cart if any
    try {
      const userCart = await Cart.findOne({ user: req.user._id });
      if (userCart) {
        const orderedProductIds = validatedItems.map((item) => item.product.toString());
        userCart.items = userCart.items.filter(
          (cartItem) => !orderedProductIds.includes(cartItem.product.toString())
        );
        await userCart.save();
      }
    } catch (cartErr) {
      console.error('Error clearing cart after order:', cartErr);
    }

    // Send order confirmation email
    sendEmail(
      req.user.email,
      `Order Confirmation #${order._id}`,
      `Thank you for your order! Your order #${order._id} for ₹${order.totalPrice} has been placed successfully.`,
      `<h2>Order Placed Successfully!</h2><p>Dear ${req.user.name},</p><p>Thank you for your order. Your order ID is <b>#${order._id}</b>.</p><p><b>Total Amount:</b> ₹${order.totalPrice}</p><p><b>Payment Method:</b> ${order.paymentMethod}</p><p>We will notify you when it ships.</p>`
    ).catch((err) => console.error('Email send failure:', err));

    return res.status(201).json({ success: true, order });
  } catch (error) {
    console.error('Create order error:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/my-orders
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, orders });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email phone');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Ensure only order owner or admin can view
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to view this order' });
    }

    return res.status(200).json({ success: true, order });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Cancel order (User or Admin)
// @route   PUT /api/orders/:id/cancel
export const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Only owner or admin can cancel
    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this order' });
    }

    if (order.orderStatus === 'Delivered') {
      return res.status(400).json({ success: false, message: 'Delivered orders cannot be cancelled' });
    }

    if (order.orderStatus === 'Cancelled') {
      return res.status(400).json({ success: false, message: 'Order is already cancelled' });
    }

    // Restore inventory stock
    for (const item of order.orderItems) {
      const product = await Product.findById(item.product);
      if (product) {
        product.stock += item.qty;
        await product.save();
      }
    }

    order.orderStatus = 'Cancelled';
    const updatedOrder = await order.save();

    return res.status(200).json({
      success: true,
      message: 'Order cancelled successfully and stock restored',
      order: updatedOrder,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Get all orders (Admin)
// @route   GET /api/orders
export const getAllOrders = async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Number(req.query.limit) || 20);
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.status) {
      query.orderStatus = req.query.status;
    }

    const totalOrders = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate('user', 'id name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return res.status(200).json({
      success: true,
      orders,
      page,
      pages: Math.ceil(totalOrders / limit),
      totalOrders,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Update order status (Admin)
// @route   PUT /api/orders/:id/status
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed values: ${allowedStatuses.join(', ')}`,
      });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // If order was cancelled and now changing away from cancelled, or vice versa
    if (status === 'Cancelled' && order.orderStatus !== 'Cancelled') {
      for (const item of order.orderItems) {
        const product = await Product.findById(item.product);
        if (product) {
          product.stock += item.qty;
          await product.save();
        }
      }
    }

    order.orderStatus = status;

    if (status === 'Delivered') {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
      if (order.paymentMethod === 'COD') {
        order.isPaid = true;
        order.paidAt = Date.now();
      }
    }

    const updatedOrder = await order.save();
    return res.status(200).json({
      success: true,
      message: `Order status updated to ${status}`,
      order: updatedOrder,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Delete order (Admin)
// @route   DELETE /api/orders/:id
export const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    await Order.findByIdAndDelete(req.params.id);
    return res.status(200).json({ success: true, message: 'Order removed successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
