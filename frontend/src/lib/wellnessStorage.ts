/**
 * lib/wellnessStorage.ts — localStorage-backed persistence for wellness data.
 *
 * All data is scoped per-user (via setUserId) so that switching accounts on
 * the same browser doesn't leak one user's journal into another's view.
 * Falls back to a "guest" scope when no user is signed in.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface JournalEntry {
  id: number;
  title?: string;
  content: string;
  createdAt: string;
}

export interface MoodLog {
  mood: string;
  emoji: string;
  timestamp: string;
}

export interface GratitudeItem {
  text: string;
  timestamp: string;
}

export interface Activity {
  type: string;
  description: string;
  timestamp: string;
}

export interface Streak {
  count: number;
  lastActiveDate: string | null;
}

export type HabitsData = Record<string, boolean[]>;

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

let _currentUserId: string | null = null;

function scope(): string {
  return _currentUserId ?? 'guest';
}

function key(name: string): string {
  return `theravox:${scope()}:${name}`;
}

function readArray<T>(name: string): T[] {
  try {
    const raw = localStorage.getItem(key(name));
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

function writeArray<T>(name: string, value: T[]): void {
  try {
    localStorage.setItem(key(name), JSON.stringify(value));
  } catch {
    // localStorage unavailable or full — fail silently, data just won't persist
  }
}

function readValue<T>(name: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key(name));
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeValue<T>(name: string, value: T): void {
  try {
    localStorage.setItem(key(name), JSON.stringify(value));
  } catch {
    // ignore
  }
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isYesterday(date: Date, reference: Date): boolean {
  const yesterday = new Date(reference);
  yesterday.setDate(yesterday.getDate() - 1);
  return isSameDay(date, yesterday);
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export const WellnessStorage = {
  // -- User scope -----------------------------------------------------
  setUserId(id: string | null): void {
    _currentUserId = id;
  },

  // -- Journal ----------------------------------------------------------
  getJournalEntries(): JournalEntry[] {
    return readArray<JournalEntry>('journalEntries').sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  },

  addJournalEntry(entry: Omit<JournalEntry, 'id' | 'createdAt'>): void {
    const entries = readArray<JournalEntry>('journalEntries');
    entries.push({
      ...entry,
      id: Date.now(),
      createdAt: new Date().toISOString(),
    });
    writeArray('journalEntries', entries);
  },

  deleteJournalEntry(id: number): void {
    const entries = readArray<JournalEntry>('journalEntries').filter((e) => e.id !== id);
    writeArray('journalEntries', entries);
  },

  // -- Mood ---------------------------------------------------------------
  getMoodLogs(): MoodLog[] {
    return readArray<MoodLog>('moodLogs').sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );
  },

  addMoodLog(mood: string, emoji: string): void {
    const logs = readArray<MoodLog>('moodLogs');
    logs.push({ mood, emoji, timestamp: new Date().toISOString() });
    writeArray('moodLogs', logs);
  },

  // -- Gratitude ------------------------------------------------------------
  getGratitude(): GratitudeItem[] {
    return readArray<GratitudeItem>('gratitude').sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );
  },

  addGratitude(text: string): void {
    const items = readArray<GratitudeItem>('gratitude');
    items.push({ text, timestamp: new Date().toISOString() });
    writeArray('gratitude', items);
  },

  // -- Activities (audit trail used for streaks & tracker) -----------------
  getActivities(): Activity[] {
    return readArray<Activity>('activities').sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );
  },

  addActivity(type: string, description: string): void {
    const activities = readArray<Activity>('activities');
    activities.push({ type, description, timestamp: new Date().toISOString() });
    writeArray('activities', activities);
  },

  // -- Breathing -----------------------------------------------------------
  getBreathingMinutes(): number {
    return readValue<number>('breathingMinutes', 0);
  },

  addBreathingMinutes(minutes: number): void {
    const total = readValue<number>('breathingMinutes', 0) + minutes;
    writeValue('breathingMinutes', total);
  },

  // -- Habits ----------------------------------------------------------
  getHabits(): HabitsData {
    return readValue<HabitsData>('habits', {});
  },

  toggleHabit(habit: string, dayIndex: number): void {
    const habits = readValue<HabitsData>('habits', {});
    const days = habits[habit] ?? new Array(7).fill(false);
    days[dayIndex] = !days[dayIndex];
    habits[habit] = days;
    writeValue('habits', habits);
  },

  // -- Streak -----------------------------------------------------------
  getStreak(): Streak {
    return readValue<Streak>('streak', { count: 0, lastActiveDate: null });
  },

  updateStreak(): void {
    const streak = readValue<Streak>('streak', { count: 0, lastActiveDate: null });
    const now = new Date();

    if (!streak.lastActiveDate) {
      writeValue('streak', { count: 1, lastActiveDate: now.toISOString() });
      return;
    }

    const last = new Date(streak.lastActiveDate);
    if (isSameDay(last, now)) {
      // Already logged activity today — no change
      return;
    }
    if (isYesterday(last, now)) {
      writeValue('streak', { count: streak.count + 1, lastActiveDate: now.toISOString() });
      return;
    }
    // Streak broken — restart
    writeValue('streak', { count: 1, lastActiveDate: now.toISOString() });
  },
};
