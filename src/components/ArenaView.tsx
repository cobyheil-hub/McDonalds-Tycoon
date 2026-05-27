import React from 'react';
import { useGame } from '../lib/GameContext';
import { motion } from 'motion/react';
import RestaurantLocator from './RestaurantLocator';

interface ArenaViewProps {
  onNavigateToHabit: (habitId: 'posture' | 'devotions') => void;
  onOpenOpponentSelect: () => void;
}

export default function ArenaView({ onNavigateToHabit, onOpenOpponentSelect }: ArenaViewProps) {
  const { state, fightActiveBoss } = useGame();

  // Dynamic Level Config
  const getLevelInfo = (xp: number) => {
    if (xp < 300) {
      return {
        level: 1,
        title: 'TRAINEE',
        xpFloor: 0,
        xpCeil: 300,
        desc: 'The Struggle - Sweeping the arches.'
      };
    }
    if (xp < 800) {
      return {
        level: 2,
        title: 'SHIFT CREW',
        xpFloor: 300,
        xpCeil: 800,
        desc: 'The Grind - Operating the fry dispensers.'
      };
    }
    if (xp < 1500) {
      return {
        level: 3,
        title: 'OFFICIAL HIRE',
        xpFloor: 800,
        xpCeil: 1500,
        desc: 'Certified Lock-in! Smiling through lunch rushes.'
      };
    }
    if (xp < 2500) {
      return {
        level: 4,
        title: 'CREW LEADER',
        xpFloor: 1500,
        xpCeil: 2500,
        desc: 'Manager Shift! Guiding newcomers during morning devotions.'
      };
    }
    return {
      level: 5,
      title: 'STORE MANAGER',
      xpFloor: 2500,
      xpCeil: 5000,
      desc: 'The Ultimate Ronald - Golden Arches Empire Commander.'
    };
  };

  const lvl = getLevelInfo(state.xp);
  const percentProgress = Math.min(
    Math.max(((state.xp - lvl.xpFloor) / (lvl.xpCeil - lvl.xpFloor)) * 100, 0),
    100
  );

  // Boss character description mappings
  const opponentInfo = {
    karen: {
      name: 'The Karen',
      lvl: 'Level 1 (BOSS)',
      slogan: 'DEMANDS SERVICE - STEALS 25 COINS IF SEVENTY OR FAILING SHIFT',
      color: 'bg-[#cf240a]/10',
      avatar: (
        <img 
          src="https://res.cloudinary.com/dnablzr1p/image/upload/v1779768554/Screenshot_2026-05-25_095757_kw09ni.png"
          referrerPolicy="no-referrer"
          alt="The Karen"
          className="w-16 h-16 object-cover border-2 border-black bg-amber-50 rounded"
        />
      )
    },
    sga: {
      name: 'SGA Threat',
      lvl: 'Level 2 (ELITE)',
      slogan: 'AURA ATTACK - SWIPES 35 COINS WITH STATIC PRESSURE',
      color: 'bg-blue-100',
      avatar: (
        <img 
          src="https://res.cloudinary.com/dnablzr1p/image/upload/v1779768554/Screenshot_2026-05-25_095806_urmpnd.png"
          referrerPolicy="no-referrer"
          alt="SGA Threat"
          className="w-16 h-16 object-cover border-2 border-black bg-amber-50 rounded"
        />
      )
    },
    bk: {
      name: 'Burglar King',
      lvl: 'Level 4 (GRAND BOSS)',
      slogan: 'SOVEREIGN FLAME-BROILED AURA! STEALS 50 COINS & DISRUPTS YOUR SHIFT AURA',
      color: 'bg-yellow-50',
      avatar: (
        <img 
          src="https://res.cloudinary.com/dnablzr1p/image/upload/v1779372879/Screenshot_2026-05-21_211435_n0ojbn.png"
          referrerPolicy="no-referrer"
          alt="Burglar King"
          className="w-16 h-16 object-cover border-2 border-black bg-amber-50 rounded select-none"
        />
      )
    }
  };

  const activeOpp = opponentInfo[state.activeOpponentId] || opponentInfo.bk;
  const activeOppHp = state.bossHps[state.activeOpponentId];
  const activeOppMaxHp = state.activeOpponentId === 'bk' ? 200 : state.activeOpponentId === 'sga' ? 150 : 100;
  const oppHpPct = Math.round((activeOppHp / activeOppMaxHp) * 100);

  return (
    <div className="flex flex-col gap-5 py-2">
      {/* Restaurant GPS Registry locator */}
      <RestaurantLocator />

      {/* 1. Official Hire Level Banner */}
      <div className="bg-[#FFF] border-4 border-[#1E1B1C] rounded-none p-4 shadow-[4px_4px_0_0_rgba(30,27,28,1)] flex flex-col sm:flex-row gap-4 items-center">
        {/* Pixel portrait */}
        <div className="relative shrink-0 select-none">
          <div className="w-20 h-20 border-4 border-[#1E1B1C] bg-[#FFE7E2] relative overflow-hidden">
            <img 
              src={lvl.level <= 2 
                ? "https://res.cloudinary.com/dnablzr1p/image/upload/v1779768553/Screenshot_2026-05-26_105242_goqxov.png" 
                : lvl.level <= 4
                ? "https://res.cloudinary.com/dnablzr1p/image/upload/q_auto/f_auto/v1779768552/Screenshot_2026-05-26_105248_wc2uln.png"
                : "https://res.cloudinary.com/dnablzr1p/image/upload/v1779768552/Screenshot_2026-05-26_105306_iji0ft.png"
              }
              alt="Employee Profile Avatar"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            {/* Visual indicator of equipped status */}
            <div className="absolute top-1 left-1 flex flex-col gap-0.5 pointer-events-none select-none">
              {state.equippedVisor && (
                <span className="text-[6px] font-pixel bg-[#f4e700] text-[#1e1b1c] px-1 border border-[#1e1b1c] rounded-xs font-bold uppercase leading-none scale-90 origin-left">
                  VISOR
                </span>
              )}
              {state.equippedHoodie && (
                <span className="text-[6px] font-pixel bg-[#a51300] text-white px-1 border border-[#1e1b1c] rounded-xs font-bold uppercase leading-none scale-90 origin-left">
                  HOODIE
                </span>
              )}
            </div>
          </div>
          <div className="absolute -bottom-2 -right-2 px-2 py-0.5 bg-primary text-white font-headline font-bold text-[9px] uppercase tracking-wider border-2 border-[#1E1B1C] shadow-[1px_1px_0_0_#1E1B1C]">
            LVL {lvl.level}
          </div>
        </div>

        {/* Level metrics details & description */}
        <div className="flex-1 w-full flex flex-col justify-between">
          <div className="text-center sm:text-left mb-2">
            <h2 className="font-headline font-bold text-base text-[#1E1B1C] uppercase tracking-wider flex flex-col sm:flex-row items-center gap-1">
              <span>{lvl.title}</span>
              <span className="text-xs text-gray-400 font-pixel font-normal uppercase hidden sm:inline">|</span>
              <span className="text-xs text-primary font-pixel font-bold">STREAK LOCK IN ACTIVE</span>
            </h2>
            <p className="font-body text-xs text-gray-500 mt-1 sm:mt-0 font-medium">
              {lvl.desc}
            </p>
          </div>

          {/* Level Progress Meter */}
          <div className="w-full">
            <div className="flex justify-between items-end mb-1 font-pixel text-[10px]">
              <span className="text-gray-500 uppercase tracking-widest leading-none">RANK PROGRESS</span>
              <span className="font-bold text-[#1E1B1C] leading-none">
                {state.xp} / {lvl.xpCeil} XP
              </span>
            </div>
            {/* Retro 8-bit meter */}
            <div className="w-full h-5 bg-surface-container border-3 border-[#1E1B1C] relative select-none">
              <div 
                className="h-full bg-[#f4e700] border-r-3 border-[#1E1B1C] transition-all duration-300" 
                style={{ width: `${percentProgress}%` }}
              />
              <span className="absolute inset-x-0 inset-y-0 flex items-center justify-center font-pixel text-[9px] font-bold text-on-surface text-center">
                {Math.round(percentProgress)}% CERTIFIED
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. The Daily Shift Section */}
      <section className="flex flex-col gap-3">
        <h3 className="font-headline font-bold text-sm text-[#1E1B1C] uppercase tracking-wider flex items-center gap-1.5 border-b-2 border-stone-300 pb-1">
          <span className="material-symbols-outlined text-lg text-primary">schedule</span>
          The Daily Habit Station Shifts
        </h3>
        <p className="font-body text-xs text-gray-500 leading-normal mb-1">
          Each station contains target habits to perfect. Clock into sessions to load metrics and claim Coins/XP rewards.
        </p>

        <div className="grid grid-cols-1 gap-3">
          {/* Habit 2: Posture */}
          <div 
            onClick={() => onNavigateToHabit('posture')}
            className="p-4 bg-[#FEF9E1]/30 border-4 border-[#1E1B1C] hover:bg-[#FEF9E1]/60 cursor-pointer transition-all flex items-center justify-between shadow-[2px_2px_0_0_rgba(30,27,28,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0_0_rgba(30,27,28,1)]"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#f1e400]/20 border-2 border-[#1E1B1C] text-stone-700 flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl font-bold">accessibility_new</span>
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <h4 className="font-headline font-bold text-sm text-[#1E1B1C] leading-snug">STATION 2: POSTURE FIX</h4>
                  <span className="text-[9px] px-1 font-pixel font-bold bg-[#666000]/10 text-stone-700 border border-stone-500/20 rounded uppercase">MED</span>
                </div>
                <p className="font-body text-xs text-gray-500 leading-none mt-1">
                  Computer vision alignment • {state.postureAlignment}% alignment today
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="text-right">
                <span className="block font-pixel text-[10px] text-primary font-bold">+10 XP</span>
                <span className="block font-pixel text-[10px] text-secondary font-bold">+$20 Coin</span>
              </div>
              <span className="material-symbols-outlined text-stone-600 font-bold">chevron_right</span>
            </div>
          </div>

          {/* Habit 3: Devotions */}
          <div 
            onClick={() => onNavigateToHabit('devotions')}
            className="p-4 bg-[#FEF9E1]/30 border-4 border-[#1E1B1C] hover:bg-[#FEF9E1]/60 cursor-pointer transition-all flex items-center justify-between shadow-[2px_2px_0_0_rgba(30,27,28,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0_0_rgba(30,27,28,1)]"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 border-2 border-[#1E1B1C] text-emerald-700 flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl font-bold">menu_book</span>
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <h4 className="font-headline font-bold text-sm text-[#1E1B1C] leading-snug">STATION 3: MORNING DEVOTIONS</h4>
                  <span className="text-[9px] px-1 font-pixel font-bold bg-emerald-50 text-emerald-700 border border-emerald-500/20 rounded uppercase">EASY</span>
                </div>
                <p className="font-body text-xs text-gray-500 leading-none mt-1">
                  Daily meditation & Speech AI reflections • {state.devotionsText ? 'Reflected' : 'Pending shift log'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="text-right">
                <span className="block font-pixel text-[10px] text-primary font-bold">+5 XP</span>
                <span className="block font-pixel text-[10px] text-secondary font-bold">+$10 Coin</span>
              </div>
              <span className="material-symbols-outlined text-stone-600 font-bold">chevron_right</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Lunch Rush / Antagonist Section */}
      <section className="bg-surface border-4 border-[#1E1B1C] p-4 shadow-[4px_4px_0_0_rgba(30,27,28,1)] flex flex-col gap-3">
        <div className="flex items-center justify-between border-b-2 border-[#1E1B1C]/25 pb-2">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#cf240a] font-bold">sports_kabaddi</span>
            <div>
              <h3 className="font-headline font-bold text-sm text-[#1e1b1c] uppercase tracking-wider leading-none">
                LUNCH RUSH (Antagonists)
              </h3>
              <span className="font-pixel text-[9px] text-[#cf240a] font-bold uppercase leading-none">
                Shift Arena Battleground
              </span>
            </div>
          </div>
          <button 
            id="arena-choose-opponent-btn"
            onClick={onOpenOpponentSelect}
            className="px-2 py-1 border-2 border-black font-headline font-bold text-[9px] uppercase tracking-wide bg-surface-container transition-all hover:bg-[#FFE7E2] hover:text-primary active:scale-95 cursor-pointer flex items-center gap-1"
          >
            Switch Boss ⚔️
          </button>
        </div>

        {/* Boss Profile stats */}
        <div className="flex flex-col sm:flex-row gap-4 items-center mt-1">
          {/* Boss avatar */}
          <div className="shrink-0">
            {activeOpp.avatar}
          </div>

          {/* HP bar and description */}
          <div className="flex-1 w-full text-center sm:text-left">
            <div className="flex flex-col sm:flex-row justify-between items-center sm:items-baseline mb-1 font-pixel text-[11px]">
              <span className="font-bold text-[#1E1B1C] uppercase tracking-wide leading-none">
                {activeOpp.name} <span className="text-xs text-primary font-normal">{activeOpp.lvl}</span>
              </span>
              <span className="font-bold text-stone-500 leading-none">
                {activeOppHp} / {activeOppMaxHp} HP
              </span>
            </div>

            {/* Boss health progress bar */}
            <div className="w-full h-4 bg-stone-200 border-2 border-black relative mb-2 select-none">
              <div 
                className="h-full bg-[#cf240a] border-r-2 border-black transition-all duration-150" 
                style={{ width: `${oppHpPct}%` }}
              />
              <span className="absolute inset-x-0 inset-y-0 flex items-center justify-center font-pixel text-[9px] font-bold text-white text-center drop-shadow-sm">
                {activeOppHp > 0 ? `${oppHpPct}% ACTIVE THREAT` : 'VANQUISHED!'}
              </span>
            </div>

            <p className="font-body text-[10px] text-gray-400 font-semibold leading-normal mb-1">
              {activeOpp.slogan}
            </p>
          </div>
        </div>

        {/* Fight Button */}
        <div className="mt-2">
          {activeOppHp > 0 ? (
            <button
              id="arena-fight-btn"
              onClick={fightActiveBoss}
              className="w-full py-2.5 bg-primary border-4 border-black text-white font-headline font-bold text-sm tracking-wider uppercase flex items-center justify-center gap-2 cursor-pointer shadow-[3px_3px_0_0_#1E1B1C] hover:bg-[#cf240a] transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1.5px_1.5px_0_0_#1E1B1C]"
            >
              <span className="material-symbols-outlined text-lg">swords</span>
              Attack {activeOpp.name.toUpperCase()} (FIGHT ⚔️)
            </button>
          ) : (
            <div className="w-full py-2.5 bg-stone-100 border-4 border-black text-emerald-600 font-headline font-bold text-sm tracking-wider uppercase flex items-center justify-center gap-2 border-dashed select-none">
              <span className="material-symbols-outlined text-lg">check_circle</span>
              {activeOpp.name.toUpperCase()} HAS BEEN SATISFIED!
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
