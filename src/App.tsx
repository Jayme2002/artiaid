import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { supabase } from './lib/supabase';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import SessionPage from './pages/SessionPage';

// The location hook can only be used inside Router, so create a wrapper
function AppRoutes({ session }: { session: any }) {
  const location = useLocation();
  
  useEffect(() => {
    console.log('Current path in AppRoutes:', location.pathname);
    console.log('Session state:', session ? 'Logged in' : 'Not logged in');
  }, [location.pathname, session]);

  return (
    <Routes>
      <Route
        path="/"
        element={
          session ? <Navigate to="/dashboard" replace /> : <LandingPage />
        }
      />
      <Route
        path="/dashboard"
        element={
          session ? <Dashboard session={session} /> : <Navigate to="/" replace />
        }
      />
      <Route
        path="/session"
        element={
          session ? <SessionPage session={session} /> : <Navigate to="/" replace />
        }
      />
    </Routes>
  );
}

function App() {
  const [session, setSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('App component mounted');
    
    const getInitialSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        console.log('Initial session check:', data.session ? 'Session exists' : 'No session');
        setSession(data.session);
      } catch (error) {
        console.error('Error getting initial session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    getInitialSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('Auth state changed. Event:', _event);
      console.log('New session state:', session ? 'Session exists' : 'No session');
      setSession(session);
    });

    return () => {
      console.log('Unsubscribing from auth state changes');
      subscription.unsubscribe();
    };
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Router>
      <AppRoutes session={session} />
    </Router>
  );
}

export default App;