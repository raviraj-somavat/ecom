# E-Commerce Backend API Documentation

A full-featured Node.js / Express / MongoDB backend for e-commerce platforms with JWT authentication, OTP email verification, Cloudinary image upload, Razorpay payments, dynamic cart, order fulfillment, review system, and admin analytics.

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
cd server
npm install
```

### 2. Environment Variables (`.env`)
```env
PORT = 8000
MONGODB_URI = "your_mongodb_connection_string"
JWT_SECRET = "your_jwt_secret_key"
NODE_ENV = development
EMAIL_USER = your_email@gmail.com
EMAIL_PASS = your_email_app_password
CLOUDINARY_CLOUD_NAME = your_cloud_name
CLOUDINARY_API_KEY = your_api_key
CLOUDINARY_API_SECRET = your_api_secret
RAZORPAY_KEY_ID = rzp_test_your_key_id
RAZORPAY_KEY_SECRET = your_razorpay_key_secret
```

### 3. Seed Database
Run the seeder to populate sample users, catalog products, reviews, orders, and cart items:
```bash
npm run seed
```
To wipe all data:
```bash
npm run seed:destroy
```

### 4. Default Seed Credentials
| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@example.com` | `adminpassword123` |
| **Customer** | `rahul@example.com` | `userpassword123` |
| **Customer** | `priya@example.com` | `userpassword123` |
| **Customer** | `amit@example.com` | `userpassword123` |

### 5. Start Server
```bash
# Run server
npm run run
# Or
node index.js
```

---

## 📡 API Endpoints

### 🔐 1. Authentication & User Profile (`/api/auth`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register user & send verification OTP |
| `POST` | `/api/auth/verify-otp` | Public | Verify 6-digit OTP & get JWT token |
| `POST` | `/api/auth/resend-otp` | Public | Resend verification OTP |
| `POST` | `/api/auth/login` | Public | Login with email & password |
| `POST` | `/api/auth/logout` | Public | Logout & clear session cookie |
| `POST` | `/api/auth/forgot-password` | Public | Send password reset OTP |
| `POST` | `/api/auth/reset-password` | Public | Reset password using OTP |
| `GET` | `/api/auth/profile` or `/me` | User | Get logged-in user profile |
| `PUT` | `/api/auth/profile` | User | Update profile (name, phone, avatar, addresses, password) |
| `GET` | `/api/auth/wishlist` | User | Get current user's wishlist |
| `POST` | `/api/auth/wishlist/:productId` | User | Add product to wishlist |
| `DELETE` | `/api/auth/wishlist/:productId` | User | Remove product from wishlist |
| `GET` | `/api/auth/users` | Admin | Get all users (search & pagination) |
| `GET` | `/api/auth/users/:id` | Admin | Get user details by ID |
| `PUT` | `/api/auth/users/:id` | Admin | Update user role or verified status |
| `DELETE` | `/api/auth/users/:id` | Admin | Delete user |

---

### 📦 2. Product Management (`/api/products`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/products` | Public | Get products with search (`keyword`), category, price range (`minPrice`, `maxPrice`), sorting, pagination (`page`, `limit`) |
| `GET` | `/api/products/categories` | Public | Get distinct list of product categories |
| `GET` | `/api/products/top` | Public | Get top-rated products |
| `GET` | `/api/products/:id` | Public | Get single product details |
| `POST` | `/api/products` | Admin | Create product (multipart `image` file or `imageUrl` JSON) |
| `PUT` | `/api/products/:id` | Admin | Update product details or image |
| `DELETE` | `/api/products/:id` | Admin | Delete product |
| `POST` | `/api/products/:id/reviews` | User | Add review & rating (1-5) for product |
| `DELETE` | `/api/products/:id/reviews/:reviewId` | User/Admin | Delete product review |

---

### 🛒 3. Cart Management (`/api/cart`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/cart` | User | Get user's cart items and total amount |
| `POST` | `/api/cart` | User | Add item to cart (`productId`, `quantity`) |
| `PUT` | `/api/cart/:productId` | User | Update quantity of item in cart |
| `DELETE` | `/api/cart/:productId` | User | Remove single item from cart |
| `DELETE` | `/api/cart` | User | Clear entire cart |

---

### 📋 4. Order Management (`/api/orders`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/orders` | User | Place order (validates stock, deducts inventory, auto-calculates taxes & shipping) |
| `GET` | `/api/orders/my-orders` | User | Get all orders of current logged-in user |
| `GET` | `/api/orders/:id` | User/Admin | Get order details by ID |
| `PUT` | `/api/orders/:id/cancel` | User/Admin | Cancel order (restores product inventory) |
| `GET` | `/api/orders` | Admin | Get all orders with status filter & pagination |
| `PUT` | `/api/orders/:id/status` | Admin | Update order status (`Pending`, `Processing`, `Shipped`, `Delivered`, `Cancelled`) |
| `DELETE` | `/api/orders/:id` | Admin | Delete order record |

---

### 💳 5. Payment Gateway (`/api/payments`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/payments/razorpay-key` | Public | Get Razorpay Key ID for client checkout |
| `POST` | `/api/payments/create-order` | User | Create Razorpay order for an order ID |
| `POST` | `/api/payments/verify` | User | Verify HMAC SHA256 payment signature & mark order as paid |

---

### 📊 6. Admin Analytics (`/api/analytics`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/analytics/dashboard` | Admin | Dashboard summary: Total revenue, order status breakdown, inventory metrics (out of stock / low stock), monthly sales trends, recent orders, and top selling products |

---

## 🛡️ Authentication Header
For protected routes, include the Bearer token in the `Authorization` header:
```
Authorization: Bearer <jwt_token>
```
*Note: Tokens sent via HTTP cookies are also automatically recognized.*
