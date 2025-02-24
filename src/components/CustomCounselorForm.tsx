import React, { useState, useEffect } from 'react';
import { Brain, Sparkles, Heart, Image } from 'lucide-react';
import { personalities, approaches, voices, avatarStyles } from '../lib/counselorConstants';

interface CustomCounselorFormProps {
  onCreateCounselor: (counselor: any) => void;
}

export default function CustomCounselorForm({ onCreateCounselor }: CustomCounselorFormProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    specialty: '',
    personality: '',
    approach: '',
    voice: 'alloy',
    avatarStyle: 'avataaars',
    avatarSeed: Date.now().toString(),
    systemPrompt: ''
  });

  const [avatarOptions, setAvatarOptions] = useState<string[]>([]);

  useEffect(() => {
    // Generate 6 different seeds for avatar options
    const seeds = Array.from({ length: 6 }, () => Math.random().toString(36).substring(7));
    setAvatarOptions(seeds);
  }, [formData.avatarStyle]);

  const generateSystemPrompt = () => {
    const personality = personalities.find(p => p.id === formData.personality);
    const approach = approaches.find(a => a.id === formData.approach);

    return `You are ${formData.name}, an AI counselor specializing in ${formData.specialty}. Your approach is:
- Personality: ${personality?.description}
- Communication Style: ${approach?.description}
- Focus Areas: ${formData.specialty}

Always maintain a ${personality?.id} tone and use ${approach?.id} techniques in your responses.
Each response should include:
1) Validation of the client's experience
2) Reflection of understanding
3) Therapeutic insight or technique
4) Gentle guidance or suggestion for next steps`;
  };

  const handleSubmit = () => {
    const systemPrompt = generateSystemPrompt();
    const counselor = {
      ...formData,
      systemPrompt,
      avatar: `https://api.dicebear.com/7.x/${formData.avatarStyle}/svg?seed=${formData.avatarSeed}`,
      id: Date.now().toString()
    };
    onCreateCounselor(counselor);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Basic Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Counselor Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter a name for your counselor"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Specialty Focus
                </label>
                <input
                  type="text"
                  value={formData.specialty}
                  onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Anxiety, Depression, Relationships"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Choose an Avatar</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Select Avatar Style
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {avatarStyles.map((style) => (
                    <button
                      key={style.id}
                      onClick={() => setFormData({ ...formData, avatarStyle: style.id })}
                      className={`p-4 border rounded-lg text-left transition-all ${
                        formData.avatarStyle === style.id
                          ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500'
                          : 'hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <img
                          src={`https://api.dicebear.com/7.x/${style.id}/svg?seed=${formData.name || 'preview'}`}
                          alt={style.label}
                          className="w-12 h-12 rounded-full"
                        />
                        <div>
                          <h3 className="font-medium text-gray-900">{style.label}</h3>
                          <p className="text-sm text-gray-600">{style.description}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Choose Avatar Variation
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {avatarOptions.map((seed) => (
                    <button
                      key={seed}
                      onClick={() => setFormData({ ...formData, avatarSeed: seed })}
                      className={`p-4 border rounded-lg transition-all ${
                        formData.avatarSeed === seed
                          ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500'
                          : 'hover:border-gray-300'
                      }`}
                    >
                      <img
                        src={`https://api.dicebear.com/7.x/${formData.avatarStyle}/svg?seed=${seed}`}
                        alt="Avatar option"
                        className="w-20 h-20 mx-auto"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Personality & Approach</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Choose a Personality Style
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {personalities.map((personality) => (
                    <button
                      key={personality.id}
                      onClick={() => setFormData({ ...formData, personality: personality.id })}
                      className={`p-4 border rounded-lg text-left transition-all ${
                        formData.personality === personality.id
                          ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500'
                          : 'hover:border-gray-300'
                      }`}
                    >
                      <h3 className="font-medium text-gray-900">{personality.label}</h3>
                      <p className="text-sm text-gray-600 mt-1">{personality.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Choose an Approach
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {approaches.map((approach) => (
                    <button
                      key={approach.id}
                      onClick={() => setFormData({ ...formData, approach: approach.id })}
                      className={`p-4 border rounded-lg text-left transition-all ${
                        formData.approach === approach.id
                          ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500'
                          : 'hover:border-gray-300'
                      }`}
                    >
                      <h3 className="font-medium text-gray-900">{approach.label}</h3>
                      <p className="text-sm text-gray-600 mt-1">{approach.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Voice Selection</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {voices.map((voice) => (
                <button
                  key={voice.id}
                  onClick={() => setFormData({ ...formData, voice: voice.id })}
                  className={`p-4 border rounded-lg text-left transition-all ${
                    formData.voice === voice.id
                      ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500'
                      : 'hover:border-gray-300'
                  }`}
                >
                  <h3 className="font-medium text-gray-900">{voice.label}</h3>
                  <p className="text-sm text-gray-600 mt-1">{voice.description}</p>
                </button>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="max-w-3xl mx-auto">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[
              { icon: Brain, label: 'Basic Info' },
              { icon: Image, label: 'Avatar' },
              { icon: Heart, label: 'Personality' },
              { icon: Sparkles, label: 'Voice' }
            ].map((s, i) => (
              <div key={i} className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    step > i
                      ? 'bg-blue-600 text-white'
                      : step === i + 1
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  <s.icon className="w-5 h-5" />
                </div>
                <span
                  className={`mt-2 text-sm ${
                    step > i
                      ? 'text-blue-600'
                      : step === i + 1
                      ? 'text-gray-900'
                      : 'text-gray-400'
                  }`}
                >
                  {s.label}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 relative">
            <div className="absolute top-0 left-0 h-1 bg-gray-200 w-full rounded">
              <div
                className="absolute top-0 left-0 h-full bg-blue-600 rounded transition-all duration-300"
                style={{ width: `${((step - 1) / 3) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="mb-8">{renderStep()}</div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={() => setStep(step - 1)}
            disabled={step === 1}
            className="px-6 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50"
          >
            Back
          </button>
          <button
            onClick={() => {
              if (step === 4) {
                handleSubmit();
              } else {
                setStep(step + 1);
              }
            }}
            disabled={
              (step === 1 && (!formData.name || !formData.specialty)) ||
              (step === 3 && (!formData.personality || !formData.approach))
            }
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {step === 4 ? 'Create Counselor' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
}