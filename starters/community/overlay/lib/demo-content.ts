import type { DemoPayload } from '@/lib/demo-types';
import type { Channel, Thread } from '@/lib/community';

export const DEMO_CHANNELS: Channel[] = [
  { id: 'general', name: 'general', nameLower: 'general', description: 'Housekeeping and hellos' },
  { id: 'design', name: 'design', nameLower: 'design', description: 'Type, colour, and screens' },
  {
    id: 'shipping',
    name: 'shipping',
    nameLower: 'shipping',
    description: 'What we are building this week',
  },
  { id: 'lounge', name: 'lounge', nameLower: 'lounge', description: 'Off-topic, on purpose' },
  {
    id: 'help',
    name: 'help',
    nameLower: 'help',
    description: 'Ask, then leave the thread for the next person',
  },
  { id: 'events', name: 'events', nameLower: 'events', description: 'Meetups and office hours' },
];

export const DEMO_THREADS: Record<string, Thread[]> = {
  general: [
    { id: 't-welcome', channelId: 'general', title: 'Welcome — start here', authorId: 'preview' },
    { id: 't-intros', channelId: 'general', title: 'Introductions', authorId: 'preview' },
  ],
  design: [
    {
      id: 't-type',
      channelId: 'design',
      title: 'Display serif on the magazine home',
      authorId: 'preview',
    },
    {
      id: 't-density',
      channelId: 'design',
      title: 'Desktop density without looking like a spreadsheet',
      authorId: 'preview',
    },
  ],
  shipping: [
    { id: 't-week', channelId: 'shipping', title: 'This week’s cut', authorId: 'preview' },
  ],
  lounge: [
    { id: 't-coffee', channelId: 'lounge', title: 'What are you drinking', authorId: 'preview' },
  ],
  help: [{ id: 't-rules', channelId: 'help', title: 'How invites work', authorId: 'preview' }],
  events: [
    { id: 't-friday', channelId: 'events', title: 'Friday office hours', authorId: 'preview' },
  ],
};

export function getDemoDocuments(_uid: string): DemoPayload {
  return {
    collections: {
      channels: DEMO_CHANNELS,
    },
  };
}
