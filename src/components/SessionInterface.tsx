import React, { useState, useEffect } from 'react';
import { X, Download, UserPlus, Settings, Phone, AlertCircle } from 'lucide-react';
import { RealtimeChat } from '../lib/realtime';
import { counselorPrompts } from '../lib/counselorPrompts';

interface SessionInterfaceProps {
  counselor: any;
  onEndSession: () => void;
}

export default function SessionInterface({ counselor, onEndSession }: SessionInterfaceProps) {
  const [sessionTime, setSessionTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [realtimeChat, setRealtimeChat] = useState<RealtimeChat | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (!isPaused && realtimeChat) { // Only run timer when chat is active
      interval = setInterval(() => {
        setSessionTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPaused, realtimeChat]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleMessage = (event: any) => {
    if (event.type === 'text') {
      setMessages(prev => [...prev, { type: 'assistant', content: event.text, timestamp: new Date() }]);
    }
  };

  const startChat = async () => {
    try {
      const chat = new RealtimeChat();
      // Use the counselor's name directly as the voice ID since they match OpenAI's voice modes
      await chat.start(handleMessage, counselor.name.toLowerCase());
      setRealtimeChat(chat);

      // Get counselor-specific prompt
      const counselorPrompt = counselorPrompts[counselor.name];
      chat.sendMessage({
        type: "response.create",
        response: {
          modalities: ["text", "audio"],
          instructions: counselorPrompt.systemPrompt,
        },
      });
    } catch (error) {
      console.error('Failed to start chat:', error);
    }
  };

  const stopChat = () => {
    realtimeChat?.stop();
    setRealtimeChat(null);
  };

  const downloadChatLog = () => {
    const log = messages.map(m => `[${m.timestamp.toLocaleString()}] ${m.type}: ${m.content}`).join('\n');
    const blob = new Blob([log], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-log-${new Date().toISOString()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white rounded-l-xl shadow-sm">
        <div className="border-b p-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <img
              src={counselor.avatar}
              alt={counselor.name}
              className="w-10 h-10 rounded-full"
            />
            <div>
              <h2 className="font-semibold text-gray-900">{counselor.name}</h2>
              <p className="text-sm text-gray-600">{counselor.specialty}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">
              {realtimeChat ? `Session Time: ${formatTime(sessionTime)}` : 'Click Start Voice to begin'}
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.type === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[70%] rounded-lg p-3 ${
                  message.type === 'user'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100'
                }`}
              >
                <p>{message.content}</p>
                <span className="text-xs opacity-75 mt-1 block">
                  {message.timestamp.toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t p-4">
          <div className="flex items-center space-x-4">
            {realtimeChat && (
              <button
                onClick={() => setIsPaused(!isPaused)}
                className="px-4 py-2 text-sm text-purple-600 hover:bg-purple-50 rounded-lg"
              >
                {isPaused ? 'Resume' : 'Pause'}
              </button>
            )}
            <button
              onClick={downloadChatLog}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              title="Download Chat Log"
            >
              <Download className="w-5 h-5" />
            </button>
            <button
              onClick={onEndSession}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              title="End Session"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Controls Panel */}
      <div className="w-1/4 bg-gray-50 p-4 rounded-r-xl border-l">
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Voice Controls</h3>
            <div className="space-y-2">
              <button
                onClick={realtimeChat ? stopChat : startChat}
                className={`w-full py-2 px-4 rounded-lg flex items-center justify-center space-x-2 ${
                  realtimeChat
                    ? 'bg-red-600 text-white'
                    : 'bg-purple-600 text-white'
                }`}
              >
                <Phone className="w-5 h-5" />
                <span>{realtimeChat ? 'Stop Voice' : 'Start Voice'}</span>
              </button>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Session Actions</h3>
            <div className="space-y-2">
              <button
                onClick={() => {/* Implement counselor change */}}
                className="w-full py-2 px-4 bg-white border rounded-lg text-gray-700 flex items-center justify-center space-x-2"
              >
                <UserPlus className="w-5 h-5" />
                <span>Change Counselor</span>
              </button>
              <button
                onClick={() => {/* Implement audio settings */}}
                className="w-full py-2 px-4 bg-white border rounded-lg text-gray-700 flex items-center justify-center space-x-2"
              >
                <Settings className="w-5 h-5" />
                <span>Audio Settings</span>
              </button>
              <button
                onClick={() => window.open('/resources', '_blank')}
                className="w-full py-2 px-4 bg-white border rounded-lg text-gray-700 flex items-center justify-center space-x-2"
              >
                <AlertCircle className="w-5 h-5" />
                <span>Emergency Resources</span>
              </button>
            </div>
          </div>

          {realtimeChat && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Session Progress</h3>
              <div className="bg-white p-4 rounded-lg">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Duration</span>
                    <span>{formatTime(sessionTime)}</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-600 transition-all"
                      style={{ width: `${Math.min((sessionTime / 3600) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}