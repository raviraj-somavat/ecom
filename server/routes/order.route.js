import express from 'express';
import {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  getAllOrders,
  updateOrderStatus,
  deleteOrder,
} from '../controllers/order.controller.js';
import { protect, admin } from '../middleware/auth.middleware.js';

const orderRouter = express.Router();

// User routes (all protected)
orderRouter.use(protect);

orderRouter.route('/').post(createOrder).get(admin, getAllOrders);
orderRouter.route('/my-orders').get(getMyOrders);
orderRouter.route('/:id').get(getOrderById).delete(admin, deleteOrder);
orderRouter.route('/:id/cancel').put(cancelOrder);
orderRouter.route('/:id/status').put(admin, updateOrderStatus);

export default orderRouter;
