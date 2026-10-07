import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Authorization header if token exists in localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response error handler
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Optional: handle token expiration or unauthorized access
    }
    return Promise.reject(error);
  }
);

// ----------------- Auth API -----------------
export const authApi = {
  register: (data) => api.post('/auth/register', data),
  verifyOtp: (data) => api.post('/auth/verify-otp', data),
  resendOtp: (data) => api.post('/auth/resend-otp', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  getWishlist: () => api.get('/auth/wishlist'),
  addToWishlist: (productId) => api.post(`/auth/wishlist/${productId}`),
  removeFromWishlist: (productId) => api.delete(`/auth/wishlist/${productId}`),
  // Admin user management
  getUsers: (params) => api.get('/auth/users', { params }),
  getUserById: (id) => api.get(`/auth/users/${id}`),
  updateUserRole: (id, data) => api.put(`/auth/users/${id}`, data),
  deleteUser: (id) => api.delete(`/auth/users/${id}`),
};

// ----------------- Products API -----------------
export const productApi = {
  getProducts: (params) => api.get('/products', { params }),
  getCategories: () => api.get('/products/categories'),
  getTopProducts: (params) => api.get('/products/top', { params }),
  getProductById: (id) => api.get(`/products/${id}`),
  createProduct: (formData) =>
    api.post('/products', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  updateProduct: (id, formData) =>
    api.put(`/products/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  deleteProduct: (id) => api.delete(`/products/${id}`),
  createReview: (id, data) => api.post(`/products/${id}/reviews`, data),
  deleteReview: (id, reviewId) => api.delete(`/products/${id}/reviews/${reviewId}`),
};

// ----------------- Cart API -----------------
export const cartApi = {
  getCart: () => api.get('/cart'),
  addToCart: (productId, quantity = 1) => api.post('/cart', { productId, quantity }),
  updateCartItem: (productId, quantity) => api.put(`/cart/${productId}`, { quantity }),
  removeFromCart: (productId) => api.delete(`/cart/${productId}`),
  clearCart: () => api.delete('/cart'),
};

// ----------------- Orders API -----------------
export const orderApi = {
  createOrder: (orderData) => api.post('/orders', orderData),
  getMyOrders: () => api.get('/orders/my-orders'),
  getOrderById: (id) => api.get(`/orders/${id}`),
  cancelOrder: (id) => api.put(`/orders/${id}/cancel`),
  // Admin orders
  getAllOrders: (params) => api.get('/orders', { params }),
  updateOrderStatus: (id, status) => api.put(`/orders/${id}/status`, { status }),
  deleteOrder: (id) => api.delete(`/orders/${id}`),
};

// ----------------- Payments API -----------------
export const paymentApi = {
  getRazorpayKey: () => api.get('/payments/razorpay-key'),
  createRazorpayOrder: (orderId) => api.post('/payments/create-order', { orderId }),
  verifyPayment: (data) => api.post('/payments/verify', data),
};

// ----------------- Analytics API -----------------
export const analyticsApi = {
  getDashboardAnalytics: () => api.get('/analytics/dashboard'),
};

export default api;
