import React, { useState } from 'react';
import { Brain, MessageSquare, Mic, Shield } from 'lucide-react';
import Auth from '../components/Auth';

export default function LandingPage() {
  const [showLogin, setShowLogin] = useState(false);

  return (
    <div className="min-h-screen animated-gradient">
      {/* Decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-purple-200 rounded-full opacity-20 blur-3xl floating"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-200 rounded-full opacity-20 blur-3xl floating" style={{ animationDelay: '-1.5s' }}></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-green-200 rounded-full opacity-20 blur-3xl floating" style={{ animationDelay: '-0.75s' }}></div>
      </div>

      {/* Header */}
      <header className="fixed w-full glass-effect z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <Brain className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                Artiaid
              </span>
            </div>
            <button
              onClick={() => setShowLogin(true)}
              className="bg-white/20 backdrop-blur-sm text-blue-600 px-6 py-2 rounded-lg hover:bg-white/30 transition-all"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Your Personal AI{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                Counselor
              </span>
            </h1>
            <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
              Experience compassionate, intelligent counseling powered by advanced AI. Available 24/7 to support your mental well-being journey.
            </p>
            <button
              onClick={() => setShowLogin(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg text-lg hover:opacity-90 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Start Your Journey
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-effect p-6 rounded-xl text-center transform hover:-translate-y-1 transition-all">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Text Chat</h3>
              <p className="text-gray-600">
                Express yourself through text conversations with our AI counselor
              </p>
            </div>
            <div className="glass-effect p-6 rounded-xl text-center transform hover:-translate-y-1 transition-all">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mic className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Voice Interaction</h3>
              <p className="text-gray-600">
                Natural voice conversations for a more personal experience
              </p>
            </div>
            <div className="glass-effect p-6 rounded-xl text-center transform hover:-translate-y-1 transition-all">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Private & Secure</h3>
              <p className="text-gray-600">
                Your conversations are private and protected
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass-effect rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <button
              onClick={() => setShowLogin(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
            <Auth />
          </div>
        </div>
      )}
    </div>
  );
}