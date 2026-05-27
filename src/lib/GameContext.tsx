import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  auth, 
  db, 
  isLiveFirebase, 
  handleFirestoreError, 
  OperationType 
} from './firebase';
import { 
  onAuthStateChanged, 
  User 
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc 
} from 'firebase/firestore';
import { ToastMessage } from '../components/Toast';

interface GameState {
  xp: number;
  coins: number;
  streak: number;
  equippedHoodie: boolean;
  equippedVisor: boolean;
  equippedShield: boolean;
  ownedItems: ('hoodie' | 'visor' | 'shield')[];
  shiftProgress: number; // e.g. 8 of 12
  isShiftActive: boolean;
  
  // Sleep Habit State
  sleepHours: number;
  isSleepPhoneLocked: boolean;

  // Posture Habit State
  postureTimer: number; // in seconds
  isPostureSessionRunning: boolean;
  postureAlignment: number; // e.g., 94

  // Devotions State
  devotionsText: string;
  isRecordingVoice: boolean;
  voiceVerificationStatus: string;

  // Arena Status
  bossHps: { karen: number; sga: number; bk: number };
  activeOpponentId: 'karen' | 'sga' | 'bk';
  burglarKingAttackActive: boolean;

  // Active Restaurant State
  activeRestaurantName: string;
  activeRestaurantAddress: string;
  activeRestaurantLat: number;
  activeRestaurantLng: number;
}

interface GameContextProps {
  state: GameState;
  user: User | null;
  authLoading: boolean;
  toasts: ToastMessage[];
  aiProcessing: boolean;
  aiMessage: string;
  
  addXp: (amount: number) => void;
  addCoins: (amount: number) => void;
  incrementStreak: () => void;
  purchaseItem: (itemId: 'hoodie' | 'visor' | 'shield', cost: number) => void;
  equipItem: (itemId: 'hoodie' | 'visor' | 'shield', equip: boolean) => void;
  completeTask: (taskName: string, xpReward: number, coinReward: number, isCrooked?: boolean) => void;
  fightActiveBoss: () => void;
  selectOpponent: (id: 'karen' | 'sga' | 'bk') => void;
  triggerToast: (message: string, type?: 'success' | 'warning' | 'loot' | 'combat') => void;
  dismissToast: (id: string) => void;
  resetAllGameProgress: () => void;
  advanceToNextLevel: () => void;

  // Habit specific handlers
  setSleepHours: (hrs: number) => void;
  toggleSleepPhoneLock: () => void;
  setPostureTimer: React.Dispatch<React.SetStateAction<number>>;
  setIsPostureSessionRunning: (running: boolean) => void;
  setPostureAlignment: (pct: number) => void;
  setDevotionsText: (text: string) => void;
  setIsRecordingVoice: (recording: boolean) => void;
  setVoiceVerificationStatus: (status: string) => void;
  setShiftProgress: React.Dispatch<React.SetStateAction<number>>;
  setBurglarKingAttackActive: (b: boolean) => void;
  updateActiveRestaurant: (name: string, address: string, lat: number, lng: number) => void;
}

const GameContext = createContext<GameContextProps | undefined>(undefined);

const DEFAULT_STATE: GameState = {
  xp: 0,
  coins: 0,
  streak: 0,
  equippedHoodie: false,
  equippedVisor: false,
  equippedShield: false,
  ownedItems: [], 
  shiftProgress: 0,
  isShiftActive: false,
  sleepHours: 10,
  isSleepPhoneLocked: true,
  postureTimer: 60, // 1 minute
  isPostureSessionRunning: false,
  postureAlignment: 94,
  devotionsText: '',
  isRecordingVoice: false,
  voiceVerificationStatus: 'IDLE - READY FOR INPUT',
  bossHps: { karen: 100, sga: 150, bk: 200 },
  activeOpponentId: 'bk',
  burglarKingAttackActive: true,
  activeRestaurantName: "McD Golden Arches Flagship #304",
  activeRestaurantAddress: "1600 Amphitheatre Pkwy, Mountain View, CA 94043",
  activeRestaurantLat: 37.422,
  activeRestaurantLng: -122.084
};

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [state, setState] = useState<GameState>(DEFAULT_STATE);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [aiProcessing, setAiProcessing] = useState(false);
  const [aiMessage, setAiMessage] = useState('');

  // 1. Trigger micro-interaction Feedback Toast
  const triggerToast = (message: string, type: 'success' | 'warning' | 'loot' | 'combat' = 'success') => {
    const id = Math.random().toString(36).substring(7);
    setToasts(prev => [...prev, { id, message, type }]);
    
    // Auto-remove after 4 seconds
    setTimeout(() => {
      dismissToast(id);
    }, 4000);
  };

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // 2. Optimistic local state persistence loader (never reset to zero)
  useEffect(() => {
    const local = localStorage.getItem('mcd_employee_tracker_state');
    if (local) {
      try {
        const parsed = JSON.parse(local);
        // Ensure defaults are backfilled
        setState({ ...DEFAULT_STATE, ...parsed });
      } catch (err) {
        console.error('Failed to parse storage, using fallback default values:', err);
      }
    }
  }, []);

  const getLevelFromXp = (xp: number) => {
    if (xp < 300) return 1;
    if (xp < 800) return 2;
    if (xp < 1500) return 3;
    if (xp < 2500) return 4;
    return 5;
  };

  // Sync state to localstorage (Offline master fallback)
  const saveStateToLocal = (updated: GameState) => {
    const oldLevel = getLevelFromXp(state.xp);
    const newLevel = getLevelFromXp(updated.xp);
    let finalState = updated;
    if (newLevel > oldLevel) {
      finalState = {
        ...updated,
        coins: updated.coins + 200
      };
      triggerToast(`🏆 LEVEL UP! Reached LVL ${newLevel}! Gained +200 Coins!`, 'loot');
    }
    setState(finalState);
    localStorage.setItem('mcd_employee_tracker_state', JSON.stringify(finalState));
  };

  // 3. Authenticated database synchronizer
  useEffect(() => {
    if (!isLiveFirebase || !auth) {
      setAuthLoading(false);
      return;
    }

    const unsub = onAuthStateChanged(auth, async (authUser) => {
      setUser(authUser);
      if (authUser) {
        // Load stats from Firestore
        const userDocRef = doc(db, 'users', authUser.uid);
        try {
          const snap = await getDoc(userDocRef);
          if (snap.exists()) {
            const data = snap.data();
            const loaded = {
              ...DEFAULT_STATE,
              xp: data.xp ?? DEFAULT_STATE.xp,
              coins: data.coins ?? DEFAULT_STATE.coins,
              streak: data.streak ?? DEFAULT_STATE.streak,
              equippedHoodie: data.equippedHoodie ?? false,
              equippedVisor: data.equippedVisor ?? false,
              equippedShield: data.equippedShield ?? false,
              ownedItems: data.ownedItems ?? DEFAULT_STATE.ownedItems,
              shiftProgress: data.shiftProgress ?? DEFAULT_STATE.shiftProgress,
              bossHps: data.bossHps ?? DEFAULT_STATE.bossHps,
              sleepHours: data.sleepHours ?? DEFAULT_STATE.sleepHours,
              postureAlignment: data.postureAlignment ?? DEFAULT_STATE.postureAlignment,
              activeRestaurantName: data.activeRestaurantName ?? DEFAULT_STATE.activeRestaurantName,
              activeRestaurantAddress: data.activeRestaurantAddress ?? DEFAULT_STATE.activeRestaurantAddress,
              activeRestaurantLat: data.activeRestaurantLat ?? DEFAULT_STATE.activeRestaurantLat,
              activeRestaurantLng: data.activeRestaurantLng ?? DEFAULT_STATE.activeRestaurantLng,
            };
            setState(loaded);
            localStorage.setItem('mcd_employee_tracker_state', JSON.stringify(loaded));
            triggerToast(`Cloud profile logged in: ${authUser.displayName || 'Manager'}`, 'success');
          } else {
            // Document doesn't exist yet, bootstrap first record
            const freshState = {
              uid: authUser.uid,
              displayName: authUser.displayName || 'McDonalds Crew',
              photoURL: authUser.photoURL || '',
              xp: state.xp,
              coins: state.coins,
              streak: state.streak,
              equippedHoodie: state.equippedHoodie,
              equippedVisor: state.equippedVisor,
              equippedShield: state.equippedShield,
              ownedItems: state.ownedItems,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
            await setDoc(userDocRef, freshState);
            triggerToast('Synced offline stats with pristine Cloud profile', 'success');
          }
        } catch (err) {
          handleFirestoreError(err, OperationType.GET, `users/${authUser.uid}`);
        }
      }
      setAuthLoading(false);
    });

    return () => unsub();
  }, []);

  // Async cloud sync trigger helper
  const syncToFirestore = async (updated: GameState) => {
    if (!user || !isLiveFirebase) return;
    
    const oldLevel = getLevelFromXp(state.xp);
    const newLevel = getLevelFromXp(updated.xp);
    let finalState = updated;
    if (newLevel > oldLevel) {
      finalState = {
        ...updated,
        coins: updated.coins + 200
      };
    }

    const userDocRef = doc(db, 'users', user.uid);
    try {
      await updateDoc(userDocRef, {
        xp: finalState.xp,
        coins: finalState.coins,
        streak: updated.streak,
        equippedHoodie: updated.equippedHoodie,
        equippedVisor: updated.equippedVisor,
        equippedShield: updated.equippedShield,
        ownedItems: updated.ownedItems,
        shiftProgress: updated.shiftProgress,
        bossHps: updated.bossHps,
        sleepHours: updated.sleepHours,
        postureAlignment: updated.postureAlignment,
        activeRestaurantName: updated.activeRestaurantName,
        activeRestaurantAddress: updated.activeRestaurantAddress,
        activeRestaurantLat: updated.activeRestaurantLat,
        activeRestaurantLng: updated.activeRestaurantLng,
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  // State handlers with micro-interaction confirmations
  const addXp = (amount: number) => {
    const updated = { ...state, xp: state.xp + amount };
    saveStateToLocal(updated);
    syncToFirestore(updated);
    triggerToast(`Gained +${amount} XP!`, 'success');
  };

  const addCoins = (amount: number) => {
    const updated = { ...state, coins: state.coins + amount };
    saveStateToLocal(updated);
    syncToFirestore(updated);
    triggerToast(`Acquired +${amount} Coins!`, 'loot');
  };

  const incrementStreak = () => {
    const updated = { ...state, streak: state.streak + 1 };
    saveStateToLocal(updated);
    syncToFirestore(updated);
  };

  const purchaseItem = (itemId: 'hoodie' | 'visor' | 'shield', cost: number) => {
    if (state.ownedItems.includes(itemId)) {
      triggerToast('You already own this retro gear!', 'warning');
      return;
    }
    if (state.coins < cost) {
      triggerToast('Insufficient Coins in your Purse!', 'warning');
      return;
    }
    const updated = {
      ...state,
      coins: state.coins - cost,
      ownedItems: [...state.ownedItems, itemId]
    };
    saveStateToLocal(updated);
    syncToFirestore(updated);
    triggerToast(`Purchased ${itemId.toUpperCase()} successfully!`, 'success');
  };

  const equipItem = (itemId: 'hoodie' | 'visor' | 'shield', equip: boolean) => {
    if (!state.ownedItems.includes(itemId)) {
      triggerToast('Purchase this item from the cosmetic shop to equip it!', 'warning');
      return;
    }

    let updated = { ...state };
    if (itemId === 'hoodie') updated.equippedHoodie = equip;
    if (itemId === 'visor') updated.equippedVisor = equip;
    if (itemId === 'shield') updated.equippedShield = equip;

    saveStateToLocal(updated);
    syncToFirestore(updated);
    triggerToast(`${itemId.toUpperCase()} is now ${equip ? 'EQUIPPED' : 'UNEQUIPPED'}!`, 'success');
  };

  const completeTask = (taskName: string, xpReward: number, coinReward: number, isCrooked?: boolean) => {
    if (aiProcessing) return; // Prevent spamming / multiple triggers

    // Determine custom text status message based on the habit's theme
    let message = "AI is processing and sync-claiming your habit...";
    const lowerName = taskName.toLowerCase();
    if (lowerName.includes('posture')) {
      message = "AI is analyzing your camera posture...";
    } else if (lowerName.includes('voice') || lowerName.includes('devotion') || lowerName.includes('mantra')) {
      message = "AI is listening to your Voice Journal speech goals...";
    } else if (lowerName.includes('sleep') || lowerName.includes('lock')) {
      message = "AI Accelerometer is scanning phone lock diagnostics...";
    } else if (lowerName.includes('written') || lowerName.includes('log') || lowerName.includes('reflection')) {
      message = "AI OCR is scanning your homework/reflection notes...";
    } else if (lowerName.includes('guitar')) {
      message = "AI is listening to your guitar pitch...";
    }

    setAiMessage(message);
    setAiProcessing(true);

    setTimeout(() => {
      if (lowerName.includes('posture') && isCrooked) {
        setAiMessage("AI Scan Checked: BAD POSTURE! Spine curves exceed 35° threshold.");
        
        setTimeout(() => {
          setAiProcessing(false);
        }, 1200);
      } else {
        if (lowerName.includes('posture')) {
          setAiMessage("AI Scan Checked: GOOD POSTURE! Spine is vertically aligned at 94%.");
        }
        
        setTimeout(() => {
          // Visor provides +5% coin boost
          const coinResult = state.equippedVisor ? Math.round(coinReward * 1.05) : coinReward;
          const updatedProgress = Math.min(state.shiftProgress + 1, 12);
          
          // Complete task reward multiplier state updates
          const updated = {
            ...state,
            xp: state.xp + xpReward,
            coins: state.coins + coinResult,
            shiftProgress: updatedProgress
          };
          
          saveStateToLocal(updated);
          syncToFirestore(updated);
          triggerToast(`COMPLETED: "${taskName}"! Recieved +${xpReward} XP | +${coinResult} Coins`, 'loot');
          setAiProcessing(false);
        }, 1200);
      }
    }, 2000);
  };

  const selectOpponent = (id: 'karen' | 'sga' | 'bk') => {
    const updated = { ...state, activeOpponentId: id };
    saveStateToLocal(updated);
    syncToFirestore(updated);
    triggerToast(`CHOSEN OPPONENT: ${id.toUpperCase()}`, 'combat');
  };

  const fightActiveBoss = () => {
    const oppId = state.activeOpponentId;
    const currentHp = state.bossHps[oppId];
    
    if (currentHp <= 0) {
      triggerToast('Opponent already vanquished! Clock in dynamic shifts to reset arena!', 'warning');
      return;
    }

    // Shield reduces the possibility/impact of burger burglar attacks or defeats
    const userAttackVal = Math.floor(Math.random() * 25) + 15; // 15 to 40 damage
    const updatedHp = Math.max(currentHp - userAttackVal, 0);
    const resultHps = { ...state.bossHps, [oppId]: updatedHp };

    let updated = { ...state, bossHps: resultHps };

    if (updatedHp === 0) {
      // Victory loot!
      const xpBonus = oppId === 'bk' ? 100 : oppId === 'sga' ? 60 : 40;
      const coinBonus = oppId === 'bk' ? 150 : oppId === 'sga' ? 100 : 50;
      updated.xp += xpBonus;
      updated.coins += coinBonus;
      
      saveStateToLocal(updated);
      syncToFirestore(updated);
      triggerToast(`VICTORY! ${oppId.toUpperCase()} DEFEATED. Earned +${xpBonus} XP and +${coinBonus} Coins!`, 'loot');
    } else {
      // Counter-attack theft chance
      const steals = Math.random() > 0.6;
      if (steals) {
        let baseTheft = oppId === 'bk' ? 50 : oppId === 'sga' ? 35 : 25;
        // Shield mitigates theft by 50%
        if (state.equippedShield) {
          baseTheft = Math.round(baseTheft * 0.5);
          updated.coins = Math.max(state.coins - baseTheft, 0);
          triggerToast(`SHIELD TRIGGERED! Kept streak. Karen's swipe diminished! Lost only ${baseTheft} Coins!`, 'warning');
        } else {
          updated.coins = Math.max(state.coins - baseTheft, 0);
          triggerToast(`ATTACKED! ${oppId.toUpperCase()} stole ${baseTheft} Coins! Equip Shield to guard shifts!`, 'warning');
        }
      } else {
        triggerToast(`HIT! Dealt ${userAttackVal} DMG to ${oppId.toUpperCase()}! Slashed to ${updatedHp} HP!`, 'combat');
      }
      
      saveStateToLocal(updated);
      syncToFirestore(updated);
    }
  };

  const setSleepHours = (hrs: number) => {
    const updated = { ...state, sleepHours: hrs };
    saveStateToLocal(updated);
    syncToFirestore(updated);
  };

  const toggleSleepPhoneLock = () => {
    const updated = { ...state, isSleepPhoneLocked: !state.isSleepPhoneLocked };
    saveStateToLocal(updated);
    syncToFirestore(updated);
    triggerToast(`Phone lock is now ${updated.isSleepPhoneLocked ? 'ACTIVE' : 'INACTIVE'}!`, 'success');
  };

  const setPostureAlignment = (pct: number) => {
    const updated = { ...state, postureAlignment: pct };
    saveStateToLocal(updated);
    syncToFirestore(updated);
  };

  const setDevotionsText = (text: string) => {
    const updated = { ...state, devotionsText: text };
    saveStateToLocal(updated);
    syncToFirestore(updated);
  };

  const setIsRecordingVoice = (recording: boolean) => {
    const updated = { ...state, isRecordingVoice: recording };
    saveStateToLocal(updated);
    syncToFirestore(updated);
  };

  const setVoiceVerificationStatus = (status: string) => {
    const updated = { ...state, voiceVerificationStatus: status };
    saveStateToLocal(updated);
    syncToFirestore(updated);
  };

  const setShiftProgress = (action: React.SetStateAction<number>) => {
    setState(prev => {
      const nextProgress = typeof action === 'function' ? action(prev.shiftProgress) : action;
      const updated = { ...prev, shiftProgress: nextProgress };
      localStorage.setItem('mcd_employee_tracker_state', JSON.stringify(updated));
      syncToFirestore(updated);
      return updated;
    });
  };

  const setBurglarKingAttackActive = (b: boolean) => {
    const updated = { ...state, burglarKingAttackActive: b };
    saveStateToLocal(updated);
    syncToFirestore(updated);
  };

  const updateActiveRestaurant = (name: string, address: string, lat: number, lng: number) => {
    const updated = {
      ...state,
      activeRestaurantName: name,
      activeRestaurantAddress: address,
      activeRestaurantLat: lat,
      activeRestaurantLng: lng
    };
    saveStateToLocal(updated);
    syncToFirestore(updated);
    triggerToast(`Lock-In Restaurant Set: ${name}`, 'success');
  };

  const resetAllGameProgress = () => {
    const updated = {
      ...DEFAULT_STATE,
      xp: 0,
      coins: 0,
      streak: 0,
      ownedItems: [],
      shiftProgress: 0,
      equippedHoodie: false,
      equippedVisor: false,
      equippedShield: false,
      bossHps: { karen: 100, sga: 150, bk: 200 }
    };
    saveStateToLocal(updated);
    syncToFirestore(updated);
    triggerToast('All game progress reset to 0!', 'warning');
  };

  const advanceToNextLevel = () => {
    let targetXp = 300;
    if (state.xp >= 2500) {
      targetXp = state.xp + 1000;
    } else if (state.xp >= 1500) {
      targetXp = 2500;
    } else if (state.xp >= 800) {
      targetXp = 1500;
    } else if (state.xp >= 300) {
      targetXp = 800;
    }
    const updated = { ...state, xp: targetXp };
    saveStateToLocal(updated);
    syncToFirestore(updated);
    triggerToast(`Advanced progress to next level threshold: ${targetXp} XP!`, 'success');
  };

  return (
    <GameContext.Provider value={{
      state,
      user,
      authLoading,
      toasts,
      aiProcessing,
      aiMessage,
      addXp,
      addCoins,
      incrementStreak,
      purchaseItem,
      equipItem,
      completeTask,
      fightActiveBoss,
      selectOpponent,
      triggerToast,
      dismissToast,
      setSleepHours,
      toggleSleepPhoneLock,
      setPostureTimer: (action) => {
        setState(prev => {
          const nextVal = typeof action === 'function' ? action(prev.postureTimer) : action;
          const updated = { ...prev, postureTimer: nextVal };
          localStorage.setItem('mcd_employee_tracker_state', JSON.stringify(updated));
          return updated;
        });
      },
      setIsPostureSessionRunning: (running: boolean) => {
        const updated = { ...state, isPostureSessionRunning: running };
        saveStateToLocal(updated);
      },
      setPostureAlignment,
      setDevotionsText,
      setIsRecordingVoice,
      setVoiceVerificationStatus,
      setShiftProgress,
      setBurglarKingAttackActive,
      updateActiveRestaurant,
      resetAllGameProgress,
      advanceToNextLevel
    }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
