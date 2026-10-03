import express from 'express';
import { registerUser, loginUser, getUsers, verifyOtp } from '../controllers/auth.controller.js';
import { protect, admin } from '../middleware/auth.middleware.js';

const authRouter = express.Router();
authRouter.post('/register', registerUser);
authRouter.post('/login', loginUser);
authRouter.post('/verify-otp', verifyOtp);
authRouter.get('/users', protect, admin, getUsers);

export default authRouter;