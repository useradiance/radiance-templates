import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
  type Query,
} from 'firebase/firestore';

import { getDb } from '@/lib/firestore';

export type Thread = {
  id: string;
  memberIds: string[];
  title?: string | null;
  lastMessage?: string | null;
  lastMessageAt?: { seconds: number } | null;
  unread?: Record<string, number>;
};

/** Storage path (+ metadata) for a message attachment. Persist `path`, not a signed URL. */
export type ChatAttachment = {
  path: string;
  contentType?: string | null;
  name?: string | null;
};

/** emoji → member uids who reacted with it */
export type ChatReactions = Record<string, string[]>;

export type ChatDeliveryStatus = 'sent' | 'delivered' | 'seen';

export type ChatMessage = {
  id: string;
  senderId: string;
  /** Caption; empty string when the message is attachment-only. */
  text: string;
  attachment?: ChatAttachment | null;
  reactions?: ChatReactions | null;
  /** Member uids that have received the message (client-side). */
  deliveredTo?: string[] | null;
  /** Member uids that have opened the thread after the message arrived. */
  seenBy?: string[] | null;
  createdAt?: { seconds: number; nanoseconds?: number } | null;
};

/** Local draft attachment — not uploaded until send. */
export type PendingChatMedia = {
  uri: string;
  mimeType?: string | null;
  name?: string | null;
};

/** Profile docs from `users` — any signed-in client can list them (auth rules). */
export type ChatUser = {
  id: string;
  uid: string;
  displayName?: string | null;
  email?: string | null;
  photoURL?: string | null;
};

export type SendMessageInput = {
  text?: string;
  attachment?: ChatAttachment | null;
};

/** Quick-react palette shown on long-press. */
export const CHAT_REACTION_EMOJI = ['👍', '❤️', '😂', '😮', '😢', '🙏'] as const;

/** Group consecutive same-sender messages closer than this gap. */
export const CHAT_GROUP_WINDOW_MS = 60_000;

export function inboxQuery(uid: string): Query {
  return query(
    collection(getDb(), 'threads'),
    where('memberIds', 'array-contains', uid),
    orderBy('lastMessageAt', 'desc'),
  );
}

/** Directory for starting chats. Sort / filter client-side (displayName may be null). */
export function directoryQuery(): Query {
  return query(collection(getDb(), 'users'));
}

export function chatUserLabel(user: ChatUser): string {
  return user.displayName?.trim() || user.email?.trim() || user.uid || user.id;
}

export function threadRef(threadId: string) {
  return doc(getDb(), 'threads', threadId);
}

export function messageRef(threadId: string, messageId: string) {
  return doc(getDb(), 'threads', threadId, 'messages', messageId);
}

export function messagesQuery(threadId: string): Query {
  return query(collection(getDb(), 'threads', threadId, 'messages'), orderBy('createdAt', 'asc'));
}

/**
 * Owner-scoped Storage path for a chat attachment.
 * Fits existing `users/{uid}/**` Storage rules (signed-in read, owner write).
 */
export function chatAttachmentPath(uid: string, threadId: string, fileName: string): string {
  const safe = fileName.replace(/[^\w.\-]+/g, '_') || 'file';
  return `users/${uid}/chat/${threadId}/${Date.now()}-${safe}`;
}

export function isImageAttachment(attachment: ChatAttachment | null | undefined): boolean {
  const type = attachment?.contentType?.toLowerCase() ?? '';
  if (type.startsWith('image/')) return true;
  const name = attachment?.name?.toLowerCase() ?? attachment?.path.toLowerCase() ?? '';
  return /\.(png|jpe?g|gif|webp|heic|heif|bmp)$/.test(name);
}

export function messageTimeMs(message: ChatMessage): number | null {
  const created = message.createdAt as
    | { seconds?: number; toMillis?: () => number }
    | null
    | undefined;
  if (!created) return null;
  if (typeof created.toMillis === 'function') return created.toMillis();
  if (typeof created.seconds === 'number') return created.seconds * 1000;
  return null;
}

/** True when this bubble should show time (+ delivery) — last in a same-sender ≤1min group. */
export function isGroupTail(messages: ChatMessage[], index: number): boolean {
  const current = messages[index];
  const next = messages[index + 1];
  if (!current) return false;
  if (!next || next.senderId !== current.senderId) return true;
  const a = messageTimeMs(current);
  const b = messageTimeMs(next);
  if (a == null || b == null) return true;
  return b - a > CHAT_GROUP_WINDOW_MS;
}

/** True when this bubble starts a new visual group (extra top spacing). */
export function isGroupHead(messages: ChatMessage[], index: number): boolean {
  if (index <= 0) return true;
  const current = messages[index];
  const prev = messages[index - 1];
  if (!current || !prev || prev.senderId !== current.senderId) return true;
  const a = messageTimeMs(prev);
  const b = messageTimeMs(current);
  if (a == null || b == null) return true;
  return b - a > CHAT_GROUP_WINDOW_MS;
}

export function formatMessageTime(message: ChatMessage, locale?: string): string {
  const ms = messageTimeMs(message);
  if (ms == null) return '';
  return new Intl.DateTimeFormat(locale, { hour: 'numeric', minute: '2-digit' }).format(
    new Date(ms),
  );
}

/**
 * Delivery for the sender: seen when every other member has seen it,
 * delivered when every other member has received it, otherwise sent.
 */
export function deliveryStatusForSender(
  message: ChatMessage,
  memberIds: string[],
): ChatDeliveryStatus {
  const others = memberIds.filter((id) => id && id !== message.senderId);
  if (others.length === 0) return 'sent';
  const seenBy = message.seenBy ?? [];
  const deliveredTo = message.deliveredTo ?? [];
  if (others.every((id) => seenBy.includes(id))) return 'seen';
  if (others.every((id) => deliveredTo.includes(id) || seenBy.includes(id))) return 'delivered';
  return 'sent';
}

export async function createThread(memberIds: string[], title?: string): Promise<string> {
  const ref = await addDoc(collection(getDb(), 'threads'), {
    memberIds,
    title: title ?? null,
    lastMessage: null,
    lastMessageAt: serverTimestamp(),
    unread: Object.fromEntries(memberIds.map((id) => [id, 0])),
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

function previewForMessage(text: string, attachment?: ChatAttachment | null): string {
  if (text && attachment) {
    return isImageAttachment(attachment) ? `${text} 📷` : `${text} 📎`;
  }
  if (text) return text;
  if (attachment) {
    return isImageAttachment(attachment) ? '📷 Photo' : `📎 ${attachment.name ?? 'Attachment'}`;
  }
  return '';
}

/**
 * Sends a text and/or attachment message. No-op when both are empty.
 * Upload the file first, then pass the Storage `path` in `attachment`.
 */
export async function sendMessage(
  threadId: string,
  senderId: string,
  input: string | SendMessageInput,
): Promise<void> {
  const payload: SendMessageInput = typeof input === 'string' ? { text: input } : (input ?? {});
  const trimmed = (payload.text ?? '').trim();
  const attachment = payload.attachment ?? null;
  if (!trimmed && !attachment?.path) return;

  const db = getDb();
  await addDoc(collection(db, 'threads', threadId, 'messages'), {
    senderId,
    text: trimmed,
    attachment: attachment?.path
      ? {
          path: attachment.path,
          contentType: attachment.contentType ?? null,
          name: attachment.name ?? null,
        }
      : null,
    reactions: {},
    deliveredTo: [],
    seenBy: [],
    createdAt: serverTimestamp(),
  });
  await updateDoc(doc(db, 'threads', threadId), {
    lastMessage: previewForMessage(trimmed, attachment),
    lastMessageAt: serverTimestamp(),
  });
}

/** Toggle the current user's reaction for an emoji on a message. */
export async function toggleMessageReaction(
  threadId: string,
  messageId: string,
  uid: string,
  emoji: string,
  reacted: boolean,
): Promise<void> {
  await updateDoc(messageRef(threadId, messageId), {
    [`reactions.${emoji}`]: reacted ? arrayRemove(uid) : arrayUnion(uid),
  });
}

/**
 * Marks peer messages as delivered and/or seen for the current member.
 * Batched; safe to call whenever the thread subscription updates.
 */
export async function acknowledgeMessages(
  threadId: string,
  uid: string,
  messages: ChatMessage[],
  options: { delivered?: boolean; seen?: boolean } = { delivered: true, seen: true },
): Promise<void> {
  const peer = messages.filter((message) => message.senderId !== uid);
  if (peer.length === 0) return;

  const db = getDb();
  let batch = writeBatch(db);
  let ops = 0;

  const commitIfNeeded = async () => {
    if (ops === 0) return;
    await batch.commit();
    batch = writeBatch(db);
    ops = 0;
  };

  for (const message of peer) {
    const updates: Record<string, ReturnType<typeof arrayUnion>> = {};
    if (options.delivered !== false && !(message.deliveredTo ?? []).includes(uid)) {
      updates.deliveredTo = arrayUnion(uid);
    }
    if (options.seen && !(message.seenBy ?? []).includes(uid)) {
      updates.seenBy = arrayUnion(uid);
      // Seen implies delivered.
      if (!(message.deliveredTo ?? []).includes(uid)) {
        updates.deliveredTo = arrayUnion(uid);
      }
    }
    if (Object.keys(updates).length === 0) continue;
    batch.update(messageRef(threadId, message.id), updates);
    ops += 1;
    if (ops >= 400) await commitIfNeeded();
  }

  await commitIfNeeded();
}

export async function markThreadRead(threadId: string, uid: string): Promise<void> {
  await setDoc(doc(getDb(), 'threads', threadId), { unread: { [uid]: 0 } }, { merge: true });
}
