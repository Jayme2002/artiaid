import React, { useRef, useEffect } from 'react';

interface AudioVisualizerProps {
  audioElement: HTMLAudioElement | null;
  isActive: boolean;
}

const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ audioElement, isActive }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);

  useEffect(() => {
    let animationId: number;
    
    const setupVisualization = () => {
      if (!audioElement || !canvasRef.current) return;
      
      // Create audio context if it doesn't exist
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      const audioContext = audioContextRef.current;
      
      // Create analyzer node
      if (!analyserRef.current) {
        analyserRef.current = audioContext.createAnalyser();
        analyserRef.current.fftSize = 256;
        analyserRef.current.smoothingTimeConstant = 0.8;
      }
      
      const analyser = analyserRef.current;
      
      // Connect the audio element to the analyzer
      if (!sourceNodeRef.current && audioElement) {
        sourceNodeRef.current = audioContext.createMediaElementSource(audioElement);
        sourceNodeRef.current.connect(analyser);
        analyser.connect(audioContext.destination);
      }
      
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d')!;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      const draw = () => {
        // If the component is unmounted or inactive, stop animation
        if (!isActive || !canvas) {
          if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
          }
          return;
        }
        
        animationRef.current = requestAnimationFrame(draw);
        
        // Get frequency data
        analyser.getByteFrequencyData(dataArray);
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Set dimensions
        const width = canvas.width;
        const height = canvas.height;
        
        // Calculate bar width based on canvas size and buffer length
        const barWidth = (width / bufferLength) * 2.5;
        let barHeight;
        let x = 0;
        
        // Draw frequency bars with gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, '#4F46E5'); // Indigo
        gradient.addColorStop(0.5, '#8B5CF6'); // Purple
        gradient.addColorStop(1, '#EC4899'); // Pink
        
        for (let i = 0; i < bufferLength; i++) {
          barHeight = dataArray[i] / 255 * height;
          
          // Fill with gradient
          ctx.fillStyle = gradient;
          
          // Draw bar with rounded corners for a more polished look
          ctx.beginPath();
          const cornerRadius = barWidth / 2;
          
          // Only add rounded corners to the top of the bar
          const barX = x;
          const barY = height - barHeight;
          
          if (barHeight > cornerRadius * 2) {
            ctx.moveTo(barX, height);
            ctx.lineTo(barX, barY + cornerRadius);
            ctx.quadraticCurveTo(barX, barY, barX + cornerRadius, barY);
            ctx.lineTo(barX + barWidth - cornerRadius, barY);
            ctx.quadraticCurveTo(barX + barWidth, barY, barX + barWidth, barY + cornerRadius);
            ctx.lineTo(barX + barWidth, height);
          } else {
            // If bar is too small for corners, just draw a rectangle
            ctx.rect(barX, barY, barWidth, barHeight);
          }
          
          ctx.closePath();
          ctx.fill();
          
          // Add reflective effect
          const reflectionGradient = ctx.createLinearGradient(0, height - barHeight, 0, height);
          reflectionGradient.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
          reflectionGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
          ctx.fillStyle = reflectionGradient;
          ctx.fillRect(barX, height - barHeight, barWidth, barHeight / 3);
          
          x += barWidth + 1;
        }
        
        // Draw a subtle glow effect
        if (isActive) {
          const centerX = width / 2;
          const centerY = height / 2;
          const radius = Math.max(width, height) / 4;
          
          const glowGradient = ctx.createRadialGradient(
            centerX, centerY, 0, 
            centerX, centerY, radius
          );
          
          glowGradient.addColorStop(0, 'rgba(139, 92, 246, 0.2)'); // Purple
          glowGradient.addColorStop(1, 'rgba(139, 92, 246, 0)');
          
          ctx.fillStyle = glowGradient;
          ctx.fillRect(0, 0, width, height);
        }
      };
      
      // Start animation
      draw();
    };
    
    // Try to set up visualization whenever audioElement becomes available
    if (audioElement && isActive) {
      setupVisualization();
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [audioElement, isActive]);
  
  // Reset visualization when component unmounts
  useEffect(() => {
    return () => {
      if (sourceNodeRef.current) {
        sourceNodeRef.current.disconnect();
        sourceNodeRef.current = null;
      }
      if (analyserRef.current) {
        analyserRef.current.disconnect();
        analyserRef.current = null;
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    };
  }, []);
  
  return (
    <div className="relative w-full h-32 bg-gray-900 rounded-lg overflow-hidden">
      <canvas 
        ref={canvasRef} 
        width={500} 
        height={128}
        className="w-full h-full absolute top-0 left-0"
      />
      {!isActive && (
        <div className="absolute inset-0 flex items-center justify-center text-white bg-black bg-opacity-60">
          <p>Start voice to activate visualization</p>
        </div>
      )}
    </div>
  );
};

export default AudioVisualizer; 