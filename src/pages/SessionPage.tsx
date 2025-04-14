import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import SessionInterface from '../components/SessionInterface';
import Layout from '../components/Layout';
import { counselorPrompts } from '../lib/counselorPrompts';

interface SessionPageProps {
  session: any;
}

interface CounselorInfo {
  name: string;
  voice: string;
  system_prompt: string;
}

export default function SessionPage({ session }: SessionPageProps) {
  const [counselorInfo, setCounselorInfo] = useState<CounselorInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.log('SessionPage mounted.');
    console.log('Current pathname:', location.pathname);
    console.log('Auth session:', session);
    console.log('Location state:', location.state);

    const { counselingType, voice } = (location.state || {}) as { counselingType?: string, voice?: string };

    if (counselingType && voice) {
      const promptData = counselorPrompts[counselingType];
      
      if (promptData) {
        const info: CounselorInfo = {
          name: counselingType,
          voice: voice,
          system_prompt: promptData.systemPrompt
        };
        console.log('Setting up session with info:', info);
        setCounselorInfo(info);
        setError(null);
      } else {
        console.error(`No prompt found for counseling type: ${counselingType}`);
        setError(`Invalid counseling type selected: ${counselingType}`);
      }
    } else {
      console.error('Missing counselingType or voice in location state');
      setError('Session details missing. Please go back to the dashboard and select session options.');
    }

    setLoading(false);

    return () => {
      console.log('SessionPage unmounting');
    };
  }, [location, session, navigate]);

  const handleEndSession = () => {
    console.log('Ending session, navigating to dashboard');
    navigate('/dashboard');
  };

  if (loading) {
    console.log('SessionPage rendering loading state');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !counselorInfo) {
    console.log('SessionPage rendering error state. Error:', error);
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 pt-16 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="bg-red-50 text-red-600 p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-bold mb-2">Error Starting Session</h2>
              <p>{error || 'Something went wrong. Session details might be missing.'}</p>
              <button
                onClick={() => navigate('/dashboard')}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  console.log('SessionPage rendering session interface with counselor info:', counselorInfo);
  return (
    <Layout>
      <SessionInterface
        counselor={counselorInfo}
        onEndSession={handleEndSession}
        session={session}
      />
    </Layout>
  );
} 