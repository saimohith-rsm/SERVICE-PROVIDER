import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  XCircle,
  FileText,
  Star,
  ChevronLeft,
  AlertTriangle,
  Send,
  MessageSquare,
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StarRating from '../../components/common/StarRating';

const BookingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  // Modals state
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [existingReview, setExistingReview] = useState(null);

  const [complaintModalOpen, setComplaintModalOpen] = useState(false);
  const [complaintSubject, setComplaintSubject] = useState('');
  const [complaintDesc, setComplaintDesc] = useState('');
  const [submittingComplaint, setSubmittingComplaint] = useState(false);

  const fetchBooking = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/bookings/${id}`);
      if (res.data.success) {
        setBooking(res.data.booking);

        // Check if customer already left a review for this booking
        if (res.data.booking.bookingStatus === 'Completed') {
          try {
            const revRes = await api.get('/reviews/my');
            if (revRes.data.success) {
              const matched = revRes.data.reviews.find(
                (r) => r.bookingId?._id === id || r.bookingId === id
              );
              if (matched) setExistingReview(matched);
            }
          } catch (rErr) {
            console.error('Failed to check reviews:', rErr);
          }
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load booking details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooking();
  }, [id]);

  // Handle Customer Cancellation
  const handleCancelBooking = async (e) => {
    e.preventDefault();
    try {
      setCancelling(true);
      const res = await api.patch(`/bookings/${id}/cancel`, { reason: cancelReason });
      if (res.data.success) {
        setBooking(res.data.booking);
        setCancelModalOpen(false);
        setActionSuccess('Booking has been cancelled successfully.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel booking.');
    } finally {
      setCancelling(false);
    }
  };

  // Handle Review Submission
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    try {
      setSubmittingReview(true);
      const res = await api.post('/reviews', {
        bookingId: id,
        rating,
        comment,
      });
      if (res.data.success) {
        setExistingReview(res.data.review);
        setReviewModalOpen(false);
        setActionSuccess('Thank you! Your verified review has been submitted.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  // Handle Complaint Submission
  const handleSubmitComplaint = async (e) => {
    e.preventDefault();
    try {
      setSubmittingComplaint(true);
      const res = await api.post('/complaints', {
        bookingId: id,
        subject: complaintSubject,
        description: complaintDesc,
      });
      if (res.data.success) {
        setComplaintModalOpen(false);
        setActionSuccess('Your grievance ticket has been filed with ServeEase admin support.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit complaint.');
    } finally {
      setSubmittingComplaint(false);
    }
  };

  if (loading) return <LoadingSpinner text="Retrieving booking progress and status..." />;
  if (!booking) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-navy-900 mb-2">Booking Not Found</h2>
        <Link to="/customer/bookings" className="px-4 py-2 bg-teal-600 text-white rounded-xl text-xs font-bold">
          ← Back to My Bookings
        </Link>
      </div>
    );
  }

  // Lifecycle steps definition
  const steps = ['Pending', 'Accepted', 'On The Way', 'In Progress', 'Completed'];
  const currentStepIndex = steps.indexOf(booking.bookingStatus);
  const isCancelled = booking.bookingStatus === 'Cancelled';
  const isRejected = booking.bookingStatus === 'Rejected';

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      <Link
        to="/customer/bookings"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-teal-600"
      >
        <ChevronLeft size={16} /> Back to My Bookings
      </Link>

      {/* Action alerts */}
      {actionSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600" />
            <span>{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess('')} className="text-emerald-600 font-bold">✕</button>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="text-rose-600" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError('')} className="text-rose-600 font-bold">✕</button>
        </div>
      )}

      {/* Main Booking Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="font-mono text-sm font-black text-navy-900">
              #{booking.bookingId}
            </span>
            <StatusBadge status={booking.bookingStatus} />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-navy-900">
            {booking.serviceId?.title}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Created on {new Date(booking.createdAt).toLocaleString()}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Cancel button if pending or accepted */}
          {['Pending', 'Accepted'].includes(booking.bookingStatus) && (
            <button
              onClick={() => setCancelModalOpen(true)}
              className="px-4 py-2 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-bold transition-colors"
            >
              Cancel Booking
            </button>
          )}

          {/* Write review button if completed */}
          {booking.bookingStatus === 'Completed' && (
            <button
              onClick={() => setReviewModalOpen(true)}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5"
            >
              <Star size={14} className="fill-white" />
              {existingReview ? 'Update Review' : 'Rate & Review Service'}
            </button>
          )}

          {/* Raise Complaint button */}
          <button
            onClick={() => setComplaintModalOpen(true)}
            className="px-3 py-2 text-slate-600 hover:text-slate-900 text-xs font-semibold rounded-xl border border-slate-200 hover:bg-slate-50"
            title="File Grievance Ticket"
          >
            <AlertTriangle size={14} className="text-amber-500 inline mr-1" /> Help Desk
          </button>
        </div>
      </div>

      {/* Lifecycle Progress Stepper */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xs">
        <h3 className="text-xs font-bold uppercase tracking-wider text-navy-900 mb-6">
          Live Service Status Progress
        </h3>

        {isCancelled ? (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl flex items-center gap-3">
            <XCircle size={20} className="text-rose-600 shrink-0" />
            <div>
              <span className="text-xs font-bold block">This booking has been cancelled</span>
              <span className="text-[11px] text-rose-600">No further technician dispatch will occur.</span>
            </div>
          </div>
        ) : isRejected ? (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl flex items-center gap-3">
            <XCircle size={20} className="text-rose-600 shrink-0" />
            <div>
              <span className="text-xs font-bold block">Booking was declined by provider</span>
              <span className="text-[11px] text-rose-600">The provider was unable to accommodate this time slot.</span>
            </div>
          </div>
        ) : (
          <div className="relative">
            <div className="overflow-x-auto pb-4">
              <div className="flex items-center justify-between min-w-[500px] relative">
                {/* Connecting track */}
                <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-100 -translate-y-1/2 z-0"></div>
                <div
                  className="absolute top-1/2 left-0 h-1 bg-teal-600 -translate-y-1/2 z-0 transition-all duration-300"
                  style={{
                    width: `${Math.max(0, (currentStepIndex / (steps.length - 1)) * 100)}%`,
                  }}
                ></div>

                {steps.map((step, idx) => {
                  const isDone = currentStepIndex >= idx;
                  const isCurrent = currentStepIndex === idx;

                  return (
                    <div key={step} className="flex flex-col items-center relative z-10">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                          isDone
                            ? 'bg-teal-600 text-white shadow-md shadow-teal-500/20'
                            : 'bg-white border-2 border-slate-200 text-slate-400'
                        }`}
                      >
                        {isDone ? <CheckCircle2 size={16} /> : idx + 1}
                      </div>
                      <span
                        className={`mt-2 text-xs font-bold text-center ${
                          isCurrent ? 'text-teal-700' : isDone ? 'text-navy-900' : 'text-slate-400'
                        }`}
                      >
                        {step}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Existing Review Display (if customer already reviewed) */}
      {existingReview && (
        <div className="bg-amber-50/70 border border-amber-200 p-6 rounded-3xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
              <Star size={14} className="fill-amber-500 text-amber-500" /> Your Submitted Review
            </span>
            <span className="text-[10px] text-amber-700">
              {new Date(existingReview.createdAt).toLocaleDateString()}
            </span>
          </div>
          <StarRating rating={existingReview.rating} size={14} />
          <p className="text-xs text-amber-900 leading-relaxed font-medium">"{existingReview.comment}"</p>
        </div>
      )}

      {/* Grid: Details & Status History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Service Details & Schedule */}
        <div className="lg:col-span-2 space-y-6">
          {/* Appointment Information Card */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xs space-y-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-navy-900 pb-3 border-b border-slate-100">
              Appointment & Location Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-2xl">
                <span className="text-slate-400 block text-[10px] font-bold uppercase">Scheduled Date</span>
                <span className="font-bold text-navy-900 text-sm mt-0.5 block flex items-center gap-1.5">
                  <Calendar size={14} className="text-teal-600" /> {booking.bookingDate}
                </span>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl">
                <span className="text-slate-400 block text-[10px] font-bold uppercase">Time Window</span>
                <span className="font-bold text-navy-900 text-sm mt-0.5 block flex items-center gap-1.5">
                  <Clock size={14} className="text-teal-600" /> {booking.timeSlot}
                </span>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] font-bold uppercase">Destination Address</span>
                <p className="font-semibold text-slate-800 mt-1 flex items-start gap-1.5">
                  <MapPin size={15} className="text-teal-600 shrink-0 mt-0.5" />
                  <span>
                    {booking.serviceAddress?.street}, {booking.serviceAddress?.landmark ? `(${booking.serviceAddress.landmark}), ` : ''}
                    {booking.serviceAddress?.city}, {booking.serviceAddress?.state} - {booking.serviceAddress?.postalCode}
                  </span>
                </p>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px] font-bold uppercase">Registered Customer Phone</span>
                <p className="font-semibold text-slate-800 mt-1 flex items-center gap-1.5">
                  <Phone size={14} className="text-teal-600" /> {booking.customerPhone}
                </p>
              </div>

              {booking.problemDescription && (
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">Customer Problem Note</span>
                  <p className="p-3 bg-slate-50 rounded-xl text-slate-700 italic mt-1 leading-relaxed">
                    "{booking.problemDescription}"
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Status Timeline History */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-navy-900 mb-4 pb-3 border-b border-slate-100">
              Booking Activity Log
            </h3>
            <div className="space-y-4">
              {booking.statusHistory?.map((hist, i) => (
                <div key={i} className="flex items-start gap-3 text-xs">
                  <div className="w-2 h-2 rounded-full bg-teal-600 mt-1.5 shrink-0"></div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-navy-900">{hist.status}</span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(hist.timestamp).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    {hist.note && <p className="text-slate-500 mt-0.5">{hist.note}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Provider & Pricing */}
        <div className="space-y-6">
          {/* Provider Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 block mb-2">
              Assigned Provider
            </span>
            <h3 className="text-sm font-bold text-navy-900 mb-1">
              {booking.providerId?.businessName}
            </h3>
            <p className="text-xs text-slate-500 mb-3">
              ⭐ {booking.providerId?.averageRating?.toFixed(1) || '5.0'} Rating
            </p>

            <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1.5 mb-4">
              <div className="flex justify-between text-slate-600">
                <span>Contact Tech:</span>
                <span className="font-bold text-slate-900">{booking.providerId?.userId?.phone || '+91 98480 11223'}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Email:</span>
                <span className="text-slate-800">{booking.providerId?.userId?.email}</span>
              </div>
            </div>

            <Link
              to={`/providers/${booking.providerId?._id}`}
              className="w-full block text-center py-2 text-xs font-bold text-teal-600 hover:text-teal-700 bg-teal-50 rounded-xl"
            >
              View Full Provider Profile →
            </Link>
          </div>

          {/* Pricing & Invoicing */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-navy-900 pb-2 border-b border-slate-100">
              Payment & Invoicing
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Estimated Quote</span>
                <span>₹{booking.estimatedPrice}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Doorstep Inspection Fee</span>
                <span className="text-emerald-600 font-semibold">₹0 (Free)</span>
              </div>
              <div className="flex justify-between font-black text-sm text-navy-900 pt-2 border-t border-slate-100">
                <span>Final Payable</span>
                <span className="text-teal-600">
                  ₹{booking.finalPrice || booking.estimatedPrice}
                </span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">Payment Method:</span>
                <span className="font-bold text-slate-800">{booking.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Payment Status:</span>
                <span
                  className={`font-bold ${
                    booking.paymentStatus === 'Paid' ? 'text-emerald-600' : 'text-amber-600'
                  }`}
                >
                  {booking.paymentStatus}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Cancel Booking */}
      {cancelModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full p-6 rounded-3xl shadow-xl">
            <h3 className="text-base font-bold text-navy-900 mb-2">Cancel Service Booking?</h3>
            <p className="text-xs text-slate-500 mb-4">
              Are you sure you want to cancel booking #{booking.bookingId}? This appointment slot will be released.
            </p>
            <form onSubmit={handleCancelBooking} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Reason for cancellation
                </label>
                <textarea
                  rows="3"
                  required
                  placeholder="e.g. Schedule conflict, problem resolved, etc."
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-rose-500"
                ></textarea>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCancelModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Keep Booking
                </button>
                <button
                  type="submit"
                  disabled={cancelling}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl disabled:opacity-60"
                >
                  {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Write Review */}
      {reviewModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full p-6 rounded-3xl shadow-xl">
            <h3 className="text-base font-bold text-navy-900 mb-1">Review Service</h3>
            <p className="text-xs text-slate-500 mb-4">
              Rate your experience with {booking.providerId?.businessName}.
            </p>
            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Your Rating (1 to 5 Stars)</label>
                <StarRating rating={rating} size={24} interactive={true} onRate={setRating} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Written Feedback</label>
                <textarea
                  rows="3"
                  required
                  placeholder="Describe the technician's punctuality, work quality, professionalism..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
                ></textarea>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReviewModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-xs disabled:opacity-60"
                >
                  {submittingReview ? 'Submitting...' : 'Post Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Raise Complaint */}
      {complaintModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full p-6 rounded-3xl shadow-xl">
            <h3 className="text-base font-bold text-navy-900 mb-1 flex items-center gap-1.5">
              <AlertTriangle size={18} className="text-amber-500" /> Raise Support Ticket
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              File a formal grievance regarding booking #{booking.bookingId} to the ServeEase admin team.
            </p>
            <form onSubmit={handleSubmitComplaint} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Subject</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Technician delayed, improper work, pricing mismatch..."
                  value={complaintSubject}
                  onChange={(e) => setComplaintSubject(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Details</label>
                <textarea
                  rows="3"
                  required
                  placeholder="Explain what happened so our grievance desk can intervene..."
                  value={complaintDesc}
                  onChange={(e) => setComplaintDesc(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
                ></textarea>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setComplaintModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingComplaint}
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs disabled:opacity-60"
                >
                  {submittingComplaint ? 'Submitting Ticket...' : 'Submit Grievance'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingDetails;

