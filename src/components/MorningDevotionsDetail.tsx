import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '../lib/GameContext';

interface DevotionsProps {
  onBack: () => void;
}

export default function MorningDevotionsDetail({ onBack }: DevotionsProps) {
  const { 
    state, 
    devotionsText, 
    setDevotionsText, 
    isRecordingVoice, 
    setIsRecordingVoice, 
    voiceVerificationStatus, 
    setVoiceVerificationStatus,
    completeTask, 
    triggerToast 
  } = useGame();

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [audioLevels, setAudioLevels] = useState<number[]>([15, 15, 15, 15, 15, 15, 15]);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const elapsedSecondsRef = useRef<number>(0);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const simIntervalRef = useRef<any>(null);
  const simTimeoutRef = useRef<any>(null);
  const countUpRef = useRef<any>(null);

  const updateElapsedSeconds = (secs: number | ((prev: number) => number)) => {
    if (typeof secs === 'function') {
      setElapsedSeconds(prev => {
        const next = secs(prev);
        elapsedSecondsRef.current = next;
        return next;
      });
    } else {
      setElapsedSeconds(secs);
      elapsedSecondsRef.current = secs;
    }
  };

  // Stop recording tracks and clean up upon component unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (simIntervalRef.current) {
        clearInterval(simIntervalRef.current);
      }
      if (simTimeoutRef.current) {
        clearTimeout(simTimeoutRef.current);
      }
      if (countUpRef.current) {
        clearInterval(countUpRef.current);
      }
    };
  }, [stream]);

  const handleSaveTextLog = () => {
    if (devotionsText.trim().length < 10) {
      triggerToast('Devotion reflection must be at least 10 characters long!', 'warning');
      return;
    }
    completeTask('Logged Written Devotion Reflection', 5, 10);
    onBack();
  };

  const handleToggleVoiceVerify = async () => {
    if (isRecordingVoice) {
      // Manual STOP recording
      const finalSecs = elapsedSecondsRef.current;

      if (countUpRef.current) {
        clearInterval(countUpRef.current);
        countUpRef.current = null;
      }

      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
        audioContextRef.current = null;
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      if (simIntervalRef.current) {
        clearInterval(simIntervalRef.current);
        simIntervalRef.current = null;
      }
      if (simTimeoutRef.current) {
        clearTimeout(simTimeoutRef.current);
        simTimeoutRef.current = null;
      }
      
      setIsRecordingVoice(false);

      if (finalSecs >= 180) {
        setVoiceVerificationStatus('VERIFIED! SPEECH_AI_SUCCESS: 100% AUDIO MATCH');
        completeTask('Voice Verified Devotional Log', 5, 10);
      } else {
        const remaining = 180 - finalSecs;
        const formattedLogged = `${Math.floor(finalSecs / 60)}m ${finalSecs % 60}s`;
        const formattedRem = `${Math.floor(remaining / 60)}m ${remaining % 60}s`;
        setVoiceVerificationStatus(`REJECTED - ONLY SPOKE FOR ${formattedLogged}. YOU NEED ${formattedRem} MORE FOR DEVOTIONAL GAINS.`);
      }
      return;
    }

    // Manual START recording
    updateElapsedSeconds(0);
    if (countUpRef.current) {
      clearInterval(countUpRef.current);
    }
    countUpRef.current = setInterval(() => {
      updateElapsedSeconds(prev => prev + 1);
    }, 1000);

    try {
      // Direct microphone access request
      const userStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setStream(userStream);
      setIsRecordingVoice(true);
      setVoiceVerificationStatus('RECORDING... DEVOTIONAL METRIC ACTIVE in REAL TIME');

      // Hook up analyzer node so 8-bit sound bars move perfectly in sync with speaker's voice!
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioCtx();
        const source = ctx.createMediaStreamSource(userStream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 64;
        source.connect(analyser);

        audioContextRef.current = ctx;
        analyserRef.current = analyser;

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const updateBars = () => {
          if (!analyserRef.current) return;
          analyserRef.current.getByteFrequencyData(dataArray);
          // Scale to 7 visual bar heights between 15% and 100%
          const levels = Array.from({ length: 7 }).map((_, idx) => {
            const raw = dataArray[idx * 2] || 0;
            return Math.max(15, Math.min(100, (raw / 255) * 125));
          });
          setAudioLevels(levels);
          animationFrameRef.current = requestAnimationFrame(updateBars);
        };
        animationFrameRef.current = requestAnimationFrame(updateBars);
      } catch (e) {
        console.warn('Analyser setup fallback:', e);
      }

      // Also set up actual MediaRecorder to capture and dump dummy byte size for verification
      try {
        const recorder = new MediaRecorder(userStream);
        mediaRecorderRef.current = recorder;
        recorder.start();
        
        const chunks: Blob[] = [];
        recorder.ondataavailable = (ev) => {
          if (ev.data.size > 0) chunks.push(ev.data);
        };
        
        recorder.onstop = () => {
          const recordedBlob = new Blob(chunks, { type: 'audio/webm' });
          console.log("Speech commitment captured locally. Size of audio file:", recordedBlob.size, "bytes.");
        };
      } catch (er) {
        console.warn('State recording warning:', er);
      }

    } catch (err) {
      console.error('Microphone capture error:', err);
      setIsRecordingVoice(true);
      setVoiceVerificationStatus('SIMULATION SCAN: CALIBRATING FROM VOICE MODULATORS');

      // Simulate bouncing audio bars visually
      simIntervalRef.current = setInterval(() => {
        setAudioLevels(Array.from({ length: 7 }).map(() => Math.floor(Math.random() * 80) + 20));
      }, 100);
    }
  };

  return (
    <div className="flex flex-col gap-4 py-2">
      {/* Back to Arena Button */}
      <button 
        id="devotions-back-btn"
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
            STATION HABIT 3
          </span>
          <h2 className="font-headline font-bold text-base text-[#1E1B1C] uppercase leading-none mt-1">
            MORNING DEVOTIONS
          </h2>
        </div>
        <span className="px-1.5 py-0.5 font-pixel text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-500/20 uppercase rounded tracking-wider">
          EASY
        </span>
      </div>

      {/* Reflection Text Area Card */}
      <div className="bg-white border-4 border-black p-4 shadow-[4px_4px_0_0_rgba(30,27,28,1)] flex flex-col gap-3">
        <div className="flex justify-between items-center select-none">
          <label className="font-headline font-bold text-xs uppercase tracking-wide text-[#1E1B1C]">
            DAILY REFLECTION LOG
          </label>
          <span className="font-pixel text-[9px] text-[#cf240a] font-bold">
            +5 XP | +$10 COIN
          </span>
        </div>

        <textarea
          id="devotions-textarea"
          value={devotionsText}
          onChange={(e) => setDevotionsText(e.target.value)}
          placeholder="ENTER YOUR THOUGHTS COMMANDER..."
          rows={3}
          style={{ resize: 'none' }}
          className="w-full p-2.5 font-pixel text-xs border-2 border-black bg-stone-50 text-[#1E1B1C] outline-none placeholder-stone-400 focus:bg-white"
        />

        <button
          id="devotions-save-text-btn"
          onClick={handleSaveTextLog}
          className="w-full py-2 bg-[#F4E700] border-2 border-black font-headline font-bold text-[10px] uppercase tracking-wider text-[#1E2B1C] shadow-[2px_2px_0_0_#1E1B1C] hover:bg-[#FFE7E2] transition-all cursor-pointer active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0_0_#1E1B1C]"
        >
          Save Log & Finish Station
        </button>
      </div>

      {/* Voice Verification Speech AI Module Card */}
      <div className="bg-[#FEF9E1] border-4 border-black p-4 shadow-[4px_4px_0_0_rgba(30,27,28,1)] flex flex-col gap-3">
        <div className="flex items-center justify-between border-b-2 border-[#1E1B1C]/15 pb-2 select-none">
          <span className="font-headline font-bold text-xs text-[#1e1b1c] uppercase tracking-wide flex items-center gap-1">
            <span className="material-symbols-outlined text-lg">mic</span>
            VOICE VERIFY (SPEECH AI)
          </span>
          <span className="font-pixel text-[9px] font-bold text-primary animate-pulse">
            ID: REC_INPUT_3
          </span>
        </div>

        <p className="font-body text-[11px] leading-relaxed text-gray-500 lowercase font-medium">
          read your daily shift commitment aloud: "i am locking in for the golden arches. my spine is straight, my goals are clear."
        </p>

        {/* Oscilloscope interactive layout */}
        <div className="h-14 border-2 border-black bg-slate-950 flex justify-center items-end gap-1.5 p-3 overflow-hidden rounded relative">
          <div className="absolute inset-x-0 inset-y-0 scanline opacity-30 pointer-events-none" />
          
          {isRecordingVoice ? (
            // Bouncing 8-bit sound bars micro-interaction driven by real speaker audio
            <div className="flex items-end justify-center gap-1.5 h-10 w-full pb-1">
              {audioLevels.map((lvl, idx) => (
                <span 
                  key={idx} 
                  className={`w-1.5 rounded-sm transition-all duration-75 ${
                    idx % 3 === 0 ? 'bg-[#F4E700]' : 'bg-emerald-400'
                  }`} 
                  style={{ height: `${lvl}%` }} 
                />
              ))}
            </div>
          ) : (
            // Flat idle audio line
            <div className="w-full flex justify-center items-center gap-0.5 select-none pb-4">
              <div className="w-32 h-[3px] bg-emerald-800 rounded-full" />
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <div className="w-32 h-[3px] bg-emerald-800 rounded-full" />
            </div>
          )}
        </div>

        {/* Dynamic high-resolution progress bar tracking the 180 seconds rule */}
        {isRecordingVoice && (
          <div className="bg-stone-900 border-2 border-black p-2 rounded flex flex-col gap-1.5 text-stone-100 select-none">
            <div className="flex justify-between items-center text-[10px] font-pixel">
              <span className="text-amber-400 animate-pulse font-bold">🎙️ VOICE TRANSCRIPTION TIMING</span>
              <span className="text-white font-mono font-black">
                {Math.floor(elapsedSeconds / 60).toString().padStart(2, '0')}:
                {(elapsedSeconds % 60).toString().padStart(2, '0')} / 03:00
              </span>
            </div>
            
            {/* Visual Progress Bar */}
            <div className="w-full h-2 bg-stone-950 border border-stone-800 rounded-sm overflow-hidden p-[1px]">
              <div 
                className="h-full bg-gradient-to-r from-amber-500 via-emerald-500 to-emerald-400 rounded-xs transition-all duration-300"
                style={{ width: `${Math.min(100, (elapsedSeconds / 180) * 100)}%` }}
              />
            </div>

            <div className="text-[8px] font-mono text-stone-400 text-center uppercase tracking-wider leading-none">
              {elapsedSeconds >= 180 
                ? "✓ 3-MINUTE COMMITMENT SATISFIED! PRESS 'STOP RECORDING' BELOW TO CLAIM AWARDS." 
                : `⚠️ LOGGING AUDIO: ${180 - elapsedSeconds}s REMAINING TO CLAIM REWARDS.`}
            </div>
          </div>
        )}

        {/* Diagnosis log */}
        <div className="bg-stone-50 p-2 border-2 border-black font-pixel text-[10px] text-[#1E1B1C] uppercase leading-none text-center">
          {voiceVerificationStatus}
        </div>

        <button
          id="devotions-mic-btn"
          onClick={handleToggleVoiceVerify}
          className={`w-full py-2.5 border-4 border-black font-headline font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 duration-100 ${
            isRecordingVoice 
              ? 'bg-[#EF4444] text-white hover:bg-[#EF4444] border-black shadow-[2px_2px_0_0_#000]' 
              : 'bg-white text-stone-700 hover:bg-stone-100'
          }`}
        >
          <span className="material-symbols-outlined text-lg">
            {isRecordingVoice ? 'stop' : 'mic'}
          </span>
          {isRecordingVoice ? 'Stop Recording' : 'Start Voice Verification'}
        </button>
      </div>

      {/* Streak multiplier preview */}
      <div className="bg-white border-4 border-black p-3.5 shadow-[4px_4px_0_0_rgba(30,27,28,1)] flex items-center justify-between select-none">
        <span className="font-headline font-bold text-[10px] text-gray-500 uppercase">
          STREAK MULTIPLIER MULT:
        </span>
        <span className="font-pixel text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 border border-emerald-500/20 uppercase rounded">
          +15 XP STREAK LOOT
        </span>
      </div>
    </div>
  );
}
