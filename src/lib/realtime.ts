import { createClient } from '@supabase/supabase-js';

const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

export class RealtimeChat {
  private pc: RTCPeerConnection | null = null;
  private dc: RTCDataChannel | null = null;
  private audioElement: HTMLAudioElement | null = null;
  private mediaStream: MediaStream | null = null;
  private onMessageCallback: ((event: any) => void) | null = null;

  constructor() {
    this.audioElement = document.createElement('audio');
    this.audioElement.autoplay = true;
  }

  async getEphemeralToken(voiceId: string) {
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
    const data = await response.json();
    return data.client_secret.value;
  }

  async start(onMessage: (event: any) => void, voiceId: string) {
    try {
      const ephemeralKey = await this.getEphemeralToken(voiceId);
      this.onMessageCallback = onMessage;

      // Create peer connection
      this.pc = new RTCPeerConnection();

      // Set up audio output
      if (this.pc && this.audioElement) {
        this.pc.ontrack = (e) => {
          this.audioElement!.srcObject = e.streams[0];
        };
      }

      // Set up microphone input
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: true
      });
      
      if (this.pc && this.mediaStream) {
        this.pc.addTrack(this.mediaStream.getTracks()[0]);
      }

      // Set up data channel
      if (this.pc) {
        this.dc = this.pc.createDataChannel("oai-events");
        this.dc.addEventListener("message", this.handleMessage.bind(this));
      }

      // Create and set local description
      const offer = await this.pc?.createOffer();
      await this.pc?.setLocalDescription(offer);

      // Connect to OpenAI Realtime API
      const baseUrl = "https://api.openai.com/v1/realtime";
      const model = "gpt-4o-realtime-preview-2024-12-17";
      
      const sdpResponse = await fetch(`${baseUrl}?model=${model}`, {
        method: "POST",
        body: offer?.sdp,
        headers: {
          Authorization: `Bearer ${ephemeralKey}`,
          "Content-Type": "application/sdp"
        },
      });

      const answer = {
        type: "answer" as RTCSdpType,
        sdp: await sdpResponse.text(),
      };

      await this.pc?.setRemoteDescription(answer);
    } catch (error) {
      console.error('Error starting realtime chat:', error);
      throw error;
    }
  }

  stop() {
    this.mediaStream?.getTracks().forEach(track => track.stop());
    this.pc?.close();
    this.pc = null;
    this.dc = null;
    this.mediaStream = null;
    if (this.audioElement) {
      this.audioElement.srcObject = null;
    }
  }

  private handleMessage(e: MessageEvent) {
    if (this.onMessageCallback) {
      const data = JSON.parse(e.data);
      this.onMessageCallback(data);
    }
  }

  sendMessage(message: any) {
    if (this.dc && this.dc.readyState === 'open') {
      this.dc.send(JSON.stringify(message));
    }
  }
}