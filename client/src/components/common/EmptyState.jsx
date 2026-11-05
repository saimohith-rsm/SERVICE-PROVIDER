import React from 'react';
import { AlertCircle } from 'lucide-react';

const EmptyState = ({
  icon: Icon = AlertCircle,
  title = 'No items found',
  description = 'Try adjusting your filters or search terms.',
  actionText,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-white border border-slate-200/80 rounded-2xl shadow-sm my-4">
      <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 mb-4 shadow-inner">
        <Icon size={28} />
      </div>
      <h3 className="text-base font-semibold text-slate-800 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm mb-5">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors shadow-sm"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;

