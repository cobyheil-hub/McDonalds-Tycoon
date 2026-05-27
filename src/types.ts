export interface UserProfile {
  uid: string;
  displayName: string;
  photoURL: string;
  xp: number;
  coins: number;
  streak: number;
  role: string;
  equippedHoodie: boolean;
  equippedVisor: boolean;
  equippedShield: boolean;
  createdAt: string;
  updatedAt: string;
}

export type TabName = 'Arena' | 'Stats' | 'Shop' | 'Settings';

export interface Habit {
  id: 'sleep' | 'posture' | 'devotions';
  name: string;
  tag: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  description: string;
  detailedDescription: string;
  xpReward: number;
  coinReward: number;
  icon: string;
  streak: number;
}

export interface HabitLog {
  id: string;
  userId: string;
  habitId: 'sleep' | 'posture' | 'devotions';
  value: number; // e.g. sleep duration, posture alignment percentage
  timestamp: string;
  xpReward: number;
  coinReward: number;
}

export interface ShopItem {
  id: 'hoodie' | 'visor' | 'shield';
  name: string;
  tag: 'Common Gear' | 'Rare Buff' | 'Epic Utility';
  description: string;
  cost: number;
  icon: string; // lucide or materials icon
  imageUrl: string;
}

export interface Opponent {
  id: 'karen' | 'sga' | 'bk';
  name: string;
  levelText: string;
  maxHp: number;
  currentHp: number;
  coinTheft: number;
  description: string;
  imageUrl: string;
  avatarUrl: string;
}
