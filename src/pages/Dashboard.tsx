import React, { useState, useEffect, useLayoutEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Settings, 
  AlertCircle, 
  UserCircle, 
  LogOut, 
  Plus,
  Calendar,
  Clock,
  Activity,
  BookOpen,
  Award,
  Target,
  PlayCircle
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import DashboardOverview from '../components/DashboardOverview';
import CustomCounselorForm from '../components/CustomCounselorForm';
import Layout from '../components/Layout';

interface DashboardProps {
  session: any;
}

export default function Dashboard({ session }: DashboardProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [showCreateCounselor, setShowCreateCounselor] = useState<boolean>(false);
  const [customCounselors, setCustomCounselors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recentSessions, setRecentSessions] = useState<any[]>([]);

  useLayoutEffect(() => {
    if (location.state && (location.state as any).createCounselor) {
      setShowCreateCounselor(true);
      window.history.replaceState({}, document.title);
    }
  }, [location]);
  
  useEffect(() => {
    fetchCounselors();
    fetchRecentSessions();
  }, [session.user.id]);

  const fetchRecentSessions = async () => {
    try {
      const { data, error } = await supabase
        .from('sessions')
        .select(`
          *,
          chat_messages (
            content,
            role,
            created_at
          )
        `)
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setRecentSessions(data || []);
    } catch (error) {
      console.error('Error fetching recent sessions:', error);
    }
  };

  const fetchCounselors = async () => {
    try {
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

      setCustomCounselors(counselorsWithAvatars);
    } catch (error: any) {
      console.error('Error fetching counselors:', error);
      setError('Failed to load your counselors. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const navigateToSelectCounselor = () => {
    navigate('/select-counselor');
  };

  const handleCreateCounselor = async (counselor: any) => {
    try {
      setError(null);
      const { data, error } = await supabase
        .from('counselors')
        .insert([
          {
            user_id: session.user.id,
            name: counselor.name,
            specialty: counselor.specialty,
            personality: counselor.personality,
            approach: counselor.approach,
            voice: counselor.voice,
            avatar_style: counselor.avatarStyle,
            avatar_seed: counselor.avatarSeed,
            system_prompt: counselor.systemPrompt
          }
        ])
        .select()
        .single();

      if (error) throw error;

      const counselorWithAvatar = {
        ...data,
        avatar: `https://api.dicebear.com/7.x/${data.avatar_style}/svg?seed=${data.avatar_seed}`
      };

      setCustomCounselors([counselorWithAvatar, ...customCounselors]);
      setShowCreateCounselor(false);
    } catch (error: any) {
      console.error('Error creating counselor:', error);
      setError('Failed to create counselor. Please try again.');
    }
  };

  const renderContent = () => {
    if (showCreateCounselor) {
      return (
        <div className="py-8">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Create Your Custom Counselor</h2>
            <button
              onClick={() => setShowCreateCounselor(false)}
              className="text-gray-600 hover:text-gray-900"
            >
              Cancel
            </button>
          </div>
          <CustomCounselorForm 
            onCreateCounselor={(counselor) => {
              handleCreateCounselor(counselor);
            }} 
          />
        </div>
      );
    } else {
      return (
        <div className="space-y-8 py-8">
          <DashboardOverview session={session} />
          
          {/* Start Session Button */}
          <div className="glass-effect rounded-xl p-8 text-center">
            {loading ? (
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            ) : customCounselors.length === 0 ? (
              <div>
                <div className="flex justify-center">
                  <Plus className="w-16 h-16 text-blue-600" />
                </div>
                <h2 className="mt-4 text-2xl font-bold text-gray-900">Welcome to Artiaid</h2>
                <p className="mt-2 text-gray-600 max-w-md mx-auto">
                  Create your first custom counselor to begin your therapeutic journey
                </p>
                <button
                  onClick={() => setShowCreateCounselor(true)}
                  className="mt-6 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:opacity-90 text-lg transform hover:-translate-y-1 transition-all duration-200"
                >
                  Create Your First Counselor
                </button>
              </div>
            ) : (
              <div>
                <div className="flex justify-center">
                  <PlayCircle className="w-16 h-16 text-blue-600" />
                </div>
                <h2 className="mt-4 text-2xl font-bold text-gray-900">Ready for Your Session?</h2>
                <p className="mt-2 text-gray-600 max-w-md mx-auto">
                  Start a new counseling session with one of your custom counselors
                </p>
                <button
                  onClick={navigateToSelectCounselor}
                  className="mt-6 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:opacity-90 text-lg transform hover:-translate-y-1 transition-all duration-200"
                >
                  Start Session
                </button>
              </div>
            )}
          </div>

          {/* Resources and Goals Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass-effect rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Recommended Resources</h2>
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  Browse All
                </button>
              </div>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 bg-blue-50/50 rounded-lg hover:bg-blue-50/80 transition-colors">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                  <div>
                    <h3 className="font-medium text-gray-900">Mindfulness Guide</h3>
                    <p className="text-sm text-gray-600">10-minute daily practice</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-purple-50/50 rounded-lg hover:bg-purple-50/80 transition-colors">
                  <Award className="w-5 h-5 text-purple-600" />
                  <div>
                    <h3 className="font-medium text-gray-900">Stress Management</h3>
                    <p className="text-sm text-gray-600">Practical techniques</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-effect rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Your Goals</h2>
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  Set New Goal
                </button>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50/50 rounded-lg hover:bg-green-50/80 transition-colors">
                  <div className="flex items-center space-x-3">
                    <Activity className="w-5 h-5 text-green-600" />
                    <div>
                      <h3 className="font-medium text-gray-900">Reduce Anxiety</h3>
                      <p className="text-sm text-gray-600">2 sessions per week</p>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-green-600">75%</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-orange-50/50 rounded-lg hover:bg-orange-50/80 transition-colors">
                  <div className="flex items-center space-x-3">
                    <Target className="w-5 h-5 text-orange-600" />
                    <div>
                      <h3 className="font-medium text-gray-900">Better Sleep</h3>
                      <p className="text-sm text-gray-600">Practice mindfulness</p>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-orange-600">40%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Sessions */}
          <div className="glass-effect rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Recent Sessions</h2>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                View All
              </button>
            </div>
            <div className="space-y-4">
              {recentSessions.map((session) => (
                <div key={session.id} className="border-b last:border-0 pb-4 last:pb-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gray-100/50 rounded-lg">
                        <Calendar className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{session.counselor_name}</h3>
                        <p className="text-sm text-gray-600">
                          {new Date(session.started_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm text-gray-600">
                      {session.duration ? session.duration.replace('seconds', 's') : 'Ongoing'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <Layout>
      {renderContent()}
    </Layout>
  );
}