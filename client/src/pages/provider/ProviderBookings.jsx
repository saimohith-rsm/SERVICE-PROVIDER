import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  CheckCircle2,
  XCircle,
  Truck,
  PlayCircle,
  AlertCircle,
  DollarSign,
  ChevronRight,
} from 'lucide-react';
import api from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

const ProviderBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');

  // Complete Job Modal state
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [finalPrice, setFinalPrice] = useState('');
  const [markPaid, setMarkPaid] = useState(true);
  const [completionNote, setCompletionNote] = useState('');
  const [submittingComplete, setSubmittingComplete] = useState(false);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      params.append('limit', 50);

      const res = await api.get(`/bookings/provider?${params.toString()}`);
      if (res.data.success) {
        setBookings(res.data.bookings);
      }
    } catch (err) {
      console.error('Failed to load provider bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [statusFilter]);

  // Update status action
  const handleUpdateStatus = async (bookingId, newStatus, note = '') => {
    setActionSuccess('');
    setActionError('');
    try {
      const res = await api.patch(`/bookings/${bookingId}/status`, {
        status: newStatus,
        note,
      });
      if (res.data.success) {
        setActionSuccess(`Booking updated to '${newStatus}' successfully!`);
        fetchBookings();
      }
    } catch (err) {
      setActionError(err.response?.data?.message || `Failed to update status to ${newStatus}.`);
    }
  };

  // Open Complete Modal
  const openCompleteModal = (booking) => {
    setSelectedBooking(booking);
    setFinalPrice(booking.estimatedPrice);
    setMarkPaid(true);
    setCompletionNote('Job finished and inspected with customer.');
    setCompleteModalOpen(true);
  };

  // Submit Completion
  const handleCompleteSubmit = async (e) => {
    e.preventDefault();
    setActionSuccess('');
    setActionError('');
    try {
      setSubmittingComplete(true);
      const res = await api.patch(`/bookings/${selectedBooking._id}/status`, {
        status: 'Completed',
        finalPrice: Number(finalPrice),
        markPaid,
        note: completionNote,
      });
      if (res.data.success) {
        setActionSuccess(`Booking #${selectedBooking.bookingId} marked Completed!`);
        setCompleteModalOpen(false);
        fetchBookings();
      }
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to complete booking.');
    } finally {
      setSubmittingComplete(false);
    }
  };

  const tabs = [
    { label: 'All Requests', val: 'all' },
    { label: 'Pending', val: 'Pending' },
    { label: 'Accepted', val: 'Accepted' },
    { label: 'On The Way', val: 'On The Way' },
    { label: 'In Progress', val: 'In Progress' },
    { label: 'Completed', val: 'Completed' },
    { label: 'Cancelled/Declined', val: 'Cancelled' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-navy-900">Manage Service Appointments</h1>
        <p className="text-xs text-slate-500 mt-1">
          Review pending customer inquiries, dispatch technicians, and mark jobs completed.
        </p>
      </div>

      {actionSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600" />
            <span>{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess('')} className="text-emerald-600 font-bold">✕</button>
        </div>
      )}

      {actionError && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="text-rose-600" />
            <span>{actionError}</span>
          </div>
          <button onClick={() => setActionError('')} className="text-rose-600 font-bold">✕</button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex overflow-x-auto pb-2 scrollbar-none gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.val}
            onClick={() => setStatusFilter(tab.val)}
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
        <LoadingSpinner text="Loading appointment requests..." />
      ) : bookings.length === 0 ? (
        <EmptyState
          title={`No ${statusFilter === 'all' ? '' : statusFilter.toLowerCase()} requests`}
          description="You currently have no bookings matching this status category."
        />
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div
              key={booking._id}
              className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6"
            >
              {/* Left Info */}
              <div className="space-y-3 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-bold text-slate-400">
                    #{booking.bookingId}
                  </span>
                  <StatusBadge status={booking.bookingStatus} />
                  <span className="text-[11px] text-slate-400">
                    Submitted on {new Date(booking.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-navy-900">
                    {booking.serviceId?.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-700 mt-1">
                    <span>
                      Customer: <strong className="text-slate-900">{booking.customerId?.name}</strong>
                    </span>
                    <span className="flex items-center gap-1 text-teal-700 font-bold">
                      <Phone size={13} /> {booking.customerPhone}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-500 pt-1">
                  <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                    <Calendar size={14} className="text-teal-600" />
                    <span>{booking.bookingDate} ({booking.timeSlot})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin size={14} className="text-teal-600" />
                    <span>
                      {booking.serviceAddress?.street}, {booking.serviceAddress?.city}
                    </span>
                  </div>
                </div>

                {booking.problemDescription && (
                  <p className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600 italic">
                    Problem Note: "{booking.problemDescription}"
                  </p>
                )}
              </div>

              {/* Right Action Controls */}
              <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-4 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100 shrink-0">
                <div className="text-left lg:text-right">
                  <span className="text-[10px] text-slate-400 font-medium block">Billing Amount</span>
                  <span className="text-lg font-black text-navy-900">
                    ₹{booking.finalPrice || booking.estimatedPrice}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500 block">
                    {booking.paymentStatus} via {booking.paymentMethod}
                  </span>
                </div>

                {/* Status-Driven Provider Action Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  {booking.bookingStatus === 'Pending' && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(booking._id, 'Accepted', 'Provider confirmed appointment.')}
                        className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs flex items-center gap-1"
                      >
                        <CheckCircle2 size={14} /> Accept Request
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(booking._id, 'Rejected', 'Provider unavailable for requested slot.')}
                        className="px-4 py-2 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-bold transition-colors"
                      >
                        Decline
                      </button>
                    </>
                  )}

                  {booking.bookingStatus === 'Accepted' && (
                    <button
                      onClick={() => handleUpdateStatus(booking._id, 'On The Way', 'Technician dispatched to customer location.')}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5"
                    >
                      <Truck size={14} /> Mark "On The Way"
                    </button>
                  )}

                  {booking.bookingStatus === 'On The Way' && (
                    <button
                      onClick={() => handleUpdateStatus(booking._id, 'In Progress', 'Technician arrived and began service.')}
                      className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5"
                    >
                      <PlayCircle size={14} /> Mark "In Progress"
                    </button>
                  )}

                  {booking.bookingStatus === 'In Progress' && (
                    <button
                      onClick={() => openCompleteModal(booking)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5"
                    >
                      <CheckCircle2 size={14} /> Mark "Completed"
                    </button>
                  )}

                  {booking.bookingStatus === 'Completed' && (
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                      ✓ Job Finished
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Complete Service Job */}
      {completeModalOpen && selectedBooking && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full p-6 rounded-3xl shadow-xl">
            <h3 className="text-base font-bold text-navy-900 mb-1">Finalize Service Completion</h3>
            <p className="text-xs text-slate-500 mb-4">
              Mark booking #{selectedBooking.bookingId} as successfully completed.
            </p>

            <form onSubmit={handleCompleteSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Final Agreed Price (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={finalPrice}
                  onChange={(e) => setFinalPrice(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-navy-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={markPaid}
                    onChange={(e) => setMarkPaid(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <span>Confirm Cash/Payment Received from Customer</span>
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Completion Note</label>
                <textarea
                  rows="2"
                  value={completionNote}
                  onChange={(e) => setCompletionNote(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCompleteModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingComplete}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs disabled:opacity-60"
                >
                  {submittingComplete ? 'Completing...' : 'Mark Job Completed'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProviderBookings;

