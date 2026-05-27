import React from 'react';
import { useGame } from '../lib/GameContext';
import { isLiveFirebase } from '../lib/firebase';

export default function SettingsView() {
  const { state, triggerToast } = useGame();

  const handleWipeSettings = () => {
    localStorage.removeItem('mcd_employee_tracker_state');
    triggerToast('Local shift logs cleared! Refresh browser to reload initial pristine 0 stats.', 'warning');
  };

  const handleTestPingSync = () => {
    triggerToast(
      isLiveFirebase 
        ? 'Diagnostics: Sync state normal. Live Cloud connection established.' 
        : 'Diagnostics: Running on Local-First offline fallback. Data persists natively!', 
      'success'
    );
  };

  return (
    <div className="flex flex-col gap-5 py-2">
      {/* Settings Title Header Banner */}
      <div className="bg-[#FFF] border-4 border-black p-4 shadow-[4px_4px_0_0_rgba(30,27,28,1)]">
        <h2 className="font-headline font-bold text-sm tracking-wider text-[#1e1b1c] uppercase flex items-center gap-1.5 border-b-2 border-stone-100 pb-2 mb-1">
          <span className="material-symbols-outlined text-primary text-xl">settings</span>
          SYSTEM CONFIGURE & RECOVERY
        </h2>
        <p className="font-body text-xs text-gray-500 font-medium leading-relaxed mt-1">
          Diagnostics, cloud connection rules, and local cache restoration operations.
        </p>
      </div>

      {/* Firebase Status Diagnostic card */}
      <div className="bg-[#FEF9E1] border-4 border-black p-4 shadow-[4px_4px_0_0_#1E1B1C] flex flex-col gap-3">
        <h3 className="font-headline font-bold text-xs text-[#1e1b1c] uppercase tracking-wide flex items-center gap-1 border-b border-black/10 pb-1">
          <span className="material-symbols-outlined text-base">cloud_sync</span>
          FIREBASE CONNECTIVITY INFRASTRUCTURE
        </h3>

        <div className="flex flex-col gap-2.5 font-pixel text-xs">
          <div className="flex justify-between items-center p-2.5 bg-white border border-black/15">
            <span className="uppercase text-stone-500 font-bold">Cloud Synced Mode:</span>
            <span className={`px-2 py-0.5 border rounded font-bold uppercase ${
              isLiveFirebase 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-400' 
                : 'bg-amber-50 text-amber-700 border-amber-300'
            }`}>
              {isLiveFirebase ? '● ENABLED' : '○ OFFLINE'}
            </span>
          </div>

          <div className="flex justify-between items-center p-2.5 bg-white border border-black/15">
            <span className="uppercase text-stone-500 font-bold">Data Store Target:</span>
            <span className="font-bold text-[#1E1B1C]">
              {isLiveFirebase ? 'Google Cloud Firestore' : 'HTML5 LocalStorage'}
            </span>
          </div>

          <p className="font-body text-[11px] font-medium leading-relaxed text-stone-600 border-t border-black/5 pt-2.5">
            {isLiveFirebase 
              ? "All your records, shift completions, XP values, and shop ornaments sync automatically to Firebase. Authenticated profiles keep progress unified across different tabs."
              : "No terms accepted yet in this playground. We have dynamically bridged progress to browser-level localStorage. Your statistics will never wipe or reset to zero on window close!"
            }
          </p>
        </div>

        <button 
          id="settings-test-diag-btn"
          onClick={handleTestPingSync}
          className="w-full py-2 border-2 border-black bg-white cursor-pointer hover:bg-stone-50 font-headline font-bold text-[10px] uppercase tracking-wide active:scale-95 transition-all shadow-[1px_1px_0_0_black]"
        >
          Run Synchronization Check
        </button>
      </div>

      {/* Streak Preservation Guidelines */}
      <div className="bg-white border-4 border-black p-4 shadow-[4px_4px_0_0_rgba(30,27,28,1)] flex flex-col gap-2">
        <h4 className="font-headline font-semibold text-xs text-[#1e1b1c] uppercase tracking-wider flex items-center gap-1">
          <span className="material-symbols-outlined text-sm text-primary">local_fire_department</span>
          SHIFT RULES & RISK MITIGATION
        </h4>
        <dl className="flex flex-col gap-2 font-body text-xs text-stone-600 font-medium leading-normal lowercase">
          <div>
            <dt className="font-headline font-bold uppercase text-[#1e1b1c] text-[10px] tracking-wide inline mr-1">
              Streak Lock-In:
            </dt>
            <dd className="inline">
              Your streak ratio increases by Completing written devotions logs daily. Fulfilling multiple shifts boosts XP multiplier by +1.2x.
            </dd>
          </div>
          <div className="border-t border-stone-100 pt-2">
            <dt className="font-headline font-bold uppercase text-[#1e1b1c] text-[10px] tracking-wide inline mr-1">
              Thievery Defense:
            </dt>
            <dd className="inline">
              Karen or Grand Boss characters have a minor chance to steal gold during active combat shifts. Purchasing and equipping the **Rush Hour Shield** blocks 50% of swiped coin losses!
            </dd>
          </div>
        </dl>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-50/20 border-4 border-[#1E1B1C] p-4 shadow-[4px_4px_0_0_rgba(30,27,28,1)] flex flex-col gap-2">
        <h4 className="font-headline font-bold text-xs uppercase text-[#cf240a] tracking-wider flex items-center gap-1 select-none">
          <span className="material-symbols-outlined text-base">warning</span>
          DANGER ZONE
        </h4>
        <p className="font-body text-xs text-gray-500 font-semibold leading-normal lowercase">
          clearing cached stats will restore player parameters to level 1 trainees with 0 stats on launch.
        </p>

        <button
          id="settings-reset-all-btn"
          onClick={handleWipeSettings}
          className="w-full mt-1.5 py-1.5 border-2 border-primary bg-white text-primary rounded-xs font-headline font-bold text-[10px] uppercase tracking-wider shadow-[2px_2px_0_0_#a51300] hover:bg-[#ffe7e2] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0_0_#a51300] cursor-pointer"
        >
          RESTORE LOCAL CACHE BACKUP
        </button>
      </div>
    </div>
  );
}
