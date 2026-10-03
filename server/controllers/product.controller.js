import Product from "../models/product.model.js";
import cloudinary from "../config/cloudinary.js";

// Create a new product
export const createProduct = async (req, res) => {
    try {
    const { name, description, price, category, stock } = req.body;
    let imageUrl = '';

    if (req.file) {
        const result = await cloudinary.uploader.upload(req.file.path);
        imageUrl = result.secure_url;
    }

    const product = new Product.create({ 
        name,
        description, 
        price, 
        category, 
        stock, 
        imageUrl
 })
 res.status(201).json(product);
}catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
}
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
}

export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
}

export const updateProduct = async (req, res) => {
    try {
    const { name, description, price, category, stock } = req.body;
    let imageUrl = '';

    if (req.file) {
        const result = await cloudinary.uploader.upload(req.file.path);
        imageUrl = result.secure_url;
    }
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    product.name = name || product.name;
    product.description = description || product.description;
    product.price = price || product.price;
    product.category = category || product.category;
    product.stock = stock || product.stock;
    if (imageUrl) {
      product.imageUrl = imageUrl;
    }
    const updatedProduct = await product.save();
    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const deleteProduct = async (req, res) => {
    try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    } 
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
     