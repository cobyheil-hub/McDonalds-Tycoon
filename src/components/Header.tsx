import React from 'react';
import { useGame } from '../lib/GameContext';
import { signInWithGoogle, logOutUser, isLiveFirebase } from '../lib/firebase';

export default function Header() {
  const { state, user, authLoading, triggerToast } = useGame();

  const handleSignIn = async () => {
    try {
      if (!isLiveFirebase) {
        triggerToast('Sandbox Workspace is running locally. Accepting terms will unlock Firebase Cloud Sync!', 'warning');
        return;
      }
      await signInWithGoogle();
    } catch (err: any) {
      triggerToast('Google Sign-In failed or cancelled', 'warning');
    }
  };

  const handleSignOut = async () => {
    try {
      await logOutUser();
      triggerToast('Successfully logged out of Cloud Profile', 'success');
    } catch (err) {
      triggerToast('Failed to log out', 'warning');
    }
  };

  // Dynamic Level Calculation
  const getLevelInfo = (xp: number) => {
    if (xp < 300) return { level: 1, title: 'TRAINEE', color: 'bg-stone-500' };
    if (xp < 800) return { level: 2, title: 'SHIFT CREW', color: 'bg-[#666000]' };
    if (xp < 1500) return { level: 3, title: 'OFFICIAL HIRE', color: 'bg-primary' };
    if (xp < 2500) return { level: 4, title: 'CREW LEADER', color: 'bg-blue-600' };
    return { level: 5, title: 'STORE MANAGER', color: 'bg-emerald-600' };
  };

  const lvlInfo = getLevelInfo(state.xp);

  return (
    <header className="sticky top-0 z-40 w-full bg-[#FEF9E1] border-b-4 border-[#1E1B1C] py-2 px-3 shadow-[0_4px_0_0_rgba(30,27,28,1)]">
      <div className="flex flex-col gap-2">
        {/* Top bar: Brand & Login */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-3xl font-bold animate-pulse" style={{ fontVariationSettings: "'FILL' 1" }}>
              stars
            </span>
            <div className="flex flex-col">
              <h1 className="font-headline font-bold text-sm tracking-wider text-[#1e1b1c] uppercase leading-none">
                McD LOCK-IN
              </h1>
              <span className="font-pixel text-[10px] text-gray-500 uppercase leading-none">
                Employee Tracker
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {authLoading ? (
              <span className="font-pixel text-[10px] text-gray-400 animate-pulse uppercase">
                Bridging...
              </span>
            ) : user ? (
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex flex-col items-end">
                  <span className="font-headline font-bold text-[10px] text-on-surface truncate max-w-[100px]">
                    {user.displayName || 'Crew Member'}
                  </span>
                  <span className="font-pixel text-[8px] text-emerald-600 font-bold uppercase leading-none">
                    ☁️ Synced
                  </span>
                </div>
                <button
                  id="auth-signout-btn"
                  onClick={handleSignOut}
                  className="px-2 py-1 bg-surface-container border-2 border-[#1E1B1C] rounded font-headline font-bold text-[10px] text-[#1E1B1C] flex items-center gap-1 hover:bg-[#ffe7e2] hover:text-primary transition-all active:scale-95 cursor-pointer max-w-[140px]"
                >
                  <span className="material-symbols-outlined text-xs">logout</span>
                  <span className="truncate">{(user.displayName || 'Crew Member').toUpperCase()}</span>
                </button>
              </div>
            ) : (
              <button
                id="auth-signin-btn"
                onClick={handleSignIn}
                className="px-2 py-1 bg-[#F4E700] border-2 border-[#1E1B1C] rounded font-headline font-bold text-[10px] text-[#1E1B1C] flex items-center gap-1 shadow-[2px_2px_0_0_#1E1B1C] hover:bg-[#ffe7e2] transition-all cursor-pointer active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0_0_#1E1B1C]"
              >
                <span className="material-symbols-outlined text-xs">account_circle</span>
                SIGN IN
              </button>
            )}
          </div>
        </div>

        {/* Stats Strip under top bar */}
        <div className="flex items-center justify-between border-t-2 border-[#1E1B1C]/10 pt-2 text-xs">
          {/* XP & Current Purse */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 font-pixel text-xs bg-surface-container-low px-2 py-0.5 border border-[#1E1B1C]/20 rounded">
              <span className="text-[#a51300] font-bold">XP:</span>
              <span className="font-bold text-[#1E1B1C]">{state.xp}</span>
            </div>

            <div className="flex items-center gap-1 font-pixel text-xs bg-surface-container-low px-2 py-0.5 border border-[#1E1B1C]/20 rounded">
              <span className="text-[#666000] font-bold">COINS:</span>
              <span className="font-bold text-[#1E1B1C]">{state.coins}</span>
            </div>
          </div>

          {/* Streak & level badge */}
          <div className="flex items-center gap-2">
            <span className="font-headline font-bold text-[10px] px-1.5 py-0.5 select-none rounded text-white uppercase tracking-wider bg-primary">
              LVL {lvlInfo.level}
            </span>

            <div className="flex items-center gap-1 bg-[#FFE7E2] px-1.5 py-0.5 rounded border border-[#cf240a]/20">
              <span className="material-symbols-outlined text-xs text-[#cf240a] font-bold animate-bounce" style={{ fontVariationSettings: "'FILL' 1" }}>
                local_fire_department
              </span>
              <span className="font-pixel text-[10px] text-primary font-bold">
                {state.streak} DAY
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
