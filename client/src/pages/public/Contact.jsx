import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, Clock } from 'lucide-react';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
  };

  return (
    <div className="py-12 sm:py-16 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <span className="text-xs font-bold uppercase tracking-wider text-teal-600">
          Support & Queries
        </span>
        <h1 className="text-3xl font-black text-navy-900 mt-2 mb-2">
          Get in Touch with ServeEase
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Have a question about a booking, service partner registration, or need grievance assistance?
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contact Info Card */}
        <div className="bg-navy-900 text-white p-8 rounded-3xl space-y-6 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-white mb-6">Regional Support Hub</h3>
            <div className="space-y-5 text-xs text-slate-300">
              <div className="flex items-start gap-3">
                <MapPin size={18} className="text-teal-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-white mb-0.5">Head Office</strong>
                  <span>4th Line, Brodipet, Guntur, Andhra Pradesh, 522002</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone size={18} className="text-teal-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-white mb-0.5">Helpline</strong>
                  <span>+91 98480 12345 (9:00 AM - 7:00 PM IST)</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail size={18} className="text-teal-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-white mb-0.5">Email Support</strong>
                  <span>support@serveease.com</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock size={18} className="text-teal-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-white mb-0.5">Operational Hours</strong>
                  <span>Monday – Sunday: 8:00 AM – 8:00 PM</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-navy-950/80 rounded-2xl border border-slate-800 text-[11px] text-teal-300 font-medium">
            💡 For urgent active booking concerns, customers can also utilize the "Raise Complaint" feature directly on their Booking Details page.
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-200/90 shadow-xs">
          {submitted ? (
            <div className="p-8 text-center bg-teal-50 border border-teal-200 rounded-2xl">
              <div className="w-12 h-12 bg-teal-600 text-white rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 size={24} />
              </div>
              <h3 className="text-base font-bold text-teal-900 mb-1">Message Dispatched!</h3>
              <p className="text-xs text-teal-700 max-w-md mx-auto mb-4">
                Thank you for contacting ServeEase Support. Our Guntur team will respond within 24 business hours.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="px-4 py-2 bg-teal-600 text-white rounded-xl text-xs font-bold"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h3 className="text-base font-bold text-navy-900 mb-2">Send Us a Direct Message</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Your Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Priya Reddy"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="priya@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Phone (Optional)</label>
                  <input
                    type="tel"
                    placeholder="+91 99881 12233"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Subject</label>
                  <input
                    type="text"
                    required
                    placeholder="Booking assistance, provider inquiry..."
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Message / Inquiry</label>
                <textarea
                  rows="4"
                  required
                  placeholder="Describe your inquiry or question in detail..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
                ></textarea>
              </div>

              <button
                type="submit"
                className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
              >
                <Send size={14} /> Send Message
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Contact;

