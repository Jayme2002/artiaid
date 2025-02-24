import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Download, UserPlus, Settings, Phone, AlertCircle, 
  Mic, MicOff, PauseCircle, PlayCircle, Clock, Calendar,
  Brain, ChevronRight, Bookmark, Share2, FileText, 
  MessageSquare, Volume2, Volume1, VolumeX
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { RealtimeChat } from '../lib/realtime';
import { counselorPrompts } from '../lib/counselorPrompts';
import { supabase } from '../lib/supabase';

interface SessionInterfaceProps {
  counselor: any;
  onEndSession: () => void;
  session: any;
}

interface Message {
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function SessionInterface({ counselor, onEndSession, session }: SessionInterfaceProps) {
  const [isActive, setIsActive] = useState(false);
  const [realtimeChat, setRealtimeChat] = useState<RealtimeChat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [volume, setVolume] = useState<number>(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [sessionDuration, setSessionDuration] = useState<string>('00:00');
  const [showSidebar, setShowSidebar] = useState(true);
  const [sessionNotes, setSessionNotes] = useState<string>('');
  const [bookmarkedMessages, setBookmarkedMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sessionStartTime = useRef<Date>(new Date());
  const audioElement = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    console.log('SessionInterface mounted with counselor:', counselor ? counselor.name : 'none');
    startNewSession();
    return () => {
      console.log('SessionInterface unmounting, cleaning up...');
      endCurrentSession();
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      const duration = new Date().getTime() - sessionStartTime.current.getTime();
      const minutes = Math.floor(duration / 60000);
      const seconds = Math.floor((duration % 60000) / 1000);
      setSessionDuration(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const startNewSession = async () => {
    try {
      console.log('Starting new session with counselor:', counselor.name);
      const { data, error } = await supabase
        .from('sessions')
        .insert({
          user_id: session.user.id,
          counselor_name: counselor.name,
          started_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error('Error inserting session record:', error);
        throw error;
      }
      
      console.log('Session created in database with ID:', data.id);
      setSessionId(data.id);

      // Simplified welcome message
      const welcomeMessage: Message = {
        type: 'assistant',
        content: `Hello! I'm ${counselor.name}. How can I help you today?`,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
      saveMessage(welcomeMessage, data.id);
    } catch (error) {
      console.error('Error starting session:', error);
      setError('Failed to start session. Please try again.');
    }
  };

  const saveMessage = async (message: Message, sid: string) => {
    try {
      await supabase
        .from('chat_messages')
        .insert({
          session_id: sid,
          role: message.type,
          content: message.content,
        });
    } catch (error) {
      console.error('Error saving message:', error);
    }
  };

  const handleMessage = async (event: any) => {
    console.log('Received message event:', event);
    
    if (event.type === 'error') {
      setError(event.error || 'An error occurred with the voice connection');
      setIsActive(false);
      setIsProcessing(false);
      return;
    }
    
    if (event.type === 'connection' && event.status === 'connected') {
      console.log('Connection established successfully');
    }
    
    if (event.type === 'datachannel' && event.status === 'open') {
      console.log('Data channel ready to send messages');
      // We don't need to send the initial message here since we're doing it in the onopen handler
    }
    
    if (event.type === 'text') {
      const newMessage: Message = {
        type: 'assistant',
        content: event.text,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, newMessage]);
      if (sessionId) {
        await saveMessage(newMessage, sessionId);
      }
      setIsProcessing(false);
    }
  };

  const checkMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (error) {
      return false;
    }
  };

  const startChat = async () => {
    try {
      setError(null);
      setIsProcessing(true);
      
      console.log('Checking microphone permissions...');
      const hasPermission = await checkMicrophonePermission();
      if (!hasPermission) {
        setError('Microphone access is required. Please allow microphone access and try again.');
        setIsProcessing(false);
        return;
      }

      console.log('Starting voice chat with counselor:', counselor.name);
      console.log('Using counselor system prompt:', counselor.system_prompt);
      const chat = new RealtimeChat();
      
      // Attach the event handler before starting the connection
      setRealtimeChat(chat);
      
      // Start the connection with the selected voice and pass the system prompt
      await chat.start(
        handleMessage, 
        counselor.voice.toLowerCase(),
        counselor.system_prompt
      );
      
      // Update UI state to show active connection
      setIsActive(true);
      
      // No need to send the initial message here since it's now sent
      // in the data channel onopen handler with the correct system prompt
    } catch (error) {
      console.error('Failed to start chat:', error);
      setError('Unable to start voice chat: ' + (error.message || 'Please ensure you have a working microphone connected.'));
      setIsProcessing(false);
      setIsActive(false);
    }
  };

  const stopChat = () => {
    realtimeChat?.stop();
    setRealtimeChat(null);
    setIsActive(false);
    setError(null);
  };

  const endCurrentSession = async () => {
    console.log('Ending current session. SessionId:', sessionId);
    if (sessionId) {
      try {
        const endTime = new Date();
        const updateResult = await supabase
          .from('sessions')
          .update({
            ended_at: endTime.toISOString(),
            duration: `${Math.floor((endTime.getTime() - sessionStartTime.current.getTime()) / 1000)} seconds`,
            notes: sessionNotes
          })
          .eq('id', sessionId);
          
        console.log('Session update result:', updateResult);
      } catch (error) {
        console.error('Error updating session end time:', error);
      }
    }
    
    stopChat();
    // Don't immediately call onEndSession here, as it could cause a redirect during cleanup
    // Instead, only call it when explicitly ending a session via a user action
  };
  
  // Add a separate function for user-initiated session end
  const handleUserEndSession = () => {
    console.log('User ended session');
    endCurrentSession();
    onEndSession();
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (audioElement.current) {
      audioElement.current.volume = newVolume;
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (audioElement.current) {
      audioElement.current.muted = !isMuted;
    }
  };

  const downloadChatLog = () => {
    const log = messages
      .map(m => `[${m.timestamp.toLocaleString()}] ${m.type}: ${m.content}`)
      .join('\n\n');
    
    const fullLog = `Session with ${counselor.name}\nDate: ${sessionStartTime.current.toLocaleString()}\nDuration: ${sessionDuration}\n\nChat Log:\n${log}\n\nSession Notes:\n${sessionNotes}`;
    
    const blob = new Blob([fullLog], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `session-log-${new Date().toISOString()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const bookmarkMessage = (message: Message) => {
    setBookmarkedMessages(prev => [...prev, message]);
  };

  const shareSession = async () => {
    try {
      await navigator.share({
        title: `Therapy Session with ${counselor.name}`,
        text: `Session Duration: ${sessionDuration}\nDate: ${sessionStartTime.current.toLocaleDateString()}`,
      });
    } catch (error) {
      console.error('Error sharing session:', error);
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white rounded-l-xl shadow-sm">
        {/* Header */}
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
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-gray-600">
              <Clock className="w-5 h-5" />
              <span>{sessionDuration}</span>
            </div>
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronRight className={`w-5 h-5 transition-transform ${showSidebar ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] rounded-lg p-4 group relative ${
                  message.type === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100'
                }`}
              >
                <ReactMarkdown className="prose prose-sm max-w-none">
                  {message.content}
                </ReactMarkdown>
                <div className="mt-2 flex items-center justify-between text-xs opacity-75">
                  <span>{message.timestamp.toLocaleTimeString()}</span>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => bookmarkMessage(message)}
                      className="p-1 hover:bg-gray-200 rounded"
                    >
                      <Bookmark className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {isProcessing && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg p-4">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Controls */}
        <div className="border-t p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={isActive ? stopChat : startChat}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                  isActive
                    ? 'bg-red-600 text-white'
                    : 'bg-blue-600 text-white'
                }`}
              >
                {isActive ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                <span>{isActive ? 'Stop Voice' : 'Start Voice'}</span>
              </button>
              {isActive && (
                <button
                  onClick={() => setIsActive(!isActive)}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  {isActive ? <PauseCircle className="w-5 h-5" /> : <PlayCircle className="w-5 h-5" />}
                </button>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={toggleMute}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="w-24"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      {showSidebar && (
        <div className="w-80 bg-gray-50 p-4 rounded-r-xl border-l space-y-6">
          {/* Session Info */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Session Info</h3>
            <div className="bg-white p-4 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Duration</span>
                <span className="text-sm font-medium">{sessionDuration}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Status</span>
                <span className="text-sm font-medium text-green-600">
                  {isActive ? 'Active' : 'Ready'}
                </span>
              </div>
            </div>
          </div>

          {/* Session Notes */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Session Notes</h3>
            <textarea
              value={sessionNotes}
              onChange={(e) => setSessionNotes(e.target.value)}
              placeholder="Add your session notes here..."
              className="w-full h-40 p-3 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Bookmarked Messages */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Bookmarked Messages</h3>
            <div className="bg-white p-4 rounded-lg space-y-2 max-h-40 overflow-y-auto">
              {bookmarkedMessages.map((message, index) => (
                <div key={index} className="text-sm text-gray-600 p-2 bg-gray-50 rounded">
                  {message.content}
                </div>
              ))}
              {bookmarkedMessages.length === 0 && (
                <p className="text-sm text-gray-500 italic">No bookmarked messages</p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <button
              onClick={downloadChatLog}
              className="w-full flex items-center justify-center space-x-2 p-2 bg-white border rounded-lg text-gray-700 hover:bg-gray-50"
            >
              <FileText className="w-4 h-4" />
              <span>Download Chat Log</span>
            </button>
            <button
              onClick={shareSession}
              className="w-full flex items-center justify-center space-x-2 p-2 bg-white border rounded-lg text-gray-700 hover:bg-gray-50"
            >
              <Share2 className="w-4 h-4" />
              <span>Share Session</span>
            </button>
            <button
              onClick={handleUserEndSession}
              className="w-full flex items-center justify-center space-x-2 p-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              <X className="w-4 h-4" />
              <span>End Session</span>
            </button>
          </div>
        </div>
      )}

      {/* Hidden audio element for volume control */}
      <audio ref={audioElement} />
    </div>
  );
}