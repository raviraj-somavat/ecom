import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6">
      <span className="text-[13px] font-medium uppercase tracking-wider text-[#6B6B6B]">404 Error</span>
      <h1 className="text-[32px] sm:text-[36px] font-medium text-[#171717] tracking-tight mt-1 mb-2">
        Page Not Found
      </h1>
      <p className="text-[14px] text-[#6B6B6B] max-w-sm mb-6 leading-relaxed">
        The page you are looking for does not exist or has been relocated.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 h-[42px] px-[18px] bg-[#171717] hover:bg-[#262626] text-white rounded-[8px] text-[14px] font-medium transition-colors"
      >
        <ArrowLeft size={15} /> Return to Home
      </Link>
    </div>
  );
};

export default NotFoundPage;
