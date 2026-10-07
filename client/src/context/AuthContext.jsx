import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  // Initialize and load user profile if token exists
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          setToken(storedToken);
          // Fetch fresh user profile and wishlist
          const res = await authApi.getProfile();
          if (res.data.success && res.data.user) {
            setUser(res.data.user);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            if (res.data.user.wishlist) {
              setWishlist(res.data.user.wishlist);
            }
          }
        } catch (err) {
          console.error('Failed to restore session:', err);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await authApi.login({ email, password });
    if (res.data.success) {
      setUser(res.data.user);
      setToken(res.data.token);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      // Fetch wishlist
      try {
        const wishRes = await authApi.getWishlist();
        if (wishRes.data.success) setWishlist(wishRes.data.wishlist || []);
      } catch (e) {}
    }
    return res.data;
  };

  const register = async (userData) => {
    const res = await authApi.register(userData);
    return res.data;
  };

  const verifyOtp = async (email, otp) => {
    const res = await authApi.verifyOtp({ email, otp });
    if (res.data.success && res.data.token) {
      setUser(res.data.user);
      setToken(res.data.token);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
    }
    return res.data;
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (e) {}
    setUser(null);
    setToken(null);
    setWishlist([]);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const updateProfile = async (data) => {
    const res = await authApi.updateProfile(data);
    if (res.data.success && res.data.user) {
      setUser(res.data.user);
      localStorage.setItem('user', JSON.stringify(res.data.user));
    }
    return res.data;
  };

  const toggleWishlist = async (product) => {
    if (!user) {
      throw new Error('Please login to manage your wishlist');
    }
    const productId = product._id || product;
    const isWishlisted = wishlist.some((item) => (item._id || item) === productId);

    if (isWishlisted) {
      setWishlist((prev) => prev.filter((item) => (item._id || item) !== productId));
      await authApi.removeFromWishlist(productId);
    } else {
      setWishlist((prev) => [...prev, product]);
      await authApi.addToWishlist(productId);
    }
  };

  const isInWishlist = (productId) => {
    return wishlist.some((item) => (item._id || item) === productId);
  };

  const value = {
    user,
    token,
    wishlist,
    loading,
    isAdmin: user?.role === 'admin',
    login,
    register,
    verifyOtp,
    logout,
    updateProfile,
    toggleWishlist,
    isInWishlist,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
