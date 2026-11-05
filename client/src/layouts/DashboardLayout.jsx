import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  Briefcase,
  User,
  Star,
  Settings,
  ShieldCheck,
  Users,
  Grid,
  AlertTriangle,
  LogOut,
  ChevronRight,
  Menu,
  X,
  PlusCircle,
  Clock,
  Search,
  Bell,
  Wrench,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import NotificationDropdown from '../components/common/NotificationDropdown';

const DashboardLayout = () => {
  const { user, provider, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const customerNav = [
    { label: 'Overview', path: '/customer/dashboard', icon: LayoutDashboard },
    { label: 'Browse Services', path: '/services', icon: Search },
    { label: 'My Bookings', path: '/customer/bookings', icon: Calendar },
    { label: 'My Reviews', path: '/customer/reviews', icon: Star },
    { label: 'Profile Settings', path: '/customer/profile', icon: User },
    { label: 'Notifications', path: '/notifications', icon: Bell },
  ];

  const providerNav = [
    { label: 'Dashboard', path: '/provider/dashboard', icon: LayoutDashboard },
    { label: 'Booking Requests', path: '/provider/bookings', icon: Calendar },
    { label: 'My Services', path: '/provider/services', icon: Briefcase },
    { label: 'Add New Service', path: '/provider/services/add', icon: PlusCircle },
    { label: 'Schedule & Slots', path: '/provider/availability', icon: Clock },
    { label: 'Reviews & Feedback', path: '/provider/reviews', icon: Star },
    { label: 'Business Profile', path: '/provider/profile', icon: Settings },
  ];

  const adminNav = [
    { label: 'Admin Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Provider Approvals', path: '/admin/providers', icon: ShieldCheck },
    { label: 'Manage Categories', path: '/admin/categories', icon: Grid },
    { label: 'All Services', path: '/admin/services', icon: Briefcase },
    { label: 'All Bookings', path: '/admin/bookings', icon: Calendar },
    { label: 'Manage Users', path: '/admin/users', icon: Users },
    { label: 'Complaints', path: '/admin/complaints', icon: AlertTriangle },
  ];

  const getNavItems = () => {
    if (user?.role === 'admin') return adminNav;
    if (user?.role === 'provider') return providerNav;
    return customerNav;
  };

  const navItems = getNavItems();

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row">
      {/* Mobile Top Header */}
      <div className="md:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-navy-900 flex items-center justify-center text-teal-400">
              <Wrench size={16} />
            </div>
            <span className="font-extrabold text-navy-900 text-sm">
              Serve<span className="text-teal-600">Ease</span>
            </span>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <NotificationDropdown />
          <div className="w-8 h-8 rounded-full bg-teal-600 text-white font-bold text-xs flex items-center justify-center">
            {user?.name?.charAt(0) || 'U'}
          </div>
        </div>
      </div>

      {/* Sidebar for Desktop & Mobile Drawer */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-40 h-screen w-64 bg-navy-900 text-white flex flex-col justify-between transition-transform duration-200 ease-in-out md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Logo Branding */}
          <div className="px-6 py-5 border-b border-navy-800 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-teal-500 flex items-center justify-center text-navy-950 font-bold shadow-md shadow-teal-500/20">
                <Wrench size={18} className="transform -rotate-12 text-navy-900" />
              </div>
              <div>
                <span className="text-lg font-black tracking-tight text-white">
                  Serve<span className="text-teal-400">Ease</span>
                </span>
                <span className="block text-[10px] text-teal-300 font-semibold uppercase tracking-wider">
                  {user?.role} portal
                </span>
              </div>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden text-slate-400 hover:text-white"
            >
              <X size={18} />
            </button>
          </div>

          {/* User Brief Card */}
          <div className="px-5 py-4 border-b border-navy-800/80 bg-navy-950/40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-600/30 border border-teal-500/30 text-teal-300 font-extrabold flex items-center justify-center text-sm">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white truncate">{user?.name}</p>
                <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                {user?.role === 'provider' && (
                  <span
                    className={`inline-block mt-1 px-1.5 py-0.2 text-[9px] font-bold rounded uppercase tracking-wider ${
                      provider?.verificationStatus === 'approved'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    {provider?.verificationStatus || 'pending'}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="px-3 py-4 space-y-1 overflow-y-auto max-h-[calc(100vh-230px)]">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    active
                      ? 'bg-teal-600 text-white shadow-sm'
                      : 'text-slate-300 hover:bg-navy-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={16} className={active ? 'text-white' : 'text-slate-400'} />
                    <span>{item.label}</span>
                  </div>
                  {active && <ChevronRight size={14} className="opacity-80" />}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-navy-800 bg-navy-950/60">
          <Link
            to="/"
            className="flex items-center justify-center gap-2 py-2 mb-2 text-xs font-semibold text-slate-300 hover:text-white bg-navy-800 hover:bg-navy-750 rounded-xl transition-colors"
          >
            ← Back to Main Site
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 text-xs font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-900/20 rounded-xl transition-colors"
          >
            <LogOut size={14} /> Log Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Desktop Top Bar */}
        <header className="hidden md:flex items-center justify-between px-8 py-4 bg-white border-b border-slate-200">
          <div>
            <h1 className="text-base font-bold text-slate-800 capitalize">
              {location.pathname.split('/')[2]?.replace(/-/g, ' ') || 'Dashboard'}
            </h1>
            <p className="text-xs text-slate-500">
              ServeEase Local Services Portal &middot; Guntur, AP
            </p>
          </div>
          <div className="flex items-center gap-4">
            <NotificationDropdown />
            <div className="h-6 w-px bg-slate-200"></div>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-teal-600 text-white font-bold flex items-center justify-center text-xs shadow-xs">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="text-left">
                <span className="block text-xs font-bold text-slate-800 leading-tight">
                  {user?.name}
                </span>
                <span className="block text-[10px] text-slate-400 capitalize">
                  {user?.role}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Content View */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>

      {/* Backdrop for mobile sidebar */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-30 md:hidden"
        />
      )}
    </div>
  );
};

export default DashboardLayout;

