import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Settings, 
  AlertCircle, 
  UserCircle, 
  LogOut,
  Brain
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
    <div className="min-h-screen animated-gradient">
      {/* Decorative circles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-purple-200 rounded-full opacity-20 blur-3xl floating"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-200 rounded-full opacity-20 blur-3xl floating" style={{ animationDelay: '-1.5s' }}></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-green-200 rounded-full opacity-20 blur-3xl floating" style={{ animationDelay: '-0.75s' }}></div>
      </div>

      <header className="fixed top-0 w-full z-50 glass-effect">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <Brain className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                  Artiaid
                </h1>
                <span className="text-sm text-gray-500">Your AI Counselor</span>
              </div>
            </Link>
            <div className="flex items-center space-x-4">
              <button
                className="text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-white/50 transition-all"
                onClick={() => window.open('/resources', '_blank')}
              >
                <AlertCircle className="w-5 h-5" />
              </button>
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-white/50 transition-all focus:outline-none"
                >
                  <UserCircle className="w-6 h-6" />
                </button>
                
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-48 glass-effect rounded-lg shadow-lg py-1">
                    <button
                      onClick={() => {
                        console.log('Navigating to dashboard from menu');
                        navigate('/dashboard');
                      }}
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-white/50 w-full text-left"
                    >
                      <span>Dashboard</span>
                    </button>
                    <button
                      onClick={() => {/* Implement settings */}}
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-white/50 w-full text-left"
                    >
                      <Settings className="w-4 h-4" />
                      <span>Settings</span>
                    </button>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-white/50 w-full text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign out</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="pt-20 px-4 max-w-7xl mx-auto relative">
        <div className="glass-effect rounded-2xl shadow-xl p-6 my-6">
          {children}
        </div>
      </main>
    </div>
  );
}