import express from 'express';
import {
  registerUser,
  loginUser,
  verifyOtp,
  resendOtp,
  logoutUser,
  forgotPassword,
  resetPassword,
  getUserProfile,
  updateUserProfile,
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  getUsers,
  getUserById,
  updateUserRole,
  deleteUser,
} from '../controllers/auth.controller.js';
import { protect, admin } from '../middleware/auth.middleware.js';

const authRouter = express.Router();

// Public auth routes
authRouter.post('/register', registerUser);
authRouter.post('/login', loginUser);
authRouter.post('/verify-otp', verifyOtp);
authRouter.post('/resend-otp', resendOtp);
authRouter.post('/logout', logoutUser);
authRouter.post('/forgot-password', forgotPassword);
authRouter.post('/reset-password', resetPassword);

// Profile routes (User protected)
authRouter.get('/profile', protect, getUserProfile);
authRouter.get('/me', protect, getUserProfile);
authRouter.put('/profile', protect, updateUserProfile);

// Wishlist routes (User protected)
authRouter.get('/wishlist', protect, getWishlist);
authRouter.post('/wishlist/:productId', protect, addToWishlist);
authRouter.delete('/wishlist/:productId', protect, removeFromWishlist);

// Admin User Management routes
authRouter.get('/users', protect, admin, getUsers);
authRouter.get('/users/:id', protect, admin, getUserById);
authRouter.put('/users/:id', protect, admin, updateUserRole);
authRouter.delete('/users/:id', protect, admin, deleteUser);

export default authRouter;