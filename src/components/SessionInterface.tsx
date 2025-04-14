import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Download, Phone, AlertCircle, 
  Mic, MicOff, Clock, ChevronRight, 
  FileText, Volume2, VolumeX, PauseCircle, PlayCircle
} from 'lucide-react';
import { RealtimeChat } from '../lib/realtime';
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

// At the top of the file, define the interface extension
interface ExtendedRealtimeChat extends RealtimeChat {
  getMediaStream: () => MediaStream | null;
  replaceAudioTrack?: (track: MediaStreamTrack) => void;
  replaceMediaStream?: (stream: MediaStream) => void;
  sendControlMessage: (message: any) => void;
  pauseProcessing: () => void;
  resumeProcessing: () => void;
  closeConnection: () => void;
  getAudioTracks?: () => MediaStreamTrack[];
}

export default function SessionInterface({ counselor, onEndSession, session }: SessionInterfaceProps) {
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [realtimeChat, setRealtimeChat] = useState<ExtendedRealtimeChat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]); // Keep for database records
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [volume, setVolume] = useState<number>(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [sessionDuration, setSessionDuration] = useState<string>('00:00');
  const [showSidebar, setShowSidebar] = useState(true);
  const sessionStartTime = useRef<Date>(new Date());
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [status, setStatus] = useState<string>('Ready');

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
      
      // Initial message just for database record
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
      // Convert error object to string if it's not already a string
      const errorMessage = typeof event.error === 'object' 
        ? (event.error.message || JSON.stringify(event.error)) 
        : (event.error || 'An error occurred with the voice connection');
      
      setError(errorMessage);
      setStatus('Error');
      setIsActive(false);
      setIsProcessing(false);
      return;
    }
    
    if (event.type === 'connection' && event.status === 'connected') {
      console.log('Connection established successfully');
      setStatus('Connected');
      setIsProcessing(false);
    }
    
    if (event.type === 'datachannel' && event.status === 'open') {
      console.log('Data channel ready to send messages');
      setStatus('Channel Open');
      setIsProcessing(false);
    }
    
    if (event.type === 'text') {
      // Still save messages to database but don't display them
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
      setStatus('Active');
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
    // If paused, just resume
    if (isActive && isPaused) {
      console.log('Resuming paused session - re-enabling microphone input');
      
      if (realtimeChat) {
        try {
          // Call resumeProcessing method if it exists
          if (typeof realtimeChat.resumeProcessing === 'function') {
            realtimeChat.resumeProcessing();
            console.log('Called resumeProcessing method');
          } else {
            // Fallback for basic implementations
            console.warn('No resume method available, trying basic track enabling');
            if (typeof realtimeChat.getMediaStream === 'function') {
              const mediaStream = realtimeChat.getMediaStream();
              if (mediaStream) {
                mediaStream.getAudioTracks().forEach(track => {
                  console.log('Re-enabling track:', track.kind);
                  track.enabled = true;
                });
              }
            }
          }
        } catch (error) {
          console.error('Error during resume:', error);
        }
      }
      
      setIsPaused(false);
      setStatus('Active');
      return;
    }
    
    try {
      setError(null);
      setIsProcessing(true);
      setStatus('Starting...');
      
      console.log('Checking microphone permissions...');
      const hasPermission = await checkMicrophonePermission();
      if (!hasPermission) {
        setError('Microphone access is required. Please allow microphone access and try again.');
        setIsProcessing(false);
        setStatus('Error');
        return;
      }

      console.log('Starting voice chat with counselor:', counselor.name);
      console.log('Using counselor system prompt:', counselor.system_prompt);
      const chat = new RealtimeChat();
      
      // Get and store the audio element
      setAudioElement(chat.getAudioElement());
      
      // Attach the event handler before starting the connection
      setRealtimeChat(chat);
      
      // Start the connection with the selected voice and pass the system prompt
      await chat.start(
        handleMessage, 
        counselor.voice.toLowerCase(),
        counselor.system_prompt,
        counselor.name
      );
      
      // Update UI state to show active connection
      setIsActive(true);
      setIsPaused(false);
      setStatus('Active');
      
    } catch (error: any) {
      console.error('Failed to start chat:', error);
      setError('Unable to start voice chat: ' + (error.message || 'Please ensure you have a working microphone connected.'));
      setIsProcessing(false);
      setIsActive(false);
      setIsPaused(false);
      setStatus('Error');
    }
  };

  const pauseChat = () => {
    console.log('Pausing session - stopping microphone input');
    
    if (realtimeChat) {
      try {
        // Call pauseProcessing method if it exists
        if (typeof realtimeChat.pauseProcessing === 'function') {
          realtimeChat.pauseProcessing();
          console.log('Called pauseProcessing method');
        } else {
          // Fallback for basic implementations
          console.warn('No pause method available, trying basic track muting');
          if (typeof realtimeChat.getMediaStream === 'function') {
            const mediaStream = realtimeChat.getMediaStream();
            if (mediaStream) {
              // Disable all audio tracks
              mediaStream.getAudioTracks().forEach(track => {
                console.log('Disabling track:', track.kind);
                track.enabled = false;
              });
            }
          }
        }
      } catch (error) {
        console.error('Error during pause:', error);
      }
    }
    
    // Update UI state
    setIsPaused(true);
    setStatus('Paused');
  };

  const stopChat = () => {
    console.log('Stopping chat completely');
    if (realtimeChat) {
      try {
        // First explicitly stop any active streams
        if (typeof realtimeChat.getMediaStream === 'function') {
          const mediaStream = realtimeChat.getMediaStream();
          if (mediaStream) {
            mediaStream.getTracks().forEach(track => {
              console.log('Stopping track:', track.kind);
              track.stop();
            });
          }
        }
        
        // Explicitly close any WebRTC connections if that method exists
        if (typeof realtimeChat.closeConnection === 'function') {
          realtimeChat.closeConnection();
        }
        
        // Then call the stop method
        realtimeChat.stop();
        
        // Force audio element to stop
        if (audioElement) {
          console.log('Stopping audio playback');
          audioElement.pause();
          audioElement.srcObject = null;
          audioElement.load(); // Force reload to clear any buffered audio
        }
      } catch (error) {
        console.error('Error during chat stop:', error);
      }
    }
    
    setRealtimeChat(null);
    setIsActive(false);
    setIsPaused(false);
    setError(null);
    setStatus('Ready');
    setIsProcessing(false); // Ensure processing state is cleared
  };

  const endCurrentSession = async () => {
    console.log('Ending current session. SessionId:', sessionId);
    
    // First, let's forcefully stop the chat
    stopChat();
    
    // If we still have the session ID, update the database record
    if (sessionId) {
      try {
        const endTime = new Date();
        const updateResult = await supabase
          .from('sessions')
          .update({
            ended_at: endTime.toISOString(),
            duration: `${Math.floor((endTime.getTime() - sessionStartTime.current.getTime()) / 1000)} seconds`,
          })
          .eq('id', sessionId);
          
        console.log('Session update result:', updateResult);
      } catch (error) {
        console.error('Error updating session end time:', error);
      }
    }
  };
  
  const handleUserEndSession = () => {
    console.log('User ended session');
    
    // Aggressively stop everything
    if (realtimeChat) {
      try {
        if (typeof realtimeChat.getMediaStream === 'function') {
          const mediaStream = realtimeChat.getMediaStream();
          if (mediaStream) {
            mediaStream.getTracks().forEach(track => {
              track.stop();
            });
          }
        }
        
        if (typeof realtimeChat.closeConnection === 'function') {
          realtimeChat.closeConnection();
        }
        
        realtimeChat.stop();
      } catch (error) {
        console.error('Error during forceful chat stop:', error);
      }
    }
    
    // Reset all state
    setRealtimeChat(null);
    setAudioElement(null);
    setIsActive(false);
    setIsPaused(false);
    
    // End the session in the database
    endCurrentSession();
    
    // Add a slight delay before navigating away to ensure cleanup is complete
    setTimeout(() => {
      onEndSession();
    }, 300);
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (audioElement) {
      audioElement.volume = newVolume;
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (audioElement) {
      audioElement.muted = !isMuted;
    }
  };

  const downloadSessionLog = () => {
    const log = messages
      .map(m => `[${m.timestamp.toLocaleString()}] ${m.type}: ${m.content}`)
      .join('\n\n');
    
    const fullLog = `Session with ${counselor.name}\nDate: ${sessionStartTime.current.toLocaleString()}\nDuration: ${sessionDuration}`;
    
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

  return (
    <div className="h-[calc(100vh-4rem)] flex bg-gray-50">
      {/* Main Session Area */}
      <div className="flex-1 flex flex-col bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="border-b p-4 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-r from-blue-200 to-indigo-200 border-2 border-white shadow-md">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 text-lg">{counselor.name}</h2>
              <p className="text-sm text-gray-600">Using {counselor.voice} voice</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-gray-600 px-3 py-1.5 bg-white rounded-full shadow-sm">
              <Clock className="w-5 h-5 text-blue-500" />
              <span className="font-medium">{sessionDuration}</span>
            </div>
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="p-2 hover:bg-white rounded-lg transition-colors"
            >
              <ChevronRight className={`w-5 h-5 transition-transform ${showSidebar ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gradient-to-b from-white to-blue-50">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-start space-x-2 mb-6 max-w-md shadow-sm border border-red-100">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p className="text-sm">{error}</p>
            </div>
          )}
          
          <div className="text-center mb-10">
            <div className="mb-6">
              <div className="w-28 h-28 rounded-full mx-auto flex items-center justify-center bg-gradient-to-r from-blue-400 to-indigo-500 border-4 border-white shadow-lg">
                <FileText className="w-14 h-14 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-3">{counselor.name}</h1>
            <p className="text-lg text-gray-600 max-w-md mx-auto">AI-assisted counseling with {counselor.voice} voice</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6 mb-8 w-full max-w-md border border-gray-100">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-gray-800 text-lg">Session Status</h3>
              <span className={`px-4 py-1.5 rounded-full text-sm font-medium ${
                status === 'Active' ? 'bg-green-100 text-green-700 border border-green-200' :
                status === 'Error' ? 'bg-red-100 text-red-700 border border-red-200' :
                status === 'Paused' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
                'bg-blue-100 text-blue-700 border border-blue-200'
              }`}>
                {status}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <p className="text-sm text-gray-500 mb-1">Duration</p>
                <p className="font-medium text-gray-800 text-lg">{sessionDuration}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <p className="text-sm text-gray-500 mb-1">Audio</p>
                <p className="font-medium text-gray-800 text-lg">{isMuted ? 'Muted' : `${Math.round(volume * 100)}%`}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <button
                onClick={isActive && !isPaused ? pauseChat : startChat}
                disabled={isProcessing}
                className={`w-full flex items-center justify-center space-x-3 py-4 px-6 rounded-xl ${
                  isActive && !isPaused
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white' 
                    : 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white'
                } transition-colors shadow-md disabled:opacity-70 text-lg font-medium`}
              >
                {isActive && !isPaused ? <PauseCircle className="w-6 h-6" /> : 
                 isPaused ? <PlayCircle className="w-6 h-6" /> : 
                 <Mic className="w-6 h-6" />}
                <span>
                  {isProcessing ? 'Starting...' : 
                   isActive && !isPaused ? 'Pause Session' : 
                   isPaused ? 'Resume Session' : 
                   'Begin Session'}
                </span>
              </button>
            </div>
          </div>
          
          {isActive && (
            <div className="flex justify-between w-full max-w-md bg-white rounded-xl shadow-sm p-4 border border-gray-100">
              <div className="flex items-center flex-grow mr-4">
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
                  className="w-full mx-2"
                />
                <span className="text-sm font-medium text-gray-700">{Math.round(volume * 100)}%</span>
              </div>
              
              <button
                onClick={stopChat}
                className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-lg shadow-sm flex items-center justify-center"
                title="End Session"
              >
                <MicOff className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Sidebar */}
      {showSidebar && (
        <div className="w-80 bg-white p-6 rounded-r-xl border-l space-y-6 shadow-lg">
          {/* Session Info */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4 text-lg">About Your Session</h3>
            <div className="bg-gray-50 p-5 rounded-lg border border-gray-100">
              <p className="text-gray-600 mb-4">This is an AI-assisted counseling session tailored to provide supportive guidance for {counselor.name.toLowerCase()}.</p>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">Type</span>
                  <span className="font-medium text-gray-900">{counselor.name}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">Voice</span>
                  <span className="font-medium text-gray-900">{counselor.voice}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-gray-600">Status</span>
                  <span className={`font-medium ${
                    status === 'Active' ? 'text-green-600' :
                    status === 'Error' ? 'text-red-600' :
                    status === 'Paused' ? 'text-amber-600' : 
                    'text-blue-600'
                  }`}>{status}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 space-y-3 mt-auto">
            <button
              onClick={downloadSessionLog}
              className="w-full flex items-center justify-center space-x-2 p-3 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <FileText className="w-4 h-4" />
              <span>Download Session Log</span>
            </button>
            <button
              onClick={handleUserEndSession}
              className="w-full flex items-center justify-center space-x-2 p-3 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-lg hover:from-red-600 hover:to-rose-600 transition-colors"
            >
              <X className="w-4 h-4" />
              <span>End Session</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}