import React, { useState, useEffect } from 'react';
import { Settings, AlertCircle, UserCircle, LogOut, Plus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import SessionInterface from '../components/SessionInterface';
import DashboardOverview from '../components/DashboardOverview';
import CustomCounselorForm from '../components/CustomCounselorForm';
import { personalities, approaches } from '../lib/counselorConstants';

interface DashboardProps {
  session: any;
}

export default function Dashboard({ session }: DashboardProps) {
  const [activeSession, setActiveSession] = useState(false);
  const [selectedCounselor, setSelectedCounselor] = useState<any>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [customCounselors, setCustomCounselors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCounselors();
  }, [session.user.id]);

  const fetchCounselors = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('counselors')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Add avatar URL to each counselor
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

      // Add avatar URL to the new counselor
      const counselorWithAvatar = {
        ...data,
        avatar: `https://api.dicebear.com/7.x/${data.avatar_style}/svg?seed=${data.avatar_seed}`
      };

      setCustomCounselors([counselorWithAvatar, ...customCounselors]);
      setShowCreateForm(false);
    } catch (error: any) {
      console.error('Error creating counselor:', error);
      setError('Failed to create counselor. Please try again.');
    }
  };

  const handleDeleteCounselor = async (counselorId: string) => {
    if (!window.confirm('Are you sure you want to delete this counselor?')) return;

    try {
      setError(null);
      const { error } = await supabase
        .from('counselors')
        .delete()
        .eq('id', counselorId);

      if (error) throw error;

      setCustomCounselors(customCounselors.filter(c => c.id !== counselorId));
    } catch (error: any) {
      console.error('Error deleting counselor:', error);
      setError('Failed to delete counselor. Please try again.');
    }
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
        ) : showCreateForm ? (
          <div className="py-8">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Create Your Custom Counselor</h2>
              <button
                onClick={() => setShowCreateForm(false)}
                className="text-gray-600 hover:text-gray-900"
              >
                Cancel
              </button>
            </div>
            <CustomCounselorForm onCreateCounselor={handleCreateCounselor} />
          </div>
        ) : (
          <div className="space-y-8 py-8">
            <DashboardOverview session={session} />
            
            {/* Custom Counselors Section */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Your Custom Counselors</h2>
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus className="w-5 h-5" />
                  <span>Create New</span>
                </button>
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg">
                  {error}
                </div>
              )}

              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading your counselors...</p>
                </div>
              ) : customCounselors.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed">
                  <div className="flex justify-center">
                    <Plus className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="mt-4 text-lg font-medium text-gray-900">No custom counselors yet</h3>
                  <p className="mt-2 text-gray-600">
                    Create your first custom counselor tailored to your needs
                  </p>
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Create Counselor
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {customCounselors.map((counselor) => (
                    <div
                      key={counselor.id}
                      className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                    >
                      <div className="aspect-w-1 aspect-h-1 relative">
                        <img
                          src={counselor.avatar}
                          alt={counselor.name}
                          className="w-full h-48 object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <h3 className="text-xl font-semibold text-white">{counselor.name}</h3>
                          <p className="text-white/80">{counselor.specialty}</p>
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-sm text-gray-600">
                            {personalities.find(p => p.id === counselor.personality)?.label}
                          </span>
                          <span className="text-sm text-gray-600">
                            {approaches.find(a => a.id === counselor.approach)?.label}
                          </span>
                        </div>
                        <div className="space-y-2">
                          <button
                            onClick={() => startSession(counselor)}
                            className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                          >
                            Start Session
                          </button>
                          <button
                            onClick={() => handleDeleteCounselor(counselor.id)}
                            className="w-full py-2 text-red-600 hover:bg-red-50 rounded-lg border border-red-200"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}