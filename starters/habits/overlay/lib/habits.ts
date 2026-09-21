import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  increment,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore';
import * as Notifications from 'expo-notifications';

import { getDb } from '@/lib/firestore';
import { requestPushPermissions } from '@/lib/push';

export type Habit = {
  id: string;
  ownerId: string;
  name: string;
  streak: number;
  lastCheckInDate?: string | null;
  history?: string[];
  reminderHour?: number | null;
};

export function habitsQuery(uid: string) {
  return query(collection(getDb(), 'habits'), where('ownerId', '==', uid), orderBy('name', 'asc'));
}

export function localDateKey(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export async function scheduleHabitReminder(
  habitId: string,
  name: string,
  hour: number,
): Promise<void> {
  try {
    const granted = await requestPushPermissions();
    if (!granted) return;
    await Notifications.cancelScheduledNotificationAsync(`habit-${habitId}`).catch(() => undefined);
    await Notifications.scheduleNotificationAsync({
      identifier: `habit-${habitId}`,
      content: { title: name, body: 'Time to check in' },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute: 0,
      },
    });
  } catch {
    // Web / simulators / missing permission — skip.
  }
}

export async function createHabit(ownerId: string, name: string, reminderHour?: number | null) {
  const ref = await addDoc(collection(getDb(), 'habits'), {
    ownerId,
    name: name.trim(),
    streak: 0,
    lastCheckInDate: null,
    history: [],
    reminderHour: reminderHour ?? null,
    createdAt: serverTimestamp(),
  });
  if (typeof reminderHour === 'number' && reminderHour >= 0 && reminderHour <= 23) {
    await scheduleHabitReminder(ref.id, name.trim(), reminderHour);
  }
  return ref.id;
}

export async function checkIn(habit: Habit) {
  const today = localDateKey();
  if (habit.lastCheckInDate === today) return;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yKey = localDateKey(yesterday);
  const nextStreak = habit.lastCheckInDate === yKey ? (habit.streak ?? 0) + 1 : 1;
  await setDoc(
    doc(getDb(), 'habits', habit.id),
    {
      lastCheckInDate: today,
      streak: nextStreak,
      checkIns: increment(1),
      history: arrayUnion(today),
    },
    { merge: true },
  );
}
