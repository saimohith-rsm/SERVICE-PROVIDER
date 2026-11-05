import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  ShieldCheck,
  Briefcase,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  DollarSign,
  Clock,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import api from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        setLoading(true);
        const res = await api.get('/admin/dashboard');
        if (res.data.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminStats();
  }, []);

  if (loading) return <LoadingSpinner text="Aggregating platform metrics..." />;

  const stats = data?.stats || {};
  const recentBookings = data?.recentBookings || [];
  const recentProviders = data?.recentProviders || [];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Admin Welcome */}
      <div className="bg-navy-950 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-bold text-teal-400 uppercase tracking-wider block mb-1">
            Central Administration
          </span>
          <h1 className="text-2xl sm:text-3xl font-black">Platform Operations Overview</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
            Live overview of customers, providers, appointment lifecycles, and transactions in Guntur & AP.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/providers"
            className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5"
          >
            <ShieldCheck size={16} /> Approvals Desk
            {stats.pendingProviders > 0 && (
              <span className="px-1.5 py-0.2 bg-white text-teal-800 text-[10px] font-black rounded-full">
                {stats.pendingProviders}
              </span>
            )}
          </Link>
          <Link
            to="/admin/complaints"
            className="px-4 py-2.5 bg-navy-800 hover:bg-navy-750 text-white font-bold text-xs rounded-xl border border-slate-700 flex items-center gap-1.5"
          >
            <AlertTriangle size={15} className="text-amber-400" /> Complaints
            {stats.openComplaints > 0 && (
              <span className="px-1.5 py-0.2 bg-amber-400 text-navy-950 text-[10px] font-black rounded-full">
                {stats.openComplaints}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* 8 Platform Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Total Customers</span>
            <Users size={16} className="text-teal-600" />
          </div>
          <span className="text-2xl font-black text-navy-900 block">{stats.totalCustomers || 0}</span>
          <span className="text-[10px] text-slate-400 font-medium">Registered accounts</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Total Providers</span>
            <Briefcase size={16} className="text-blue-600" />
          </div>
          <span className="text-2xl font-black text-navy-900 block">{stats.totalProviders || 0}</span>
          <span className="text-[10px] text-emerald-600 font-bold">
            {stats.approvedProviders || 0} Approved &middot; {stats.pendingProviders || 0} Pending
          </span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Pending Approvals</span>
            <Clock size={16} className="text-amber-500" />
          </div>
          <span className="text-2xl font-black text-amber-600 block">{stats.pendingProviders || 0}</span>
          <span className="text-[10px] text-slate-400 font-medium">Awaiting verification</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Active Services</span>
            <Briefcase size={16} className="text-teal-600" />
          </div>
          <span className="text-2xl font-black text-navy-900 block">{stats.totalServices || 0}</span>
          <span className="text-[10px] text-slate-400 font-medium">Catalog offerings</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Total Bookings</span>
            <Calendar size={16} className="text-indigo-600" />
          </div>
          <span className="text-2xl font-black text-navy-900 block">{stats.totalBookings || 0}</span>
          <span className="text-[10px] text-slate-400 font-medium">All platform requests</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Completed Jobs</span>
            <CheckCircle2 size={16} className="text-emerald-600" />
          </div>
          <span className="text-2xl font-black text-emerald-600 block">{stats.completedBookings || 0}</span>
          <span className="text-[10px] text-slate-400 font-medium">Successfully serviced</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Platform Volume</span>
            <DollarSign size={16} className="text-purple-600" />
          </div>
          <span className="text-2xl font-black text-purple-700 block">₹{stats.totalRevenue || 0}</span>
          <span className="text-[10px] text-slate-400 font-medium">Completed value</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Support Tickets</span>
            <AlertTriangle size={16} className="text-rose-500" />
          </div>
          <span className="text-2xl font-black text-rose-600 block">{stats.openComplaints || 0}</span>
          <span className="text-[10px] text-slate-400 font-medium">Open grievances</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Platform Bookings */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-navy-900">Recent Platform Activity</h2>
              <p className="text-xs text-slate-400">Live booking dispatch stream</p>
            </div>
            <Link to="/admin/bookings" className="text-xs font-bold text-teal-600">
              View All Bookings →
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {recentBookings.map((b) => (
              <div key={b._id} className="p-4 hover:bg-slate-50 flex items-center justify-between gap-4 text-xs">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-slate-400 font-bold">#{b.bookingId}</span>
                    <StatusBadge status={b.bookingStatus} />
                  </div>
                  <h4 className="font-bold text-slate-800">{b.serviceId?.title}</h4>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    {b.customerId?.name} &rarr; {b.providerId?.businessName}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-bold text-navy-900 block">₹{b.finalPrice || b.estimatedPrice}</span>
                  <span className="text-[10px] text-slate-400">{b.bookingDate}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Providers Quick Approvals */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden flex flex-col justify-between">
          <div>
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-navy-900">Partner Applications</h2>
                <p className="text-xs text-slate-400">Recent providers in Guntur</p>
              </div>
              <Link to="/admin/providers" className="text-xs font-bold text-teal-600">
                All →
              </Link>
            </div>

            <div className="p-4 space-y-3">
              {recentProviders.slice(0, 5).map((p) => (
                <div key={p._id} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs flex items-center justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-navy-900">{p.businessName}</h4>
                    <p className="text-[11px] text-slate-500">{p.userId?.name} &middot; {p.userId?.phone}</p>
                    <span className="text-[10px] font-semibold text-slate-400">
                      Areas: {p.serviceAreas?.slice(0, 2).join(', ')}
                    </span>
                  </div>
                  <StatusBadge status={p.verificationStatus} />
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 border-t border-slate-100 bg-slate-50/50">
            <Link
              to="/admin/providers"
              className="w-full block text-center py-2 bg-navy-900 hover:bg-navy-800 text-white rounded-xl text-xs font-bold transition-colors"
            >
              Open Provider Approvals Desk
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

