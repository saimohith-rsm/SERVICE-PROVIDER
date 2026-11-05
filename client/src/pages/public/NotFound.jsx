import React from 'react';
import { Link } from 'react-router-dom';
import { Wrench, Home, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 text-center">
      <div className="max-w-md mx-auto">
        <div className="w-16 h-16 bg-teal-50 border border-teal-200 text-teal-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-inner">
          <Wrench size={32} className="transform -rotate-12" />
        </div>
        <span className="text-4xl sm:text-6xl font-black text-navy-900 block mb-2">404</span>
        <h2 className="text-xl font-bold text-navy-900 mb-2">Page Not Found</h2>
        <p className="text-xs text-slate-500 mb-6">
          The service, page, or resource you are looking for does not exist or has been relocated.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
          >
            <Home size={14} /> Back to Homepage
          </Link>
          <Link
            to="/services"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors"
          >
            Explore Services
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;

