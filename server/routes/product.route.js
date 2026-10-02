import express from 'express';
import { protect, admin } from '../middleware/auth.middleware.js';
const productRouter = express.Router();
productRouter.route('/').get(protect, admin, createProduct).post(protect, admin, createProduct);
productRouter.route('/:id').get(getProductById).put(protect, admin, updateProduct).delete(protect, admin, deleteProduct);