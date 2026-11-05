import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, PlusCircle, AlertCircle, ArrowRight } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const AddService = () => {
  const navigate = useNavigate();
  const { provider } = useAuth();

  const [categories, setCategories] = useState([]);
  const [loadingCats, setLoadingCats] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    categoryId: '',
    title: '',
    description: '',
    price: '',
    estimatedDuration: '1-2 hours',
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCats(true);
        const res = await api.get('/categories');
        if (res.data.success) {
          setCategories(res.data.categories);
          if (res.data.categories.length > 0) {
            setFormData((prev) => ({ ...prev, categoryId: res.data.categories[0]._id }));
          }
        }
      } catch (err) {
        console.error('Failed to load categories:', err);
      } finally {
        setLoadingCats(false);
      }
    };

    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.categoryId) {
      setError('Please select a valid service category.');
      return;
    }

    if (Number(formData.price) <= 0) {
      setError('Price must be greater than 0.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post('/services', {
        ...formData,
        price: Number(formData.price),
      });

      if (res.data.success) {
        navigate('/provider/services', { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create service.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingCats) return <LoadingSpinner text="Loading service categories..." />;

  // Enforce approved provider rule
  if (provider?.verificationStatus !== 'approved') {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="p-6 bg-amber-50 border border-amber-200 rounded-3xl text-amber-900">
          <AlertCircle size={32} className="mx-auto text-amber-600 mb-2" />
          <h2 className="text-base font-bold">Verification In Progress</h2>
          <p className="text-xs text-amber-800 mt-1">
            Only verified providers can publish new services to the ServeEase platform. Your profile is currently pending approval.
          </p>
        </div>
        <Link to="/provider/dashboard" className="inline-block px-4 py-2 bg-navy-900 text-white rounded-xl text-xs font-bold">
          ← Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link
        to="/provider/services"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-teal-600"
      >
        <ChevronLeft size={16} /> Back to My Services
      </Link>

      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xs">
        <h1 className="text-xl font-black text-navy-900 mb-1">Create a New Service Offering</h1>
        <p className="text-xs text-slate-500 mb-6">
          Specify transparent pricing, category, and what clients receive.
        </p>

        {error && (
          <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl flex items-start gap-2">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Service Category
            </label>
            <select
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Service Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Jet Pump AC Foam Cleaning, Main Distribution Box Repair..."
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Standard Price (₹ INR)
              </label>
              <input
                type="number"
                min="1"
                required
                placeholder="499"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-navy-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Estimated Duration
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 1-2 hours, 45 mins"
                value={formData.estimatedDuration}
                onChange={(e) => setFormData({ ...formData, estimatedDuration: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Service Scope & Detailed Description
            </label>
            <textarea
              rows="4"
              required
              placeholder="Explain the specific tools, process, and parts checked during this service..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 leading-relaxed"
            ></textarea>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <Link
              to="/provider/services"
              className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-60"
            >
              <PlusCircle size={15} /> {submitting ? 'Publishing...' : 'Publish Service'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddService;

