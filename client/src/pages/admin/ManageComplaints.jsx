import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle2, AlertCircle, Save, MessageSquare } from 'lucide-react';
import api from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

const ManageComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Selected complaint for review
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [status, setStatus] = useState('Open');
  const [adminResponse, setAdminResponse] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const res = await api.get('/complaints');
      if (res.data.success) {
        setComplaints(res.data.complaints);
      }
    } catch (err) {
      console.error('Failed to load complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const openReviewModal = (comp) => {
    setSelectedComplaint(comp);
    setStatus(comp.status);
    setAdminResponse(comp.adminResponse || '');
  };

  const handleUpdateComplaint = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await api.patch(`/complaints/${selectedComplaint._id}/status`, {
        status,
        adminResponse,
      });
      if (res.data.success) {
        setMessage('Complaint resolution note saved.');
        setSelectedComplaint(null);
        fetchComplaints();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update complaint.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner text="Retrieving customer support complaints..." />;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-navy-900">Support Grievance Desk</h1>
        <p className="text-xs text-slate-500 mt-1">
          Review customer service complaints, investigate disputes, and provide resolution notes.
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

      {complaints.length === 0 ? (
        <EmptyState
          icon={AlertTriangle}
          title="No open complaints"
          description="Great job! There are currently no customer disputes or complaints requiring admin review."
        />
      ) : (
        <div className="space-y-4">
          {complaints.map((c) => (
            <div
              key={c._id}
              className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-400">
                    Booking #{c.bookingId?.bookingId}
                  </span>
                  <StatusBadge status={c.status} />
                </div>
                <span className="text-[10px] text-slate-400">
                  Filed on {new Date(c.createdAt).toLocaleString()}
                </span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-navy-900">{c.subject}</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                  "{c.description}"
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                <div>
                  Customer: <strong className="text-slate-800">{c.customerId?.name}</strong> ({c.customerId?.phone})
                  &middot; Provider: <strong className="text-slate-800">{c.bookingId?.providerId?.businessName}</strong>
                </div>
                <button
                  onClick={() => openReviewModal(c)}
                  className="px-3.5 py-1.5 bg-navy-900 hover:bg-navy-800 text-white rounded-xl text-xs font-bold transition-colors"
                >
                  Manage / Resolve
                </button>
              </div>

              {c.adminResponse && (
                <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-xs text-teal-900">
                  <strong className="block text-[11px] text-teal-800 uppercase tracking-wider mb-0.5">
                    Admin Resolution Note:
                  </strong>
                  <span>{c.adminResponse}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full p-6 rounded-3xl shadow-xl">
            <h3 className="text-base font-bold text-navy-900 mb-1">Grievance Ticket Resolution</h3>
            <p className="text-xs text-slate-500 mb-4">
              Ticket for booking #{selectedComplaint.bookingId?.bookingId}
            </p>

            <form onSubmit={handleUpdateComplaint} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Ticket Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="Open">Open</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Dismissed">Dismissed</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Admin Response / Note</label>
                <textarea
                  rows="3"
                  required
                  placeholder="Record investigation findings, compensation offered, or resolution details..."
                  value={adminResponse}
                  onChange={(e) => setAdminResponse(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedComplaint(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-xs disabled:opacity-60"
                >
                  {saving ? 'Saving...' : 'Save Resolution'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageComplaints;

