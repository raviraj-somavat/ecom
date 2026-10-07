import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  return (
    <footer className="bg-[#171717] text-[#9E9E9E] border-t border-[#262626] mt-20">
      <div className="max-w-[1200px] mx-auto px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand info */}
          <div className="space-y-4">
            <span className="font-semibold text-[20px] text-[#FFFFFF] tracking-tight block">
              NovaCart<span className="text-[#E86A33]">.</span>
            </span>
            <p className="text-[13px] text-[#9E9E9E] leading-relaxed max-w-xs font-normal">
              Carefully curated daily essentials, audio gear, and lifestyle products with doorstep delivery.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-[13px] font-medium uppercase tracking-wider text-[#FFFFFF] mb-4">
              Catalog
            </h4>
            <ul className="space-y-2.5 text-[13px]">
              <li>
                <Link to="/shop" className="hover:text-[#FFFFFF] transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link to="/shop?category=Electronics" className="hover:text-[#FFFFFF] transition-colors">
                  Electronics
                </Link>
              </li>
              <li>
                <Link to="/shop?category=Fashion" className="hover:text-[#FFFFFF] transition-colors">
                  Apparel
                </Link>
              </li>
              <li>
                <Link to="/shop?sort=top-rated" className="hover:text-[#FFFFFF] transition-colors">
                  Customer Favorites
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Support */}
          <div>
            <h4 className="text-[13px] font-medium uppercase tracking-wider text-[#FFFFFF] mb-4">
              Support
            </h4>
            <ul className="space-y-2.5 text-[13px]">
              <li>
                <Link to="/orders" className="hover:text-[#FFFFFF] transition-colors">
                  Track Orders
                </Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-[#FFFFFF] transition-colors">
                  Cart & Bag
                </Link>
              </li>
              <li>
                <Link to="/wishlist" className="hover:text-[#FFFFFF] transition-colors">
                  Saved Wishlist
                </Link>
              </li>
              <li>
                <Link to="/profile" className="hover:text-[#FFFFFF] transition-colors">
                  Shipping Details
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-[13px] font-medium uppercase tracking-wider text-[#FFFFFF] mb-4">
              Newsletter
            </h4>
            <p className="text-[13px] text-[#9E9E9E] mb-3">
              Receive updates on seasonal arrivals and exclusive discounts.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-2">
              <input
                type="email"
                required
                placeholder="Enter email..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-[40px] px-3 rounded-[8px] bg-[#262626] border border-[#333333] text-[13px] text-[#FFFFFF] placeholder-[#6B6B6B] outline-none focus:border-[#E86A33]"
              />
              <button
                type="submit"
                className="w-full h-[40px] rounded-[8px] bg-[#FFFFFF] hover:bg-[#E7E5E2] text-[#171717] text-[13px] font-medium transition-colors"
              >
                Subscribe
              </button>
            </form>
            {subscribed && (
              <p className="text-[12px] text-[#3F7D58] mt-2">✓ Thank you for subscribing.</p>
            )}
          </div>
        </div>

        <div className="pt-12 mt-12 border-t border-[#262626] flex flex-col sm:flex-row items-center justify-between text-[12px] text-[#6B6B6B] gap-4">
          <p>© {new Date().getFullYear()} NovaCart Retail. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-[#9E9E9E] cursor-pointer">Privacy</span>
            <span className="hover:text-[#9E9E9E] cursor-pointer">Terms</span>
            <span className="hover:text-[#9E9E9E] cursor-pointer">Support</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
