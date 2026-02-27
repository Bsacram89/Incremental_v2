import React from 'react';

const StatisticsCard = ({ title, value, subtitle, color = 'blue', icon: Icon }) => {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-800',
    green: 'bg-green-50 border-green-200 text-green-800',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    red: 'bg-red-50 border-red-200 text-red-800',
    purple: 'bg-purple-50 border-purple-200 text-purple-800'
  };

  const iconColorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    yellow: 'text-yellow-600',
    red: 'text-red-600',
    purple: 'text-purple-600'
  };

  return (
    <div className={`p-6 rounded-lg border-2 ${colorClasses[color]}`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-sm mb-1">{title}</h3>
          <p className="text-3xl font-bold mb-1">{value}</p>
          {subtitle && (
            <p className="text-sm opacity-80">{subtitle}</p>
          )}
        </div>
        {Icon && (
          <Icon className={`h-8 w-8 ${iconColorClasses[color]}`} />
        )}
      </div>
    </div>
  );
};

export default StatisticsCard;

