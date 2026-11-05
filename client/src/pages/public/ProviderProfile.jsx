import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ShieldCheck,
  Star,
  Clock,
  MapPin,
  Calendar,
  Briefcase,
  Award,
  ChevronLeft,
  ArrowRight,
} from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StarRating from '../../components/common/StarRating';

const ProviderProfile = () => {
  const { id } = useParams();
  const [provider, setProvider] = useState(null);
  const [services, setServices] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProviderData = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/providers/${id}`);
        if (res.data.success) {
          setProvider(res.data.provider);
          setServices(res.data.services || []);
          setReviews(res.data.reviews || []);
        }
      } catch (err) {
        console.error('Failed to load provider profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProviderData();
  }, [id]);

  if (loading) return <LoadingSpinner text="Loading provider credentials..." />;
  if (!provider) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-navy-900 mb-2">Provider Not Found</h2>
        <Link to="/services" className="px-4 py-2 bg-teal-600 text-white rounded-xl text-xs font-bold">
          ← Back to Services
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <Link to="/services" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-teal-600 mb-6">
        <ChevronLeft size={16} /> Back to Search
      </Link>

      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-navy-900 text-teal-400 font-black flex items-center justify-center text-2xl shadow-md shrink-0">
              {provider.businessName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-navy-900">
                  {provider.businessName}
                </h1>
                {provider.verificationStatus === 'approved' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <ShieldCheck size={13} /> Verified Partner
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed mb-3">
                {provider.description}
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 font-medium">
                <div className="flex items-center gap-1.5">
                  <Award size={14} className="text-teal-600" />
                  <span>{provider.experience}+ Years Experience</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin size={14} className="text-teal-600" />
                  <span>{provider.serviceAreas?.join(', ')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Rating Pill */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center sm:text-right shrink-0 w-full sm:w-auto">
            <div className="flex items-center justify-center sm:justify-end gap-1.5 text-amber-500 font-black text-lg mb-1">
              <Star size={20} className="fill-amber-400" />
              <span>{provider.averageRating?.toFixed(1) || '0.0'}</span>
            </div>
            <p className="text-xs text-slate-400 font-semibold">
              Based on {provider.totalReviews || 0} reviews
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Services Offered */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-lg font-bold text-navy-900 flex items-center gap-2">
            <Briefcase size={18} className="text-teal-600" /> Services by {provider.businessName}
          </h2>

          {services.length === 0 ? (
            <div className="p-8 bg-white border border-slate-200 rounded-2xl text-center text-xs text-slate-400">
              This provider hasn't published any active services yet.
            </div>
          ) : (
            <div className="space-y-4">
              {services.map((service) => (
                <div
                  key={service._id}
                  className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-teal-500 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-teal-50 text-teal-800 rounded">
                        {service.categoryId?.name}
                      </span>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Clock size={12} /> {service.estimatedDuration}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-navy-900 mb-1">{service.title}</h3>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {service.description}
                    </p>
                  </div>
                  <div className="flex items-center justify-between sm:flex-col sm:items-end gap-3 shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <span className="text-lg font-black text-navy-900">₹{service.price}</span>
                    <Link
                      to={`/book/${service._id}`}
                      className="px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition-colors shadow-xs flex items-center gap-1.5"
                    >
                      Book <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Reviews List */}
          <div className="pt-6">
            <h2 className="text-lg font-bold text-navy-900 mb-4 flex items-center gap-2">
              <Star size={18} className="text-amber-500 fill-amber-400" /> Client Reviews ({reviews.length})
            </h2>

            {reviews.length === 0 ? (
              <p className="p-6 bg-white border border-slate-200 rounded-2xl text-xs text-slate-400 text-center">
                No customer reviews yet.
              </p>
            ) : (
              <div className="space-y-3">
                {reviews.map((r) => (
                  <div key={r._id} className="p-4 bg-white border border-slate-200 rounded-2xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-800">{r.customerId?.name}</span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="mb-2">
                      <StarRating rating={r.rating} size={12} />
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{r.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Schedule & Working Hours */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-navy-900 mb-4 flex items-center gap-2">
              <Calendar size={15} className="text-teal-600" /> Working Schedule
            </h3>

            <div className="space-y-3 text-xs mb-6">
              <div>
                <span className="text-slate-400 block text-[11px] font-medium mb-1.5">Operating Days</span>
                <div className="flex flex-wrap gap-1.5">
                  {(provider.availability?.days || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']).map(
                    (day) => (
                      <span key={day} className="px-2 py-0.5 bg-slate-100 text-slate-700 font-semibold rounded-md text-[11px]">
                        {day.slice(0, 3)}
                      </span>
                    )
                  )}
                </div>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px] font-medium mb-1.5">Available Daily Time Slots</span>
                <div className="space-y-1.5">
                  {(provider.availability?.timeSlots || ['09:00 AM - 11:00 AM', '11:00 AM - 01:00 PM', '02:00 PM - 04:00 PM', '04:00 PM - 06:00 PM']).map(
                    (slot) => (
                      <div key={slot} className="px-3 py-1.5 bg-teal-50/60 text-teal-900 font-semibold rounded-lg text-xs border border-teal-100 flex items-center gap-2">
                        <Clock size={12} className="text-teal-600" /> {slot}
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>

            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
              <span className="text-xs font-bold text-emerald-800 flex items-center justify-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                Currently Accepting Appointments
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderProfile;

