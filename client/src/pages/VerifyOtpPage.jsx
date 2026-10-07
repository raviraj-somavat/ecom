import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/client';

const VerifyOtpPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { verifyOtp } = useAuth();

  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [otp, setOtp] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setMsg({ type: '', text: '' });

    if (!email || !otp) {
      setMsg({ type: 'error', text: 'Email and 6-digit OTP are required' });
      return;
    }

    try {
      setSubmitting(true);
      const res = await verifyOtp(email, otp);
      if (res.success) {
        setMsg({ type: 'success', text: 'Account verified successfully!' });
        setTimeout(() => navigate('/'), 1200);
      }
    } catch (err) {
      setMsg({
        type: 'error',
        text: err.response?.data?.message || 'Invalid or expired OTP',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      setMsg({ type: 'error', text: 'Please enter your email to resend OTP' });
      return;
    }

    try {
      setResending(true);
      setMsg({ type: '', text: '' });
      const res = await authApi.resendOtp({ email });
      if (res.data.success) {
        setMsg({ type: 'success', text: 'A new 6-digit OTP has been dispatched to your email.' });
        setCountdown(60);
      }
    } catch (err) {
      setMsg({
        type: 'error',
        text: err.response?.data?.message || 'Failed to resend OTP',
      });
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-[26px] font-medium text-[#171717] tracking-tight">
            Security Verification
          </h1>
          <p className="text-[13px] text-[#6B6B6B]">
            Enter the 6-digit OTP code sent to your email.
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

          <form onSubmit={handleVerify} className="space-y-4 text-[13px]">
            <div>
              <label className="text-[#6B6B6B] block mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-[40px] px-3 rounded-[8px] bg-[#F7F7F5] border border-[#E7E5E2] outline-none focus:border-[#171717]"
              />
            </div>

            <div>
              <label className="text-[#6B6B6B] block mb-1">6-Digit Code</label>
              <input
                type="text"
                required
                maxLength={6}
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value.trim())}
                className="w-full h-[46px] px-3 rounded-[8px] bg-[#F7F7F5] border border-[#E7E5E2] font-mono tracking-widest text-center text-[18px] font-semibold text-[#171717] outline-none focus:border-[#171717]"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full h-[42px] rounded-[8px] bg-[#171717] hover:bg-[#262626] text-white text-[14px] font-medium transition-colors disabled:opacity-50"
            >
              {submitting ? 'Verifying...' : 'Verify Code'}
            </button>
          </form>

          <div className="pt-3 border-t border-[#E7E5E2] flex items-center justify-between text-[12px]">
            <span className="text-[#6B6B6B]">Didn't get code?</span>
            <button
              type="button"
              disabled={countdown > 0 || resending}
              onClick={handleResend}
              className="font-medium text-[#E86A33] hover:underline disabled:opacity-40"
            >
              {countdown > 0 ? `Resend (${countdown}s)` : 'Resend OTP'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtpPage;
