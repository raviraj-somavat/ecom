# NovaCart - Modern E-Commerce Frontend

A modern, responsive e-commerce web application built with **React**, **Vite**, **Tailwind CSS**, and **Lucide React**, fully integrated with the NovaCart Express backend.

---

## 🚀 Features

### 🛍️ Customer Experience
- **Dynamic Homepage:** Hero promotion banner, department categories, featured items, limited-time voucher callout, and top-rated products.
- **Interactive Shop & Catalog:** Real-time search, category filters, price range filter, in-stock filter, sorting options (`newest`, `price-asc`, `price-desc`, `top-rated`), and responsive pagination.
- **Product Details:** High-resolution image gallery with thumbnails, quantity selector, direct "Buy Now" option, live stock status badge, customer reviews list, and review submission with star ratings.
- **Smart Shopping Cart:** Live quantity adjustments, persistent backend synchronization, free delivery progress bar, and comprehensive tax calculation.
- **Streamlined Checkout:** Address selection, Razorpay online gateway modal integration with fallback simulation, and Cash on Delivery (COD).
- **Order Tracking & History:** Real-time status badges (`Pending`, `Processing`, `Shipped`, `Delivered`, `Cancelled`), items preview, and cancel order action for pending shipments.
- **Wishlist:** Quick bookmarking of favorite products with real-time navbar counter.
- **Customer Profile:** Manage profile details, phone number, custom avatar, and password updates.

### 🛡️ Authentication & Verification
- **Email & OTP Verification:** 6-digit OTP verification with countdown timer and resend capability.
- **Password Recovery:** Forgot password and OTP-based password reset flows.
- **Demo Quick-Fill:** One-click demo login buttons for **Admin** and **Customer** for swift evaluation.
- **Protected Routes:** Separate route guards for authenticated customers and administrators.

### 📊 Admin Portal
- **Executive Dashboard:** Revenue KPI cards, total orders, catalog statistics, low/out-of-stock alerts, fulfillment status progress bars, recent orders feed, and top-selling products.
- **Product Management:** Search & filter catalog table, add product modal with image uploads, edit product modal, and delete actions.
- **Order Management:** Status tab filters and on-the-fly order status updates (`Pending` ➔ `Processing` ➔ `Shipped` ➔ `Delivered` ➔ `Cancelled`).
- **User Management:** View registered users and promote/demote administrative permissions.

---

## 🛠️ Tech Stack
- **Framework:** React 19 + Vite
- **Styling:** Tailwind CSS v4
- **Icons:** Lucide React
- **Routing:** React Router DOM v7
- **HTTP Client:** Axios with credentials and bearer token interceptors
- **Payment Gateway:** Razorpay Checkout SDK

---

## 🏃‍♂️ How to Run

### 1. Start Backend Server
```bash
cd ../server
npm install
npm run seed   # (Optional) Seed demo products, users, and orders
npm run run    # Runs on http://localhost:8000
```

### 2. Start Frontend Dev Server
```bash
cd client
npm install
npm run dev    # Runs on http://localhost:5173
```

### 3. Build for Production
```bash
npm run build
```
