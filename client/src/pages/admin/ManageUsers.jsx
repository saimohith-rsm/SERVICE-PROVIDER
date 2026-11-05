import React, { useState, useEffect } from 'react';
import { Users, Search, CheckCircle2, XCircle, ShieldCheck, UserCheck, Phone, Mail } from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (roleFilter !== 'all') params.append('role', roleFilter);
      if (search.trim()) params.append('search', search.trim());
      params.append('limit', 50);

      const res = await api.get(`/users?${params.toString()}`);
      if (res.data.success) {
        setUsers(res.data.users);
      }
    } catch (err) {
      console.error('Failed to load user list:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const handleToggleStatus = async (id, currentStatus) => {
    setMessage('');
    setError('');
    try {
      const res = await api.patch(`/users/${id}/toggle-status`);
      if (res.data.success) {
        setUsers((prev) =>
          prev.map((u) => (u._id === id ? { ...u, isActive: !currentStatus } : u))
        );
        setMessage(res.data.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to toggle status.');
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-navy-900">User Management Directory</h1>
        <p className="text-xs text-slate-500 mt-1">
          Inspect customer and provider profiles, verify accounts, or toggle platform access.
        </p>
      </div>

      {message && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600" />
            <span>{message}</span>
          </div>
          <button onClick={() => setMessage('')} className="text-emerald-600 font-bold">✕</button>
        </div>
      )}

      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold rounded-2xl flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError('')} className="text-rose-600 font-bold">✕</button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex gap-2">
          {['all', 'customer', 'provider', 'admin'].map((role) => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                roleFilter === role
                  ? 'bg-navy-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {role}
            </button>
          ))}
        </div>

        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-64">
          <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, email, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </form>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading users..." />
      ) : users.length === 0 ? (
        <EmptyState title="No users found" description="No users match the selected role or search." />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs divide-y divide-slate-100 overflow-hidden">
          {users.map((u) => (
            <div key={u._id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-navy-900 font-black flex items-center justify-center text-sm">
                  {u.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-bold text-navy-900">{u.name}</h3>
                    <span className="px-2 py-0.2 text-[10px] font-bold uppercase rounded bg-slate-100 text-slate-700">
                      {u.role}
                    </span>
                    <span
                      className={`px-1.5 py-0.2 text-[9px] font-bold rounded-full ${
                        u.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                      }`}
                    >
                      {u.isActive ? 'Active' : 'Deactivated'}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 mt-1">
                    <span className="flex items-center gap-1">
                      <Mail size={12} /> {u.email}
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone size={12} /> {u.phone}
                    </span>
                    <span>Joined: {new Date(u.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {u.role !== 'admin' && (
                <button
                  onClick={() => handleToggleStatus(u._id, u.isActive)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors self-start sm:self-auto ${
                    u.isActive
                      ? 'border border-rose-200 text-rose-600 hover:bg-rose-50'
                      : 'bg-emerald-600 text-white hover:bg-emerald-700'
                  }`}
                >
                  {u.isActive ? 'Deactivate' : 'Activate Account'}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageUsers;

