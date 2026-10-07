import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, ArrowRight } from 'lucide-react';

const OrderSuccessPage = () => {
  const { orderId } = useParams();

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-20">
      <div className="max-w-md mx-auto bg-[#FFFFFF] border border-[#E7E5E2] rounded-[12px] p-8 text-center space-y-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
        <div className="w-12 h-12 bg-[#EBF4EE] text-[#3F7D58] rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 size={26} />
        </div>

        <div>
          <span className="text-[12px] font-medium uppercase tracking-wider text-[#3F7D58]">
            Order Confirmed
          </span>
          <h1 className="text-[24px] font-medium text-[#171717] mt-1">
            Thank you for your order
          </h1>
          <p className="text-[13px] text-[#6B6B6B] mt-2 leading-relaxed">
            Your purchase has been received and is being prepared. A receipt has been sent to your email.
          </p>
        </div>

        {orderId && (
          <div className="p-3 rounded-[8px] bg-[#F7F7F5] border border-[#E7E5E2] text-[12px] text-[#6B6B6B]">
            Reference: <span className="font-mono text-[#171717] font-medium">#{orderId}</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            to="/orders"
            className="w-full sm:w-auto h-[42px] px-[18px] bg-[#171717] hover:bg-[#262626] text-white text-[13px] font-medium rounded-[8px] transition-colors flex items-center justify-center"
          >
            Track Orders
          </Link>
          <Link
            to="/shop"
            className="w-full sm:w-auto h-[42px] px-[18px] bg-[#F7F7F5] hover:bg-[#E7E5E2] text-[#171717] text-[13px] font-medium rounded-[8px] transition-colors flex items-center justify-center"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
