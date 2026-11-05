import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  MapPin,
  ChevronRight,
  Search,
  Star,
  ArrowRight,
} from 'lucide-react';
import api from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      params.append('page', page);
      params.append('limit', 10);

      const res = await api.get(`/bookings/my?${params.toString()}`);
      if (res.data.success) {
        setBookings(res.data.bookings);
        setTotal(res.data.total);
        setTotalPages(res.data.totalPages);
      }
    } catch (err) {
      console.error('Failed to load my bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [statusFilter, page]);

  const filterTabs = [
    { label: 'All', val: 'all' },
    { label: 'Pending', val: 'Pending' },
    { label: 'Accepted', val: 'Accepted' },
    { label: 'In Progress', val: 'In Progress' },
    { label: 'Completed', val: 'Completed' },
    { label: 'Cancelled', val: 'Cancelled' },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-navy-900">My Service Bookings</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Track appointments, communicate with providers, and access invoice details.
          </p>
        </div>
        <Link
          to="/services"
          className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 self-start sm:self-auto"
        >
          <Search size={14} /> Book Another Service
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex overflow-x-auto pb-2 scrollbar-none gap-2">
        {filterTabs.map((tab) => (
          <button
            key={tab.val}
            onClick={() => {
              setStatusFilter(tab.val);
              setPage(1);
            }}
            className={`px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
              statusFilter === tab.val
                ? 'bg-navy-900 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {loading ? (
        <LoadingSpinner text="Fetching booking history..." />
      ) : bookings.length === 0 ? (
        <EmptyState
          title={`No ${statusFilter === 'all' ? '' : statusFilter.toLowerCase()} bookings found`}
          description="You do not have any bookings matching this status criteria."
          actionText="Find Services to Book"
          onAction={() => (window.location.href = '/services')}
        />
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div
              key={booking._id}
              className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs hover:border-teal-500/60 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-400">
                    #{booking.bookingId}
                  </span>
                  <StatusBadge status={booking.bookingStatus} />
                </div>

                <h3 className="text-base font-bold text-navy-900">
                  {booking.serviceId?.title || 'Home Service'}
                </h3>

                <p className="text-xs text-slate-600 font-medium">
                  Service Provider:{' '}
                  <strong className="text-slate-800">
                    {booking.providerId?.businessName}
                  </strong>
                </p>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 pt-1">
                  <span className="flex items-center gap-1 font-medium text-slate-600">
                    <Calendar size={13} className="text-teal-600" /> {booking.bookingDate}
                  </span>
                  <span className="flex items-center gap-1 font-medium text-slate-600">
                    <Clock size={13} className="text-teal-600" /> {booking.timeSlot}
                  </span>
                  <span className="flex items-center gap-1 text-slate-500">
                    <MapPin size={13} className="text-teal-600" /> {booking.serviceAddress?.street},{' '}
                    {booking.serviceAddress?.city}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between md:flex-col md:items-end gap-3 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100 shrink-0">
                <div className="text-left md:text-right">
                  <span className="text-[10px] text-slate-400 block font-medium">
                    {booking.bookingStatus === 'Completed' ? 'Final Amount' : 'Estimated Amount'}
                  </span>
                  <span className="text-lg font-black text-navy-900">
                    ₹{booking.finalPrice || booking.estimatedPrice}
                  </span>
                  <span className="block text-[10px] font-semibold text-slate-500">
                    Payment: {booking.paymentStatus} ({booking.paymentMethod})
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    to={`/customer/bookings/${booking._id}`}
                    className="px-4 py-2 bg-navy-900 hover:bg-navy-800 text-white rounded-xl text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5"
                  >
                    View Details <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="px-3 py-1.5 text-xs font-bold bg-white border border-slate-200 rounded-lg disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-xs text-slate-500 font-medium">
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            className="px-3 py-1.5 text-xs font-bold bg-white border border-slate-200 rounded-lg disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default MyBookings;

