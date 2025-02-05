import React from 'react';
import { Clock, Calendar, Activity } from 'lucide-react';

interface DashboardOverviewProps {
  session: any;
}

export default function DashboardOverview({ session }: DashboardOverviewProps) {
  const userEmail = session?.user?.email || '';
  const userName = userEmail.split('@')[0];

  const metrics = {
    lastSession: '2024-03-15 14:30',
    totalSessions: 12,
    totalTime: '18.5 hours'
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">
          Welcome back, {userName}
        </h2>
        <p className="text-gray-600">
          Your safe space for growth and support
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-purple-50 rounded-lg p-4 flex items-center space-x-4">
          <div className="bg-purple-100 p-2 rounded-lg">
            <Calendar className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Last Session</p>
            <p className="font-semibold text-gray-900">{metrics.lastSession}</p>
          </div>
        </div>

        <div className="bg-purple-50 rounded-lg p-4 flex items-center space-x-4">
          <div className="bg-purple-100 p-2 rounded-lg">
            <Activity className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Sessions</p>
            <p className="font-semibold text-gray-900">{metrics.totalSessions}</p>
          </div>
        </div>

        <div className="bg-purple-50 rounded-lg p-4 flex items-center space-x-4">
          <div className="bg-purple-100 p-2 rounded-lg">
            <Clock className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Time</p>
            <p className="font-semibold text-gray-900">{metrics.totalTime}</p>
          </div>
        </div>
      </div>
    </div>
  );
}