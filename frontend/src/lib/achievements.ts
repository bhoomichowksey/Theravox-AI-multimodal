/**
 * lib/achievements.ts — computes unlockable achievements from wellness state.
 *
 * 10 achievements, matching the feature set described in the project README:
 * First Step, Breath of Fresh Air, Deep Breather, Grateful Heart,
 * Journal Start, and more.
 */

import type { WellnessState } from '../hooks/useWellnessStore';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  emoji: string;
  unlocked: boolean;
}

export function computeAchievements(state: WellnessState): Achievement[] {
  const journalCount = state.journalEntries.length;
  const moodCount = state.moodLogs.length;
  const gratitudeCount = state.gratitude.length;
  const breathingMinutes = state.breathingMinutes;
  const streakCount = state.streak?.count ?? 0;
  const activityCount = state.activities.length;

  return [
    {
      id: 'first-step',
      title: 'First Step',
      description: 'Logged your first wellness activity',
      emoji: '👣',
      unlocked: activityCount >= 1,
    },
    {
      id: 'journal-start',
      title: 'Journal Start',
      description: 'Wrote your first journal entry',
      emoji: '📔',
      unlocked: journalCount >= 1,
    },
    {
      id: 'reflective-writer',
      title: 'Reflective Writer',
      description: 'Wrote 5 journal entries',
      emoji: '✍️',
      unlocked: journalCount >= 5,
    },
    {
      id: 'breath-of-fresh-air',
      title: 'Breath of Fresh Air',
      description: 'Completed your first breathing session',
      emoji: '🌬️',
      unlocked: breathingMinutes >= 1,
    },
    {
      id: 'deep-breather',
      title: 'Deep Breather',
      description: 'Logged 30 total minutes of breathing exercises',
      emoji: '🧘',
      unlocked: breathingMinutes >= 30,
    },
    {
      id: 'grateful-heart',
      title: 'Grateful Heart',
      description: 'Added 5 gratitude entries',
      emoji: '🙏',
      unlocked: gratitudeCount >= 5,
    },
    {
      id: 'gratitude-master',
      title: 'Gratitude Master',
      description: 'Added 20 gratitude entries',
      emoji: '✨',
      unlocked: gratitudeCount >= 20,
    },
    {
      id: 'mood-tracker',
      title: 'Mood Tracker',
      description: 'Logged your mood 7 times',
      emoji: '📊',
      unlocked: moodCount >= 7,
    },
    {
      id: 'three-day-streak',
      title: 'Building Momentum',
      description: 'Reached a 3-day wellness streak',
      emoji: '🔥',
      unlocked: streakCount >= 3,
    },
    {
      id: 'week-streak',
      title: 'Consistent Care',
      description: 'Reached a 7-day wellness streak',
      emoji: '🏆',
      unlocked: streakCount >= 7,
    },
  ];
}
