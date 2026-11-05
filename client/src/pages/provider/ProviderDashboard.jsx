import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Briefcase,
  DollarSign,
  Star,
  Clock,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  ShieldAlert,
  ShieldCheck,
  ArrowRight,
  User,
  MapPin,
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StarRating from '../../components/common/StarRating';

const ProviderDashboard = () => {
  const { user, provider } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await api.get('/providers/dashboard/stats');
        if (res.data.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Failed to load provider stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <LoadingSpinner text="Compiling provider dashboard analytics..." />;

  const stats = data?.stats || {};
  const isApproved = stats.verificationStatus === 'approved';

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Verification Status Banner */}
      {!isApproved && (
        <div className="p-5 bg-amber-50 border-2 border-amber-300 rounded-3xl text-amber-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <ShieldAlert size={24} className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold">
                Account Status: Pending Administrative Verification
              </h3>
              <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                Your profile is currently under review by ServeEase administrators. Once approved, your services will automatically appear in customer search results.
              </p>
            </div>
          </div>
          <span className="px-3 py-1 bg-amber-200 text-amber-900 font-bold text-xs rounded-full uppercase tracking-wider shrink-0">
            Pending Approval
          </span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-navy-900 via-navy-850 to-navy-800 text-white p-6 sm:p-8 rounded-3xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-bold text-teal-400 uppercase tracking-wider block mb-1">
            Provider Management Hub
          </span>
          <h1 className="text-2xl sm:text-3xl font-black">
            {provider?.businessName || user?.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-lg">
            Manage incoming appointment requests, track earnings from completed jobs, and update your working hours.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/provider/services/add"
            className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
          >
            <PlusCircle size={15} /> Add New Service
          </Link>
          <Link
            to="/provider/bookings"
            className="px-4 py-2.5 bg-navy-800 hover:bg-navy-750 text-white rounded-xl text-xs font-bold transition-all border border-slate-700 flex items-center gap-1.5"
          >
            <Calendar size={15} /> View Requests
          </Link>
        </div>
      </div>

      {/* 6 Key Performance Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Total Services */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold mb-2">
            <Briefcase size={16} />
          </div>
          <span className="text-2xl font-black text-navy-900 block">{stats.totalServices || 0}</span>
          <span className="text-[11px] text-slate-500 font-medium">Published Services</span>
        </div>

        {/* New Requests */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold mb-2">
            <Clock size={16} />
          </div>
          <span className="text-2xl font-black text-amber-600 block">{stats.newBookingRequests || 0}</span>
          <span className="text-[11px] text-slate-500 font-medium">Pending Requests</span>
        </div>

        {/* Accepted / In Progress */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold mb-2">
            <Calendar size={16} />
          </div>
          <span className="text-2xl font-black text-blue-600 block">{stats.acceptedBookings || 0}</span>
          <span className="text-[11px] text-slate-500 font-medium">Active Appointments</span>
        </div>

        {/* Completed */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold mb-2">
            <CheckCircle2 size={16} />
          </div>
          <span className="text-2xl font-black text-emerald-600 block">{stats.completedBookings || 0}</span>
          <span className="text-[11px] text-slate-500 font-medium">Completed Jobs</span>
        </div>

        {/* Total Earnings */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold mb-2">
            <DollarSign size={16} />
          </div>
          <span className="text-2xl font-black text-purple-700 block">₹{stats.totalEarnings || 0}</span>
          <span className="text-[11px] text-slate-500 font-medium">Total Earned</span>
        </div>

        {/* Rating */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center font-bold mb-2">
            <Star size={16} className="fill-amber-400" />
          </div>
          <span className="text-2xl font-black text-navy-900 block">
            {stats.averageRating?.toFixed(1) || '0.0'}
          </span>
          <span className="text-[11px] text-slate-500 font-medium">{stats.totalReviews || 0} reviews</span>
        </div>
      </div>

      {/* Recent Bookings for this Provider */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-navy-900">Recent Customer Bookings</h2>
            <p className="text-xs text-slate-400">Incoming requests and ongoing jobs</p>
          </div>
          <Link
            to="/provider/bookings"
            className="text-xs font-bold text-teal-600 hover:text-teal-700"
          >
            Manage All ({data?.recentBookings?.length || 0}) →
          </Link>
        </div>

        {(!data?.recentBookings || data.recentBookings.length === 0) ? (
          <div className="p-12 text-center text-xs text-slate-400">
            No booking requests yet. Once customers book your services in Guntur, requests will appear here.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {data.recentBookings.map((b) => (
              <div
                key={b._id}
                className="p-5 hover:bg-slate-50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold text-slate-400">#{b.bookingId}</span>
                    <StatusBadge status={b.bookingStatus} />
                  </div>
                  <h3 className="text-sm font-bold text-navy-900">{b.serviceId?.title}</h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Client: <strong className="text-slate-800">{b.customerId?.name}</strong> &middot;{' '}
                    Phone: {b.customerPhone}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 mt-1.5">
                    <span>📅 {b.bookingDate} ({b.timeSlot})</span>
                    <span>📍 {b.serviceAddress?.street}, {b.serviceAddress?.city}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between md:flex-col md:items-end gap-2 shrink-0">
                  <span className="text-sm font-black text-navy-900">₹{b.finalPrice || b.estimatedPrice}</span>
                  <Link
                    to="/provider/bookings"
                    className="px-3.5 py-1.5 bg-navy-900 text-white rounded-xl text-xs font-bold hover:bg-navy-800"
                  >
                    Manage Status
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Reviews Received */}
      {data?.recentReviews && data.recentReviews.length > 0 && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-navy-900">Recent Customer Ratings</h3>
            <Link to="/provider/reviews" className="text-xs font-bold text-teal-600">
              View All Reviews →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.recentReviews.map((r) => (
              <div key={r._id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">{r.customerId?.name}</span>
                  <StarRating rating={r.rating} size={12} />
                </div>
                <p className="text-xs text-slate-600 italic">"{r.comment}"</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProviderDashboard;

