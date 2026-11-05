import React, { useState, useEffect } from 'react';
import { Star, Edit3, Trash2, Calendar, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import StarRating from '../../components/common/StarRating';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

const MyReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingReview, setEditingReview] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await api.get('/reviews/my');
      if (res.data.success) {
        setReviews(res.data.reviews);
      }
    } catch (err) {
      console.error('Failed to load my reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleEditClick = (review) => {
    setEditingReview(review);
    setRating(review.rating);
    setComment(review.comment);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await api.put(`/reviews/${editingReview._id}`, { rating, comment });
      if (res.data.success) {
        setMessage('Review updated successfully!');
        setEditingReview(null);
        fetchReviews();
      }
    } catch (err) {
      console.error('Failed to update review:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      const res = await api.delete(`/reviews/${id}`);
      if (res.data.success) {
        setMessage('Review deleted successfully.');
        setReviews((prev) => prev.filter((r) => r._id !== id));
      }
    } catch (err) {
      console.error('Failed to delete review:', err);
    }
  };

  if (loading) return <LoadingSpinner text="Loading your submitted reviews..." />;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-navy-900">My Written Reviews</h1>
        <p className="text-xs text-slate-500 mt-1">
          Feedback and ratings you've posted for verified service specialists in Guntur.
        </p>
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

      {reviews.length === 0 ? (
        <EmptyState
          title="No reviews posted yet"
          description="Reviews are enabled once you complete an appointment with a service specialist."
          actionText="Browse My Bookings"
          onAction={() => (window.location.href = '/customer/bookings')}
        />
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div
              key={r._id}
              className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-navy-900">
                    {r.providerId?.businessName || 'Service Provider'}
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    Service: {r.bookingId?.serviceId?.title || 'Home Service'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEditClick(r)}
                    className="p-1.5 text-slate-400 hover:text-teal-600 rounded-lg hover:bg-slate-50 transition-colors"
                    title="Edit review"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(r._id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-50 transition-colors"
                    title="Delete review"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <StarRating rating={r.rating} size={14} />
                <span className="text-[11px] text-slate-400">
                  {new Date(r.createdAt).toLocaleDateString()}
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/70 p-3.5 rounded-2xl border border-slate-100">
                "{r.comment}"
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Edit Review Modal */}
      {editingReview && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full p-6 rounded-3xl shadow-xl">
            <h3 className="text-base font-bold text-navy-900 mb-1">Edit Your Review</h3>
            <p className="text-xs text-slate-500 mb-4">
              Updating your review for {editingReview.providerId?.businessName}.
            </p>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Rating</label>
                <StarRating rating={rating} size={22} interactive={true} onRate={setRating} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Comment</label>
                <textarea
                  rows="3"
                  required
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
                ></textarea>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingReview(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-xs disabled:opacity-60"
                >
                  {saving ? 'Saving...' : 'Update Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyReviews;

