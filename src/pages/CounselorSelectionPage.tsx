import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import CounselorSelection from '../components/CounselorSelection';
import { supabase } from '../lib/supabase';
import Layout from '../components/Layout';

interface CounselorSelectionPageProps {
  session: any;
}

export default function CounselorSelectionPage({ session }: CounselorSelectionPageProps) {
  const [customCounselors, setCustomCounselors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.log('CounselorSelectionPage mounted. Current path:', location.pathname);
    console.log('Auth session:', session);
    fetchCounselors();
  }, [session.user.id, location]);

  const fetchCounselors = async () => {
    try {
      console.log('Fetching counselors for user:', session.user.id);
      setLoading(true);
      const { data, error } = await supabase
        .from('counselors')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const counselorsWithAvatars = data.map(counselor => ({
        ...counselor,
        avatar: `https://api.dicebear.com/7.x/${counselor.avatar_style}/svg?seed=${counselor.avatar_seed}`
      }));
      
      console.log('Fetched counselors:', counselorsWithAvatars);
      setCustomCounselors(counselorsWithAvatars);
    } catch (error: any) {
      console.error('Error fetching counselors:', error);
      setError('Failed to load your counselors. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCounselor = (counselor: any) => {
    console.log('CounselorSelectionPage: handleSelectCounselor called with counselor:', counselor);
    // Prepare the session URL
    const sessionUrl = `/session/${counselor.id}`;
    console.log('Attempting to navigate to:', sessionUrl);

    // Use a more direct approach with window.location for troubleshooting
    try {
      console.log('Navigating using navigate function');
      navigate(sessionUrl);
      
      // Add a fallback if the navigate function doesn't work
      setTimeout(() => {
        if (window.location.pathname !== sessionUrl) {
          console.log('Navigate function may have failed, using window.location');
          window.location.href = sessionUrl;
        }
      }, 300);
    } catch (error) {
      console.error('Navigation error:', error);
      // Fallback to direct URL change
      window.location.href = sessionUrl;
    }
  };

  const handleCreateNew = () => {
    console.log('Navigating to dashboard with createCounselor state');
    navigate('/dashboard', { state: { createCounselor: true } });
  };

  const handleBack = () => {
    console.log('Navigating back to dashboard');
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}
        
        <CounselorSelection
          counselors={customCounselors}
          onSelectCounselor={handleSelectCounselor}
          onCreateNew={handleCreateNew}
          onBack={handleBack}
        />
      </div>
    </Layout>
  );
} 