import React, { useState } from 'react';
import { Play, Filter } from 'lucide-react';

interface Counselor {
  id: string;
  name: string;
  avatar: string;
  specialty: string;
  personality: string;
  style: string;
  voice: string;
  description: string;
}

const counselors: Counselor[] = [
  {
    id: '1',
    name: 'Alloy',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200&h=200',
    specialty: 'Anxiety',
    personality: 'Calm and methodical',
    style: 'Analytical',
    voice: 'Professional',
    description: 'Specializes in evidence-based approaches to anxiety management'
  },
  {
    id: '2',
    name: 'Ash',
    avatar: 'https://images.unsplash.com/photo-1552058544-f2b08422138a?auto=format&fit=crop&q=80&w=200&h=200',
    specialty: 'Depression',
    personality: 'Warm and empathetic',
    style: 'Nurturing',
    voice: 'Warm',
    description: 'Focuses on building resilience and finding inner strength'
  },
  {
    id: '3',
    name: 'Ballad',
    avatar: 'https://images.unsplash.com/photo-1499952127939-9bbf5af6c51c?auto=format&fit=crop&q=80&w=200&h=200',
    specialty: 'Relationships',
    personality: 'Insightful and balanced',
    style: 'Direct',
    voice: 'Professional',
    description: 'Helps navigate complex relationship dynamics'
  },
  {
    id: '4',
    name: 'Coral',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200&h=200',
    specialty: 'Stress',
    personality: 'Gentle and supportive',
    style: 'Nurturing',
    voice: 'Casual',
    description: 'Expert in stress management and work-life balance'
  },
  {
    id: '5',
    name: 'Echo',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200&h=200',
    specialty: 'Trauma',
    personality: 'Patient and understanding',
    style: 'Analytical',
    voice: 'Professional',
    description: 'Specialized in trauma-informed care approaches'
  },
  {
    id: '6',
    name: 'Sage',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200&h=200',
    specialty: 'Self-esteem',
    personality: 'Encouraging and positive',
    style: 'Direct',
    voice: 'Warm',
    description: 'Helps build confidence and self-worth'
  },
  {
    id: '7',
    name: 'Shimmer',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200&h=200',
    specialty: 'Career',
    personality: 'Motivating and strategic',
    style: 'Direct',
    voice: 'Professional',
    description: 'Guides career development and workplace challenges'
  },
  {
    id: '8',
    name: 'Verse',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200&h=200',
    specialty: 'Mindfulness',
    personality: 'Serene and present',
    style: 'Nurturing',
    voice: 'Casual',
    description: 'Expert in mindfulness and meditation practices'
  }
];

interface CounselorGridProps {
  onSelectCounselor: (counselor: Counselor) => void;
}

export default function CounselorGrid({ onSelectCounselor }: CounselorGridProps) {
  const [filters, setFilters] = useState({
    specialty: '',
    style: '',
    voice: ''
  });

  const filteredCounselors = counselors.filter(counselor => {
    if (filters.specialty && counselor.specialty !== filters.specialty) return false;
    if (filters.style && counselor.style !== filters.style) return false;
    if (filters.voice && counselor.voice !== filters.voice) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Choose Your Counselor</h2>
        <div className="flex items-center space-x-4">
          <select
            className="rounded-lg border-gray-300 text-sm"
            value={filters.specialty}
            onChange={(e) => setFilters({ ...filters, specialty: e.target.value })}
          >
            <option value="">All Specialties</option>
            <option value="Anxiety">Anxiety</option>
            <option value="Depression">Depression</option>
            <option value="Relationships">Relationships</option>
            <option value="Stress">Stress</option>
            <option value="Trauma">Trauma</option>
            <option value="Self-esteem">Self-esteem</option>
            <option value="Career">Career</option>
            <option value="Mindfulness">Mindfulness</option>
          </select>
          <select
            className="rounded-lg border-gray-300 text-sm"
            value={filters.style}
            onChange={(e) => setFilters({ ...filters, style: e.target.value })}
          >
            <option value="">All Styles</option>
            <option value="Direct">Direct</option>
            <option value="Nurturing">Nurturing</option>
            <option value="Analytical">Analytical</option>
          </select>
          <select
            className="rounded-lg border-gray-300 text-sm"
            value={filters.voice}
            onChange={(e) => setFilters({ ...filters, voice: e.target.value })}
          >
            <option value="">All Voices</option>
            <option value="Warm">Warm</option>
            <option value="Professional">Professional</option>
            <option value="Casual">Casual</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredCounselors.map((counselor) => (
          <div
            key={counselor.id}
            className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow group"
          >
            <div className="aspect-w-1 aspect-h-1 relative">
              <img
                src={counselor.avatar}
                alt={counselor.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity flex items-center justify-center">
                <button
                  onClick={() => onSelectCounselor(counselor)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity transform hover:scale-105"
                >
                  Begin Session
                </button>
              </div>
            </div>
            <div className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">{counselor.name}</h3>
                <span className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-full">
                  {counselor.specialty}
                </span>
              </div>
              <p className="text-sm text-gray-600">{counselor.description}</p>
              <div className="flex items-center space-x-2">
                <button
                  className="text-blue-600 text-sm flex items-center space-x-1"
                  onClick={() => {/* Implement voice sample playback */}}
                >
                  <Play className="w-4 h-4" />
                  <span>Voice Sample</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}