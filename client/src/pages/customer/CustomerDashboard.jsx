import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Search,
  ArrowRight,
  MapPin,
  ChevronRight,
  ShieldCheck,
  Star,
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const CustomerDashboard = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const res = await api.get('/bookings/my?limit=5');
        if (res.data.success) {
          setBookings(res.data.bookings);
        }
      } catch (err) {
        console.error('Failed to load customer dashboard bookings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Compute stats directly from customer's bookings
  const totalBookings = bookings.length;
  const pendingCount = bookings.filter((b) => b.bookingStatus === 'Pending').length;
  const activeCount = bookings.filter((b) =>
    ['Accepted', 'On The Way', 'In Progress'].includes(b.bookingStatus)
  ).length;
  const completedCount = bookings.filter((b) => b.bookingStatus === 'Completed').length;

  if (loading) return <LoadingSpinner text="Loading your dashboard overview..." />;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-navy-900 to-navy-800 text-white p-6 sm:p-8 rounded-3xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-bold text-teal-400 uppercase tracking-wider block mb-1">
            Customer Dashboard
          </span>
          <h1 className="text-2xl sm:text-3xl font-black">
            Namaste, {user?.name}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-lg">
            Track your ongoing local service requests, browse trusted technicians in Guntur, or review past jobs.
          </p>
        </div>
        <Link
          to="/services"
          className="px-5 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md shadow-teal-600/30 flex items-center gap-2 shrink-0"
        >
          <Search size={16} /> Book New Service
        </Link>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 text-navy-900 flex items-center justify-center font-bold mb-3">
            <Calendar size={18} className="text-teal-600" />
          </div>
          <span className="text-2xl font-black text-navy-900 block">{totalBookings}</span>
          <span className="text-xs text-slate-500 font-medium">Recent Bookings</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold mb-3">
            <Clock size={18} />
          </div>
          <span className="text-2xl font-black text-amber-600 block">{pendingCount}</span>
          <span className="text-xs text-slate-500 font-medium">Pending Confirmation</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold mb-3">
            <AlertCircle size={18} />
          </div>
          <span className="text-2xl font-black text-teal-600 block">{activeCount}</span>
          <span className="text-xs text-slate-500 font-medium">In Progress / Active</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold mb-3">
            <CheckCircle2 size={18} />
          </div>
          <span className="text-2xl font-black text-emerald-600 block">{completedCount}</span>
          <span className="text-xs text-slate-500 font-medium">Completed Jobs</span>
        </div>
      </div>

      {/* Recent Bookings Section */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-navy-900">Your Recent Service Bookings</h2>
            <p className="text-xs text-slate-400">Live status tracking and appointment details</p>
          </div>
          <Link
            to="/customer/bookings"
            className="text-xs font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1"
          >
            All Bookings <ChevronRight size={14} />
          </Link>
        </div>

        {bookings.length === 0 ? (
          <div className="p-12 text-center">
            <Calendar size={36} className="mx-auto text-slate-300 mb-3" />
            <h3 className="text-sm font-bold text-slate-800 mb-1">No bookings yet</h3>
            <p className="text-xs text-slate-500 mb-5 max-w-sm mx-auto">
              You haven't scheduled any local services yet. Browse vetted electricians, plumbers, and technicians.
            </p>
            <Link
              to="/services"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-600 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-teal-700"
            >
              Browse Services Now
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {bookings.map((booking) => (
              <div
                key={booking._id}
                className="p-6 hover:bg-slate-50/60 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 text-teal-700 font-bold flex items-center justify-center shrink-0">
                    <Calendar size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs font-bold text-slate-500">
                        #{booking.bookingId}
                      </span>
                      <StatusBadge status={booking.bookingStatus} />
                    </div>
                    <h3 className="text-sm font-bold text-navy-900">
                      {booking.serviceId?.title || 'Home Service'}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Provider: <strong className="text-slate-800">{booking.providerId?.businessName}</strong>
                    </p>
                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 mt-2">
                      <span className="flex items-center gap-1">
                        <Clock size={12} className="text-teal-600" /> {booking.bookingDate} &middot; {booking.timeSlot}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin size={12} className="text-teal-600" /> {booking.serviceAddress?.street}, {booking.serviceAddress?.city}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between md:flex-col md:items-end gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                  <div className="text-left md:text-right">
                    <span className="text-[10px] text-slate-400 block font-medium">Estimated Amount</span>
                    <span className="text-base font-black text-navy-900">₹{booking.estimatedPrice}</span>
                  </div>
                  <Link
                    to={`/customer/bookings/${booking._id}`}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-navy-900 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
                  >
                    View Status <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Category Discovery Banner */}
      <div className="p-6 bg-white rounded-3xl border border-slate-200/90 shadow-xs">
        <h3 className="text-xs font-bold uppercase tracking-wider text-navy-900 mb-4">
          Quick Service Shortcuts
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Electrician', query: 'Electrician', icon: '⚡' },
            { label: 'Plumbing Works', query: 'Plumbing', icon: '🔧' },
            { label: 'AC Jet Cleaning', query: 'AC', icon: '❄️' },
            { label: 'Home Deep Cleaning', query: 'Cleaning', icon: '✨' },
          ].map((item) => (
            <Link
              key={item.label}
              to={`/services?search=${encodeURIComponent(item.query)}`}
              className="p-3 bg-slate-50 hover:bg-teal-50 rounded-xl border border-slate-200/80 hover:border-teal-300 text-xs font-bold text-slate-700 hover:text-teal-800 transition-all flex items-center gap-2"
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;

