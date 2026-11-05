import React, { useState, useEffect } from 'react';
import { Star, MessageSquare } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import StarRating from '../../components/common/StarRating';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

const CustomerReviews = () => {
  const { provider } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      if (!provider?._id) return;
      try {
        setLoading(true);
        const res = await api.get(`/reviews/provider/${provider._id}`);
        if (res.data.success) {
          setReviews(res.data.reviews);
        }
      } catch (err) {
        console.error('Failed to load reviews:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [provider?._id]);

  if (loading) return <LoadingSpinner text="Retrieving customer review logs..." />;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-navy-900">Customer Feedback & Ratings</h1>
          <p className="text-xs text-slate-500 mt-1">
            Verified ratings left by customers following completed appointments in Guntur.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border border-slate-200 shadow-xs self-start sm:self-auto">
          <Star size={18} className="text-amber-400 fill-amber-400" />
          <span className="text-base font-black text-navy-900">
            {provider?.averageRating?.toFixed(1) || '0.0'}
          </span>
          <span className="text-xs text-slate-400">({reviews.length} total)</span>
        </div>
      </div>

      {reviews.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="No customer reviews yet"
          description="Whenever a client marks an appointment as complete, they have the option to rate your professionalism and craftsmanship."
        />
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div
              key={r._id}
              className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center text-xs">
                    {r.customerId?.name?.charAt(0) || 'C'}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-navy-900">{r.customerId?.name}</h3>
                    <span className="text-[10px] text-slate-400">Verified Client</span>
                  </div>
                </div>
                <span className="text-[10px] text-slate-400">
                  {new Date(r.createdAt).toLocaleDateString()}
                </span>
              </div>

              <div className="pt-1">
                <StarRating rating={r.rating} size={14} />
              </div>

              <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                "{r.comment}"
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomerReviews;

