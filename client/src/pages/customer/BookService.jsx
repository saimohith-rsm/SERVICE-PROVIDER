import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  FileText,
  CreditCard,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const BookService = () => {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Booking Form State
  const [bookingDate, setBookingDate] = useState(() => {
    // Tomorrow as default
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [timeSlot, setTimeSlot] = useState('');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [street, setStreet] = useState(user?.address?.street || '');
  const [city, setCity] = useState(user?.address?.city || 'Guntur');
  const [postalCode, setPostalCode] = useState(user?.address?.postalCode || '522002');
  const [landmark, setLandmark] = useState('');
  const [problemDescription, setProblemDescription] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');

  useEffect(() => {
    const fetchService = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/services/${serviceId}`);
        if (res.data.success) {
          setService(res.data.service);
          // Set first available time slot as default
          const slots = res.data.service.providerId?.availability?.timeSlots;
          if (slots && slots.length > 0) {
            setTimeSlot(slots[0]);
          }
        }
      } catch (err) {
        setError('Failed to retrieve service details for booking.');
      } finally {
        setLoading(false);
      }
    };

    fetchService();
  }, [serviceId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!timeSlot) {
      setError('Please select an appointment time slot.');
      return;
    }

    if (!street.trim()) {
      setError('Please provide your service street address.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post('/bookings', {
        serviceId,
        bookingDate,
        timeSlot,
        serviceAddress: {
          street,
          city,
          postalCode,
          landmark,
          state: 'Andhra Pradesh',
        },
        customerPhone,
        problemDescription,
        paymentMethod,
      });

      if (res.data.success) {
        navigate(`/customer/bookings/${res.data.booking._id}`, { replace: true });
      } else {
        setError(res.data.message || 'Failed to place booking.');
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to book appointment. Please check availability or try another time slot.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner text="Preparing booking appointment form..." />;

  if (!service) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-navy-900 mb-2">Service Not Available</h2>
        <Link to="/services" className="px-4 py-2 bg-teal-600 text-white rounded-xl text-xs font-bold">
          ← Browse Other Services
        </Link>
      </div>
    );
  }

  const provider = service.providerId;
  const todayStr = new Date().toISOString().split('T')[0];
  const availableSlots = provider?.availability?.timeSlots || [
    '09:00 AM - 11:00 AM',
    '11:00 AM - 01:00 PM',
    '02:00 PM - 04:00 PM',
    '04:00 PM - 06:00 PM',
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <Link
        to={`/services/${service._id}`}
        className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-teal-600 mb-6"
      >
        <ChevronLeft size={16} /> Back to Service Details
      </Link>

      <div className="mb-8">
        <span className="text-xs font-bold uppercase tracking-wider text-teal-600">
          Book Appointment
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-navy-900 mt-1">
          Schedule Doorstep Service
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Pick your preferred date, time window, and address. Pay after the service is completed.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Booking Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xs space-y-6">
            {error && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl flex items-start gap-2">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Date Selection */}
            <div>
              <label className="block text-xs font-bold text-navy-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Calendar size={14} className="text-teal-600" /> 1. Select Date
              </label>
              <input
                type="date"
                min={todayStr}
                required
                value={bookingDate}
                onChange={(e) => setBookingDate(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {/* Time Slot Selection */}
            <div>
              <label className="block text-xs font-bold text-navy-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Clock size={14} className="text-teal-600" /> 2. Pick Available Time Window
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {availableSlots.map((slot) => {
                  const isSelected = timeSlot === slot;
                  return (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setTimeSlot(slot)}
                      className={`p-3 text-xs font-semibold rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <span>{slot}</span>
                      {isSelected && <CheckCircle2 size={16} />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Service Address */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <label className="block text-xs font-bold text-navy-900 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin size={14} className="text-teal-600" /> 3. Service Address (Guntur & Surrounding)
              </label>

              <div>
                <input
                  type="text"
                  required
                  placeholder="House/Flat No., Apartment, Street/Colony"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 mb-2"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <input
                  type="text"
                  required
                  placeholder="City"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <input
                  type="text"
                  placeholder="Landmark (e.g. Near Brodipet Mosque / Rythu Bazar)"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Contact Phone Number for Technician Coordination
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98480 12345"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            {/* Problem Description */}
            <div className="pt-4 border-t border-slate-100">
              <label className="block text-xs font-bold text-navy-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <FileText size={14} className="text-teal-600" /> 4. Problem Description (Optional)
              </label>
              <textarea
                rows="2"
                placeholder="Briefly describe the specific issue, brand of appliance, or any instructions..."
                value={problemDescription}
                onChange={(e) => setProblemDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
              ></textarea>
            </div>

            {/* Payment Method */}
            <div className="pt-4 border-t border-slate-100">
              <label className="block text-xs font-bold text-navy-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <CreditCard size={14} className="text-teal-600" /> 5. Payment Preference
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="p-3 bg-slate-50 rounded-xl border border-teal-500 flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="Cash"
                    checked={paymentMethod === 'Cash'}
                    onChange={() => setPaymentMethod('Cash')}
                    className="text-teal-600 focus:ring-teal-500"
                  />
                  <div>
                    <span className="block text-xs font-bold text-slate-800">Cash on Completion</span>
                    <span className="block text-[10px] text-slate-400">Pay after job verification</span>
                  </div>
                </label>
                <label className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-2 cursor-pointer opacity-70">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="Online"
                    checked={paymentMethod === 'Online'}
                    onChange={() => setPaymentMethod('Online')}
                    className="text-teal-600 focus:ring-teal-500"
                  />
                  <div>
                    <span className="block text-xs font-bold text-slate-800">Online UPI / Card</span>
                    <span className="block text-[10px] text-slate-400">Pay digital upon arrival</span>
                  </div>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-teal-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {submitting ? 'Confirming Appointment...' : 'Confirm & Request Booking'} <ArrowRight size={16} />
            </button>
          </form>
        </div>

        {/* Order Summary Sidebar */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-navy-900 mb-4 pb-2 border-b border-slate-100">
              Booking Summary
            </h3>

            <div className="mb-4">
              <span className="text-[10px] font-bold uppercase text-teal-600 block">Service</span>
              <h4 className="text-sm font-bold text-navy-900">{service.title}</h4>
              <span className="text-xs text-slate-400 block mt-0.5">Est. Duration: {service.estimatedDuration}</span>
            </div>

            <div className="mb-4 pt-3 border-t border-slate-100">
              <span className="text-[10px] font-bold uppercase text-teal-600 block">Service Provider</span>
              <h4 className="text-xs font-bold text-slate-800">{provider?.businessName}</h4>
              <span className="text-[11px] text-slate-400 block mt-0.5">
                ⭐ {provider?.averageRating?.toFixed(1) || '5.0'} &middot; {provider?.experience}+ yrs exp
              </span>
            </div>

            <div className="space-y-2 pt-3 border-t border-slate-100 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Base Service Rate</span>
                <span>₹{service.price}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Inspection & Travel Fee</span>
                <span className="text-emerald-600 font-semibold">Free (Included)</span>
              </div>
              <div className="flex justify-between text-navy-900 font-extrabold text-sm pt-2 border-t border-slate-100">
                <span>Estimated Total</span>
                <span className="text-teal-600">₹{service.price}</span>
              </div>
            </div>
          </div>

          <div className="p-5 bg-teal-50 border border-teal-200 rounded-3xl text-xs text-teal-900 space-y-2">
            <h5 className="font-bold flex items-center gap-1.5 text-teal-800">
              <ShieldCheck size={16} /> ServeEase Protection
            </h5>
            <p className="text-[11px] text-teal-700 leading-relaxed">
              Your appointment is backed by our customer satisfaction promise. If you are unsatisfied, our grievance team will intervene.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookService;

