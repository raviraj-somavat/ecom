import express from 'express';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from '../controllers/cart.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const cartRouter = express.Router();

cartRouter.use(protect); // All cart routes require user authentication

cartRouter.route('/').get(getCart).post(addToCart).delete(clearCart);
cartRouter.route('/:productId').put(updateCartItem).delete(removeFromCart);

export default cartRouter;
