import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, Save, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const EditService = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    categoryId: '',
    title: '',
    description: '',
    price: '',
    estimatedDuration: '',
    isActive: true,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [catRes, srvRes] = await Promise.all([
          api.get('/categories'),
          api.get(`/services/${id}`),
        ]);

        if (catRes.data.success) setCategories(catRes.data.categories);
        if (srvRes.data.success) {
          const s = srvRes.data.service;
          setFormData({
            categoryId: s.categoryId?._id || s.categoryId,
            title: s.title,
            description: s.description,
            price: s.price,
            estimatedDuration: s.estimatedDuration,
            isActive: s.isActive,
          });
        }
      } catch (err) {
        setError('Failed to load service data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      setSaving(true);
      const res = await api.put(`/services/${id}`, {
        ...formData,
        price: Number(formData.price),
      });

      if (res.data.success) {
        navigate('/provider/services', { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update service.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner text="Retrieving service data..." />;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link
        to="/provider/services"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-teal-600"
      >
        <ChevronLeft size={16} /> Back to My Services
      </Link>

      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xs">
        <h1 className="text-xl font-black text-navy-900 mb-1">Edit Service Offering</h1>
        <p className="text-xs text-slate-500 mb-6">
          Update service information, pricing rates, or availability status.
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
                value={formData.estimatedDuration}
                onChange={(e) => setFormData({ ...formData, estimatedDuration: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Service Description
            </label>
            <textarea
              rows="4"
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
            ></textarea>
          </div>

          <div>
            <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 text-teal-600 rounded"
              />
              <span>Service is active and visible in customer search results</span>
            </label>
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
              disabled={saving}
              className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-60"
            >
              <Save size={15} /> {saving ? 'Saving Changes...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditService;

