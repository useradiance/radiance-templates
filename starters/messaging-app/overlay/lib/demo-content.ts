import type { DemoPayload } from '@/lib/demo-types';
import type { Thread } from '@/lib/chat';

export const DEMO_THREADS: Thread[] = [
  {
    id: 'c-maya',
    memberIds: ['preview', 'demo-maya'],
    title: 'Maya Chen',
    lastMessage: 'See you at 7 — I will grab a table.',
  },
  {
    id: 'c-jordan',
    memberIds: ['preview', 'demo-jordan'],
    title: 'Jordan Hale',
    lastMessage: 'The oak place is quieter after 4.',
  },
  {
    id: 'c-priya',
    memberIds: ['preview', 'demo-priya'],
    title: 'Priya Nair',
    lastMessage: 'Ridge loop tomorrow if the fog lifts.',
  },
  {
    id: 'c-alex',
    memberIds: ['preview', 'demo-alex'],
    title: 'Alex Rivera',
    lastMessage: 'Sending the type samples in a minute.',
  },
  {
    id: 'c-sam',
    memberIds: ['preview', 'demo-sam'],
    title: 'Sam Okonkwo',
    lastMessage: 'Saved you a seat. Come hungry.',
  },
];

export const DEMO_THREAD_MESSAGES: Record<string, { mine: boolean; text: string }[]> = {
  'c-maya': [
    { mine: false, text: 'Are we still on for dinner?' },
    { mine: true, text: 'Yes — 7 works.' },
    { mine: false, text: 'See you at 7 — I will grab a table.' },
  ],
  'c-jordan': [
    { mine: true, text: 'Coffee this afternoon?' },
    { mine: false, text: 'The oak place is quieter after 4.' },
  ],
  'c-priya': [
    { mine: false, text: 'Ridge loop tomorrow if the fog lifts.' },
    { mine: true, text: 'I am in. Extra water.' },
  ],
  'c-alex': [
    { mine: true, text: 'Need the magazine lockup.' },
    { mine: false, text: 'Sending the type samples in a minute.' },
  ],
  'c-sam': [{ mine: false, text: 'Saved you a seat. Come hungry.' }],
};

export function getDemoDocuments(uid: string): DemoPayload {
  return {
    collections: {
      threads: DEMO_THREADS.map((thread) => ({
        ...thread,
        memberIds: [uid, ...thread.memberIds.filter((id) => id !== 'preview')],
      })),
    },
  };
}
