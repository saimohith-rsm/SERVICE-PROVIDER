import React, { useState, useEffect } from 'react';
import { Calendar, Search, MapPin, Phone, Clock, DollarSign } from 'lucide-react';
import api from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

const AdminManageBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (search.trim()) params.append('search', search.trim());
      params.append('page', page);
      params.append('limit', 20);

      const res = await api.get(`/admin/bookings?${params.toString()}`);
      if (res.data.success) {
        setBookings(res.data.bookings);
        setTotalPages(res.data.totalPages);
      }
    } catch (err) {
      console.error('Failed to load admin bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [statusFilter, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchBookings();
  };

  const tabs = ['all', 'Pending', 'Accepted', 'On The Way', 'In Progress', 'Completed', 'Cancelled', 'Rejected'];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-navy-900">Platform Bookings Master Log</h1>
        <p className="text-xs text-slate-500 mt-1">
          Monitor all scheduled, active, and completed appointments across Guntur.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex overflow-x-auto gap-2 w-full sm:w-auto pb-1 scrollbar-none">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setStatusFilter(tab);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === tab
                  ? 'bg-navy-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-64">
          <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search booking ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </form>
      </div>

      {loading ? (
        <LoadingSpinner text="Retrieving booking logs..." />
      ) : bookings.length === 0 ? (
        <EmptyState title="No bookings found" description="No platform bookings match this filter." />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs divide-y divide-slate-100 overflow-hidden">
          {bookings.map((b) => (
            <div key={b._id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-navy-900">#{b.bookingId}</span>
                  <StatusBadge status={b.bookingStatus} />
                </div>
                <h3 className="text-sm font-bold text-slate-800">{b.serviceId?.title}</h3>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                  <span>Customer: <strong className="text-slate-800">{b.customerId?.name}</strong></span>
                  <span>Provider: <strong className="text-slate-800">{b.providerId?.businessName}</strong></span>
                  <span className="flex items-center gap-1">
                    <Calendar size={12} className="text-teal-600" /> {b.bookingDate} ({b.timeSlot})
                  </span>
                </div>
              </div>

              <div className="text-left md:text-right shrink-0">
                <span className="text-base font-black text-navy-900 block">
                  ₹{b.finalPrice || b.estimatedPrice}
                </span>
                <span className="text-[11px] font-semibold text-slate-500 block">
                  {b.paymentStatus} &middot; {b.paymentMethod}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="px-3 py-1.5 text-xs font-bold bg-white border border-slate-200 rounded-lg disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-xs text-slate-500 font-medium">Page {page} of {totalPages}</span>
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

export default AdminManageBookings;

