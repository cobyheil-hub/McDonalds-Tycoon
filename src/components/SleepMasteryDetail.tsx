import React from 'react';
import { useGame } from '../lib/GameContext';

interface SleepMasteryProps {
  onBack: () => void;
}

export default function SleepMasteryDetail({ onBack }: SleepMasteryProps) {
  const { state, setSleepHours, toggleSleepPhoneLock, completeTask, triggerToast } = useGame();

  const handleIncrement = () => {
    if (state.sleepHours >= 12) {
      triggerToast('Optimal shift limit capped at 12 hours!', 'warning');
      return;
    }
    setSleepHours(Math.min(state.sleepHours + 0.5, 12));
  };

  const handleDecrement = () => {
    if (state.sleepHours <= 0) return;
    setSleepHours(Math.max(state.sleepHours - 0.5, 0));
  };

  const handleSubmitSleepShift = () => {
    if (state.sleepHours < 8) {
      triggerToast('Shift warning: Sleep duration under 8 hours is unhealthy. Lock in more hours first!', 'warning');
      return;
    }
    if (!state.isSleepPhoneLocked) {
      triggerToast('Shift warning: Accelerometer diagnostics show Phone Lock was unengaged! Lock phone first!', 'warning');
      return;
    }
    // Claim mission reward!
    completeTask('Perfected 10HR Sleep Mastery', 20, 50);
    onBack();
  };

  return (
    <div className="flex flex-col gap-4 py-2">
      {/* Back to Arena Button */}
      <button 
        id="sleep-back-btn"
        onClick={onBack}
        className="self-start px-2 py-1.5 border-2 border-black rounded flex items-center gap-1 bg-surface-container font-headline font-bold text-[10px] uppercase cursor-pointer hover:bg-stone-100 active:scale-95 transition-all select-none"
      >
        <span className="material-symbols-outlined text-xs">arrow_back</span>
        Back to Arena
      </button>

      {/* Title */}
      <div className="flex items-center justify-between border-b-4 border-black pb-2 select-none">
        <div>
          <span className="font-pixel text-[10px] text-gray-500 font-bold uppercase leading-none block">
            STATION HABIT 1
          </span>
          <h2 className="font-headline font-bold text-base text-[#1E1B1C] uppercase leading-none mt-1">
            SLEEP MASTERY
          </h2>
        </div>
        <span className="px-1.5 py-0.5 font-pixel text-[9px] font-bold bg-tomato text-primary border border-tomato/30 uppercase rounded tracking-wider">
          HARD
        </span>
      </div>

      {/* Visual Reference Banner */}
      <div className="border-4 border-black bg-stone-100 overflow-hidden relative shadow-[4px_4px_0_0_rgba(30,27,28,1)]">
        <span className="absolute top-1.5 left-2 font-pixel text-[8px] px-1.5 py-0.5 border border-black bg-black text-yellow-400 uppercase select-none z-10 font-bold">
          HABIT TRACKER CONTROL PANEL
        </span>
        <img 
          src="https://i.ibb.co/Xx5FqsKW/Screenshot-2026-05-25-094417.png"
          alt="Sleep Tracker Overview Reference"
          className="w-full h-auto max-h-48 object-cover border-b-2 border-black"
          referrerPolicy="no-referrer"
        />
        <div className="bg-red-50 p-2.5 text-center text-red-800 font-pixel text-[9px] uppercase font-bold leading-normal select-none">
          🌙 OPERATING SLEEP RECOVERY CHANNELS: MULTIPLIERS ENGAGED
        </div>
      </div>

      {/* Cozy bedroom illustration */}
      <div className="bg-white border-4 border-black p-4 flex flex-col items-center justify-center shadow-[4px_4px_0_0_rgba(30,27,28,1)] overflow-hidden relative select-none">
        {/* Retro night window graphic */}
        <div className="w-full max-w-[260px] h-32 border-4 border-black bg-slate-900 rounded relative overflow-hidden flex items-center justify-center">
          {/* Cyberpunk starry background grid */}
          <div className="absolute inset-0 scanline" />
          <div className="scanning-bar absolute h-[1px] w-full bg-[#f4e700]/15" />
          
          {/* Little Stars */}
          <div className="absolute top-4 left-6 w-1 h-1 bg-white rounded-full animate-ping" />
          <div className="absolute top-12 left-24 w-1 h-1 bg-[#F4E700] rounded-full" />
          <div className="absolute top-5 right-12 w-0.5 h-0.5 bg-white rounded-full" />
          <div className="absolute top-16 right-4 w-1 h-1 bg-white rounded-full animate-pulse" />
          
          {/* Moon Drawing */}
          <circle cx="210" cy="30" r="12" fill="#FEF9E1" className="absolute" />
          <circle cx="204" cy="30" r="11" fill="#0F172A" className="absolute" />

          {/* Cozy bed silhouette */}
          <div className="absolute bottom-0 w-full px-4 flex items-end">
            <div className="w-16 h-8 bg-amber-800 border-2 border-black rounded-t flex items-start p-1 translate-x-3">
              <div className="w-4 h-3 bg-white border border-black rounded-xs" />
            </div>
            <div className="w-32 h-6 bg-primary border-2 border-black rounded-t translate-x-2" />
          </div>
        </div>
        
        <span className="font-pixel text-[9px] text-gray-400 mt-2 uppercase font-semibold">
          bedroom_isometric_diagram.exe
        </span>
      </div>

      {/* Sleep Hour Adjuster */}
      <div className="bg-[#FEF9E1] border-4 border-black p-4 shadow-[4px_4px_0_0_#1E1B1C] flex flex-col gap-3">
        <div className="flex justify-between items-end">
          <span className="font-headline font-bold text-xs uppercase tracking-wide text-[#1E1B1C]">
            TIME ASLEEP RECORD:
          </span>
          <span className="font-pixel font-bold text-sm text-primary">
            {state.sleepHours} / 10 HR
          </span>
        </div>

        {/* Action Widgets to adjust time */}
        <div className="flex items-center gap-3">
          <button
            id="sleep-dec-btn"
            onClick={handleDecrement}
            className="p-3 border-2 border-black rounded bg-white text-stone-700 hover:bg-stone-50 active:scale-95 transition-all cursor-pointer font-bold text-lg select-none flex items-center justify-center leading-none"
            style={{ width: '44px', height: '44px' }}
          >
            -
          </button>
          
          {/* Visual Bar gauge */}
          <div className="flex-1 h-6 bg-white border-2 border-black relative select-none">
            <div 
              className="h-full bg-primary border-r-2 border-black transition-all" 
              style={{ width: `${Math.min((state.sleepHours / 10) * 100, 100)}%` }}
            />
          </div>

          <button
            id="sleep-inc-btn"
            onClick={handleIncrement}
            className="p-3 border-2 border-black rounded bg-white text-stone-700 hover:bg-stone-50 active:scale-95 transition-all cursor-pointer font-bold text-lg select-none flex items-center justify-center leading-none"
            style={{ width: '44px', height: '44px' }}
          >
            +
          </button>
        </div>
      </div>

      {/* Status boxes grid & checklist rules */}
      <div className="grid grid-cols-2 gap-3">
        <div 
          onClick={toggleSleepPhoneLock}
          className={`p-3 border-4 border-black flex flex-col gap-1 items-center justify-center cursor-pointer active:scale-95 transition-all ${
            state.isSleepPhoneLocked 
              ? 'bg-emerald-50 text-emerald-700 border-black' 
              : 'bg-stone-50 text-stone-400 border-stone-300 border-dashed'
          }`}
        >
          <span className="material-symbols-outlined text-2xl font-bold">
            {state.isSleepPhoneLocked ? 'lock' : 'lock_open'}
          </span>
          <span className="font-headline font-bold text-[9px] text-center uppercase tracking-wide">
            PHONE LOCK ACTIVE
          </span>
        </div>

        <div className="p-3 border-4 border-black bg-emerald-50 text-emerald-700 flex flex-col gap-1 items-center justify-center select-none">
          <span className="material-symbols-outlined text-2xl font-bold animate-pulse">
            sensors_kronecker
          </span>
          <span className="font-headline font-bold text-[9px] text-center uppercase tracking-wide">
            ANALYTICS: LIVE
          </span>
        </div>
      </div>

      {/* Description Box */}
      <div className="bg-white border-4 border-black p-4 shadow-[4px_4px_0_0_rgba(30,27,28,1)] flex flex-col gap-2">
        <h4 className="font-headline font-bold text-xs uppercase text-[#1e1b1c] tracking-widest flex items-center gap-1 select-none">
          <span className="material-symbols-outlined text-base">info</span>
          STATION DIRECTIVE RULES
        </h4>
        <p className="font-body text-xs text-gray-400 font-semibold leading-relaxed lowercase">
          Aim for 10 hours of undisturbed rest. NO PHONE PERMITTED. Verified via AI accelerometer tracking.
        </p>

        {/* Mission Loot summary */}
        <div className="mt-2 p-3 bg-surface-container-low border-2 border-black flex justify-between items-center select-none">
          <span className="font-headline font-bold text-[10px] text-gray-500">SHIFT SUCCESS LOOT:</span>
          <span className="font-pixel text-[11px] font-bold text-[#cf240a]">
            +20 XP | +$50 Coins
          </span>
        </div>

        <button
          id="sleep-submit-shift-btn"
          onClick={handleSubmitSleepShift}
          className="w-full mt-2 py-2.5 bg-primary border-4 border-black text-white font-headline font-bold text-xs tracking-wider uppercase shadow-[3px_3px_0_0_#1E1B1C] hover:bg-[#cf240a] cursor-pointer transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1.5px_1.5px_0_0_#1E1B1C]"
        >
          PUNCH OUT SLEEP SHIFT (SUBMIT VALUE)
        </button>
      </div>
    </div>
  );
}
