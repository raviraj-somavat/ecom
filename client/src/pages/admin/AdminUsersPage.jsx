import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Search, Trash2 } from 'lucide-react';
import { authApi } from '../../api/client';
import LoadingSpinner from '../../components/LoadingSpinner';

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await authApi.getUsers({ keyword, limit: 100 });
      if (res.data.success) {
        setUsers(res.data.users);
      }
    } catch (err) {
      console.error('Error fetching admin users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [keyword]);

  const handleRoleToggle = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    if (!window.confirm(`Set this user's role to "${newRole}"?`)) return;

    try {
      setUpdatingId(userId);
      const res = await authApi.updateUserRole(userId, { role: newRole });
      if (res.data.success) {
        setUsers((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u))
        );
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user role');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Delete this user?')) return;

    try {
      setUpdatingId(userId);
      const res = await authApi.deleteUser(userId);
      if (res.data.success) {
        alert('User deleted');
        fetchUsers();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete user');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E7E5E2]">
        <div>
          <Link
            to="/admin"
            className="inline-flex items-center gap-1.5 text-[13px] text-[#6B6B6B] hover:text-[#171717] mb-1"
          >
            <ArrowLeft size={14} /> Back to Dashboard
          </Link>
          <h1 className="text-[28px] sm:text-[32px] font-medium text-[#171717] tracking-tight">
            User Accounts
          </h1>
        </div>
      </div>

      {/* Search toolbar */}
      <div className="bg-[#FFFFFF] p-3 rounded-[8px] border border-[#E7E5E2] max-w-sm">
        <div className="relative">
          <input
            type="text"
            placeholder="Search users..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="w-full pl-8 pr-3 h-[36px] text-[13px] bg-[#F7F7F5] border border-[#E7E5E2] rounded-[6px] outline-none focus:border-[#171717]"
          />
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#6B6B6B]" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#FFFFFF] rounded-[12px] border border-[#E7E5E2] shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Loading user accounts..." />
        ) : users.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead className="bg-[#F7F7F5] text-[#6B6B6B] border-b border-[#E7E5E2] text-[12px]">
                <tr>
                  <th className="py-3 px-4">Account</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7E5E2]">
                {users.map((u) => {
                  const isBusy = updatingId === u._id;

                  return (
                    <tr key={u._id} className="hover:bg-[#F7F7F5] transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-medium text-[#171717] block">{u.name}</span>
                        <span className="text-[11px] text-[#6B6B6B]">{u.email}</span>
                      </td>

                      <td className="py-3 px-4 text-[#6B6B6B]">{u.phone || '—'}</td>

                      <td className="py-3 px-4">
                        <span
                          className={`h-[22px] px-2 rounded-[5px] text-[11px] font-medium inline-flex items-center ${
                            u.verified
                              ? 'bg-[#EBF4EE] text-[#2A5A3C]'
                              : 'bg-[#FDF3E7] text-[#E86A33]'
                          }`}
                        >
                          {u.verified ? 'Verified' : 'Pending OTP'}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="text-[12px] font-medium text-[#171717] capitalize">
                          {u.role}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            disabled={isBusy}
                            onClick={() => handleRoleToggle(u._id, u.role)}
                            className="h-[30px] px-2.5 rounded-[6px] border border-[#E7E5E2] text-[11px] font-medium text-[#171717] hover:bg-[#F2F1EE]"
                          >
                            Set as {u.role === 'admin' ? 'User' : 'Admin'}
                          </button>
                          <button
                            disabled={isBusy}
                            onClick={() => handleDeleteUser(u._id)}
                            className="text-[#6B6B6B] hover:text-[#B9382F] p-1"
                            title="Delete"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-[#6B6B6B] text-[13px]">No users found.</div>
        )}
      </div>
    </div>
  );
};

export default AdminUsersPage;
