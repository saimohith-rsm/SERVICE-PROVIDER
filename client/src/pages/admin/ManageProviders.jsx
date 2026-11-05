import React, { useState, useEffect } from 'react';
import { ShieldCheck, ShieldAlert, CheckCircle2, XCircle, Search, MapPin, Award, Phone } from 'lucide-react';
import api from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

const ManageProviders = () => {
  const [providers, setProviders] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchProviders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (search.trim()) params.append('search', search.trim());

      const res = await api.get(`/admin/providers?${params.toString()}`);
      if (res.data.success) {
        setProviders(res.data.providers);
      }
    } catch (err) {
      console.error('Failed to load admin providers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, [statusFilter]);

  const handleUpdateVerification = async (id, newStatus) => {
    setMessage('');
    setError('');
    try {
      const res = await api.patch(`/admin/providers/${id}/verification`, {
        status: newStatus,
        note: `Verification updated to ${newStatus} by administrator.`,
      });
      if (res.data.success) {
        setMessage(`Provider marked as '${newStatus}' successfully!`);
        fetchProviders();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update verification status.');
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProviders();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-navy-900">Provider Verification & Approvals</h1>
        <p className="text-xs text-slate-500 mt-1">
          Review service partner applications, inspect credentials, and manage platform permissions.
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
          <div className="flex items-center gap-2">
            <ShieldAlert size={16} className="text-rose-600" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError('')} className="text-rose-600 font-bold">✕</button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex gap-2 overflow-x-auto w-full sm:w-auto">
          {['all', 'pending', 'approved', 'rejected'].map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                statusFilter === tab
                  ? 'bg-navy-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-64">
          <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search provider..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </form>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading provider directory..." />
      ) : providers.length === 0 ? (
        <EmptyState
          title="No providers found"
          description="No service providers match the current filter criteria."
        />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs divide-y divide-slate-100 overflow-hidden">
          {providers.map((p) => (
            <div key={p._id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-slate-50/60 transition-colors">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2.5">
                  <h3 className="text-base font-black text-navy-900">{p.businessName}</h3>
                  <StatusBadge status={p.verificationStatus} />
                </div>

                <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                  {p.description}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                  <span>
                    Contact: <strong className="text-slate-800">{p.userId?.name}</strong> ({p.userId?.email})
                  </span>
                  <span className="flex items-center gap-1 text-slate-800 font-semibold">
                    <Phone size={12} className="text-teal-600" /> {p.userId?.phone}
                  </span>
                  <span className="flex items-center gap-1 font-semibold text-slate-800">
                    <Award size={12} className="text-teal-600" /> {p.experience}+ Yrs Exp
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin size={12} className="text-teal-600" /> {p.serviceAreas?.join(', ')}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                {p.verificationStatus !== 'approved' && (
                  <button
                    onClick={() => handleUpdateVerification(p._id, 'approved')}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5"
                  >
                    <CheckCircle2 size={14} /> Approve Provider
                  </button>
                )}

                {p.verificationStatus !== 'rejected' && (
                  <button
                    onClick={() => handleUpdateVerification(p._id, 'rejected')}
                    className="px-4 py-2 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                  >
                    <XCircle size={14} /> Reject
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageProviders;

