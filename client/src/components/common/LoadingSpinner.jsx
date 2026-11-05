import React from 'react';

const LoadingSpinner = ({ text = 'Loading data...', size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div
        className={`${sizeClasses[size] || sizeClasses.md} border-teal-600 border-t-transparent rounded-full animate-spin mb-3`}
      ></div>
      {text && <p className="text-xs font-medium text-slate-500 animate-pulse">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;

