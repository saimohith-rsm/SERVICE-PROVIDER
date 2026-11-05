import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogIn, Lock, Mail, AlertCircle, Wrench, ArrowRight, ShieldCheck, UserCheck, Briefcase } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    try {
      setLoading(true);
      const res = await login(email, password);
      if (res.success) {
        // Redirect based on user role or previous location
        if (from) {
          navigate(from, { replace: true });
        } else if (res.user.role === 'admin') {
          navigate('/admin/dashboard', { replace: true });
        } else if (res.user.role === 'provider') {
          navigate('/provider/dashboard', { replace: true });
        } else {
          navigate('/customer/dashboard', { replace: true });
        }
      } else {
        setError(res.message || 'Login failed.');
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Invalid email or password. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Card Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-3 group">
            <div className="w-10 h-10 rounded-xl bg-navy-900 flex items-center justify-center text-teal-400 shadow-sm">
              <Wrench size={20} className="transform -rotate-12" />
            </div>
            <span className="text-2xl font-black text-navy-900">
              Serve<span className="text-teal-600">Ease</span>
            </span>
          </Link>
          <h2 className="text-2xl font-extrabold text-navy-900">Welcome back</h2>
          <p className="text-xs text-slate-500 mt-1">
            Log in to manage your appointments, services, or account.
          </p>
        </div>

        {/* Demo Fast-Login Bar */}
        <div className="mb-6 p-3.5 bg-teal-50/70 border border-teal-200/80 rounded-2xl">
          <p className="text-[11px] font-bold text-teal-900 mb-2 flex items-center gap-1.5">
            <UserCheck size={14} className="text-teal-600" /> Quick Demo Accounts (One-Click Fill):
          </p>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <button
              type="button"
              onClick={() => handleDemoFill('rahul.customer@example.com', 'Customer@123')}
              className="p-1.5 bg-white hover:bg-teal-100/50 border border-teal-200 text-teal-900 font-semibold rounded-lg text-left transition-colors"
            >
              🧑 Customer Demo
            </button>
            <button
              type="button"
              onClick={() => handleDemoFill('ramesh.electrician@serveease.com', 'Provider@123')}
              className="p-1.5 bg-white hover:bg-teal-100/50 border border-teal-200 text-teal-900 font-semibold rounded-lg text-left transition-colors"
            >
              ⚡ Approved Provider
            </button>
            <button
              type="button"
              onClick={() => handleDemoFill('anji.mechanic@serveease.com', 'Provider@123')}
              className="p-1.5 bg-white hover:bg-teal-100/50 border border-teal-200 text-teal-900 font-semibold rounded-lg text-left transition-colors"
            >
              ⏳ Pending Provider
            </button>
            <button
              type="button"
              onClick={() => handleDemoFill('admin@serveease.com', 'Admin@123456')}
              className="p-1.5 bg-white hover:bg-teal-100/50 border border-teal-200 text-teal-900 font-semibold rounded-lg text-left transition-colors"
            >
              🛡️ Platform Admin
            </button>
          </div>
        </div>

        {/* Main Login Form */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-md">
          {error && (
            <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl flex items-start gap-2.5">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all font-medium text-slate-900"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700">Password</label>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all font-medium text-slate-900"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-teal-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span> <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              Don't have an account yet?{' '}
              <Link to="/register" className="font-bold text-teal-600 hover:text-teal-700">
                Create one now
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

