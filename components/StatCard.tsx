
import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  change: string;
  type: 'info' | 'success' | 'warning' | 'danger';
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, type }) => {
  const colors = {
    info: 'text-blue-600 bg-blue-50',
    success: 'text-green-600 bg-green-50',
    warning: 'text-orange-600 bg-orange-50',
    danger: 'text-red-600 bg-red-50',
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm transition-transform hover:scale-[1.02]">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
          <h4 className="text-2xl font-bold text-slate-900">{value}</h4>
        </div>
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${colors[type]}`}>
          {change}
        </span>
      </div>
      <div className="mt-4 flex items-center text-xs text-slate-400">
        <svg className="w-4 h-4 mr-1 text-slate-300" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
        </svg>
        Last updated 5 mins ago
      </div>
    </div>
  );
};

export default StatCard;
