import React, { useState, useEffect } from 'react';
import { Clock, Calendar, Activity } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface DashboardOverviewProps {
  session: any;
}

export default function DashboardOverview({ session }: DashboardOverviewProps) {
  const firstName = session?.user?.user_metadata?.first_name || 'there';
  const [metrics, setMetrics] = useState({
    lastSession: 'No sessions yet',
    totalSessions: 0,
    totalTime: '0 hours'
  });

  useEffect(() => {
    const fetchSessionMetrics = async () => {
      // Get total sessions count
      const { count } = await supabase
        .from('sessions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', session.user.id);

      // Get last session
      const { data: lastSession } = await supabase
        .from('sessions')
        .select('started_at')
        .eq('user_id', session.user.id)
        .order('started_at', { ascending: false })
        .limit(1)
        .single();

      // Get total duration
      const { data: sessions } = await supabase
        .from('sessions')
        .select('duration')
        .eq('user_id', session.user.id);

      let totalSeconds = 0;
      sessions?.forEach(session => {
        if (session.duration) {
          // Parse the interval string to seconds
          const durationMatch = session.duration.match(/(\d+) seconds/);
          if (durationMatch) {
            totalSeconds += parseInt(durationMatch[1]);
          }
        }
      });

      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);

      setMetrics({
        lastSession: lastSession ? new Date(lastSession.started_at).toLocaleString() : 'No sessions yet',
        totalSessions: count || 0,
        totalTime: `${hours}h ${minutes}m`
      });
    };

    if (session?.user?.id) {
      fetchSessionMetrics();
    }
  }, [session?.user?.id]);

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">
          Welcome back, {firstName}
        </h2>
        <p className="text-gray-600">
          Your safe space for growth and support
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-50 rounded-lg p-4 flex items-center space-x-4">
          <div className="bg-blue-100 p-2 rounded-lg">
            <Calendar className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Last Session</p>
            <p className="font-semibold text-gray-900">{metrics.lastSession}</p>
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-4 flex items-center space-x-4">
          <div className="bg-blue-100 p-2 rounded-lg">
            <Activity className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Sessions</p>
            <p className="font-semibold text-gray-900">{metrics.totalSessions}</p>
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-4 flex items-center space-x-4">
          <div className="bg-blue-100 p-2 rounded-lg">
            <Clock className="w-6 h-6 text-blue-600" />
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