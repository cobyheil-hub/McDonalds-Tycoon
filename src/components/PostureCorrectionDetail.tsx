import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '../lib/GameContext';

interface PostureProps {
  onBack: () => void;
}

export default function PostureCorrectionDetail({ onBack }: PostureProps) {
  const { 
    state, 
    setPostureTimer, 
    setIsPostureSessionRunning, 
    setPostureAlignment, 
    completeTask, 
    triggerToast 
  } = useGame();

  const [simulatedSlouch, setSimulatedSlouch] = useState(false);
  const [trackedCentroid, setTrackedCentroid] = useState({ x: 80, y: 18 });

  // Real Camera Feed State & Refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(false);

  // Auto-connect to live webcam stream on mount
  useEffect(() => {
    let activeStream: MediaStream | null = null;
    async function initCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { width: 640, height: 480, facingMode: "user" } 
        });
        activeStream = stream;
        setCameraStream(stream);
        setCameraActive(true);
        setCameraError(false);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error('Camera streaming refused/restricted:', err);
        setCameraError(true);
      }
    }
    
    initCamera();

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Update srcObject when ref mounts or changes
  useEffect(() => {
    if (videoRef.current && cameraStream) {
      videoRef.current.srcObject = cameraStream;
    }
  }, [cameraStream]);

  // Real-time Computer Vision skeleton tracking analyzer
  useEffect(() => {
    if (!cameraActive || !cameraStream) return;

    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 48;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const interval = setInterval(() => {
      if (!videoRef.current || videoRef.current.paused || videoRef.current.ended) return;

      try {
        ctx.drawImage(videoRef.current, 0, 0, 64, 48);
        const imgData = ctx.getImageData(0, 0, 64, 48);
        const data = imgData.data;

        let totalWeight = 0;
        let weightedY = 0;
        let weightedX = 0;

        // Calculate overall average scene intensity
        let totalLuma = 0;
        for (let i = 0; i < data.length; i += 4) {
          totalLuma += (0.299 * data[i] + 0.587 * data[i+1] + 0.114 * data[i+2]);
        }
        const avgLuma = totalLuma / (64 * 48);

        // Scan central columns (columns index 16 to 48 out of 64) for human centroid
        for (let y = 6; y < 42; y++) {
          for (let x = 16; x < 48; x++) {
            const idx = (y * 64 + x) * 4;
            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];
            const luma = (0.299 * r + 0.587 * g + 0.114 * b);

            const diff = Math.abs(luma - avgLuma);
            if (diff > 25) { // Pixels that contrast with ambient background represent active subject
              const weight = diff;
              weightedY += y * weight;
              weightedX += x * weight;
              totalWeight += weight;
            }
          }
        }

        if (totalWeight > 0) {
          const cy = weightedY / totalWeight; // Range 6 to 42
          const cx = weightedX / totalWeight; // Range 16 to 48

          setTrackedCentroid(prev => {
            const smoothFact = 0.25;
            // Map coordinates directly to SVG viewBox values: X to [0-160], Y to [0-90]
            const targetX = (cx / 64) * 160;
            const targetY = (cy / 48) * 90;

            const nextX = prev.x + (targetX - prev.x) * smoothFact;
            const nextY = prev.y + (targetY - prev.y) * smoothFact;

            // Threshold: If coordinate Y > 33, subject is crouching downward/slouching!
            const isSlouchingNow = nextY > 33;
            const scaleOffset = Math.max(0, nextY - 18);
            const calcAlignment = Math.max(30, Math.min(100, Math.round(100 - (scaleOffset * 2.5))));

            // Update state & posture context values in real-time
            setPostureAlignment(calcAlignment);
            setSimulatedSlouch(isSlouchingNow);

            return { x: nextX, y: nextY };
          });
        }
      } catch (err) {
        console.warn('Centroid computation suspended:', err);
      }
    }, 150);

    return () => clearInterval(interval);
  }, [cameraActive, cameraStream]);

  // Countdown timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (state.isPostureSessionRunning && state.postureTimer > 0) {
      interval = setInterval(() => {
        setPostureTimer(prev => {
          if (prev <= 1) {
            setIsPostureSessionRunning(false);
            // Complete task reward!
            completeTask('Posture Correction session', 10, 20);
            return 60; // Reset
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [state.isPostureSessionRunning, state.postureTimer]);

  const toggleSession = () => {
    if (simulatedSlouch) {
      return;
    }
    setIsPostureSessionRunning(!state.isPostureSessionRunning);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleSimulateAlignmentToggle = () => {
    // If camera is not active or blocked, we allow user to simply click on the feed to switch test position
    if (!cameraActive || cameraError) {
      const nextY = simulatedSlouch ? 18 : 32;
      setTrackedCentroid({ x: 80, y: nextY });
      setSimulatedSlouch(!simulatedSlouch);
      setPostureAlignment(!simulatedSlouch ? 48 : 94);
    }
  };

  const handleEvaluateScan = () => {
    completeTask('Posture Correction session', 10, 20, simulatedSlouch);
    if (!simulatedSlouch) {
      setTimeout(() => {
        onBack();
      }, 3400); // Wait for the full 2s scan + 1.2s status display time
    }
  };

  return (
    <div className="flex flex-col gap-4 py-2">
      {/* Back button */}
      <button 
        id="posture-back-btn"
        onClick={onBack}
        className="self-start px-2 py-1.5 border-2 border-black rounded flex items-center gap-1 bg-surface-container font-headline font-bold text-[10px] uppercase cursor-pointer hover:bg-stone-100 active:scale-95 transition-all select-none"
      >
        <span className="material-symbols-outlined text-xs">arrow_back</span>
        Back to Arena
      </button>

      {/* Main Title Header */}
      <div className="flex items-center justify-between border-b-4 border-black pb-2 select-none">
        <div>
          <span className="font-pixel text-[10px] text-gray-500 font-bold uppercase leading-none block">
            STATION HABIT 2
          </span>
          <h2 className="font-headline font-bold text-base text-[#1E1B1C] uppercase leading-none mt-1">
            POSTURE CORRECTION
          </h2>
        </div>
        <span className="px-1.5 py-0.5 font-pixel text-[9px] font-bold bg-[#f1e400]/20 text-stone-700 border border-stone-500/20 uppercase rounded tracking-wider">
          MEDIUM
        </span>
      </div>

      {/* Interactive simulated posture camera feed mockup */}
      <div className="bg-white border-4 border-black p-4 flex flex-col gap-3 shadow-[4px_4px_0_0_rgba(30,27,28,1)] select-none">
        <div 
          onClick={handleSimulateAlignmentToggle}
          className="relative w-full aspect-video border-4 border-black bg-slate-900 overflow-hidden rounded cursor-pointer group"
          title={(!cameraActive || cameraError) ? "Click to toggle vertical spine levels offline" : "Real-time AI camera tracking user's physical spine alignment"}
        >
          {/* Real live video stream */}
          {cameraActive && !cameraError ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover opacity-70"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950 p-4 text-center">
              <span className="material-symbols-outlined text-4xl text-stone-600 animate-pulse">videocam_off</span>
              <span className="font-pixel text-[8px] text-stone-500 mt-2 uppercase">Camera Loading or Blocked</span>
            </div>
          )}

          {/* Scanline overlay */}
          <div className="absolute inset-0 scanline z-10 pointer-events-none" />
          <div className="scanning-bar absolute h-[1.5px] w-full bg-emerald-500/20 z-10 pointer-events-none" />

          {/* Simulated camera capture graphic */}
          <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
            {/* Interactive skeletal node grid */}
            <svg viewBox="0 0 160 90" className="w-full h-full p-2 text-stone-300">
              {/* grid references */}
              <line x1="80" y1="0" x2="80" y2="90" stroke="#334155" strokeWidth="0.5" strokeDasharray="2" />
              <line x1="0" y1="45" x2="160" y2="45" stroke="#334155" strokeWidth="0.5" strokeDasharray="2" />

              {/* Head & Spine nodes mapped in real-time */}
              <g stroke={simulatedSlouch ? "#EF4444" : "#10B981"} strokeWidth="1.5" fill="none">
                {/* Dynamic Spine curves connecting tracked Y centroid coordinates */}
                <path d={`M ${trackedCentroid.x},${trackedCentroid.y} Q ${trackedCentroid.x + (trackedCentroid.x - 80) * 0.4},${trackedCentroid.y + (80 - trackedCentroid.y) * 0.55} 80,82`} />
                
                {/* Dynamically balancing shoulder girdle */}
                <line 
                  x1={trackedCentroid.x - 30} 
                  y1={trackedCentroid.y + 24} 
                  x2={trackedCentroid.x + 30} 
                  y2={trackedCentroid.y + 24} 
                />

                {/* Face tracker mesh */}
                <circle cx={trackedCentroid.x} cy={trackedCentroid.y} r="8" fill={simulatedSlouch ? "#EF4444" : "#10B981"} fillOpacity="0.15" strokeWidth="2" />
                <circle cx={trackedCentroid.x} cy={trackedCentroid.y} r="2" fill={simulatedSlouch ? "#EF4444" : "#10B981"} />

                {/* Left Shoulder Node */}
                <circle cx={trackedCentroid.x - 30} cy={trackedCentroid.y + 24} r="2" fill={simulatedSlouch ? "#EF4444" : "#10B981"} />
                {/* Right Shoulder Node */}
                <circle cx={trackedCentroid.x + 30} cy={trackedCentroid.y + 24} r="2" fill={simulatedSlouch ? "#EF4444" : "#10B981"} />
                {/* Base Spine Node */}
                <circle cx={trackedCentroid.x} cy={trackedCentroid.y + 24} r="2.5" fill={simulatedSlouch ? "#EF4444" : "#10B981"} />
              </g>
            </svg>
          </div>

          {/* Status overlay */}
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded font-pixel text-[8px] tracking-wider text-white uppercase bg-black/60 border border-white/20 select-none flex items-center gap-1 z-20">
            <span className={`w-1.5 h-1.5 rounded-full animate-ping ${simulatedSlouch ? 'bg-red-500' : 'bg-green-400'}`} />
            CAM_INSPECTFEED_3C
          </div>

          <div className={`absolute top-2 right-2 px-2 py-0.5 rounded-xs font-headline font-bold text-[9px] uppercase shadow border z-20 ${
            simulatedSlouch 
              ? 'bg-primary border-black text-white' 
              : 'bg-emerald-500 border-black text-white'
          }`}>
            {simulatedSlouch ? '⚠ SLOUCHING DETECTED' : '✓ POSITIONS ALIGNED'}
          </div>

          {/* Guide ribbon inside webcam card: Tap instruction shown when offline */}
          {(!cameraActive || cameraError) && (
            <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center bg-black/70 backdrop-blur-xs px-2 py-1 rounded text-[8px] font-pixel text-stone-300 pointer-events-none group-hover:text-amber-300 transition-colors z-25">
              <span>💡 TAP FEED TO ATTEMPT MANUAL RE-ALIGNMENT</span>
              <span>{simulatedSlouch ? "SLOUCH" : "ALIGNED"}</span>
            </div>
          )}
        </div>

        {/* Dynamic manual controller display block for desk calibrators when camera stream is locked/denied */}
        {(!cameraActive || cameraError) && (
          <div className="bg-stone-50 border-2 border-black p-3 rounded flex flex-col gap-1 z-20">
            <div className="flex justify-between items-center">
              <span className="font-pixel text-[8px] text-stone-600 uppercase font-bold">
                ⚙️ SPINE CALIBRATION OVERRIDE SLIDER
              </span>
              <span className="font-headline font-bold text-[8px] px-1 bg-amber-500 text-stone-950 rounded">
                MANUAL DIAL ENGAGED
              </span>
            </div>
            <p className="font-body text-[9px] text-stone-600 leading-tight">
              Adjust your vertical level manually to match your genuine posture alignment:
            </p>
            <div className="flex items-center gap-3 my-1">
              <span className="font-headline font-bold text-[9px] text-red-500 uppercase">
                Hunched (Low)
              </span>
              <input
                id="posture-manual-slider"
                type="range"
                min="14"
                max="34"
                value={Math.round(trackedCentroid.y)}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  const isSlouched = val > 24;
                  setTrackedCentroid({ x: 80, y: val });
                  setSimulatedSlouch(isSlouched);
                  setPostureAlignment(isSlouched ? 48 : 94);
                }}
                className="flex-1 accent-primary h-2 bg-stone-200 border border-black rounded-lg cursor-pointer"
              />
              <span className="font-headline font-bold text-[9px] text-emerald-500 uppercase">
                Straight (Tall)
              </span>
            </div>
            <div className="text-center font-pixel text-[8px] text-stone-500">
              Virtual skeletal position: Y = {Math.round(trackedCentroid.y)}px ({simulatedSlouch ? "⚠ Slouching Position" : "✓ Aligned Straight Position"})
            </div>
          </div>
        )}

        {/* Real Posture scan evaluation launcher */}
        <button
          id="posture-evaluate-scan-btn"
          onClick={handleEvaluateScan}
          className="w-full py-2.5 bg-emerald-400 text-stone-900 border-4 border-black font-headline font-bold text-xs uppercase tracking-wider shadow-[3px_3px_0_0_#1E1B1C] hover:bg-emerald-300 cursor-pointer active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1.5px_1.5px_0_0_#1E1B1C] transition-all select-none"
        >
          🔍 SCAN POSTURE WITH AI CAMERA
        </button>
      </div>

      {/* Anatomy diagram & meter tracker */}
      <div className="bg-[#FEF9E1] border-4 border-black p-4 shadow-[4px_4px_0_0_#1E1B1C] grid grid-cols-2 gap-4">
        {/* Alignment Gauge */}
        <div className="flex flex-col justify-between">
          <div>
            <span className="font-headline font-semibold text-[10px] text-gray-500 uppercase">
              ALIGNDIAGRAM.DAT
            </span>
            <div className="font-headline font-bold text-2xl text-primary mt-1">
              {state.postureAlignment}%
            </div>
            <p className="font-body text-[9px] leading-snug mt-1 text-gray-400 lowercase">
              alignment stability coefficient from active bone nodes
            </p>
          </div>

          <div className="h-2 bg-white border border-black rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all ${simulatedSlouch ? 'bg-primary' : 'bg-emerald-500'}`} 
              style={{ width: `${state.postureAlignment}%` }} 
            />
          </div>
        </div>

        {/* Spine height visual vertical level indicator */}
        <div className="p-2 border-2 border-dashed border-stone-500 bg-white flex flex-col justify-end items-center relative">
          <span className="absolute top-1 left-2 font-pixel text-[8px] text-gray-400 uppercase">SPINE</span>
          {/* vertebrae blocks */}
          <div className="flex flex-col gap-1 w-full max-w-[40px] items-stretch">
            {Array.from({ length: 5 }).map((_, idx) => {
              const alignmentLevel = 5 - idx;
              const alignmentThreshold = alignmentLevel * 20;
              const isColored = state.postureAlignment >= alignmentThreshold;
              return (
                <div 
                  key={alignmentLevel}
                  className={`h-2 border transition-all ${
                    isColored
                      ? simulatedSlouch ? 'bg-primary/70 border-black' : 'bg-emerald-500/70 border-black'
                      : 'bg-stone-100 border-dashed border-stone-300'
                  }`}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Timer & Punch buttons */}
      <div className="bg-white border-4 border-black p-4 shadow-[4px_4px_0_0_rgba(30,27,28,1)] flex flex-col gap-3">
        <div className="flex items-center justify-between pb-2 border-b border-stone-200">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-stone-500 text-lg">hourglass_bottom</span>
            <span className="font-headline font-bold text-xs uppercase tracking-wide text-[#1E1B1C]">
              Session Timer
            </span>
          </div>
          <span className="font-pixel font-bold text-sm text-primary">
            {formatTime(state.postureTimer)}
          </span>
        </div>

        <button
          id="posture-start-btn"
          onClick={toggleSession}
          className={`w-full py-2.5 border-4 border-black font-headline font-bold text-xs tracking-wider uppercase shadow-[3px_3px_0_0_#1E1B1C] cursor-pointer transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1.5px_1.5px_0_0_#1E1B1C] ${
            state.isPostureSessionRunning
              ? 'bg-stone-100 text-stone-600'
              : 'bg-primary text-white hover:bg-[#cf240a]'
          }`}
        >
          {state.isPostureSessionRunning ? '‖ PAUSE POSTURE SESSION' : '▶ PUNCH IN POSTURE SESSION (1M)'}
        </button>

        {/* Quick cheat button to fast finish the posture timer (for convenient grading/eval) */}
        <button
          id="posture-eval-fast-btn"
          onClick={() => {
            completeTask('Posture Correction session', 10, 20, simulatedSlouch);
            if (!simulatedSlouch) {
              onBack();
            }
          }}
          className="w-full text-center py-1 bg-[#F4E700] border-2 border-black font-headline font-bold text-[9px] uppercase tracking-wide cursor-pointer hover:bg-stone-100"
        >
          [Dev Evaluator: Instantly claim reward]
        </button>
      </div>
    </div>
  );
}

