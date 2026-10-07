import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('user');

  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters');
      return;
    }

    try {
      setSubmitting(true);
      const res = await register({ name, email, password, phone, role });
      if (res.success) {
        navigate(`/verify-otp?email=${encodeURIComponent(email)}`);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-[26px] font-medium text-[#171717] tracking-tight">
            Create an Account
          </h1>
          <p className="text-[13px] text-[#6B6B6B]">Join NovaCart for order tracking and exclusive drops.</p>
        </div>

        <div className="bg-[#FFFFFF] rounded-[12px] border border-[#E7E5E2] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] space-y-5">
          {errorMsg && (
            <div className="p-3 rounded-[6px] bg-[#FCE8E5] text-[12px] text-[#B9382F] flex items-center gap-2">
              <AlertCircle size={14} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5 text-[13px]">
            <div>
              <label className="text-[#6B6B6B] block mb-1">Full Name</label>
              <input
                type="text"
                required
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-[40px] px-3 rounded-[8px] bg-[#F7F7F5] border border-[#E7E5E2] outline-none focus:border-[#171717]"
              />
            </div>

            <div>
              <label className="text-[#6B6B6B] block mb-1">Email</label>
              <input
                type="email"
                required
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-[40px] px-3 rounded-[8px] bg-[#F7F7F5] border border-[#E7E5E2] outline-none focus:border-[#171717]"
              />
            </div>

            <div>
              <label className="text-[#6B6B6B] block mb-1">Phone</label>
              <input
                type="tel"
                placeholder="+91..."
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full h-[40px] px-3 rounded-[8px] bg-[#F7F7F5] border border-[#E7E5E2] outline-none focus:border-[#171717]"
              />
            </div>

            <div>
              <label className="text-[#6B6B6B] block mb-1">Password</label>
              <input
                type="password"
                required
                placeholder="Min 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-[40px] px-3 rounded-[8px] bg-[#F7F7F5] border border-[#E7E5E2] outline-none focus:border-[#171717]"
              />
            </div>

            <div>
              <label className="text-[#6B6B6B] block mb-1">Account Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full h-[40px] px-2.5 rounded-[8px] bg-[#F7F7F5] border border-[#E7E5E2] outline-none focus:border-[#171717] cursor-pointer"
              >
                <option value="user">Customer</option>
                <option value="admin">Administrator</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full h-[42px] rounded-[8px] bg-[#171717] hover:bg-[#262626] text-white text-[14px] font-medium transition-colors disabled:opacity-50 mt-1"
            >
              {submitting ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="pt-3 border-t border-[#E7E5E2] text-center text-[12px] text-[#6B6B6B]">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-[#171717] hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
