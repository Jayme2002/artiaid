import React, { useState, useEffect, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  PlayCircle,
  ChevronDown,
  Speaker
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import Layout from '../components/Layout';
import { counselorPrompts } from '../lib/counselorPrompts';

interface DashboardProps {
  session: any;
}

const availableVoices = ['alloy', 'ash', 'ballad', 'coral', 'echo', 'nova', 'onyx', 'sage', 'shimmer', 'verse'];
// Filter to keep only these four counseling types
const allowedCounselingTypes = ['Anxiety Treatment', 'Depression Support', 'Relationship Counseling', 'Trauma Support'];
const counselingTypes = Object.keys(counselorPrompts).filter(type => allowedCounselingTypes.includes(type));

export default function Dashboard({ session }: DashboardProps) {
  const navigate = useNavigate();
  const [selectedCounselingType, setSelectedCounselingType] = useState<string>(counselingTypes[0]);
  const [selectedVoice, setSelectedVoice] = useState<string>(availableVoices[0]);

  const handleStartSession = () => {
    if (selectedCounselingType && selectedVoice) {
      navigate('/session', { 
        state: { 
          counselingType: selectedCounselingType, 
          voice: selectedVoice 
        } 
      });
    } else {
      console.error("Please select a counseling type and voice.");
    }
  };

  const renderContent = () => {
    return (
      <div className="space-y-8 py-8 max-w-2xl mx-auto">
        <div className="text-center">
           <h1 className="text-3xl font-bold text-gray-900">Welcome, {session.user.email || 'User'}!</h1>
           <p className="mt-2 text-lg text-gray-600">Ready to start your session?</p>
        </div>

        <div className="glass-effect rounded-xl p-8 space-y-6">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">Configure Your Session</h2>
          
          <div>
            <label htmlFor="counselingType" className="block text-sm font-medium text-gray-700 mb-1">
              Choose Counseling Type
            </label>
            <div className="relative">
              <select
                id="counselingType"
                value={selectedCounselingType}
                onChange={(e) => setSelectedCounselingType(e.target.value)}
                className="w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md appearance-none bg-white"
              >
                {counselingTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <ChevronDown className="h-4 w-4" />
              </div>
            </div>
            
            <p className="mt-2 text-sm text-gray-500">
              Select the type of counseling that best matches your current needs.
            </p>
          </div>

          <div>
            <label htmlFor="voice" className="block text-sm font-medium text-gray-700 mb-1">
              Choose Voice
            </label>
            <div className="relative">
              <select
                id="voice"
                value={selectedVoice}
                onChange={(e) => setSelectedVoice(e.target.value)}
                className="w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md appearance-none bg-white"
              >
                {availableVoices.map((voice) => (
                  <option key={voice} value={voice}>
                    {voice.charAt(0).toUpperCase() + voice.slice(1)}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <ChevronDown className="h-4 w-4" />
              </div>
            </div>
            
            <p className="mt-2 text-sm text-gray-500">
              Select the voice you'd prefer for your AI counselor.
            </p>
          </div>
          
          <div className="pt-4">
            <button
              onClick={handleStartSession}
              disabled={!selectedCounselingType || !selectedVoice}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:opacity-90 text-lg transform hover:-translate-y-1 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <PlayCircle className="w-6 h-6" />
              <span>Start Session</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Layout>
      <div className="px-4 sm:px-6 lg:px-8">
        {renderContent()}
      </div>
    </Layout>
  );
}