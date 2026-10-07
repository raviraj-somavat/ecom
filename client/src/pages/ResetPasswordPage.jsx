import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { authApi } from '../api/client';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  const handleReset = async (e) => {
    e.preventDefault();
    setMsg({ type: '', text: '' });

    if (newPassword.length < 6) {
      setMsg({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMsg({ type: 'error', text: 'Passwords do not match' });
      return;
    }

    try {
      setSubmitting(true);
      const res = await authApi.resetPassword({ email, otp, newPassword });
      if (res.data.success) {
        setMsg({ type: 'success', text: 'Password updated. Redirecting to login...' });
        setTimeout(() => navigate('/login'), 1500);
      }
    } catch (err) {
      setMsg({
        type: 'error',
        text: err.response?.data?.message || 'Password reset failed',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-[26px] font-medium text-[#171717] tracking-tight">Create New Password</h1>
          <p className="text-[13px] text-[#6B6B6B]">
            Enter the recovery OTP and choose a strong password
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

          <form onSubmit={handleReset} className="space-y-3.5 text-[13px]">
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
              <label className="text-[#6B6B6B] block mb-1">6-Digit Recovery OTP</label>
              <input
                type="text"
                required
                maxLength={6}
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value.trim())}
                className="w-full h-[42px] px-3 rounded-[8px] bg-[#F7F7F5] border border-[#E7E5E2] font-mono tracking-widest text-center text-[16px] font-semibold outline-none focus:border-[#171717]"
              />
            </div>

            <div>
              <label className="text-[#6B6B6B] block mb-1">New Password</label>
              <input
                type="password"
                required
                placeholder="Min 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full h-[40px] px-3 rounded-[8px] bg-[#F7F7F5] border border-[#E7E5E2] outline-none focus:border-[#171717]"
              />
            </div>

            <div>
              <label className="text-[#6B6B6B] block mb-1">Confirm New Password</label>
              <input
                type="password"
                required
                placeholder="Repeat password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full h-[40px] px-3 rounded-[8px] bg-[#F7F7F5] border border-[#E7E5E2] outline-none focus:border-[#171717]"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full h-[42px] rounded-[8px] bg-[#171717] hover:bg-[#262626] text-white text-[14px] font-medium transition-colors disabled:opacity-50 mt-1"
            >
              {submitting ? 'Resetting...' : 'Save Password'}
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

export default ResetPasswordPage;
