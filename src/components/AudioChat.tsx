import React, { useState, useCallback } from 'react';
import { Mic, MicOff, Brain } from 'lucide-react';
import { RealtimeChat } from '../lib/realtime';

export default function AudioChat() {
  const [isActive, setIsActive] = useState(false);
  const [realtimeChat, setRealtimeChat] = useState<RealtimeChat | null>(null);
  const [messages, setMessages] = useState<string[]>([]);

  const handleMessage = useCallback((event: any) => {
    if (event.type === 'text') {
      setMessages(prev => [...prev, event.text]);
    }
  }, []);

  const startChat = async () => {
    try {
      const chat = new RealtimeChat();
      await chat.start(handleMessage);
      setRealtimeChat(chat);
      setIsActive(true);

      // Send initial instruction
      chat.sendMessage({
        type: "response.create",
        response: {
          modalities: ["text", "audio"],
          instructions: "You are a helpful AI counselor. Please introduce yourself briefly.",
        },
      });
    } catch (error) {
      console.error('Failed to start chat:', error);
    }
  };

  const stopChat = () => {
    realtimeChat?.stop();
    setRealtimeChat(null);
    setIsActive(false);
  };

  return (
    <div className="flex flex-col space-y-4 p-4 bg-white rounded-lg shadow-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Brain className="w-6 h-6 text-purple-600" />
          <h2 className="text-xl font-semibold">Voice Chat</h2>
        </div>
        <button
          onClick={isActive ? stopChat : startChat}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
            isActive
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-purple-600 hover:bg-purple-700 text-white'
          }`}
        >
          {isActive ? (
            <>
              <MicOff className="w-5 h-5" />
              <span>Stop</span>
            </>
          ) : (
            <>
              <Mic className="w-5 h-5" />
              <span>Start</span>
            </>
          )}
        </button>
      </div>

      <div className="h-48 overflow-y-auto bg-gray-50 rounded-lg p-4">
        {messages.map((message, index) => (
          <div key={index} className="mb-2">
            <p className="text-gray-800">{message}</p>
          </div>
        ))}
        {isActive && messages.length === 0 && (
          <p className="text-gray-500 italic">Waiting for response...</p>
        )}
      </div>

      {isActive && (
        <div className="flex items-center justify-center">
          <div className="flex space-x-2">
            <div className="w-2 h-2 bg-purple-600 rounded-full animate-pulse" />
            <div className="w-2 h-2 bg-purple-600 rounded-full animate-pulse delay-75" />
            <div className="w-2 h-2 bg-purple-600 rounded-full animate-pulse delay-150" />
          </div>
        </div>
      )}
    </div>
  );
}