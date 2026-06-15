// ─────────────────────────────────────────────────────────────────────────────
// HABIT STORAGE — AsyncStorage wrapper
// ─────────────────────────────────────────────────────────────────────────────

import AsyncStorage from '@react-native-async-storage/async-storage';
import { HabitModel, HabitJSON } from '../models/HabitModel';

const HABITS_KEY = 'momentum_habits';
const PREMIUM_KEY = 'momentum_premium';

const HabitStorage = {
  async loadAll(): Promise<HabitModel[]> {
    try {
      const raw = await AsyncStorage.getItem(HABITS_KEY);
      if (!raw) return [];
      const arr: HabitJSON[] = JSON.parse(raw);
      return arr
        .map((obj) => {
          try {
            return HabitModel.fromJSON(obj);
          } catch {
            return null;
          }
        })
        .filter(Boolean) as HabitModel[];
    } catch {
      return [];
    }
  },

  async saveAll(habits: HabitModel[]): Promise<void> {
    try {
      const arr = habits.map((h) => h.toJSON());
      await AsyncStorage.setItem(HABITS_KEY, JSON.stringify(arr));
    } catch (e) {
      console.warn('HabitStorage.saveAll error:', e);
    }
  },

  async isPremium(): Promise<boolean> {
    try {
      const val = await AsyncStorage.getItem(PREMIUM_KEY);
      return val === 'true';
    } catch {
      return false;
    }
  },

  async setPremium(value: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem(PREMIUM_KEY, value ? 'true' : 'false');
    } catch (e) {
      console.warn('HabitStorage.setPremium error:', e);
    }
  },
};

export default HabitStorage;
