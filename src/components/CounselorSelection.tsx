import React, { useState } from 'react';
import { 
  Plus, ArrowLeft, Search, Filter, Brain, 
  Heart, Target, MessageSquare, X 
} from 'lucide-react';

interface CounselorSelectionProps {
  counselors: any[];
  onSelectCounselor: (counselor: any) => void;
  onCreateNew: () => void;
  onBack: () => void;
}

export default function CounselorSelection({ 
  counselors, 
  onSelectCounselor, 
  onCreateNew,
  onBack 
}: CounselorSelectionProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    specialty: '',
    personality: '',
    approach: ''
  });
  const [selectedCounselor, setSelectedCounselor] = useState<any | null>(null);

  const filteredCounselors = counselors.filter(counselor => {
    const matchesSearch = searchTerm === '' || 
      counselor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      counselor.specialty.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilters = 
      (filters.specialty === '' || counselor.specialty === filters.specialty) &&
      (filters.personality === '' || counselor.personality === filters.personality) &&
      (filters.approach === '' || counselor.approach === filters.approach);

    return matchesSearch && matchesFilters;
  });

  const handleSelectCounselor = (counselor: any) => {
    setSelectedCounselor(counselor);
    onSelectCounselor(counselor);
  };

  const clearFilters = () => {
    setFilters({
      specialty: '',
      personality: '',
      approach: ''
    });
    setSearchTerm('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Your Counselors</h2>
              <p className="text-gray-600 mt-1">Choose your companion for today's journey</p>
            </div>
          </div>
          <button
            onClick={onCreateNew}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5" />
            <span>Create New</span>
          </button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or specialty..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 rounded-lg border flex items-center space-x-2 ${
              showFilters ? 'bg-blue-50 border-blue-200 text-blue-600' : 'border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Filter className="w-5 h-5" />
            <span>Filters</span>
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-900">Filter Counselors</h3>
              <button
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center space-x-1"
              >
                <X className="w-4 h-4" />
                <span>Clear all</span>
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Specialty</label>
                <select
                  value={filters.specialty}
                  onChange={(e) => setFilters({ ...filters, specialty: e.target.value })}
                  className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Specialties</option>
                  <option value="anxiety">Anxiety</option>
                  <option value="depression">Depression</option>
                  <option value="relationships">Relationships</option>
                  <option value="stress">Stress Management</option>
                  <option value="career">Career Guidance</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Personality</label>
                <select
                  value={filters.personality}
                  onChange={(e) => setFilters({ ...filters, personality: e.target.value })}
                  className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Personalities</option>
                  <option value="empathetic">Empathetic</option>
                  <option value="analytical">Analytical</option>
                  <option value="motivational">Motivational</option>
                  <option value="gentle">Gentle</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Approach</label>
                <select
                  value={filters.approach}
                  onChange={(e) => setFilters({ ...filters, approach: e.target.value })}
                  className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Approaches</option>
                  <option value="cbt">Cognitive Behavioral</option>
                  <option value="mindfulness">Mindfulness-Based</option>
                  <option value="solution">Solution-Focused</option>
                  <option value="humanistic">Humanistic</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Counselor Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCounselors.map((counselor) => (
          <div
            key={counselor.id}
            className={`group bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300 ${
              selectedCounselor?.id === counselor.id ? 'ring-2 ring-blue-500' : ''
            }`}
          >
            <div className="aspect-w-16 aspect-h-9 relative">
              <img
                src={counselor.avatar}
                alt={counselor.name}
                className="w-full h-48 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="text-xl font-semibold text-white mb-1">{counselor.name}</h3>
                <div className="flex items-center space-x-2">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-white/20 text-white backdrop-blur-sm">
                    {counselor.specialty}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center space-x-1.5 text-gray-600">
                    <Brain className="w-4 h-4" />
                    <span>{counselor.approach}</span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-gray-600">
                    <Heart className="w-4 h-4" />
                    <span>{counselor.personality}</span>
                  </div>
                </div>

                <p className="text-gray-600 text-sm line-clamp-2">
                  Specialized in helping clients with {counselor.specialty.toLowerCase()} using 
                  {counselor.approach.toLowerCase()} techniques.
                </p>

                <button
                  onClick={() => handleSelectCounselor(counselor)}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No counselors found</h3>
          <p className="text-gray-600 mt-1">Try adjusting your filters or create a new counselor</p>
          <div className="mt-6 flex justify-center space-x-4">
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-blue-600 hover:text-blue-700"
            >
              Clear filters
            </button>
            <button
              onClick={onCreateNew}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create New Counselor
            </button>
          </div>
        </div>
      )}
    </div>
  );
}