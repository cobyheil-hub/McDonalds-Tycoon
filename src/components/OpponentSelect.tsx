import React from 'react';
import { useGame } from '../lib/GameContext';

interface OpponentSelectProps {
  onClose: () => void;
}

export default function OpponentSelect({ onClose }: OpponentSelectProps) {
  const { state, selectOpponent } = useGame();

  const handleSelect = (oppId: 'karen' | 'sga' | 'bk') => {
    selectOpponent(oppId);
    onClose();
  };

  const opponents = [
    {
      id: 'karen' as const,
      name: 'The Karen',
      lvl: 'Level 1 (BOSS Lvl 1)',
      theft: 'Snatches 25 Coins on failures',
      desc: 'Demands service instantly, spills soda drinks on counters, and makes manager requests.',
      cardBg: 'bg-red-50/70 border-primary',
      avatar: (
        <img 
          src="https://res.cloudinary.com/dnablzr1p/image/upload/v1779768554/Screenshot_2026-05-25_095757_kw09ni.png"
          referrerPolicy="no-referrer"
          alt="The Karen"
          className="w-14 h-14 object-cover border-2 border-black bg-amber-50 rounded select-none"
        />
      )
    },
    {
      id: 'sga' as const,
      name: 'SGA Threat',
      lvl: 'Level 2 (ELITE)',
      theft: 'Snatches 35 Coins on failures',
      desc: 'Manifests a static field of high-pressure metrics, blocking physical drive-thru flow.',
      cardBg: 'bg-blue-50/70 border-blue-600',
      avatar: (
        <img 
          src="https://res.cloudinary.com/dnablzr1p/image/upload/v1779768554/Screenshot_2026-05-25_095806_urmpnd.png"
          referrerPolicy="no-referrer"
          alt="SGA Threat"
          className="w-14 h-14 object-cover border-2 border-black bg-amber-50 rounded select-none"
        />
      )
    },
    {
      id: 'bk' as const,
      name: 'Burglar King',
      lvl: 'Level 4 (GRAND BOSS)',
      theft: 'Snatches 50 Coins on failures',
      desc: 'Sovereign mascot of the flame-broiled kingdom. Unleashes royal metrics and demands ultimate shift lock-in!',
      cardBg: 'bg-yellow-50/70 border-yellow-500',
      avatar: (
        <img 
          src="https://res.cloudinary.com/dnablzr1p/image/upload/v1779372879/Screenshot_2026-05-21_211435_n0ojbn.png"
          referrerPolicy="no-referrer"
          alt="Burglar King"
          className="w-14 h-14 object-cover border-2 border-black bg-amber-50 rounded select-none"
        />
      )
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* black transparent overlay */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-xs select-none" 
        onClick={onClose}
      />
      
      {/* Modal dialog */}
      <div className="relative w-full max-w-sm bg-surface border-4 border-black p-5 shadow-[4px_4px_0_0_#1E1B1C] z-10 flex flex-col gap-4">
        {/* Header strip */}
        <div className="flex items-center justify-between border-b-4 border-[#1E1B1C] pb-2 -mx-5 -mt-5 bg-primary p-3 text-white font-headline font-bold">
          <span className="flex items-center gap-1 text-xs tracking-wider uppercase select-none">
            <span className="material-symbols-outlined text-base">sports_kabaddi</span>
            CHOOSE YOUR OPPONENT
          </span>
          <button 
            onClick={onClose}
            className="material-symbols-outlined text-lg leading-none hover:text-red-500 cursor-pointer"
          >
            close
          </button>
        </div>

        {/* Content list */}
        <div className="flex flex-col gap-3 max-h-[350px] overflow-y-auto pr-1">
          {opponents.map((opp) => {
            const isSelected = state.activeOpponentId === opp.id;
            return (
              <div 
                key={opp.id}
                onClick={() => handleSelect(opp.id)}
                className={`p-3 border-4 flex gap-3 items-center cursor-pointer transition-all active:scale-95 duration-100 ${
                  isSelected 
                    ? 'bg-rose-100 border-[#1E1B1C] shadow-[2px_2px_0_0_#a51300]' 
                    : 'bg-white border-dashed border-stone-300 hover:border-solid hover:border-[#1E1B1C]'
                }`}
              >
                {/* avatar */}
                <div className="shrink-0">
                  {opp.avatar}
                </div>

                {/* status details */}
                <div className="flex-1 w-full">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <h4 className="font-headline font-bold text-xs uppercase text-[#1E1B1C] leading-none">
                      {opp.name}
                    </h4>
                    {isSelected && (
                      <span className="font-pixel text-[8px] uppercase px-1.5 py-0.5 bg-primary text-white font-bold tracking-wider rounded">
                        Targeted
                      </span>
                    )}
                  </div>
                  <span className="font-pixel text-[9px] text-[#cf240a] font-bold leading-none uppercase block">
                    {opp.lvl}
                  </span>
                  <p className="font-body text-[10px] text-gray-400 font-semibold lowercase leading-normal mt-1.5">
                    {opp.desc}
                  </p>
                  <span className="block font-pixel font-bold text-[9px] text-stone-500 mt-1 uppercase">
                    {opp.theft}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={onClose}
          className="w-full py-2 border-2 border-black bg-stone-100 font-headline font-bold text-xs uppercase tracking-wider text-stone-600 hover:bg-stone-200 transition-colors cursor-pointer active:scale-95"
        >
          Dismiss Selection
        </button>
      </div>
    </div>
  );
}
