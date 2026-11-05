import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Edit3, Trash2, Clock, CheckCircle2, AlertCircle, Briefcase } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

const ManageServices = () => {
  const { provider } = useAuth();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchServices = async () => {
    try {
      setLoading(true);
      const res = await api.get('/services/provider/my');
      if (res.data.success) {
        setServices(res.data.services);
      }
    } catch (err) {
      console.error('Failed to load provider services:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleToggleActive = async (id, currentStatus) => {
    setMessage('');
    setError('');
    try {
      const res = await api.put(`/services/${id}`, { isActive: !currentStatus });
      if (res.data.success) {
        setServices((prev) =>
          prev.map((s) => (s._id === id ? { ...s, isActive: !currentStatus } : s))
        );
        setMessage(`Service status toggled successfully.`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update service.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return;
    setMessage('');
    setError('');
    try {
      const res = await api.delete(`/services/${id}`);
      if (res.data.success) {
        setServices((prev) => prev.filter((s) => s._id !== id));
        setMessage('Service removed successfully.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete service.');
    }
  };

  const isApproved = provider?.verificationStatus === 'approved';

  if (loading) return <LoadingSpinner text="Loading published service catalog..." />;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-navy-900">Manage Services</h1>
          <p className="text-xs text-slate-500 mt-1">
            Create, update pricing, and set availability for your service listings.
          </p>
        </div>

        {isApproved ? (
          <Link
            to="/provider/services/add"
            className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 self-start sm:self-auto"
          >
            <PlusCircle size={15} /> Add New Service
          </Link>
        ) : (
          <span className="px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs font-bold">
            Approval required to publish services
          </span>
        )}
      </div>

      {message && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600" />
            <span>{message}</span>
          </div>
          <button onClick={() => setMessage('')} className="text-emerald-600">✕</button>
        </div>
      )}

      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="text-rose-600" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError('')} className="text-rose-600">✕</button>
        </div>
      )}

      {services.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No services added yet"
          description="Create your first service offering (e.g. electrical inspection, pipe leak repair, AC cleaning) so customers in Guntur can discover and book you."
          actionText={isApproved ? 'Create Service Now' : null}
          onAction={() => (window.location.href = '/provider/services/add')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <div
              key={service._id}
              className={`bg-white rounded-3xl border shadow-xs flex flex-col justify-between overflow-hidden transition-all ${
                service.isActive ? 'border-slate-200/90' : 'border-slate-200 opacity-60'
              }`}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-0.5 text-[10px] font-bold bg-teal-50 text-teal-800 rounded-md border border-teal-200">
                    {service.categoryId?.name}
                  </span>
                  <span
                    className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                      service.isActive
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {service.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <h3 className="text-base font-bold text-navy-900 mb-1.5">{service.title}</h3>
                <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed mb-4">
                  {service.description}
                </p>

                <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-100">
                  <span className="text-slate-400 flex items-center gap-1 font-medium">
                    <Clock size={12} /> {service.estimatedDuration}
                  </span>
                  <span className="text-lg font-black text-navy-900">₹{service.price}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => handleToggleActive(service._id, service.isActive)}
                  className="text-xs font-semibold text-slate-600 hover:text-navy-900"
                >
                  {service.isActive ? 'Deactivate' : 'Activate'}
                </button>

                <div className="flex items-center gap-2">
                  <Link
                    to={`/provider/services/edit/${service._id}`}
                    className="p-1.5 text-slate-500 hover:text-teal-600 rounded-lg hover:bg-white transition-colors"
                    title="Edit Service"
                  >
                    <Edit3 size={16} />
                  </Link>
                  <button
                    onClick={() => handleDelete(service._id)}
                    className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-white transition-colors"
                    title="Delete Service"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageServices;

