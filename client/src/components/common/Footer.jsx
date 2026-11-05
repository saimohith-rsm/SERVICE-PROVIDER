import React from 'react';
import { Link } from 'react-router-dom';
import { Wrench, Shield, Phone, Mail, MapPin, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-navy-950 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Brand Info */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2.5 mb-4 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-teal-400 flex items-center justify-center text-white shadow-md">
                <Wrench size={20} className="transform -rotate-12" />
              </div>
              <span className="text-xl font-black tracking-tight text-white">
                Serve<span className="text-teal-400">Ease</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 max-w-sm mb-5 leading-relaxed">
              ServeEase is the premier hyper-local service marketplace connecting homeowners and businesses in Guntur & Andhra Pradesh with background-verified, skilled professionals.
            </p>
            <div className="flex items-center gap-2 text-xs text-teal-400 font-semibold bg-navy-900/80 p-3 rounded-xl border border-slate-800 w-fit">
              <Shield size={16} /> 100% Quality Guaranteed & Verified Providers
            </div>
          </div>

          {/* Service Categories */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Popular Services
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <Link to="/services?search=Electrician" className="hover:text-teal-400 transition-colors">
                  Electrician & Wiring
                </Link>
              </li>
              <li>
                <Link to="/services?search=Plumbing" className="hover:text-teal-400 transition-colors">
                  Plumbing & Leak Repairs
                </Link>
              </li>
              <li>
                <Link to="/services?search=AC" className="hover:text-teal-400 transition-colors">
                  AC Jet Pump Servicing
                </Link>
              </li>
              <li>
                <Link to="/services?search=Cleaning" className="hover:text-teal-400 transition-colors">
                  Home Deep Cleaning
                </Link>
              </li>
              <li>
                <Link to="/services?search=Carpentry" className="hover:text-teal-400 transition-colors">
                  Carpentry & Woodwork
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Platform Links
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <Link to="/services" className="hover:text-teal-400 transition-colors">
                  Find Local Experts
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-teal-400 transition-colors">
                  Join as a Service Partner
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-teal-400 transition-colors">
                  About ServeEase
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-teal-400 transition-colors">
                  Customer Help Desk
                </Link>
              </li>
            </ul>
          </div>

          {/* Guntur Support Office */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Regional Center
            </h4>
            <ul className="space-y-3 text-xs text-slate-400">
              <li className="flex items-start gap-2.5">
                <MapPin size={16} className="text-teal-400 shrink-0 mt-0.5" />
                <span>4th Line, Brodipet, Guntur, Andhra Pradesh - 522002</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone size={14} className="text-teal-400 shrink-0" />
                <span>+91 98480 12345</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail size={14} className="text-teal-400 shrink-0" />
                <span>support@serveease.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} ServeEase Technologies. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built with <Heart size={12} className="text-rose-500 fill-rose-500" /> for dependable doorstep services
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

