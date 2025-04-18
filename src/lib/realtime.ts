import { createClient } from '@supabase/supabase-js';

const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

export class RealtimeChat {
  private pc: RTCPeerConnection | null = null;
  private dc: RTCDataChannel | null = null;
  private audioElement: HTMLAudioElement | null = null;
  private mediaStream: MediaStream | null = null;
  private onMessageCallback: ((event: any) => void) | null = null;
  private connectionState: string = 'disconnected';
  private systemPrompt: string = '';
  private counselorName: string = '';
  private isPaused: boolean = false;

  constructor() {
    // Create the audio element and explicitly add it to the DOM
    this.audioElement = document.createElement('audio');
    this.audioElement.autoplay = true;
    
    // Make the audio element hidden (we'll visualize it instead)
    this.audioElement.style.display = 'none';
    document.body.appendChild(this.audioElement);
    console.log('Audio element created and added to DOM', this.audioElement);
  }

  // Add a getter for the audio element
  getAudioElement(): HTMLAudioElement | null {
    return this.audioElement;
  }

  // Add a getter for the media stream
  getMediaStream(): MediaStream | null {
    return this.mediaStream;
  }

  // Add a getter for the pause state
  isPausedState(): boolean {
    return this.isPaused;
  }

  // Implement pauseProcessing method to pause the session
  pauseProcessing(): void {
    console.log('Pausing realtime session processing');
    this.isPaused = true;

    // Disable all audio tracks - this prevents the microphone from capturing input
    if (this.mediaStream) {
      this.mediaStream.getAudioTracks().forEach(track => {
        console.log('Disabling track:', track.id);
        track.enabled = false;
      });
    }

    // DO NOT send any control messages that might break the WebRTC connection
  }

  // Implement resumeProcessing method to resume the session
  resumeProcessing(): void {
    console.log('Resuming realtime session processing');
    this.isPaused = false;

    // Re-enable all audio tracks
    if (this.mediaStream) {
      this.mediaStream.getAudioTracks().forEach(track => {
        console.log('Re-enabling track:', track.id);
        track.enabled = true;
      });
    }

    // DO NOT send any control messages that might break the WebRTC connection
  }

  // Implement method to close the connection
  closeConnection(): void {
    console.log('Explicitly closing WebRTC connection');
    
    // Send goodbye message if possible
    if (this.dc && this.dc.readyState === 'open') {
      try {
        this.sendMessage({
          type: "session.update",
          session: {
            turn_detection: {
              enabled: false
            }
          }
        });
      } catch (e) {
        console.error('Error sending goodbye message:', e);
      }
    }
    
    // Close connections
    if (this.dc) {
      try {
        this.dc.close();
      } catch (e) {
        console.error('Error closing data channel:', e);
      }
    }
    
    if (this.pc) {
      try {
        this.pc.close();
      } catch (e) {
        console.error('Error closing peer connection:', e);
      }
    }
  }

  // Implementation for sendControlMessage for the SessionInterface to use
  sendControlMessage(message: any): void {
    console.log('Sending control message:', message);
    this.sendMessage(message);
  }

  async getEphemeralToken(voiceId: string) {
    try {
      console.log('Fetching ephemeral token for voice:', voiceId);
      const response = await fetch("https://api.openai.com/v1/realtime/sessions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-realtime-preview-2024-12-17",
          voice: voiceId,
        }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response from OpenAI:', errorText);
        throw new Error(`Failed to get token: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Successfully obtained ephemeral token');
      return data.client_secret.value;
    } catch (error) {
      console.error('Error getting ephemeral token:', error);
      throw error;
    }
  }

  async start(onMessage: (event: any) => void, voiceId: string, systemPrompt: string, counselorName: string) {
    try {
      console.log('Starting realtime chat with voice:', voiceId);
      console.log('Using system prompt:', systemPrompt);
      this.systemPrompt = systemPrompt;
      this.counselorName = counselorName;
      const ephemeralKey = await this.getEphemeralToken(voiceId);
      this.onMessageCallback = onMessage;

      // Create peer connection with STUN servers (following WebRTC best practices)
      const config = {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
        ]
      };
      
      this.pc = new RTCPeerConnection(config);
      console.log('Peer connection created', this.pc);
      
      // Monitor connection state changes
      this.pc.onconnectionstatechange = () => {
        if (!this.pc) return;
        this.connectionState = this.pc.connectionState;
        console.log('WebRTC connection state changed:', this.connectionState);
        
        if (this.pc.connectionState === 'connected') {
          console.log('WebRTC connection established successfully');
          onMessage({ type: 'connection', status: 'connected' });
        } else if (this.pc.connectionState === 'failed' || this.pc.connectionState === 'disconnected') {
          console.error('WebRTC connection failed or disconnected');
          onMessage({ type: 'error', error: 'Connection lost. Please try again.' });
        }
      };
      
      this.pc.oniceconnectionstatechange = () => {
        console.log('ICE connection state changed:', this.pc?.iceConnectionState);
      };
      
      this.pc.onicegatheringstatechange = () => {
        console.log('ICE gathering state changed:', this.pc?.iceGatheringState);
      };
      
      this.pc.onicecandidate = (event) => {
        console.log('ICE candidate:', event.candidate);
      };

      // Set up audio output - exactly as in the docs
      if (this.pc && this.audioElement) {
        this.pc.ontrack = (e) => {
          console.log('Received remote audio track', e.streams[0]);
          if (this.audioElement) {
            this.audioElement.srcObject = e.streams[0];
            
            // Add event listeners to monitor audio playback
            this.audioElement.onplay = () => console.log('Audio playback started');
            this.audioElement.onpause = () => console.log('Audio playback paused');
            this.audioElement.onended = () => console.log('Audio playback ended');
            this.audioElement.onerror = (e) => console.error('Audio playback error:', e);
          }
        };
      }

      // Set up microphone input - exactly as in the docs
      console.log('Requesting microphone access...');
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      console.log('Microphone access granted. Tracks:', this.mediaStream.getTracks());
      
      if (this.pc && this.mediaStream) {
        const audioTrack = this.mediaStream.getTracks()[0];
        console.log('Adding audio track to peer connection:', audioTrack.id, audioTrack.label);
        this.pc.addTrack(audioTrack, this.mediaStream);
      }

      // Set up data channel - exactly as in the docs
      if (this.pc) {
        console.log('Creating data channel named "oai-events"');
        this.dc = this.pc.createDataChannel("oai-events");
        
        this.dc.onopen = () => {
          console.log('Data channel opened successfully!');
          onMessage({ type: 'datachannel', status: 'open' });
          
          // Send initial message with counselor system prompt
          console.log('Sending initial instructions with counselor system prompt');
          
          // Get the counselor name from the first part of the system prompt
          const counselorNameMatch = this.systemPrompt.match(/You are ([^,]+)/);
          const counselorName = counselorNameMatch ? counselorNameMatch[1] : "your counselor";
          
          this.sendMessage({
            type: "response.create",
            response: {
              modalities: ["text", "audio"],
              instructions: this.systemPrompt + "\nYour first response must only be: Hello! I'm " + counselorName + ". How can I help you today?"
            },
          });
        };
        
        this.dc.onclose = () => {
          console.log('Data channel closed');
          onMessage({ type: 'datachannel', status: 'closed' });
        };
        
        this.dc.onerror = (e) => {
          console.error('Data channel error:', e);
          onMessage({ type: 'error', error: 'Data channel error' });
        };
        
        this.dc.addEventListener("message", (e) => {
          try {
            console.log('Received message from OpenAI:', e.data);
            if (this.onMessageCallback) {
              const data = JSON.parse(e.data);
              this.onMessageCallback(data);
            }
          } catch (error) {
            console.error('Error handling message:', error);
          }
        });
      }

      // Create and set local description - exactly as in the docs
      console.log('Creating offer');
      const offer = await this.pc?.createOffer();
      console.log('Setting local description', offer);
      await this.pc?.setLocalDescription(offer);

      // Connect to OpenAI Realtime API - exactly as in the docs
      const baseUrl = "https://api.openai.com/v1/realtime";
      const model = "gpt-4o-realtime-preview-2024-12-17";
      
      console.log('Sending SDP offer to OpenAI');
      const sdpResponse = await fetch(`${baseUrl}?model=${model}`, {
        method: "POST",
        body: offer?.sdp,
        headers: {
          Authorization: `Bearer ${ephemeralKey}`,
          "Content-Type": "application/sdp"
        },
      });

      if (!sdpResponse.ok) {
        const errorText = await sdpResponse.text();
        console.error('Error response from OpenAI SDP endpoint:', errorText);
        throw new Error(`Failed to connect: ${sdpResponse.status} ${sdpResponse.statusText}`);
      }

      const sdpAnswer = await sdpResponse.text();
      console.log('Received SDP answer from OpenAI');
      
      const answer = {
        type: "answer" as RTCSdpType,
        sdp: sdpAnswer,
      };

      console.log('Setting remote description');
      await this.pc?.setRemoteDescription(answer);
      console.log('WebRTC setup complete - waiting for connection to be established');
      
    } catch (error: any) {
      console.error('Error starting realtime chat:', error);
      if (this.onMessageCallback) {
        this.onMessageCallback({ 
          type: 'error', 
          error: `Failed to start voice chat: ${error.message || 'Unknown error'}` 
        });
      }
      this.stop();
      throw error;
    }
  }

  stop() {
    console.log('Stopping realtime chat');
    
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => {
        console.log('Stopping track:', track.id);
        track.stop();
      });
    }
    
    if (this.dc) {
      console.log('Closing data channel');
      this.dc.close();
    }
    
    if (this.pc) {
      console.log('Closing peer connection');
      this.pc.close();
    }
    
    this.pc = null;
    this.dc = null;
    this.mediaStream = null;
    this.isPaused = false;
    
    if (this.audioElement) {
      console.log('Cleaning up audio element');
      this.audioElement.srcObject = null;
    }
  }

  sendMessage(message: any) {
    // Skip regular messages when paused (except session.update messages which are control messages)
    if (this.isPaused && message.type !== "session.update") {
      console.log('Session is paused, not sending message:', message);
      return;
    }
    
    if (!this.dc) {
      console.error('Cannot send message: Data channel not initialized');
      return;
    }
    
    if (this.dc.readyState !== 'open') {
      console.error('Cannot send message: Data channel not open. Current state:', this.dc.readyState);
      return;
    }
    
    console.log('Sending message to OpenAI:', message);
    this.dc.send(JSON.stringify(message));
  }
}