import React, { useState, useEffect } from 'react';
import { Grid, PlusCircle, Edit3, Trash2, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const ManageCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Add/Edit Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await api.get('/categories?includeInactive=true');
      if (res.data.success) {
        setCategories(res.data.categories);
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setName('');
    setDescription('');
    setModalOpen(true);
  };

  const openEditModal = (cat) => {
    setEditingId(cat._id);
    setName(cat.name);
    setDescription(cat.description || '');
    setModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      setSubmitting(true);
      if (editingId) {
        const res = await api.put(`/categories/${editingId}`, { name, description });
        if (res.data.success) {
          setMessage('Category updated successfully!');
        }
      } else {
        const res = await api.post('/categories', { name, description });
        if (res.data.success) {
          setMessage('New category created successfully!');
        }
      }
      setModalOpen(false);
      fetchCategories();
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete or deactivate this category?')) return;
    setMessage('');
    setError('');
    try {
      const res = await api.delete(`/categories/${id}`);
      if (res.data.success) {
        setMessage(res.data.message);
        fetchCategories();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove category.');
    }
  };

  if (loading) return <LoadingSpinner text="Loading service categories..." />;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-navy-900">Manage Service Categories</h1>
          <p className="text-xs text-slate-500 mt-1">
            Organize customer discovery categories and taxonomy across Guntur & AP.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 self-start sm:self-auto"
        >
          <PlusCircle size={15} /> Add New Category
        </button>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((c) => (
          <div
            key={c._id}
            className={`bg-white p-6 rounded-3xl border shadow-xs flex flex-col justify-between ${
              c.isActive ? 'border-slate-200/90' : 'border-slate-200 opacity-60'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {c.serviceCount || 0} active services
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    c.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                  }`}
                >
                  {c.isActive ? 'Active' : 'Disabled'}
                </span>
              </div>

              <h3 className="text-base font-bold text-navy-900 mb-1.5">{c.name}</h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">{c.description}</p>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => openEditModal(c)}
                className="p-1.5 text-slate-500 hover:text-teal-600 rounded-lg hover:bg-slate-50"
                title="Edit category"
              >
                <Edit3 size={16} />
              </button>
              <button
                onClick={() => handleDelete(c._id)}
                className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-slate-50"
                title="Delete or deactivate"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full p-6 rounded-3xl shadow-xl">
            <h3 className="text-base font-bold text-navy-900 mb-1">
              {editingId ? 'Edit Category' : 'Create Category'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              {editingId
                ? 'Update category information.'
                : 'Add a new service classification to ServeEase.'}
            </p>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Category Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pest Control, Solar Panel Servicing..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows="3"
                  placeholder="Describe what services are included in this category..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-xs disabled:opacity-60"
                >
                  {submitting ? 'Saving...' : editingId ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageCategories;

