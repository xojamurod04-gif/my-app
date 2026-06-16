import { create } from 'zustand';
import { HabitModel, generateId, todayStr } from '../models/HabitModel';
import HabitStorage from '../storage/HabitStorage';
import AudioManager from '../managers/AudioManager';
import * as Haptics from 'expo-haptics';

const MILESTONE_STREAKS = [7, 14, 30, 60, 100];

interface HabitState {
  habits: HabitModel[];
  isPremium: boolean;
  milestoneStreak: number | null;
  allDoneFlashTriggered: boolean;
  user: any | null;
  isAuthenticated: boolean;

  init: () => void;
  setPremium: (val: boolean) => void;
  setUser: (user: any | null) => void;
  setMilestoneStreak: (val: number | null) => void;
  resetAllDoneFlash: () => void;

  addHabit: (habit: HabitModel) => void;
  updateHabit: (id: string, updates: Partial<HabitModel>) => void;
  deleteHabit: (id: string) => void;
  toggleHabit: (id: string) => void;
}

export const useHabitStore = create<HabitState>((set, get) => ({
  habits: [],
  isPremium: false,
  user: null,
  isAuthenticated: false,
  milestoneStreak: null,
  allDoneFlashTriggered: false,

  init: () => {
    AudioManager.init();
    const loaded = HabitStorage.loadAll();
    const premium = HabitStorage.isPremium();
    
    // Seed demo bo'lmasa
    if (loaded.length === 0) {
      const demo = [
        new HabitModel({
          id: generateId(),
          name: 'Ertalab yugurish',
          colorHex: '#1A0533',
          emoji: '🏃',
          createdAt: todayStr(),
          completions: [],
        }),
        new HabitModel({
          id: generateId(),
          name: 'Suv ichish',
          colorHex: '#004080',
          emoji: '💧',
          createdAt: todayStr(),
          completions: [],
        }),
        new HabitModel({
          id: generateId(),
          name: 'Kitob o\'qish',
          colorHex: '#4d2600',
          emoji: '📖',
          createdAt: todayStr(),
          completions: [],
        }),
        new HabitModel({
          id: generateId(),
          name: 'Meditatsiya',
          colorHex: '#004d00',
          emoji: '🧘',
          createdAt: todayStr(),
          completions: [],
        }),
      ];
      HabitStorage.saveAll(demo);
      set({ habits: demo, isPremium: premium });
    } else {
      set({ habits: loaded, isPremium: premium });
    }
  },

  setPremium: (val) => {
    HabitStorage.setPremium(val);
    set({ isPremium: val });
  },

  setMilestoneStreak: (val) => {
    set({ milestoneStreak: val });
  },

  setUser: (user) => {
    set({ user, isAuthenticated: !!user });
  },

  resetAllDoneFlash: () => set({ allDoneFlashTriggered: false }),

  addHabit: (habit) => {
    const { habits } = get();
    const newHabits = [...habits, habit];
    HabitStorage.saveAll(newHabits);
    set({ habits: newHabits });
  },

  updateHabit: (id, updates) => {
    const { habits } = get();
    const newHabits = habits.map((h) => {
      if (h.id === id) {
        const json = h.toJSON();
        return HabitModel.fromJSON({ ...json, ...updates });
      }
      return h;
    });
    HabitStorage.saveAll(newHabits);
    set({ habits: newHabits });
  },

  deleteHabit: (id) => {
    const { habits } = get();
    const newHabits = habits.filter((h) => h.id !== id);
    HabitStorage.saveAll(newHabits);
    set({ habits: newHabits });
  },

  toggleHabit: (id) => {
    const { habits } = get();
    const wasAllDone = habits.length > 0 && habits.every((h) => h.isCompletedToday);
    const today = todayStr();
    let triggeredMilestone = null;

    const newHabits = habits.map((h) => {
      if (h.id === id) {
        if (h.isCompletedToday) {
          h.completions.delete(today);
        } else {
          h.completions.add(today);
          AudioManager.playCheck();
          
          if (MILESTONE_STREAKS.includes(h.streak)) {
            triggeredMilestone = h.streak;
          }
        }
      }
      return h;
    });

    HabitStorage.saveAll(newHabits);

    const nowAllDone = newHabits.length > 0 && newHabits.every((h) => h.isCompletedToday);
    let flash = false;
    if (!wasAllDone && nowAllDone) {
      flash = true;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }

    set({ habits: newHabits, allDoneFlashTriggered: flash });

    if (triggeredMilestone !== null) {
      setTimeout(() => {
        set({ milestoneStreak: triggeredMilestone });
      }, 600);
    }
  },
}));
