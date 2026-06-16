// ─────────────────────────────────────────────────────────────────────────────
// HABIT MODEL — Flutter HabitModel ning React Native versiyasi
// ─────────────────────────────────────────────────────────────────────────────

import { kCardColors } from '../constants/colors';

export function fmtDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function todayStr(): string {
  return fmtDate(new Date());
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export interface HabitJSON {
  id: string;
  name: string;
  color: string;
  emoji: string;
  createdAt: string;
  completions: string[];
}

export class HabitModel {
  id: string;
  name: string;
  colorHex: string;
  emoji: string;
  createdAt: string;
  completions: Set<string>;

  constructor(params: {
    id: string;
    name: string;
    colorHex: string;
    emoji?: string;
    createdAt: string;
    completions?: string[];
  }) {
    this.id = params.id;
    this.name = params.name;
    this.colorHex = params.colorHex;
    this.emoji = params.emoji ?? '';
    this.createdAt = params.createdAt;
    this.completions = new Set(params.completions ?? []);
  }

  static fromJSON(obj: HabitJSON): HabitModel {
    return new HabitModel({
      id: obj.id,
      name: obj.name,
      colorHex: obj.color,
      emoji: obj.emoji ?? '',
      createdAt: obj.createdAt,
      completions: obj.completions ?? [],
    });
  }

  toJSON(): HabitJSON {
    return {
      id: this.id,
      name: this.name,
      color: this.colorHex,
      emoji: this.emoji,
      createdAt: this.createdAt,
      completions: Array.from(this.completions),
    };
  }

  get colorIndex(): number {
    const idx = kCardColors.findIndex(
      (c) => c.toUpperCase() === this.colorHex.toUpperCase()
    );
    return idx >= 0 ? idx : 0;
  }

  isCompletedOn(date: string): boolean {
    return this.completions.has(date);
  }

  get isCompletedToday(): boolean {
    return this.isCompletedOn(todayStr());
  }

  get streak(): number {
    if (this.completions.size === 0) return 0;
    let count = 0;
    const cursor = new Date();
    if (!this.isCompletedOn(fmtDate(cursor))) {
      cursor.setDate(cursor.getDate() - 1);
    }
    while (this.isCompletedOn(fmtDate(cursor))) {
      count++;
      cursor.setDate(cursor.getDate() - 1);
    }
    return count;
  }

  get last7(): boolean[] {
    const now = new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now);
      d.setDate(now.getDate() - (6 - i));
      return this.isCompletedOn(fmtDate(d));
    });
  }

  clone(): HabitModel {
    return new HabitModel({
      id: this.id,
      name: this.name,
      colorHex: this.colorHex,
      emoji: this.emoji,
      createdAt: this.createdAt,
      completions: Array.from(this.completions),
    });
  }
}
