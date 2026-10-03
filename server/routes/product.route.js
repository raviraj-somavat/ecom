import express from 'express';
import { protect, admin } from '../middleware/auth.middleware.js';
import multer from 'multer';
import { createProduct,getProducts, getProductById, updateProduct, deleteProduct } from '../controllers/product.controller.js';
const upload = multer({ dest: 'uploads/' });
const productRouter = express.Router();
productRouter.route('/').get(getProducts).post(protect, admin,upload.single('image'), createProduct);
productRouter.route('/:id').get(getProductById).put(protect, admin, updateProduct).delete(protect, admin, deleteProduct);



export default productRouter;