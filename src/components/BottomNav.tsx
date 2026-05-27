import React from 'react';
import { TabName } from '../types';

interface BottomNavProps {
  activeTab: TabName;
  setActiveTab: (tab: TabName) => void;
}

export default function BottomNav({ activeTab, setActiveTab }: BottomNavProps) {
  const tabs: { name: TabName; icon: string; label: string }[] = [
    { name: 'Arena', icon: 'swords', label: 'Arena' },
    { name: 'Stats', icon: 'leaderboard', label: 'Stats' },
    { name: 'Shop', icon: 'shopping_cart', label: 'Shop' },
    { name: 'Settings', icon: 'settings', label: 'System' }
  ];

  return (
    <nav className="sticky bottom-0 z-40 w-full bg-[#FEF9E1] border-t-4 border-[#1E1B1C] py-2 px-3 flex justify-around shadow-[0_-4px_0_0_rgba(30,27,28,1)] safe-area-bottom">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.name;
        return (
          <button
            key={tab.name}
            id={`nav-tab-${tab.name.toLowerCase()}`}
            onClick={() => setActiveTab(tab.name)}
            style={{ minWidth: '44px', minHeight: '44px' }}
            className={`flex flex-col items-center justify-center p-1 rounded-md transition-all duration-100 ease-in-out cursor-pointer select-none active:scale-95 ${
              isActive 
                ? 'bg-[#ffe7e2] text-primary border-2 border-primary font-bold px-3 scale-105 shadow-[2px_2px_0_0_#a51300]' 
                : 'text-stone-600 hover:bg-stone-100 border-2 border-transparent hover:border-[#1E1B1C]/10'
            }`}
          >
            <span 
              className={`material-symbols-outlined text-2xl leading-none ${isActive ? 'text-primary' : 'text-stone-600'}`}
              style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
            >
              {tab.icon}
            </span>
            <span className="font-headline text-[10px] tracking-wider uppercase leading-none mt-0.5 select-none">
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
