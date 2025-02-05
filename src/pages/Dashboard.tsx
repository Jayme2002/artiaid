import React, { useState } from 'react';
import { Settings, AlertCircle, UserCircle, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';
import CounselorGrid from '../components/CounselorGrid';
import SessionInterface from '../components/SessionInterface';
import DashboardOverview from '../components/DashboardOverview';

interface DashboardProps {
  session: any;
}

export default function Dashboard({ session }: DashboardProps) {
  const [activeSession, setActiveSession] = useState(false);
  const [selectedCounselor, setSelectedCounselor] = useState<any>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const startSession = (counselor: any) => {
    setSelectedCounselor(counselor);
    setActiveSession(true);
  };

  const endSession = () => {
    setActiveSession(false);
    setSelectedCounselor(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-4 py-3 fixed top-0 w-full z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-blue-600">Artiaid</h1>
            <span className="text-sm text-gray-500">Your AI Counselor</span>
          </div>
          <div className="flex items-center space-x-4">
            <button
              className="text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-blue-50"
              onClick={() => window.open('/resources', '_blank')}
            >
              <AlertCircle className="w-5 h-5" />
            </button>
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-blue-50 focus:outline-none"
              >
                <UserCircle className="w-6 h-6" />
              </button>
              
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 border">
                  <button
                    onClick={() => {/* Implement settings */}}
                    className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Settings</span>
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="pt-16 px-4 max-w-7xl mx-auto">
        {activeSession ? (
          <SessionInterface
            counselor={selectedCounselor}
            onEndSession={endSession}
            session={session}
          />
        ) : (
          <div className="space-y-8 py-8">
            <DashboardOverview session={session} />
            <CounselorGrid onSelectCounselor={startSession} />
          </div>
        )}
      </main>
    </div>
  );
}