import React from 'react';

const LoadingSpinner = ({ text = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      <p className="text-sm text-slate-500 font-medium tracking-wide animate-pulse">{text}</p>
    </div>
  );
};

export default LoadingSpinner;
