import React, { useState, useEffect } from 'react';
import { Clock, Calendar, CheckCircle2, AlertCircle, Save, Plus, Trash2 } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const AvailabilityManagement = () => {
  const { provider, refreshMe } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [days, setDays] = useState(
    provider?.availability?.days || [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ]
  );
  const [timeSlots, setTimeSlots] = useState(
    provider?.availability?.timeSlots || [
      '09:00 AM - 11:00 AM',
      '11:00 AM - 01:00 PM',
      '02:00 PM - 04:00 PM',
      '04:00 PM - 06:00 PM',
    ]
  );
  const [isAcceptingBookings, setIsAcceptingBookings] = useState(
    provider?.availability?.isAcceptingBookings !== undefined
      ? provider.availability.isAcceptingBookings
      : true
  );

  const [newSlot, setNewSlot] = useState('');

  const allWeekDays = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];

  const toggleDay = (day) => {
    setDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleAddSlot = () => {
    if (newSlot.trim() && !timeSlots.includes(newSlot.trim())) {
      setTimeSlots([...timeSlots, newSlot.trim()]);
      setNewSlot('');
    }
  };

  const handleRemoveSlot = (slotToRemove) => {
    if (timeSlots.length <= 1) {
      setError('You must keep at least one active appointment slot.');
      return;
    }
    setTimeSlots(timeSlots.filter((s) => s !== slotToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (days.length === 0) {
      setError('Please select at least one working day.');
      return;
    }

    try {
      setSaving(true);
      const res = await api.put('/providers/availability', {
        days,
        timeSlots,
        isAcceptingBookings,
      });

      if (res.data.success) {
        setMessage('Your availability schedule and appointment slots have been updated.');
        await refreshMe();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update schedule.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-navy-900">Working Schedule & Slots</h1>
        <p className="text-xs text-slate-500 mt-1">
          Configure which days and appointment windows customers in Guntur can select.
        </p>
      </div>

      {message && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600" />
            <span>{message}</span>
          </div>
          <button onClick={() => setMessage('')} className="text-emerald-600 font-bold">✕</button>
        </div>
      )}

      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="text-rose-600" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError('')} className="text-rose-600 font-bold">✕</button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xs space-y-8">
        {/* Master Booking Toggle */}
        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200">
          <div>
            <h3 className="text-xs font-bold text-navy-900">Accepting Appointments</h3>
            <p className="text-[11px] text-slate-500">
              When switched off, customers will see that you are temporarily unavailable.
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isAcceptingBookings}
              onChange={(e) => setIsAcceptingBookings(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
          </label>
        </div>

        {/* Operating Days */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-navy-900 mb-3 flex items-center gap-2">
            <Calendar size={15} className="text-teal-600" /> 1. Operating Days of Week
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {allWeekDays.map((day) => {
              const selected = days.includes(day);
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day)}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    selected
                      ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {selected ? '✓ ' : '+ '}
                  {day}
                </button>
              );
            })}
          </div>
        </div>

        {/* Time Slots */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-navy-900 mb-3 flex items-center gap-2">
            <Clock size={15} className="text-teal-600" /> 2. Daily Appointment Time Windows
          </h3>

          <div className="space-y-2 mb-4">
            {timeSlots.map((slot) => (
              <div
                key={slot}
                className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold text-slate-800"
              >
                <span className="flex items-center gap-2">
                  <Clock size={14} className="text-teal-600" /> {slot}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveSlot(slot)}
                  className="text-slate-400 hover:text-rose-600 transition-colors"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>

          {/* Add custom slot */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. 06:00 PM - 08:00 PM"
              value={newSlot}
              onChange={(e) => setNewSlot(e.target.value)}
              className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <button
              type="button"
              onClick={handleAddSlot}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-navy-900 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 shrink-0"
            >
              <Plus size={14} /> Add Slot
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
        >
          <Save size={15} /> {saving ? 'Saving Schedule...' : 'Save Availability Schedule'}
        </button>
      </form>
    </div>
  );
};

export default AvailabilityManagement;

