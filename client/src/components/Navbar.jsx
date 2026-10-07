import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ShoppingBag,
  Heart,
  User,
  Search,
  Menu,
  X,
  ChevronDown,
  LayoutDashboard,
  PackageCheck,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { productApi } from '../api/client';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAdmin, logout, wishlist } = useAuth();
  const { cartCount } = useCart();

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [catMenuOpen, setCatMenuOpen] = useState(false);

  const userMenuRef = useRef(null);
  const catMenuRef = useRef(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await productApi.getCategories();
        if (res.data.success) {
          setCategories(res.data.categories);
        }
      } catch (e) {}
    };
    fetchCats();
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
    setCatMenuOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
      if (catMenuRef.current && !catMenuRef.current.contains(e.target)) {
        setCatMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?keyword=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FFFFFF] border-b border-[#E7E5E2]">
      {/* 68–72px height navbar */}
      <div className="max-w-[1200px] mx-auto px-6 h-[70px] flex items-center justify-between gap-6">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <span className="font-semibold text-[22px] tracking-tight text-[#171717]">
            NovaCart<span className="text-[#E86A33]">.</span>
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-7 text-[14px] text-[#6B6B6B]">
          <Link
            to="/"
            className={`transition-colors hover:text-[#171717] ${
              location.pathname === '/' ? 'text-[#171717] font-medium' : ''
            }`}
          >
            Home
          </Link>
          <Link
            to="/shop"
            className={`transition-colors hover:text-[#171717] ${
              location.pathname === '/shop' && !location.search ? 'text-[#171717] font-medium' : ''
            }`}
          >
            Shop
          </Link>

          {/* Categories dropdown */}
          <div className="relative" ref={catMenuRef}>
            <button
              onClick={() => setCatMenuOpen(!catMenuOpen)}
              className="flex items-center gap-1 transition-colors hover:text-[#171717] outline-none"
            >
              <span>Categories</span>
              <ChevronDown size={14} className={catMenuOpen ? 'rotate-180 transition-transform' : ''} />
            </button>

            {catMenuOpen && (
              <div className="absolute top-full left-0 mt-3 w-48 bg-[#FFFFFF] border border-[#E7E5E2] rounded-[8px] shadow-[0_8px_24px_rgba(0,0,0,0.08)] py-1.5 z-50">
                <Link
                  to="/shop"
                  onClick={() => setCatMenuOpen(false)}
                  className="block px-3.5 py-1.5 text-[13px] text-[#171717] hover:bg-[#F7F7F5] font-medium"
                >
                  All Categories
                </Link>
                {categories.map((c) => (
                  <Link
                    key={c}
                    to={`/shop?category=${encodeURIComponent(c)}`}
                    onClick={() => setCatMenuOpen(false)}
                    className="block px-3.5 py-1.5 text-[13px] text-[#6B6B6B] hover:text-[#171717] hover:bg-[#F7F7F5] capitalize"
                  >
                    {c}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link to="/shop?sort=top-rated" className="transition-colors hover:text-[#171717]">
            Trending
          </Link>
        </nav>

        {/* Right Actions: Search, Wishlist, Cart, Profile */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Search Trigger / Input */}
          <div className="relative">
            {searchOpen ? (
              <form onSubmit={handleSearchSubmit} className="flex items-center">
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-48 sm:w-64 h-[36px] px-3 pr-8 rounded-[8px] border border-[#E7E5E2] bg-[#F7F7F5] text-[13px] text-[#171717] outline-none focus:border-[#171717]"
                />
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="absolute right-2.5 text-[#6B6B6B] hover:text-[#171717]"
                >
                  <X size={15} />
                </button>
              </form>
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                title="Search catalog"
                className="p-2 text-[#171717] hover:text-[#E86A33] transition-colors"
              >
                <Search size={19} />
              </button>
            )}
          </div>

          {/* Wishlist */}
          <Link
            to="/wishlist"
            title="Wishlist"
            className="relative p-2 text-[#171717] hover:text-[#E86A33] transition-colors"
          >
            <Heart size={20} />
            {wishlist.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-[#E86A33] text-white text-[10px] font-medium rounded-full flex items-center justify-center">
                {wishlist.length}
              </span>
            )}
          </Link>

          {/* Cart */}
          <Link
            to="/cart"
            title="Shopping Cart"
            className="relative p-2 text-[#171717] hover:text-[#E86A33] transition-colors"
          >
            <ShoppingBag size={20} />
            {cartCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-[#171717] text-white text-[10px] font-medium rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>

          {/* User Account */}
          {user ? (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-1.5 p-1.5 text-[#171717] hover:text-[#E86A33] transition-colors"
              >
                <User size={20} />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-[#FFFFFF] border border-[#E7E5E2] rounded-[8px] shadow-[0_8px_24px_rgba(0,0,0,0.08)] py-2 z-50">
                  <div className="px-3.5 py-2 border-b border-[#E7E5E2]">
                    <p className="text-[13px] font-medium text-[#171717] truncate">{user.name}</p>
                    <p className="text-[11px] text-[#6B6B6B] truncate">{user.email}</p>
                  </div>

                  <div className="py-1">
                    <Link
                      to="/profile"
                      className="block px-3.5 py-1.5 text-[13px] text-[#6B6B6B] hover:text-[#171717] hover:bg-[#F7F7F5]"
                    >
                      My Profile
                    </Link>
                    <Link
                      to="/orders"
                      className="block px-3.5 py-1.5 text-[13px] text-[#6B6B6B] hover:text-[#171717] hover:bg-[#F7F7F5]"
                    >
                      Orders & Tracking
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="block px-3.5 py-1.5 text-[13px] font-medium text-[#E86A33] hover:bg-[#F7F7F5]"
                      >
                        Admin Portal
                      </Link>
                    )}
                  </div>

                  <div className="pt-1 border-t border-[#E7E5E2]">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3.5 py-1.5 text-[13px] text-[#D94A4A] hover:bg-[#F7F7F5]"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="h-[38px] px-3.5 rounded-[8px] bg-[#171717] hover:bg-[#2B2B2B] text-white text-[13px] font-medium flex items-center justify-center transition-colors"
            >
              Sign In
            </Link>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-[#171717]"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#E7E5E2] bg-[#FFFFFF] px-6 py-4 space-y-3">
          <Link to="/" className="block text-[14px] text-[#171717] font-medium py-1">
            Home
          </Link>
          <Link to="/shop" className="block text-[14px] text-[#171717] font-medium py-1">
            Shop All
          </Link>
          <div className="py-2 border-y border-[#E7E5E2]">
            <span className="text-[11px] uppercase tracking-wider text-[#6B6B6B] block mb-2 font-medium">
              Departments
            </span>
            <div className="grid grid-cols-2 gap-2">
              {categories.map((c) => (
                <Link
                  key={c}
                  to={`/shop?category=${encodeURIComponent(c)}`}
                  className="text-[13px] text-[#6B6B6B] hover:text-[#171717] py-1 capitalize"
                >
                  {c}
                </Link>
              ))}
            </div>
          </div>
          {isAdmin && (
            <Link to="/admin" className="block text-[13px] font-medium text-[#E86A33]">
              Admin Portal
            </Link>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
