import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { protect, admin } from '../middleware/auth.middleware.js';
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductCategories,
  getTopProducts,
  createProductReview,
  deleteProductReview,
} from '../controllers/product.controller.js';

// Ensure uploads directory exists
const uploadDir = path.resolve('uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp|gif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Images only (jpeg, jpg, png, webp, gif) are allowed!'));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter,
});

const productRouter = express.Router();

// Specific routes first to prevent conflict with /:id
productRouter.get('/categories', getProductCategories);
productRouter.get('/top', getTopProducts);

// Collection routes
productRouter
  .route('/')
  .get(getProducts)
  .post(protect, admin, upload.single('image'), createProduct);

// Single item routes
productRouter
  .route('/:id')
  .get(getProductById)
  .put(protect, admin, upload.single('image'), updateProduct)
  .delete(protect, admin, deleteProduct);

// Review routes
productRouter
  .route('/:id/reviews')
  .post(protect, createProductReview);

productRouter
  .route('/:id/reviews/:reviewId')
  .delete(protect, deleteProductReview);

export default productRouter;