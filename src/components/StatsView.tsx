import React, { useState } from 'react';
import { useGame } from '../lib/GameContext';
import { motion, AnimatePresence } from 'motion/react';

export default function StatsView() {
  const { state, setShiftProgress, triggerToast, resetAllGameProgress, advanceToNextLevel } = useGame();
  const [showTechTree, setShowTechTree] = useState(false);

  const incrementTaskProgress = () => {
    if (state.shiftProgress >= 12) {
      triggerToast('Shift tasks are fully locked in!', 'success');
      return;
    }
    setShiftProgress(p => Math.min(p + 1, 12));
    triggerToast('Perfect shift action cataloged! Multiplier scaling...', 'loot');
  };

  const resetTaskProgress = () => {
    setShiftProgress(0);
    triggerToast('Morning clock-in initialized! Shift progress reset.', 'success');
  };

  // Simple leveling config mirroring ArenaView/Header
  const getLevelInfo = (xp: number) => {
    if (xp < 300) return { level: 1, title: 'TRAINEE' };
    if (xp < 800) return { level: 2, title: 'SHIFT CREW' };
    if (xp < 1500) return { level: 3, title: 'OFFICIAL HIRE' };
    if (xp < 2500) return { level: 4, title: 'CREW LEADER' };
    return { level: 5, title: 'STORE MANAGER' };
  };

  const lvlInfo = getLevelInfo(state.xp);
  const currentLevel = lvlInfo.level;

  // Restaurant Tier Specs
  let tierTitle = "Tier 1: Startup Stand";
  let tierImage = "https://res.cloudinary.com/dnablzr1p/image/upload/v1779768554/Screenshot_2026-05-25_101751_uvsrur.png";
  let efficiency = "1.2x Mult";
  let activeStaff = "2/10 crew";

  if (currentLevel >= 5) {
    tierTitle = "Tier 3: Golden Cyber Gate";
    tierImage = "https://res.cloudinary.com/dnablzr1p/image/upload/v1779768554/Screenshot_2026-05-26_105004_vmjp5o.png";
    efficiency = "2.5x Mult";
    activeStaff = "10/10 crew";
  } else if (currentLevel >= 3) {
    tierTitle = "Tier 2: Franchise Outpost";
    tierImage = "https://res.cloudinary.com/dnablzr1p/image/upload/v1779768554/Screenshot_2026-05-26_104953_fz4914.png";
    efficiency = "1.8x Mult";
    activeStaff = "5/10 crew";
  }

  return (
    <div className="flex flex-col gap-5 py-2">
      {/* 1. Daily Shift Status Banner */}
      <div className="bg-[#FEF9E1] border-4 border-[#1E1B1C] rounded-none p-4 shadow-[4px_4px_0_0_rgba(30,27,28,1)] flex flex-col gap-3">
        <div className="flex items-center justify-between border-b-2 border-[#1E1B1C]/10 pb-2">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[#cf240a] font-bold">local_fire_department</span>
            <span className="font-headline font-bold text-sm text-[#1E1B1C] uppercase tracking-wider">
              DAILY SHIFT STATUS
            </span>
          </div>
          <span className="font-pixel text-[10px] text-gray-500 font-bold">
            SHIFT PROGRESS
          </span>
        </div>

        {/* Progress Grid representation */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-end">
            <span className="font-headline font-bold text-xs uppercase tracking-wide text-gray-700">
              Tasks Logged: <span className="text-primary">{state.shiftProgress} / 12</span>
            </span>
            {/* Burn rate warnings */}
            <div className="flex items-center gap-1">
              <span className="font-pixel text-[9px] text-[#cf240a] font-bold uppercase leading-none">
                BURN RATE:
              </span>
              <div className="flex gap-0.5">
                <span className={`w-3 h-2.5 border border-black ${state.shiftProgress > 9 ? 'bg-[#cf240a]' : 'bg-stone-300'}`} />
                <span className={`w-3 h-2.5 border border-black ${state.shiftProgress > 6 ? 'bg-[#cf240a]' : 'bg-stone-300'}`} />
                <span className={`w-3 h-2.5 border border-black bg-[#cf240a]`} />
              </div>
            </div>
          </div>

          {/* Graphical Task Tick Blocks */}
          <div className="grid grid-cols-12 gap-1 select-none">
            {Array.from({ length: 12 }).map((_, i) => {
              const isFilled = i < state.shiftProgress;
              return (
                <div
                  key={i}
                  className={`h-6 border-2 border-black transition-all ${
                    isFilled 
                      ? 'bg-[#F4E700] shadow-[1px_1px_0_0_#1E1B1C]' 
                      : 'bg-[#FFF8F8] opacity-40'
                  }`}
                  title={`Slot ${i + 1}`}
                />
              );
            })}
          </div>

          <div className="flex gap-2 mt-1">
            <button
              id="stats-plus-task-btn"
              onClick={incrementTaskProgress}
              className="flex-1 py-1.5 border-2 border-black bg-white font-headline font-bold text-[10px] uppercase tracking-wider text-[#1e1b1c] active:scale-95 transition-all shadow-[2px_2px_0_0_#1E1B1C] cursor-pointer"
            >
              + Log Shift Duty
            </button>
            <button
              id="stats-reset-tasks-btn"
              onClick={resetTaskProgress}
              className="px-3 py-1.5 border-2 border-black bg-stone-100 font-headline font-bold text-[10px] uppercase tracking-wider text-stone-500 active:scale-95 transition-all hover:bg-red-50 hover:text-red-600 hover:border-red-600 cursor-pointer"
            >
              Reset Shift
            </button>
          </div>
        </div>
      </div>

      {/* 2. Restaurant Evolution Section */}
      <div className="bg-white border-4 border-[#1E1B1C] rounded-none p-4 shadow-[4px_4px_0_0_rgba(30,27,28,1)] flex flex-col gap-4">
        <h3 className="font-headline font-bold text-sm text-[#1E1B1C] uppercase tracking-wider border-b-2 border-stone-100 pb-2 flex items-center gap-1.5">
          <span className="material-symbols-outlined text-lg text-primary">storefront</span>
          RESTAURANT EVOLUTION
        </h3>

        <div className="flex flex-col sm:flex-row gap-4 items-center">
          {/* Outside restaurant image replacing SVG evolution box */}
          <div className="shrink-0 w-24 h-20 border-4 border-[#1E1B1C] bg-stone-100 overflow-hidden relative shadow-[2px_2px_0_0_#1E1B1C] select-none transition-all duration-300">
            <img 
              src={tierImage}
              alt="Franchise Outpost Outside"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="flex-1 w-full">
            <div className="flex items-center justify-between">
              <span className="font-headline font-bold text-[#1E1B1C] text-sm uppercase">
                {tierTitle}
              </span>
              <span className="font-pixel text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 border border-emerald-500/20 uppercase rounded tracking-wider">
                ACTIVE
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-3 text-xs font-pixel">
              <div className="bg-surface-container-low p-2 border border-[#1e1b1c]/10 text-center">
                <span className="block text-[8px] text-gray-500 uppercase">Efficiency</span>
                <span className="font-bold text-sm text-[#1E1B1C]">{efficiency}</span>
              </div>
              <div className="bg-surface-container-low p-2 border border-[#1e1b1c]/10 text-center">
                <span className="block text-[8px] text-gray-500 uppercase">Active Staff</span>
                <span className="font-bold text-sm text-[#1E1B1C]">{activeStaff}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Active Crew Roster Banner */}
        <div className="p-2.5 bg-amber-50/50 border-2 border-black/10 flex items-center gap-3">
          <div className="shrink-0 w-16 h-12 border-2 border-black bg-stone-100 overflow-hidden select-none shadow-[1px_1px_0_0_rgba(0,0,0,1)]">
            <img 
              src="https://res.cloudinary.com/dnablzr1p/image/upload/v1779768553/Screenshot_2026-05-26_105233_ftqhh3.png"
              alt="Active Shift Crew"
              className="w-full h-full object-cover font-pixel text-[8px]"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <span className="block font-headline font-bold text-[10px] text-[#1e1b1c] uppercase tracking-wide">
              Active Shift Crew Members
            </span>
            <span className="block font-body text-[9px] text-gray-500 mt-0.5 leading-tight lowercase">
              operating counters, fry stations, & client drive-thrus.
            </span>
          </div>
        </div>

        {/* Upgrade steps details */}
        <div className="flex flex-col gap-1.5 border-t border-stone-200 pt-3 text-xs">
          {currentLevel < 3 ? (
            <>
              <div className="flex items-center justify-between text-gray-500">
                <span className="font-headline font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">lock</span>
                  Tier 2: Franchise Outpost
                </span>
                <span className="font-pixel text-[10px]">Unlocks at Lvl 3</span>
              </div>
              <div className="flex items-center justify-between text-gray-500">
                <span className="font-headline font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">lock</span>
                  Tier 3: Golden Cyber Empire
                </span>
                <span className="font-pixel text-[10px]">Unlocks at Lvl 5</span>
              </div>
            </>
          ) : currentLevel < 5 ? (
            <>
              <div className="flex items-center justify-between text-emerald-600">
                <span className="font-headline font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm text-emerald-500 font-bold">check_circle</span>
                  Tier 1: Starter Stand
                </span>
                <span className="font-pixel text-[10px] font-bold">COMPLETED</span>
              </div>
              <div className="flex items-center justify-between text-gray-500">
                <span className="font-headline font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">lock</span>
                  Tier 3: Golden Cyber Empire
                </span>
                <span className="font-pixel text-[10px]">Unlocks at Lvl 5</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between text-emerald-600">
                <span className="font-headline font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm text-emerald-500 font-bold">check_circle</span>
                  Tier 1: Starter Stand
                </span>
                <span className="font-pixel text-[10px] font-bold">COMPLETED</span>
              </div>
              <div className="flex items-center justify-between text-emerald-600">
                <span className="font-headline font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm text-emerald-500 font-bold">check_circle</span>
                  Tier 2: Franchise Outpost
                </span>
                <span className="font-pixel text-[10px] font-bold">COMPLETED</span>
              </div>
            </>
          )}
        </div>

        <button
          id="stats-tech-tree-btn"
          onClick={() => setShowTechTree(true)}
          className="w-full py-2 bg-[#F4E700] border-4 border-black font-headline font-bold text-xs uppercase tracking-wider text-[#1E1B1C] cursor-pointer shadow-[3px_3px_0_0_#1E1B1C] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1.5px_1.5px_0_0_#1E1B1C] hover:bg-[#ffe7e2] transition-all"
        >
          View Tech Tree Upgrades
        </button>
      </div>

      {/* 3. Habit stations list */}
      <div className="bg-[#FFF] border-4 border-[#1E1B1C] rounded-none p-4 shadow-[4px_4px_0_0_rgba(30,27,28,1)] flex flex-col gap-3">
        <h3 className="font-headline font-bold text-sm text-[#1E1B1C] uppercase tracking-wider border-b-2 border-stone-100 pb-2">
          HABIT STATION SPECIFICATIONS
        </h3>

        <div className="flex flex-col gap-2 font-pixel text-xs text-stone-700">
          <div className="flex items-center justify-between p-2 bg-stone-50 border border-black/10">
            <span className="font-headline font-bold text-[#1e1b1c] uppercase flex items-center gap-1">
              <span className="material-symbols-outlined text-base">accessibility_new</span>
              Posture Tracking
            </span>
            <span className="text-secondary font-bold">+15% Focus</span>
          </div>

          <div className="flex items-center justify-between p-2 bg-stone-50 border border-black/10">
            <span className="font-headline font-bold text-[#1e1b1c] uppercase flex items-center gap-1">
              <span className="material-symbols-outlined text-base">menu_book</span>
              Devotional Reflections
            </span>
            <span className="text-[#666000] font-bold">Spirit Max</span>
          </div>
        </div>
      </div>

      {/* 4. Stat Actions Control Bar (Reset / Next Level) */}
      <div className="flex gap-3 mt-1">
        <button
          id="stats-reset-all-btn"
          onClick={resetAllGameProgress}
          className="flex-1 py-2.5 px-3 border-4 border-black bg-red-100 hover:bg-red-250 text-red-700 font-headline font-bold text-[10px] uppercase tracking-wider cursor-pointer shadow-[3px_3px_0_0_#1E1B1C] active:translate-x-0.5 active:translate-y-0.5 transition-all text-center font-pixel"
        >
          ❌ RESET PROGRESS
        </button>
        <button
          id="stats-next-level-btn"
          onClick={advanceToNextLevel}
          className="flex-1 py-2.5 px-3 border-4 border-black bg-[#e6fbf2] hover:bg-emerald-250 text-emerald-800 font-headline font-bold text-[10px] uppercase tracking-wider cursor-pointer shadow-[3px_3px_0_0_#1E1B1C] active:translate-x-0.5 active:translate-y-0.5 transition-all text-center font-pixel"
        >
          ⚡ NEXT LEVEL
        </button>
      </div>

      {/* Retro Tech Tree Upgrade Drawer/Modal Overlay */}
      <AnimatePresence>
        {showTechTree && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black/60 backdrop-blur-xs" 
              onClick={() => setShowTechTree(false)}
            />
            
            {/* Modal Body */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="relative w-full max-w-sm bg-surface border-4 border-black p-5 shadow-[5px_5px_0_0_rgba(0,0,0,1)] z-10 flex flex-col gap-4 font-headline uppercase"
            >
              <div className="flex items-center justify-between border-b-4 border-black pb-2 bg-primary text-white -mx-5 -mt-5 p-3 font-bold">
                <span className="flex items-center gap-1 text-sm tracking-wide">
                  <span className="material-symbols-outlined text-lg text-secondary-fixed">workspace_premium</span>
                  MC_TECH_TREE.EXE
                </span>
                <button 
                  onClick={() => setShowTechTree(false)}
                  className="material-symbols-outlined hover:text-black cursor-pointer text-lg font-bold"
                >
                  close
                </button>
              </div>

              <div className="font-body text-xs text-[#1E1B1C] lowercase leading-relaxed flex flex-col gap-3 font-medium">
                <p className="font-bold uppercase text-[10px] text-gray-500 border-b border-stone-200 pb-1 font-pixel">
                  Upgrade Tree Branches & Multiplier Buffs
                </p>

                {/* Node 1 */}
                <div className="flex p-2.5 bg-white border-2 border-black rounded gap-3 items-center">
                  <div className="shrink-0 w-12 h-12 border-2 border-primary bg-on-primary-container p-0.5 overflow-hidden shadow-[1px_1px_0_0_rgba(0,0,0,1)]">
                    <img 
                      src="https://res.cloudinary.com/dnablzr1p/image/upload/v1779768554/Screenshot_2026-05-26_104916_idqoqa.png" 
                      alt="Fierce Frying Badge" 
                      className="w-full h-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div>
                    <h4 className="font-headline font-bold text-xs uppercase text-[#1E1B1C]">Fierce Frying (Lvl 1)</h4>
                    <p className="font-body text-[10px] text-gray-600">Completing Posture sessions increases combat damage by 10%.</p>
                  </div>
                </div>

                {/* Node 2 */}
                <div className={`flex p-2.5 bg-white border-2 border-black rounded gap-3 items-center ${currentLevel < 3 ? 'opacity-60' : ''}`}>
                  <div className={`shrink-0 w-12 h-12 border-2 ${currentLevel < 3 ? 'border-dashed border-stone-400 bg-stone-100' : 'border-primary bg-indigo-50'} p-0.5 overflow-hidden shadow-[1px_1px_0_0_rgba(0,0,0,1)]`}>
                    <img 
                      src="https://res.cloudinary.com/dnablzr1p/image/upload/v1779768554/Screenshot_2026-05-26_104928_szfmjq.png" 
                      alt="Posture Guard Badge" 
                      className="w-full h-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div>
                    <h4 className="font-headline font-bold text-xs uppercase text-[#1E1B1C] flex items-center gap-1">
                      Posture Core Guard (Lvl 2)
                      {currentLevel < 3 && <span className="material-symbols-outlined text-[10px]">lock</span>}
                    </h4>
                    <p className="font-body text-[10px] text-gray-600">Unlocks at Level 3. Perfect posture alignment guards your streak from theft.</p>
                  </div>
                </div>

                {/* Node 3 */}
                <div className={`flex p-2.5 bg-white border-2 border-black rounded gap-3 items-center ${currentLevel < 5 ? 'opacity-60' : ''}`}>
                  <div className={`shrink-0 w-12 h-12 border-2 ${currentLevel < 5 ? 'border-dashed border-stone-400 bg-stone-100' : 'border-primary bg-red-50'} p-0.5 overflow-hidden shadow-[1px_1px_0_0_rgba(0,0,0,1)]`}>
                    <img 
                      src="https://res.cloudinary.com/dnablzr1p/image/upload/v1779768554/Screenshot_2026-05-26_104938_qkdo6v.png" 
                      alt="Spirit Badge" 
                      className="w-full h-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div>
                    <h4 className="font-headline font-bold text-xs uppercase text-[#1E1B1C] flex items-center gap-1">
                      Spirit Multiplier (Lvl 3)
                      {currentLevel < 5 && <span className="material-symbols-outlined text-[10px]">lock</span>}
                    </h4>
                    <p className="font-body text-[10px] text-gray-600">Unlocks at Level 5. Writing devotions details gives +20% coin boost permanent.</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowTechTree(false)}
                className="w-full py-2 border-2 border-black bg-stone-100 hover:bg-stone-200 transition-colors cursor-pointer font-bold text-xs tracking-wide"
              >
                Close Tree
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
