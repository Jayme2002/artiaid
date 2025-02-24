import React, { useState, useEffect } from 'react';
import { TrendingUp, MessageSquare, Clock, Target } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface DashboardOverviewProps {
  session: any;
}

export default function DashboardOverview({ session }: DashboardOverviewProps) {
  const firstName = session?.user?.user_metadata?.first_name || 'there';
  const [insights, setInsights] = useState({
    weeklyProgress: 75,
    sessionsThisWeek: 3,
    totalMinutes: 120,
    streakDays: 5
  });

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">
          Welcome back, {firstName}
        </h2>
        <p className="text-gray-600">
          Your safe space for growth and support
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-2xl font-bold text-purple-600">{insights.weeklyProgress}%</span>
          </div>
          <h3 className="font-medium text-gray-900">Weekly Progress</h3>
          <p className="text-sm text-gray-600 mt-1">Based on session goals</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <MessageSquare className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-2xl font-bold text-blue-600">{insights.sessionsThisWeek}</span>
          </div>
          <h3 className="font-medium text-gray-900">Sessions This Week</h3>
          <p className="text-sm text-gray-600 mt-1">Keep up the momentum</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <Clock className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-2xl font-bold text-green-600">{insights.totalMinutes}m</span>
          </div>
          <h3 className="font-medium text-gray-900">Total Time</h3>
          <p className="text-sm text-gray-600 mt-1">Minutes in therapy</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Target className="w-6 h-6 text-orange-600" />
            </div>
            <span className="text-2xl font-bold text-orange-600">{insights.streakDays}</span>
          </div>
          <h3 className="font-medium text-gray-900">Day Streak</h3>
          <p className="text-sm text-gray-600 mt-1">Consecutive days active</p>
        </div>
      </div>
    </div>
  );
}