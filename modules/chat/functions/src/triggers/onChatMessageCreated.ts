import { getFirestore } from 'firebase-admin/firestore';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { logger } from 'firebase-functions';

import { notifyUsers } from '../lib/notify';

/**
 * Fan-out a push to every thread member except the sender.
 */
export const onChatMessageCreated = onDocumentCreated(
  'threads/{threadId}/messages/{messageId}',
  async (event) => {
    const data = event.data?.data();
    const threadId = event.params.threadId as string;
    if (!data) return;

    const senderId = String(data.senderId ?? '');
    const preview =
      String(data.text ?? '')
        .trim()
        .slice(0, 80) || 'New message';

    const thread = await getFirestore().collection('threads').doc(threadId).get();
    const memberIds = (thread.data()?.memberIds as string[] | undefined) ?? [];
    const recipients = memberIds.filter((uid) => uid && uid !== senderId);
    if (recipients.length === 0) return;

    logger.info('chat push fan-out', { threadId, recipients: recipients.length });
    await notifyUsers(recipients, 'New message', preview, {
      deeplink: `/chat/${threadId}`,
      threadId,
    });
  },
);
