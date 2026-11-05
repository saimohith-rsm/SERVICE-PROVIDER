import React from 'react';

const StatusBadge = ({ status }) => {
  const getStyles = () => {
    switch (status) {
      case 'Pending':
      case 'pending':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Accepted':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'On The Way':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'In Progress':
        return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'Completed':
      case 'approved':
      case 'Paid':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Cancelled':
      case 'rejected':
      case 'Failed':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStyles()}`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-70"></span>
      {status}
    </span>
  );
};

export default StatusBadge;

