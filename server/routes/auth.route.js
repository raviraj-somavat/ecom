import express from 'express';
import { registerUser, loginUser ,getUsers} from '../controllers/auth.controller.js';
import { protect, admin } from '../middleware/auth.middleware.js';
const authRouter = express.Router();
authRouter.post('/register', registerUser);
authRouter.post('/login', loginUser);
authRouter.get('/users',protect,admin, getUsers);

export default authRouter;