import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import SessionInterface from '../components/SessionInterface';
import Layout from '../components/Layout';

interface SessionPageProps {
  session: any;
}

export default function SessionPage({ session }: SessionPageProps) {
  const { counselorId } = useParams<{ counselorId: string }>();
  const [counselor, setCounselor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Add logging on component mount
  useEffect(() => {
    console.log('SessionPage mounted. counselorId:', counselorId);
    console.log('Current pathname:', location.pathname);
    console.log('Auth session:', session);
    
    if (counselorId) {
      fetchCounselor(counselorId);
    } else {
      console.error('No counselorId provided in URL params');
      setError('No counselor selected');
      setLoading(false);
    }
    
    // This will help us detect unmounting
    return () => {
      console.log('SessionPage unmounting');
    };
  }, [counselorId, location, session]);

  const fetchCounselor = async (id: string) => {
    try {
      console.log('Fetching counselor with ID:', id);
      setLoading(true);
      const { data, error } = await supabase
        .from('counselors')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Supabase error fetching counselor:', error);
        throw error;
      }

      if (data) {
        console.log('Counselor data fetched successfully:', data);
        // Add avatar URL to counselor data
        const counselorWithAvatar = {
          ...data,
          avatar: `https://api.dicebear.com/7.x/${data.avatar_style}/svg?seed=${data.avatar_seed}`
        };
        setCounselor(counselorWithAvatar);
      } else {
        console.error('No counselor found with ID:', id);
        setError('Counselor not found');
      }
    } catch (error: any) {
      console.error('Error fetching counselor:', error);
      setError('Failed to load counselor details');
    } finally {
      setLoading(false);
    }
  };

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

  if (error || !counselor) {
    console.log('SessionPage rendering error state. Error:', error, 'Counselor:', counselor);
    return (
      <div className="min-h-screen bg-gray-50 pt-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 text-red-600 p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-bold mb-2">Error</h2>
            <p>{error || 'Something went wrong'}</p>
            <button
              onClick={() => navigate('/select-counselor')}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
            >
              Select a Different Counselor
            </button>
          </div>
        </div>
      </div>
    );
  }

  console.log('SessionPage rendering session interface with counselor:', counselor);
  return (
    <Layout>
      <SessionInterface
        counselor={counselor}
        onEndSession={handleEndSession}
        session={session}
      />
    </Layout>
  );
} 