import React from 'react';

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: string;
  color: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
  change?: {
    value: number;
    isPositive: boolean;
  };
}

const colorClasses = {
  blue: 'bg-blue-500 text-white',
  green: 'bg-green-500 text-white',
  yellow: 'bg-yellow-500 text-white',
  red: 'bg-red-500 text-white',
  purple: 'bg-purple-500 text-white',
};

export default function DashboardCard({ title, value, icon, color, change }: DashboardCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-5">
        <div className="flex items-center">
          <div className={`rounded-full p-3 ${colorClasses[color]}`}>
            <i className={`fas fa-${icon} text-xl`}></i>
          </div>
          <div className="ml-5">
            <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
            <p className="text-2xl font-bold">{value}</p>
            {change && (
              <p className={`text-sm ${change.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                <i className={`fas fa-arrow-${change.isPositive ? 'up' : 'down'} mr-1`}></i>
                {change.value}% from last month
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
