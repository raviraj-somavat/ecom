import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    try {
      setSubmitting(true);
      const res = await login(email, password);
      if (res.success) {
        navigate(redirect);
      }
    } catch (err) {
      if (err.response?.data?.verified === false) {
        navigate(`/verify-otp?email=${encodeURIComponent(err.response.data.email || email)}`);
        return;
      }
      setErrorMsg(err.response?.data?.message || 'Login failed. Please verify your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const fillDemoAccount = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setErrorMsg('');
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-[26px] font-medium text-[#171717] tracking-tight">
            Sign In to NovaCart
          </h1>
          <p className="text-[13px] text-[#6B6B6B]">Welcome back. Enter your details below.</p>
        </div>

        {/* Demo Fast Login Pills */}
        <div className="p-3 bg-[#FFFFFF] border border-[#E7E5E2] rounded-[12px] space-y-2 text-[12px]">
          <span className="text-[11px] font-medium text-[#6B6B6B] block uppercase tracking-wider">
            Fast Test Accounts:
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => fillDemoAccount('admin@example.com', 'adminpassword123')}
              className="flex-1 h-[34px] rounded-[6px] bg-[#F2F1EE] hover:bg-[#E7E5E2] text-[#171717] font-medium transition-colors"
            >
              Admin Demo
            </button>
            <button
              type="button"
              onClick={() => fillDemoAccount('rahul@example.com', 'userpassword123')}
              className="flex-1 h-[34px] rounded-[6px] bg-[#F2F1EE] hover:bg-[#E7E5E2] text-[#171717] font-medium transition-colors"
            >
              Customer Demo
            </button>
          </div>
        </div>

        {/* Card */}
        <div className="bg-[#FFFFFF] rounded-[12px] border border-[#E7E5E2] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] space-y-5">
          {errorMsg && (
            <div className="p-3 rounded-[6px] bg-[#FCE8E5] text-[12px] text-[#B9382F] flex items-center gap-2">
              <AlertCircle size={14} className="shrink-0" />
              <span>{errorMsg}</span>
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

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[#6B6B6B]">Password</label>
                <Link
                  to="/forgot-password"
                  className="text-[12px] text-[#E86A33] hover:underline"
                >
                  Forgot?
                </Link>
              </div>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-[40px] px-3 rounded-[8px] bg-[#F7F7F5] border border-[#E7E5E2] outline-none focus:border-[#171717]"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full h-[42px] rounded-[8px] bg-[#171717] hover:bg-[#262626] text-white text-[14px] font-medium transition-colors disabled:opacity-50"
            >
              {submitting ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="pt-3 border-t border-[#E7E5E2] text-center text-[12px] text-[#6B6B6B]">
            Need an account?{' '}
            <Link to="/register" className="font-medium text-[#171717] hover:underline">
              Register here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
