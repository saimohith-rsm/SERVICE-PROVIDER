import React, { useState, useEffect } from 'react';
import { Briefcase, Search, CheckCircle2, AlertCircle, Clock, Trash2 } from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

const AdminManageServices = () => {
  const [services, setServices] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchServices = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/services');
      if (res.data.success) {
        setServices(res.data.services);
      }
    } catch (err) {
      console.error('Failed to load admin services:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleToggleStatus = async (id, currentStatus) => {
    setMessage('');
    setError('');
    try {
      const res = await api.put(`/services/${id}`, { isActive: !currentStatus });
      if (res.data.success) {
        setServices((prev) =>
          prev.map((s) => (s._id === id ? { ...s, isActive: !currentStatus } : s))
        );
        setMessage('Service visibility status updated.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update service.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this service completely from the platform?')) return;
    try {
      const res = await api.delete(`/services/${id}`);
      if (res.data.success) {
        setServices((prev) => prev.filter((s) => s._id !== id));
        setMessage('Service removed.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete service.');
    }
  };

  const filtered = services.filter((s) => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return (
      s.title?.toLowerCase().includes(term) ||
      s.providerId?.businessName?.toLowerCase().includes(term) ||
      s.categoryId?.name?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-navy-900">Platform Services Inventory</h1>
        <p className="text-xs text-slate-500 mt-1">
          Review all services published by service providers across Andhra Pradesh.
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

      <div className="flex items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by service, provider, category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <span className="text-xs text-slate-500 font-medium">
          Showing {filtered.length} of {services.length} services
        </span>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading services..." />
      ) : filtered.length === 0 ? (
        <EmptyState title="No services found" description="No services match your search." />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs divide-y divide-slate-100 overflow-hidden">
          {filtered.map((s) => (
            <div key={s._id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-teal-50 text-teal-800 rounded">
                    {s.categoryId?.name}
                  </span>
                  <span
                    className={`px-1.5 py-0.2 text-[9px] font-bold rounded-full ${
                      s.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {s.isActive ? 'Active' : 'Disabled'}
                  </span>
                </div>
                <h3 className="text-xs font-bold text-navy-900">{s.title}</h3>
                <p className="text-[11px] text-slate-500">
                  Provider: <strong className="text-slate-800">{s.providerId?.businessName}</strong> &middot;{' '}
                  Duration: {s.estimatedDuration}
                </p>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <span className="text-base font-black text-navy-900">₹{s.price}</span>
                <button
                  onClick={() => handleToggleStatus(s._id, s.isActive)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-colors ${
                    s.isActive
                      ? 'border-slate-200 text-slate-600 hover:bg-slate-100'
                      : 'bg-teal-600 text-white hover:bg-teal-700'
                  }`}
                >
                  {s.isActive ? 'Disable' : 'Enable'}
                </button>
                <button
                  onClick={() => handleDelete(s._id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100"
                  title="Delete service"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminManageServices;

