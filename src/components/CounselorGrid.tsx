import React, { useState, useEffect } from 'react';
import { Play, Filter, Search, X, Brain, Heart, Target, MessageSquare } from 'lucide-react';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCounselor, setSelectedCounselor] = useState<Counselor | null>(null);

  const filteredCounselors = counselors.filter(counselor => {
    const matchesSearch = searchTerm === '' || 
      counselor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      counselor.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
      counselor.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilters = 
      (filters.specialty === '' || counselor.specialty === filters.specialty) &&
      (filters.style === '' || counselor.style === filters.style) &&
      (filters.voice === '' || counselor.voice === filters.voice);

    return matchesSearch && matchesFilters;
  });

  const handleCounselorClick = (counselor: Counselor) => {
    setSelectedCounselor(counselor);
  };

  const clearFilters = () => {
    setFilters({
      specialty: '',
      style: '',
      voice: ''
    });
    setSearchTerm('');
  };

  return (
    <div className="space-y-6">
      {/* Header and Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Choose Your Counselor</h2>
          <p className="text-gray-600 mt-1">Find the perfect match for your journey</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative flex-1 md:w-64">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search counselors..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-lg border ${showFilters ? 'bg-blue-50 border-blue-200 text-blue-600' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}
          >
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-900">Filters</h3>
            <button
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <X className="w-4 h-4" />
              Clear all
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Specialty</label>
              <select
                className="w-full rounded-lg border-gray-300 text-sm"
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
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Style</label>
              <select
                className="w-full rounded-lg border-gray-300 text-sm"
                value={filters.style}
                onChange={(e) => setFilters({ ...filters, style: e.target.value })}
              >
                <option value="">All Styles</option>
                <option value="Direct">Direct</option>
                <option value="Nurturing">Nurturing</option>
                <option value="Analytical">Analytical</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Voice</label>
              <select
                className="w-full rounded-lg border-gray-300 text-sm"
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
        </div>
      )}

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>{filteredCounselors.length} counselors available</span>
        {(filters.specialty || filters.style || filters.voice || searchTerm) && (
          <button
            onClick={clearFilters}
            className="text-blue-600 hover:text-blue-700"
          >
            Clear all filters
          </button>
        )}
      </div>

      {/* Counselor Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredCounselors.map((counselor) => (
          <div
            key={counselor.id}
            className={`bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 cursor-pointer ${
              selectedCounselor?.id === counselor.id ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => handleCounselorClick(counselor)}
          >
            <div className="aspect-w-1 aspect-h-1 relative">
              <img
                src={counselor.avatar}
                alt={counselor.name}
                className="w-full h-48 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="text-xl font-semibold text-white">{counselor.name}</h3>
                <div className="flex items-center mt-1">
                  <span className="bg-white/20 text-white text-sm px-2 py-1 rounded-full backdrop-blur-sm">
                    {counselor.specialty}
                  </span>
                </div>
              </div>
            </div>
            <div className="p-4">
              <div className="space-y-3">
                <p className="text-gray-600 text-sm line-clamp-2">{counselor.description}</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-1 text-gray-600">
                    <Brain className="w-4 h-4" />
                    <span>{counselor.style}</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-600">
                    <Heart className="w-4 h-4" />
                    <span>{counselor.personality.split(' ')[0]}</span>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectCounselor(counselor);
                  }}
                  className="w-full mt-2 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Start Session</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredCounselors.length === 0 && (
        <div className="text-center py-12">
          <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No counselors found</h3>
          <p className="text-gray-600 mt-1">Try adjusting your filters or search terms</p>
          <button
            onClick={clearFilters}
            className="mt-4 text-blue-600 hover:text-blue-700"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}