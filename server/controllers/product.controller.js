import Product from '../models/product.model.js';
import cloudinary from '../config/cloudinary.js';
import fs from 'fs';

// Helper to remove temporary file after Cloudinary upload
const removeTempFile = (filePath) => {
  if (filePath && fs.existsSync(filePath)) {
    fs.unlink(filePath, (err) => {
      if (err) console.error('Error deleting temp file:', err);
    });
  }
};

// @desc    Create a new product
// @route   POST /api/products
export const createProduct = async (req, res) => {
  let tempFilePath = null;
  try {
    const { name, description, price, category, stock, brand, isFeatured } = req.body;
    let imageUrl = req.body.imageUrl || '';

    if (req.file) {
      tempFilePath = req.file.path;
      const result = await cloudinary.uploader.upload(tempFilePath, {
        folder: 'ecommerce/products',
      });
      imageUrl = result.secure_url;
    }

    if (!name || !description || price === undefined || !category || stock === undefined) {
      removeTempFile(tempFilePath);
      return res.status(400).json({
        success: false,
        message: 'Name, description, price, category, and stock are required',
      });
    }

    if (!imageUrl) {
      removeTempFile(tempFilePath);
      return res.status(400).json({
        success: false,
        message: 'Product image is required (upload file or provide imageUrl)',
      });
    }

    const product = await Product.create({
      name: name.trim(),
      description,
      price: Number(price),
      category: category.trim(),
      brand: brand || '',
      stock: Number(stock),
      imageUrl,
      images: req.body.images || [imageUrl],
      isFeatured: isFeatured === true || isFeatured === 'true',
    });

    removeTempFile(tempFilePath);
    return res.status(201).json({ success: true, product });
  } catch (error) {
    removeTempFile(tempFilePath);
    console.error('Create product error:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Get all products with filtering, search, sorting & pagination
// @route   GET /api/products
export const getProducts = async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Number(req.query.limit) || 12);
    const skip = (page - 1) * limit;

    const query = {};

    // Search keyword
    if (req.query.keyword) {
      const keywordRegex = { $regex: req.query.keyword, $options: 'i' };
      query.$or = [
        { name: keywordRegex },
        { description: keywordRegex },
        { brand: keywordRegex },
        { category: keywordRegex },
      ];
    }

    // Category filter
    if (req.query.category && req.query.category !== 'All') {
      query.category = { $regex: new RegExp(`^${req.query.category}$`, 'i') };
    }

    // Brand filter
    if (req.query.brand) {
      query.brand = { $regex: new RegExp(`^${req.query.brand}$`, 'i') };
    }

    // In Stock filter
    if (req.query.inStock === 'true') {
      query.stock = { $gt: 0 };
    }

    // Featured filter
    if (req.query.isFeatured === 'true') {
      query.isFeatured = true;
    }

    // Price range filter
    if (req.query.minPrice !== undefined || req.query.maxPrice !== undefined) {
      query.price = {};
      if (req.query.minPrice !== undefined && req.query.minPrice !== '') {
        query.price.$gte = Number(req.query.minPrice);
      }
      if (req.query.maxPrice !== undefined && req.query.maxPrice !== '') {
        query.price.$lte = Number(req.query.maxPrice);
      }
    }

    // Rating filter
    if (req.query.minRating) {
      query.rating = { $gte: Number(req.query.minRating) };
    }

    // Sorting
    let sort = { createdAt: -1 }; // default newest
    if (req.query.sort) {
      switch (req.query.sort) {
        case 'price-asc':
        case 'lowest':
          sort = { price: 1 };
          break;
        case 'price-desc':
        case 'highest':
          sort = { price: -1 };
          break;
        case 'rating':
        case 'top-rated':
          sort = { rating: -1 };
          break;
        case 'oldest':
          sort = { createdAt: 1 };
          break;
        default:
          sort = { createdAt: -1 };
      }
    }

    const totalProducts = await Product.countDocuments(query);
    const products = await Product.find(query).sort(sort).skip(skip).limit(limit);

    return res.status(200).json({
      success: true,
      products,
      page,
      pages: Math.ceil(totalProducts / limit),
      totalProducts,
    });
  } catch (error) {
    console.error('Get products error:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Get top rated or featured products
// @route   GET /api/products/top
export const getTopProducts = async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 5;
    const products = await Product.find({}).sort({ rating: -1 }).limit(limit);
    return res.status(200).json({ success: true, products });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Get distinct product categories
// @route   GET /api/products/categories
export const getProductCategories = async (req, res) => {
  try {
    const categories = await Product.distinct('category');
    return res.status(200).json({ success: true, categories });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Get product by ID
// @route   GET /api/products/:id
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    return res.status(200).json({ success: true, product });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
export const updateProduct = async (req, res) => {
  let tempFilePath = null;
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      if (req.file) removeTempFile(req.file.path);
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const { name, description, price, category, stock, brand, isFeatured, imageUrl } = req.body;

    if (req.file) {
      tempFilePath = req.file.path;
      const result = await cloudinary.uploader.upload(tempFilePath, {
        folder: 'ecommerce/products',
      });
      product.imageUrl = result.secure_url;
      removeTempFile(tempFilePath);
    } else if (imageUrl) {
      product.imageUrl = imageUrl;
    }

    if (name !== undefined) product.name = name.trim();
    if (description !== undefined) product.description = description;
    if (price !== undefined) product.price = Number(price);
    if (category !== undefined) product.category = category.trim();
    if (stock !== undefined) product.stock = Number(stock);
    if (brand !== undefined) product.brand = brand;
    if (isFeatured !== undefined) product.isFeatured = isFeatured === true || isFeatured === 'true';

    const updatedProduct = await product.save();
    return res.status(200).json({ success: true, product: updatedProduct });
  } catch (error) {
    removeTempFile(tempFilePath);
    console.error('Update product error:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    await Product.findByIdAndDelete(req.params.id);
    return res.status(200).json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Create new review for product
// @route   POST /api/products/:id/reviews
export const createProductReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (!rating || !comment) {
      return res.status(400).json({ success: false, message: 'Rating and comment are required' });
    }

    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this product' });
    }

    const review = {
      name: req.user.name,
      rating: Number(rating),
      comment,
      user: req.user._id,
    };

    product.reviews.push(review);
    product.numReviews = product.reviews.length;
    product.rating =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;

    await product.save();
    return res.status(201).json({ success: true, message: 'Review added successfully', product });
  } catch (error) {
    console.error('Review error:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Delete review (Admin or review author)
// @route   DELETE /api/products/:id/reviews/:reviewId
export const deleteProductReview = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const review = product.reviews.find((r) => r._id.toString() === req.params.reviewId);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    // Only review owner or admin can delete
    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this review' });
    }

    product.reviews = product.reviews.filter((r) => r._id.toString() !== req.params.reviewId);
    product.numReviews = product.reviews.length;
    product.rating =
      product.reviews.length > 0
        ? product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length
        : 0;

    await product.save();
    return res.status(200).json({ success: true, message: 'Review deleted successfully', product });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};