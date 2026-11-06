import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Briefcase, Mail, Lock, Phone, MapPin, Building, Award, AlertCircle, ArrowRight, Wrench } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Register = () => {
  const navigate = useNavigate();
  const { registerCustomer, registerProvider } = useAuth();

  const [activeTab, setActiveTab] = useState('customer'); // 'customer' or 'provider'
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Customer form state
  const [customerData, setCustomerData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    street: '',
    city: 'Guntur',
    postalCode: '522002',
  });

  // Provider form state
  const [providerData, setProviderData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    businessName: '',
    description: '',
    experience: 3,
    serviceAreas: ['Guntur', 'Brodipet', 'Arundelpet'],
    street: '',
    city: 'Guntur',
  });

  const availableAreas = ['Guntur', 'Brodipet', 'Arundelpet', 'Lakshmipuram', 'Syamala Nagar', 'Koretipadu', 'Amaravati', 'Vidyanagar'];

  const toggleArea = (area) => {
    setProviderData((prev) => {
      const exists = prev.serviceAreas.includes(area);
      return {
        ...prev,
        serviceAreas: exists
          ? prev.serviceAreas.filter((a) => a !== area)
          : [...prev.serviceAreas, area],
      };
    });
  };

  const handleCustomerSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const cleanName = customerData.name.trim();
    const cleanEmail = customerData.email.trim();
    const cleanPhone = customerData.phone.trim();
    const password = customerData.password;

    if (!cleanName) {
      setError('Full Name is required.');
      return;
    }

    if (!cleanEmail) {
      setError('Email Address is required.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setError('Please provide a valid email address.');
      return;
    }

    if (!cleanPhone) {
      setError('Mobile Number is required.');
      return;
    }

    const phoneRegex = /^(\+?[0-9\s-]{10,15})$/;
    if (!phoneRegex.test(cleanPhone)) {
      setError('Invalid mobile number. Please enter a valid 10 to 15 digit number.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    try {
      setLoading(true);
      const res = await registerCustomer({
        name: cleanName,
        email: cleanEmail,
        password: password,
        phone: cleanPhone,
        address: {
          street: customerData.street.trim(),
          city: customerData.city.trim() || 'Guntur',
          postalCode: customerData.postalCode.trim() || '522002',
          state: 'Andhra Pradesh',
        },
      });

      if (res.success) {
        navigate('/customer/dashboard', { replace: true });
      } else {
        setError(res.message || 'Registration failed. Please check your inputs.');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Unable to connect to the server. Please check your network.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleProviderSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const cleanName = providerData.name.trim();
    const cleanBusiness = providerData.businessName.trim();
    const cleanEmail = providerData.email.trim();
    const cleanPhone = providerData.phone.trim();
    const password = providerData.password;

    if (!cleanName) {
      setError('Contact Name is required.');
      return;
    }

    if (!cleanBusiness) {
      setError('Business / Service Name is required.');
      return;
    }

    if (!cleanEmail) {
      setError('Email Address is required.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setError('Please provide a valid email address.');
      return;
    }

    if (!cleanPhone) {
      setError('Mobile Number is required.');
      return;
    }

    const phoneRegex = /^(\+?[0-9\s-]{10,15})$/;
    if (!phoneRegex.test(cleanPhone)) {
      setError('Invalid mobile number. Please enter a valid 10 to 15 digit number.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (providerData.serviceAreas.length === 0) {
      setError('Please select at least one service location.');
      return;
    }

    try {
      setLoading(true);
      const res = await registerProvider({
        name: cleanName,
        businessName: cleanBusiness,
        email: cleanEmail,
        password: password,
        phone: cleanPhone,
        description: providerData.description.trim(),
        experience: Number(providerData.experience) || 1,
        serviceAreas: providerData.serviceAreas,
        address: {
          street: providerData.street.trim(),
          city: providerData.city.trim() || 'Guntur',
          state: 'Andhra Pradesh',
        },
      });

      if (res.success) {
        navigate('/provider/dashboard', { replace: true });
      } else {
        setError(res.message || 'Registration failed. Please check your inputs.');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Unable to connect to the server. Please check your network.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl">
        {/* Header */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-xl bg-navy-900 flex items-center justify-center text-teal-400">
              <Wrench size={20} className="transform -rotate-12" />
            </div>
            <span className="text-2xl font-black text-navy-900">
              Serve<span className="text-teal-600">Ease</span>
            </span>
          </Link>
          <h2 className="text-2xl font-extrabold text-navy-900">Create an Account</h2>
          <p className="text-xs text-slate-500 mt-1">
            Join the premier local service network in Guntur & Andhra Pradesh.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-200/80 p-1 rounded-2xl mb-6">
          <button
            type="button"
            onClick={() => {
              setActiveTab('customer');
              setError('');
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'customer'
                ? 'bg-white text-navy-900 shadow-xs'
                : 'text-slate-600 hover:text-navy-900'
            }`}
          >
            <User size={15} /> Customer Account
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('provider');
              setError('');
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'provider'
                ? 'bg-white text-teal-700 shadow-xs'
                : 'text-slate-600 hover:text-navy-900'
            }`}
          >
            <Briefcase size={15} /> Service Provider (Partner)
          </button>
        </div>

        {/* Form Container */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-md">
          {error && (
            <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl flex items-start gap-2.5">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {activeTab === 'customer' ? (
            /* Customer Form */
            <form onSubmit={handleCustomerSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Rahul Sharma"
                    value={customerData.name}
                    onChange={(e) => setCustomerData({ ...customerData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98480 12345"
                    value={customerData.phone}
                    onChange={(e) => setCustomerData({ ...customerData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="rahul@example.com"
                  value={customerData.email}
                  onChange={(e) => setCustomerData({ ...customerData, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Password (min 6 characters)
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={customerData.password}
                  onChange={(e) => setCustomerData({ ...customerData, password: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Street Address / Colony
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="4th Line, Brodipet"
                    value={customerData.street}
                    onChange={(e) => setCustomerData({ ...customerData, street: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    City / Town
                  </label>
                  <input
                    type="text"
                    required
                    value={customerData.city}
                    onChange={(e) => setCustomerData({ ...customerData, city: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-teal-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {loading ? 'Creating Customer Account...' : 'Complete Registration'} <ArrowRight size={16} />
              </button>
            </form>
          ) : (
            /* Provider Form */
            <form onSubmit={handleProviderSubmit} className="space-y-4">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-800 leading-relaxed">
                <strong>Provider Notice:</strong> All new service providers in Guntur are verified by administrators before published services appear in public search.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Contact Person Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ramesh Kumar"
                    value={providerData.name}
                    onChange={(e) => setProviderData({ ...providerData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Business / Trade Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Sri Venkateswara Electricals"
                    value={providerData.businessName}
                    onChange={(e) => setProviderData({ ...providerData, businessName: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="provider@example.com"
                    value={providerData.email}
                    onChange={(e) => setProviderData({ ...providerData, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98480 11223"
                    value={providerData.phone}
                    onChange={(e) => setProviderData({ ...providerData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Password (min 6 characters)
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={providerData.password}
                    onChange={(e) => setProviderData({ ...providerData, password: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Years of Experience
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={providerData.experience}
                    onChange={(e) => setProviderData({ ...providerData, experience: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Business Description & Specialties
                </label>
                <textarea
                  rows="2"
                  placeholder="Specialist in residential wiring, short circuits, switchboard fittings, etc."
                  value={providerData.description}
                  onChange={(e) => setProviderData({ ...providerData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Operational Service Areas in Guntur & AP (Click to toggle)
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableAreas.map((area) => {
                    const isSelected = providerData.serviceAreas.includes(area);
                    return (
                      <button
                        key={area}
                        type="button"
                        onClick={() => toggleArea(area)}
                        className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '}
                        {area}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 bg-navy-900 hover:bg-navy-800 text-white font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {loading ? 'Submitting Partner Application...' : 'Apply as Service Provider'} <ArrowRight size={16} />
              </button>
            </form>
          )}

          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-teal-600 hover:text-teal-700">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;

