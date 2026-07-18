/**
 * lib/exportCsv.ts — exports the user's local wellness data as a downloadable CSV.
 */

import type { WellnessState } from '../hooks/useWellnessStore';

function escapeCsvField(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function toRow(fields: (string | number)[]): string {
  return fields.map((f) => escapeCsvField(String(f))).join(',');
}

export function exportWellnessData(state: WellnessState, userEmail?: string): void {
  const rows: string[] = [];

  rows.push(toRow(['TheraVox AI — Wellness Data Export']));
  rows.push(toRow(['Account', userEmail ?? 'Guest']));
  rows.push(toRow(['Exported at', new Date().toISOString()]));
  rows.push('');

  // Journal entries
  rows.push(toRow(['Journal Entries']));
  rows.push(toRow(['Date', 'Title', 'Content']));
  for (const entry of state.journalEntries) {
    rows.push(toRow([entry.createdAt, entry.title ?? '', entry.content]));
  }
  rows.push('');

  // Mood logs
  rows.push(toRow(['Mood Logs']));
  rows.push(toRow(['Date', 'Mood', 'Emoji']));
  for (const log of state.moodLogs) {
    rows.push(toRow([log.timestamp, log.mood, log.emoji]));
  }
  rows.push('');

  // Gratitude
  rows.push(toRow(['Gratitude Entries']));
  rows.push(toRow(['Date', 'Entry']));
  for (const item of state.gratitude) {
    rows.push(toRow([item.timestamp, item.text]));
  }
  rows.push('');

  // Activities
  rows.push(toRow(['Activity Log']));
  rows.push(toRow(['Date', 'Type', 'Description']));
  for (const activity of state.activities) {
    rows.push(toRow([activity.timestamp, activity.type, activity.description]));
  }
  rows.push('');

  // Summary
  rows.push(toRow(['Summary']));
  rows.push(toRow(['Total breathing minutes', state.breathingMinutes]));
  rows.push(toRow(['Current streak (days)', state.streak.count]));

  const csvContent = rows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  const dateStamp = new Date().toISOString().slice(0, 10);
  link.download = `theravox-wellness-export-${dateStamp}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
