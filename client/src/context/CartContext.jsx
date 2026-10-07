import React, { createContext, useContext, useState, useEffect } from 'react';
import { cartApi } from '../api/client';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);

  // Sync cart when user signs in or changes
  const fetchCart = async () => {
    if (!user) {
      setCart(null);
      return;
    }
    try {
      setLoading(true);
      const res = await cartApi.getCart();
      if (res.data.success) {
        setCart(res.data.cart);
      }
    } catch (err) {
      console.error('Failed to fetch cart:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [user]);

  const addToCart = async (productId, quantity = 1) => {
    if (!user) {
      throw new Error('Please log in to add items to your cart');
    }
    try {
      const res = await cartApi.addToCart(productId, quantity);
      if (res.data.success) {
        setCart(res.data.cart);
        return res.data;
      }
    } catch (error) {
      throw error;
    }
  };

  const updateQuantity = async (productId, quantity) => {
    try {
      const res = await cartApi.updateCartItem(productId, quantity);
      if (res.data.success) {
        setCart(res.data.cart);
      }
      return res.data;
    } catch (error) {
      throw error;
    }
  };

  const removeFromCart = async (productId) => {
    try {
      const res = await cartApi.removeFromCart(productId);
      if (res.data.success) {
        setCart(res.data.cart);
      }
      return res.data;
    } catch (error) {
      throw error;
    }
  };

  const clearCart = async () => {
    try {
      await cartApi.clearCart();
      setCart({ items: [], totalAmount: 0 });
    } catch (error) {
      console.error('Failed to clear cart:', error);
    }
  };

  const cartItems = cart?.items || [];
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotal = cartItems.reduce(
    (acc, item) => acc + (item.price || item.product?.price || 0) * item.quantity,
    0
  );

  const value = {
    cart,
    cartItems,
    cartCount,
    cartTotal,
    loading,
    fetchCart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
