import crypto from 'crypto';
import { getRazorpayInstance } from '../config/razorpay.js';
import Order from '../models/order.model.js';

// @desc    Get Razorpay Publishable Key
// @route   GET /api/payments/razorpay-key
export const getRazorpayKey = (req, res) => {
  return res.status(200).json({
    success: true,
    key: process.env.RAZORPAY_KEY_ID || '',
  });
};

// @desc    Create Razorpay Order for checkout
// @route   POST /api/payments/create-order
export const createRazorpayOrder = async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({ success: false, message: 'Order ID is required' });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.isPaid) {
      return res.status(400).json({ success: false, message: 'Order is already paid' });
    }

    const razorpay = getRazorpayInstance();
    if (!razorpay) {
      return res.status(500).json({
        success: false,
        message: 'Razorpay is not configured on the server. Please check environment variables.',
      });
    }

    // Amount in paise (e.g. ₹100 = 10000 paise)
    const amountInPaise = Math.round(order.totalPrice * 100);

    const options = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: `order_rcptid_${order._id}`,
      notes: {
        orderId: order._id.toString(),
        userId: req.user._id.toString(),
      },
    };

    const razorpayOrder = await razorpay.orders.create(options);

    order.paymentResult = {
      ...order.paymentResult,
      razorpay_order_id: razorpayOrder.id,
    };
    await order.save();

    return res.status(200).json({
      success: true,
      razorpayOrder,
      orderId: order._id,
      amount: order.totalPrice,
      currency: 'INR',
    });
  } catch (error) {
    console.error('Create Razorpay order error:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Verify Razorpay payment signature
// @route   POST /api/payments/verify
export const verifyRazorpayPayment = async (req, res) => {
  try {
    const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!orderId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'orderId, razorpay_order_id, razorpay_payment_id, and razorpay_signature are required',
      });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
      .update(body.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      return res.status(400).json({ success: false, message: 'Payment verification failed: Invalid signature' });
    }

    // Payment is valid, update order status
    order.isPaid = true;
    order.paidAt = Date.now();
    order.orderStatus = 'Processing';
    order.paymentResult = {
      id: razorpay_payment_id,
      status: 'completed',
      update_time: new Date().toISOString(),
      email_address: req.user.email,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    };

    const updatedOrder = await order.save();

    return res.status(200).json({
      success: true,
      message: 'Payment verified and order updated successfully',
      order: updatedOrder,
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
