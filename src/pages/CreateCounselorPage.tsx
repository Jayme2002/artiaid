import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomCounselorForm from '../components/CustomCounselorForm';
import { supabase } from '../lib/supabase';

interface CreateCounselorPageProps {
  session: any;
}

export default function CreateCounselorPage({ session }: CreateCounselorPageProps) {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

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

      // Navigate back to counselor selection after successful creation
      navigate('/counselor-selection');
    } catch (error: any) {
      console.error('Error creating counselor:', error);
      setError('Failed to create counselor. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16 px-4">
      <div className="max-w-7xl mx-auto py-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Create Your Custom Counselor</h2>
          <button
            onClick={() => navigate('/counselor-selection')}
            className="text-gray-600 hover:text-gray-900"
          >
            Cancel
          </button>
        </div>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
            <p>{error}</p>
          </div>
        )}
        
        <CustomCounselorForm onCreateCounselor={handleCreateCounselor} />
      </div>
    </div>
  );
} 