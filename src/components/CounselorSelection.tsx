import React from 'react';
import { Plus, ArrowLeft } from 'lucide-react';
import { personalities, approaches } from '../lib/counselorConstants';

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
  const handleSelectCounselor = (counselor: any) => {
    // Directly call the parent handler to start the session
    console.log('CounselorSelection: handleSelectCounselor called with counselor:', counselor);
    
    if (typeof onSelectCounselor !== 'function') {
      console.error('onSelectCounselor is not a function:', onSelectCounselor);
      return;
    }
    
    onSelectCounselor(counselor);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h2 className="text-2xl font-bold text-gray-900">Choose Your Counselor</h2>
        </div>
        <button
          onClick={onCreateNew}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          <span>Create New</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {counselors.map((counselor) => (
          <div
            key={counselor.id}
            className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            onClick={(e) => e.stopPropagation()}
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
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('Start Session button clicked for counselor:', counselor);
                  handleSelectCounselor(counselor);
                }}
                className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Start Session
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}