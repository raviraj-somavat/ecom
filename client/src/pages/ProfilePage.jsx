import React, { useState } from 'react';
import { User, Lock, Check, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ProfilePage = () => {
  const { user, updateProfile } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [msg, setMsg] = useState({ type: '', text: '' });
  const [updating, setUpdating] = useState(false);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setMsg({ type: '', text: '' });

    if (password && password !== confirmPassword) {
      setMsg({ type: 'error', text: 'Passwords do not match' });
      return;
    }

    try {
      setUpdating(true);
      const payload = { name, phone, avatar };
      if (password) payload.password = password;

      const res = await updateProfile(payload);
      if (res.success) {
        setMsg({ type: 'success', text: 'Profile updated successfully.' });
        setPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      setMsg({
        type: 'error',
        text: err.response?.data?.message || err.message || 'Failed to update profile',
      });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="max-w-[720px] mx-auto px-6 py-8 space-y-6">
      <div className="pb-3 border-b border-[#E7E5E2]">
        <h1 className="text-[28px] sm:text-[32px] font-medium text-[#171717] tracking-tight">
          Personal Profile
        </h1>
        <p className="text-[13px] text-[#6B6B6B] mt-0.5">
          Manage your account credentials and contact details
        </p>
      </div>

      {msg.text && (
        <div
          className={`p-3.5 rounded-[8px] border text-[13px] flex items-center gap-2 ${
            msg.type === 'success'
              ? 'bg-[#EBF4EE] border-[#EBF4EE] text-[#2A5A3C]'
              : 'bg-[#FCE8E5] border-[#FCE8E5] text-[#B9382F]'
          }`}
        >
          {msg.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
          <span>{msg.text}</span>
        </div>
      )}

      <form onSubmit={handleProfileUpdate} className="space-y-6">
        <div className="bg-[#FFFFFF] rounded-[12px] border border-[#E7E5E2] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] space-y-4">
          <div className="flex items-center gap-3.5 pb-4 border-b border-[#E7E5E2]">
            {avatar ? (
              <img
                src={avatar}
                alt="Avatar"
                className="w-12 h-12 rounded-full object-cover border border-[#E7E5E2]"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-[#F2F1EE] text-[#171717] font-semibold text-[16px] flex items-center justify-center">
                {name.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h2 className="text-[15px] font-medium text-[#171717]">{name}</h2>
              <p className="text-[12px] text-[#6B6B6B]">{user?.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[13px]">
            <div>
              <label className="text-[#6B6B6B] block mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-[40px] px-3 rounded-[8px] bg-[#F7F7F5] border border-[#E7E5E2] outline-none focus:border-[#171717]"
              />
            </div>

            <div>
              <label className="text-[#6B6B6B] block mb-1">Email</label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full h-[40px] px-3 rounded-[8px] bg-[#F4F4F2] border border-[#E7E5E2] text-[#6B6B6B] cursor-not-allowed outline-none"
              />
            </div>

            <div>
              <label className="text-[#6B6B6B] block mb-1">Phone Number</label>
              <input
                type="tel"
                placeholder="+91..."
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full h-[40px] px-3 rounded-[8px] bg-[#F7F7F5] border border-[#E7E5E2] outline-none focus:border-[#171717]"
              />
            </div>

            <div>
              <label className="text-[#6B6B6B] block mb-1">Avatar Image URL</label>
              <input
                type="url"
                placeholder="https://..."
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                className="w-full h-[40px] px-3 rounded-[8px] bg-[#F7F7F5] border border-[#E7E5E2] outline-none focus:border-[#171717]"
              />
            </div>
          </div>
        </div>

        {/* Password */}
        <div className="bg-[#FFFFFF] rounded-[12px] border border-[#E7E5E2] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] space-y-4">
          <h3 className="text-[15px] font-medium text-[#171717] pb-3 border-b border-[#E7E5E2]">
            Change Password (Optional)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[13px]">
            <div>
              <label className="text-[#6B6B6B] block mb-1">New Password</label>
              <input
                type="password"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-[40px] px-3 rounded-[8px] bg-[#F7F7F5] border border-[#E7E5E2] outline-none focus:border-[#171717]"
              />
            </div>

            <div>
              <label className="text-[#6B6B6B] block mb-1">Confirm New Password</label>
              <input
                type="password"
                placeholder="Repeat password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full h-[40px] px-3 rounded-[8px] bg-[#F7F7F5] border border-[#E7E5E2] outline-none focus:border-[#171717]"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={updating}
          className="h-[42px] px-[18px] bg-[#171717] hover:bg-[#262626] text-white text-[14px] font-medium rounded-[8px] transition-colors active:scale-95 disabled:opacity-50"
        >
          {updating ? 'Saving...' : 'Save Profile Changes'}
        </button>
      </form>
    </div>
  );
};

export default ProfilePage;
