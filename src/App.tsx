import React, { useState } from 'react';
import { GameProvider, useGame } from './lib/GameContext';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import Toast from './components/Toast';
import OpponentSelect from './components/OpponentSelect';

// Views
import ArenaView from './components/ArenaView';
import StatsView from './components/StatsView';
import ShopView from './components/ShopView';
import SettingsView from './components/SettingsView';

// Detailed Screens
import PostureCorrectionDetail from './components/PostureCorrectionDetail';
import MorningDevotionsDetail from './components/MorningDevotionsDetail';

import { TabName } from './types';
import { motion, AnimatePresence } from 'motion/react';

function Dashboard() {
  const { state, toasts, dismissToast, aiProcessing, aiMessage } = useGame();
  
  const [activeTab, setActiveTab] = useState<TabName>('Arena');
  const [activeDetail, setActiveDetail] = useState<'posture' | 'devotions' | null>(null);
  const [showOpponentSelect, setShowOpponentSelect] = useState(false);

  // Router dispatcher
  const renderContent = () => {
    if (activeDetail === 'posture') {
      return (
        <motion.div
          key="posture-detail"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.15 }}
        >
          <PostureCorrectionDetail onBack={() => setActiveDetail(null)} />
        </motion.div>
      );
    }

    if (activeDetail === 'devotions') {
      return (
        <motion.div
          key="devotions-detail"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.15 }}
        >
          <MorningDevotionsDetail onBack={() => setActiveDetail(null)} />
        </motion.div>
      );
    }

    // Tab routing
    switch (activeTab) {
      case 'Arena':
        return (
          <motion.div
            key="arena-tab"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
          >
            <ArenaView 
              onNavigateToHabit={(id) => setActiveDetail(id)}
              onOpenOpponentSelect={() => setShowOpponentSelect(true)}
            />
          </motion.div>
        );
      case 'Stats':
        return (
          <motion.div
            key="stats-tab"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
          >
            <StatsView />
          </motion.div>
        );
      case 'Shop':
        return (
          <motion.div
            key="shop-tab"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
          >
            <ShopView />
          </motion.div>
        );
      case 'Settings':
        return (
          <motion.div
            key="settings-tab"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
          >
            <SettingsView />
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#F5ECED] flex items-center justify-center p-0 sm:p-4">
      
      {/* Dynamic tactile toast notice layer */}
      <Toast toasts={toasts} removeToast={dismissToast} />

      {/* Main Adaptive Screen Cell Frame */}
      <div 
        id="app-display-container" 
        className="w-full max-w-md bg-[#FFF8F8] h-screen sm:h-[840px] border-x-0 sm:border-x-4 border-b-0 sm:border-b-4 sm:border-t-4 border-[#1E1B1C] box-border flex flex-col justify-between overflow-hidden relative sm:shadow-[0_10px_35px_rgba(0,0,0,0.15)] retro-grid"
      >
        {/* CRT Scanline styling decoration filter */}
        <div className="absolute inset-0 scanline pointer-events-none z-30 opacity-20" />

        {/* Header (contains current level, xp status bar, coins, streaks & logout) */}
        <Header />

        {/* Scrollable Center viewport section */}
        <main className="flex-1 overflow-y-auto px-4 py-3 select-none flex flex-col justify-start relative scroll-smooth pb-8">
          <AnimatePresence mode="wait">
            {renderContent()}
          </AnimatePresence>
        </main>

        {/* Fixed bottoms tab controller navigation bar */}
        {activeDetail === null && (
          <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
        )}

        {/* Opponent Selector Overlay */}
        <AnimatePresence>
          {showOpponentSelect && (
            <OpponentSelect onClose={() => setShowOpponentSelect(false)} />
          )}
        </AnimatePresence>

        {/* Dynamic AI Scanning Processing Overlay */}
        <AnimatePresence>
          {aiProcessing && (
            <motion.div
              id="ai-processing-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 bg-[#1E1B1C]/95 flex flex-col items-center justify-center p-6 text-center select-none"
            >
              <div className="relative w-48 h-48 flex items-center justify-center">
                {/* Outer Pulsing Progress Ring */}
                <div className="absolute inset-0 rounded-full border-4 border-dashed border-[#cf240a] animate-ai-pulse-ring" />
                
                {/* Secondary Rotating Track */}
                <div className="absolute inset-2 rounded-full border-2 border-stone-500/30 border-t-[#cf240a] animate-ai-rotator" />

                {/* Grid backdrop for holographic scanning action */}
                <div className="absolute inset-4 rounded-full bg-slate-950 flex flex-col items-center justify-center overflow-hidden border-2 border-[#cf240a]/40 relative">
                  {/* Digital starry overlay scanline */}
                  <div className="absolute inset-0 scanline opacity-45 pointer-events-none" />
                  
                  {/* Scanning laser line effect */}
                  <div className="absolute top-0 left-0 w-full h-[3px] bg-[#cf240a] shadow-[0_0_12px_#cf240a] animate-ai-laser-glide" />

                  {/* Red Radar Sweep Overlay in the middle */}
                  <div className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-full pointer-events-none">
                    {/* Ambient glowing radial radar base */}
                    <div className="absolute inset-0 rounded-full border border-[#cf240a]/10" />
                    
                    {/* Rotating radar sweep */}
                    <div 
                      className="absolute inset-0 rounded-full animate-ai-rotator origin-center"
                      style={{
                        background: 'conic-gradient(from 0deg, #cf240a 0%, rgba(207, 36, 10, 0.25) 12%, rgba(207, 36, 10, 0.08) 25%, transparent 50%, transparent 100%)'
                      }}
                    />

                    {/* Concentric target lines */}
                    <div className="absolute w-[80%] h-[80%] rounded-full border border-dashed border-[#cf240a]/20" />
                    <div className="absolute w-[55%] h-[55%] rounded-full border border-dashed border-[#cf240a]/15" />
                    <div className="absolute w-[30%] h-[30%] rounded-full border border-solid border-[#cf240a]/25" />

                    {/* Grid Crosshairs */}
                    <div className="absolute inset-x-0 h-[100%] flex items-center justify-center">
                      <div className="w-full h-[1px] bg-[#cf240a]/15" />
                    </div>
                    <div className="absolute inset-y-0 w-[100%] flex items-center justify-center">
                      <div className="h-full w-[1px] bg-[#cf240a]/15" />
                    </div>

                    {/* Radar Blips (Pings) */}
                    <div className="absolute w-1.5 h-1.5 rounded-full bg-[#cf240a] shadow-[0_0_8px_#cf240a] animate-pulse top-[25%] left-[30%]" />
                    <div className="absolute w-1.5 h-1.5 rounded-full bg-[#cf240a] shadow-[0_0_6px_#cf240a] animate-pulse bottom-[35%] right-[25%]" style={{ animationDelay: '0.5s' }} />
                    <div className="absolute w-1 h-1 rounded-full bg-[#cf240a] shadow-[0_0_4px_#cf240a] animate-pulse bottom-[20%] left-[45%]" style={{ animationDelay: '0.9s' }} />
                  </div>

                  {/* Inner status items */}
                  <span className="font-pixel text-[9px] text-[#cf240a] font-bold z-10">AI SCAN</span>
                  <span className="material-symbols-outlined text-4xl text-[#cf240a] animate-pulse mt-2 z-10">
                    security_scan
                  </span>
                  <span className="font-pixel text-[8px] text-stone-400 mt-2.5 uppercase z-10">VERIFY CLOUD</span>
                </div>
              </div>

              {/* Status block with the custom theme message */}
              <div className="mt-8">
                <span className="font-pixel text-[9px] text-[#cf240a] font-bold uppercase tracking-widest block">
                  SYSTEM CORE INTERCEPT
                </span>
                <p className="mt-2 font-headline font-bold text-sm text-white uppercase tracking-wider animate-ai-text-glow leading-snug px-4">
                  {aiMessage}
                </p>
                <div className="mt-4 flex items-center justify-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#cf240a] animate-ping" />
                  <span className="font-pixel text-[8px] text-stone-400 uppercase tracking-widest">
                    SYNCING COGNITIVE LIFECYCLE
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <GameProvider>
      <Dashboard />
    </GameProvider>
  );
}
