import { getFirestore } from 'firebase-admin/firestore';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { logger } from 'firebase-functions';

import { notifyUser } from '../lib/notify';

/**
 * About an hour before an event starts, remind everyone who RSVP'd.
 * No-ops when the `events` collection is unused (booking-only apps).
 */
export const upcomingEventReminders = onSchedule('every 15 minutes', async () => {
  const db = getFirestore();
  const now = Date.now();
  const from = new Date(now + 45 * 60_000);
  const to = new Date(now + 80 * 60_000);

  const events = await db
    .collection('events')
    .where('startsAt', '>=', from)
    .where('startsAt', '<=', to)
    .get()
    .catch(() => null);

  if (!events || events.empty) return;

  for (const eventDoc of events.docs) {
    const title = String(eventDoc.data().title ?? 'Event');
    const rsvps = await eventDoc.ref.collection('rsvps').get();
    for (const rsvp of rsvps.docs) {
      if (rsvp.data().reminderSentAt) continue;
      const uid = String(rsvp.data().userId ?? rsvp.id);
      await notifyUser(uid, title, 'Starts in about an hour', {
        deeplink: `/event/${eventDoc.id}`,
        eventId: eventDoc.id,
      });
      await rsvp.ref.set({ reminderSentAt: new Date() }, { merge: true });
    }
    logger.info('event reminders sent', { eventId: eventDoc.id, count: rsvps.size });
  }
});
