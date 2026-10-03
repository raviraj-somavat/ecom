import express from 'express';
import {
  getRazorpayKey,
  createRazorpayOrder,
  verifyRazorpayPayment,
} from '../controllers/payment.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const paymentRouter = express.Router();

paymentRouter.get('/razorpay-key', getRazorpayKey);
paymentRouter.post('/create-order', protect, createRazorpayOrder);
paymentRouter.post('/verify', protect, verifyRazorpayPayment);

export default paymentRouter;
