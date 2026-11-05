import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Clock,
  Star,
  ShieldCheck,
  MapPin,
  CheckCircle2,
  Calendar,
  ArrowRight,
  User,
  Phone,
  Briefcase,
  ChevronLeft,
} from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StarRating from '../../components/common/StarRating';

const ServiceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServiceData = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/services/${id}`);
        if (res.data.success) {
          setService(res.data.service);
          if (res.data.service.providerId?._id) {
            const revRes = await api.get(`/reviews/provider/${res.data.service.providerId._id}`);
            if (revRes.data.success) {
              setReviews(revRes.data.reviews);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load service details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchServiceData();
  }, [id]);

  if (loading) return <LoadingSpinner text="Loading service details..." />;
  if (!service) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-navy-900 mb-2">Service Not Found</h2>
        <p className="text-xs text-slate-500 mb-6">This service may have been deactivated or removed.</p>
        <Link to="/services" className="px-4 py-2 bg-teal-600 text-white rounded-xl text-xs font-bold">
          ← Back to Services
        </Link>
      </div>
    );
  }

  const provider = service.providerId;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Breadcrumb Navigation */}
      <div className="mb-6 flex items-center gap-2 text-xs text-slate-500 font-medium">
        <Link to="/services" className="hover:text-teal-600 flex items-center gap-1">
          <ChevronLeft size={14} /> All Services
        </Link>
        <span>/</span>
        <span className="text-slate-700 truncate">{service.categoryId?.name}</span>
        <span>/</span>
        <span className="text-navy-900 font-bold truncate">{service.title}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Service Content */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xs">
            <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-1 text-xs font-bold bg-teal-50 text-teal-800 rounded-lg border border-teal-200">
                {service.categoryId?.name}
              </span>
              <span className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                <Clock size={13} /> {service.estimatedDuration}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-navy-900 mb-4 leading-tight">
              {service.title}
            </h1>

            <div className="border-t border-b border-slate-100 py-4 my-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-xs text-slate-400 block font-medium">Standard Service Fee</span>
                <span className="text-3xl font-black text-teal-600">₹{service.price}</span>
              </div>
              <Link
                to={`/book/${service._id}`}
                className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md shadow-teal-600/20 flex items-center gap-2"
              >
                Book Appointment <ArrowRight size={16} />
              </Link>
            </div>

            <h3 className="text-sm font-bold text-navy-900 uppercase tracking-wider mb-2">
              Service Scope & Details
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line mb-6">
              {service.description}
            </p>

            <h3 className="text-sm font-bold text-navy-900 uppercase tracking-wider mb-3">
              What's Included:
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-teal-600 shrink-0" />
                <span>Thorough on-site diagnosis & problem evaluation</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-teal-600 shrink-0" />
                <span>Professional grade tools & certified labor</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-teal-600 shrink-0" />
                <span>Transparent billing with no hidden fees</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-teal-600 shrink-0" />
                <span>ServeEase service quality guarantee</span>
              </div>
            </div>
          </div>

          {/* Customer Reviews for this Provider */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xs">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-bold text-navy-900">Customer Reviews</h3>
                <p className="text-xs text-slate-400 mt-0.5">Verified feedback from previous clients</p>
              </div>
              <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                <Star size={16} className="text-amber-400 fill-amber-400" />
                <span className="text-sm font-black text-navy-900">{provider?.averageRating?.toFixed(1) || '5.0'}</span>
                <span className="text-xs text-slate-400">({reviews.length})</span>
              </div>
            </div>

            {reviews.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center italic">
                No reviews yet for this provider. Book this service and be the first to share your experience!
              </p>
            ) : (
              <div className="space-y-4">
                {reviews.map((r) => (
                  <div key={r._id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center text-xs">
                          {r.customerId?.name?.charAt(0) || 'C'}
                        </div>
                        <span className="text-xs font-bold text-slate-800">{r.customerId?.name}</span>
                      </div>
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

        {/* Sidebar: Provider Card */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 block mb-2">
              Assigned Specialist
            </span>

            <div className="flex items-center gap-3.5 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-navy-900 text-teal-400 font-extrabold flex items-center justify-center text-xl shadow-sm">
                {provider?.businessName?.charAt(0) || 'P'}
              </div>
              <div>
                <h3 className="text-sm font-bold text-navy-900 leading-tight">
                  {provider?.businessName}
                </h3>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.2 rounded-full border border-emerald-200 mt-1">
                  <ShieldCheck size={12} /> Verified Provider
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              {provider?.description}
            </p>

            <div className="space-y-2.5 text-xs text-slate-600 pt-3 border-t border-slate-100 mb-5">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Experience</span>
                <span className="font-bold text-slate-800">{provider?.experience}+ Years in Field</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Rating</span>
                <span className="font-bold text-slate-800">{provider?.averageRating?.toFixed(1) || '0.0'} / 5.0</span>
              </div>
              <div className="flex items-start justify-between gap-2">
                <span className="text-slate-400 shrink-0">Locations</span>
                <span className="font-semibold text-slate-800 text-right">
                  {provider?.serviceAreas?.join(', ')}
                </span>
              </div>
            </div>

            <div className="pt-2">
              <Link
                to={`/providers/${provider?._id}`}
                className="w-full block text-center py-2.5 text-xs font-bold text-navy-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors mb-3"
              >
                View Full Provider Profile
              </Link>
              <Link
                to={`/book/${service._id}`}
                className="w-full block text-center py-3 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition-colors shadow-md shadow-teal-600/20"
              >
                Proceed to Booking
              </Link>
            </div>
          </div>

          {/* Customer Protection Banner */}
          <div className="p-5 bg-navy-900 text-white rounded-3xl shadow-sm space-y-3">
            <h4 className="text-xs font-bold text-teal-400 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck size={16} /> ServeEase Guarantee
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Pay upon job completion via cash or instant UPI. Enjoy verified professionals and dedicated grievance support in Guntur.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetails;

