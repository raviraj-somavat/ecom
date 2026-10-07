import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { authApi } from '../api/client';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg({ type: '', text: '' });

    try {
      setSubmitting(true);
      const res = await authApi.forgotPassword({ email });
      if (res.data.success) {
        setMsg({ type: 'success', text: 'Reset OTP has been dispatched to your email.' });
        setTimeout(() => {
          navigate(`/reset-password?email=${encodeURIComponent(email)}`);
        }, 1500);
      }
    } catch (err) {
      setMsg({
        type: 'error',
        text: err.response?.data?.message || 'Failed to send reset email',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-[26px] font-medium text-[#171717] tracking-tight">Forgot Password</h1>
          <p className="text-[13px] text-[#6B6B6B]">
            Enter your email to receive a recovery code
          </p>
        </div>

        <div className="bg-[#FFFFFF] rounded-[12px] border border-[#E7E5E2] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] space-y-5">
          {msg.text && (
            <div
              className={`p-3 rounded-[6px] text-[12px] flex items-center gap-2 ${
                msg.type === 'success'
                  ? 'bg-[#EBF4EE] text-[#2A5A3C]'
                  : 'bg-[#FCE8E5] text-[#B9382F]'
              }`}
            >
              {msg.type === 'success' ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
              <span>{msg.text}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-[13px]">
            <div>
              <label className="text-[#6B6B6B] block mb-1">Email</label>
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-[40px] px-3 rounded-[8px] bg-[#F7F7F5] border border-[#E7E5E2] outline-none focus:border-[#171717]"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full h-[42px] rounded-[8px] bg-[#171717] hover:bg-[#262626] text-white text-[14px] font-medium transition-colors disabled:opacity-50"
            >
              {submitting ? 'Sending...' : 'Send Recovery OTP'}
            </button>
          </form>

          <div className="pt-3 border-t border-[#E7E5E2] text-center text-[12px]">
            <Link to="/login" className="text-[#6B6B6B] hover:text-[#171717]">
              Return to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
