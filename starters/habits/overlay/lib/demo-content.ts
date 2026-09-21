import type { DemoPayload } from '@/lib/demo-types';
import type { Habit } from '@/lib/habits';

function recentHistory(days: number): string[] {
  const keys: string[] = [];
  for (let i = 1; i <= days; i += 1) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    keys.push(`${y}-${m}-${d}`);
  }
  return keys;
}

export const DEMO_HABITS: Habit[] = [
  {
    id: 'h-water',
    ownerId: 'preview',
    name: 'Drink water',
    streak: 12,
    lastCheckInDate: null,
    history: recentHistory(12),
    reminderHour: 8,
  },
  {
    id: 'h-walk',
    ownerId: 'preview',
    name: 'Walk 20 minutes',
    streak: 8,
    lastCheckInDate: null,
    history: recentHistory(8),
    reminderHour: 18,
  },
  {
    id: 'h-read',
    ownerId: 'preview',
    name: 'Read 10 pages',
    streak: 21,
    lastCheckInDate: null,
    history: recentHistory(21),
  },
  {
    id: 'h-stretch',
    ownerId: 'preview',
    name: 'Morning stretch',
    streak: 5,
    lastCheckInDate: null,
    history: recentHistory(5),
    reminderHour: 7,
  },
  {
    id: 'h-journal',
    ownerId: 'preview',
    name: 'Journal',
    streak: 3,
    lastCheckInDate: null,
    history: recentHistory(3),
  },
  {
    id: 'h-sleep',
    ownerId: 'preview',
    name: 'Lights out by 11',
    streak: 9,
    lastCheckInDate: null,
    history: recentHistory(9),
    reminderHour: 22,
  },
];

export function getDemoDocuments(uid: string): DemoPayload {
  return {
    collections: {
      habits: DEMO_HABITS.map((habit) => ({ ...habit, ownerId: uid })),
    },
  };
}
