import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Settings, 
  AlertCircle, 
  UserCircle, 
  LogOut
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.log('Layout mounted. Current path:', location.pathname);
  }, [location.pathname]);

  const handleSignOut = async () => {
    console.log('Signing out');
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-4 py-3 fixed top-0 w-full z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link to="/dashboard" className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-blue-600">Artiaid</h1>
            <span className="text-sm text-gray-500">Your AI Counselor</span>
          </Link>
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
                    onClick={() => {
                      console.log('Navigating to dashboard from menu');
                      navigate('/dashboard');
                    }}
                    className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                  >
                    <span>Dashboard</span>
                  </button>
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
        {children}
      </main>
    </div>
  );
} 