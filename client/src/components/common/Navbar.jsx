import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Wrench,
  Search,
  User,
  LogOut,
  Menu,
  X,
  LayoutDashboard,
  Calendar,
  ShieldCheck,
  Briefcase,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import NotificationDropdown from './NotificationDropdown';

const Navbar = () => {
  const { user, provider, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-navy-900 to-teal-600 flex items-center justify-center text-white shadow-md shadow-teal-500/10 group-hover:scale-105 transition-transform">
              <Wrench size={20} className="transform -rotate-12" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-navy-900">
                Serve<span className="text-teal-600">Ease</span>
              </span>
              <span className="hidden sm:inline-block ml-1.5 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-teal-50 text-teal-700 rounded-sm border border-teal-200">
                Guntur & AP
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-7">
            <Link
              to="/services"
              className={`text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                isActive('/services')
                  ? 'text-teal-600 font-bold'
                  : 'text-slate-600 hover:text-navy-900'
              }`}
            >
              <Search size={15} /> Find Services
            </Link>
            <Link
              to="/services?category=all"
              className={`text-sm font-semibold transition-colors ${
                isActive('/categories')
                  ? 'text-teal-600 font-bold'
                  : 'text-slate-600 hover:text-navy-900'
              }`}
            >
              Categories
            </Link>
            <Link
              to="/about"
              className={`text-sm font-semibold transition-colors ${
                isActive('/about')
                  ? 'text-teal-600 font-bold'
                  : 'text-slate-600 hover:text-navy-900'
              }`}
            >
              About
            </Link>
            <Link
              to="/contact"
              className={`text-sm font-semibold transition-colors ${
                isActive('/contact')
                  ? 'text-teal-600 font-bold'
                  : 'text-slate-600 hover:text-navy-900'
              }`}
            >
              Contact
            </Link>
          </nav>

          {/* Right Header Actions */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <NotificationDropdown />

                {/* Role Specific Dashboard Quick Button */}
                {user?.role === 'customer' && (
                  <Link
                    to="/customer/bookings"
                    className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-navy-900 rounded-lg transition-colors"
                  >
                    <Calendar size={14} className="text-teal-600" /> My Bookings
                  </Link>
                )}

                {user?.role === 'provider' && (
                  <Link
                    to="/provider/dashboard"
                    className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-lg transition-colors"
                  >
                    <Briefcase size={14} /> Provider Hub
                    {provider?.verificationStatus === 'approved' ? (
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    ) : (
                      <span className="px-1 py-0.2 text-[9px] bg-amber-100 text-amber-800 rounded">Pending</span>
                    )}
                  </Link>
                )}

                {user?.role === 'admin' && (
                  <Link
                    to="/admin/dashboard"
                    className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-navy-900 text-white rounded-lg shadow-xs hover:bg-navy-800 transition-colors"
                  >
                    <ShieldCheck size={14} className="text-teal-400" /> Admin Center
                  </Link>
                )}

                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 p-1.5 text-slate-700 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200"
                  >
                    <div className="w-8 h-8 rounded-lg bg-teal-600 text-white font-bold flex items-center justify-center text-xs shadow-xs">
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <span className="hidden lg:inline-block text-xs font-bold max-w-[100px] truncate">
                      {user?.name}
                    </span>
                    <ChevronDown size={14} className="text-slate-400" />
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-xs font-bold text-slate-900 truncate">{user?.name}</p>
                        <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                        <span className="inline-block mt-1 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 rounded">
                          {user?.role}
                        </span>
                      </div>

                      {user?.role === 'customer' && (
                        <>
                          <Link
                            to="/customer/dashboard"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium"
                          >
                            <LayoutDashboard size={14} /> Customer Dashboard
                          </Link>
                          <Link
                            to="/customer/bookings"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium"
                          >
                            <Calendar size={14} /> My Bookings
                          </Link>
                          <Link
                            to="/customer/reviews"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium"
                          >
                            <Sparkles size={14} /> My Reviews
                          </Link>
                          <Link
                            to="/customer/profile"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium"
                          >
                            <User size={14} /> Profile Settings
                          </Link>
                        </>
                      )}

                      {user?.role === 'provider' && (
                        <>
                          <Link
                            to="/provider/dashboard"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium"
                          >
                            <LayoutDashboard size={14} /> Provider Dashboard
                          </Link>
                          <Link
                            to="/provider/services"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium"
                          >
                            <Briefcase size={14} /> Manage Services
                          </Link>
                          <Link
                            to="/provider/bookings"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium"
                          >
                            <Calendar size={14} /> Booking Requests
                          </Link>
                          <Link
                            to="/provider/profile"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium"
                          >
                            <User size={14} /> Business Profile
                          </Link>
                        </>
                      )}

                      {user?.role === 'admin' && (
                        <>
                          <Link
                            to="/admin/dashboard"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium"
                          >
                            <LayoutDashboard size={14} /> Admin Overview
                          </Link>
                          <Link
                            to="/admin/providers"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium"
                          >
                            <ShieldCheck size={14} /> Provider Verifications
                          </Link>
                          <Link
                            to="/admin/users"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium"
                          >
                            <User size={14} /> User Management
                          </Link>
                        </>
                      )}

                      <div className="border-t border-slate-100 my-1"></div>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 font-semibold text-left transition-colors"
                      >
                        <LogOut size={14} /> Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 sm:gap-3">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-slate-700 hover:text-navy-900 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition-colors shadow-sm shadow-teal-600/20"
                >
                  Join ServeEase
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2">
          <Link
            to="/services"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-semibold text-slate-700 hover:text-teal-600"
          >
            Find Services
          </Link>
          <Link
            to="/services?category=all"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-semibold text-slate-700 hover:text-teal-600"
          >
            Categories
          </Link>
          <Link
            to="/about"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-semibold text-slate-700 hover:text-teal-600"
          >
            About Us
          </Link>
          <Link
            to="/contact"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-semibold text-slate-700 hover:text-teal-600"
          >
            Contact & Support
          </Link>

          {!isAuthenticated && (
            <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2 text-sm font-semibold text-slate-700 bg-slate-100 rounded-xl"
              >
                Log In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2 text-sm font-semibold text-white bg-teal-600 rounded-xl"
              >
                Create Account
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;

