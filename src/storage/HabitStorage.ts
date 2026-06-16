// ─────────────────────────────────────────────────────────────────────────────
// HABIT STORAGE — MMKV wrapper
// ─────────────────────────────────────────────────────────────────────────────

import { MMKV } from 'react-native-mmkv';
import { HabitModel, HabitJSON } from '../models/HabitModel';

let storage: any = {
  getString: () => null,
  set: () => {},
  getBoolean: () => false,
};

try {
  storage = new MMKV();
} catch (e) {
  console.warn('MMKV Init Error:', e);
}

const HABITS_KEY = 'momentum_habits';
const PREMIUM_KEY = 'momentum_premium';

const HabitStorage = {
  loadAll(): HabitModel[] {
    try {
      const raw = storage.getString(HABITS_KEY);
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

  saveAll(habits: HabitModel[]): void {
    try {
      const arr = habits.map((h) => h.toJSON());
      storage.set(HABITS_KEY, JSON.stringify(arr));
    } catch (e) {
      console.warn('HabitStorage.saveAll error:', e);
    }
  },

  isPremium(): boolean {
    return storage.getBoolean(PREMIUM_KEY) || false;
  },

  setPremium(value: boolean): void {
    storage.set(PREMIUM_KEY, value);
  },
};

export default HabitStorage;
