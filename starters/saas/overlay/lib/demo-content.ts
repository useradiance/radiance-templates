import type { DemoPayload } from '@/lib/demo-types';
import type { Workspace } from '@/lib/workspaces';

type Person = {
  id: string;
  displayName: string;
  email: string;
  title: string;
};

const PEOPLE: Person[] = [
  {
    id: 'demo-maya',
    displayName: 'Maya Chen',
    email: 'maya@example.com',
    title: 'Product',
  },
  {
    id: 'demo-jordan',
    displayName: 'Jordan Hale',
    email: 'jordan@example.com',
    title: 'Engineering',
  },
  {
    id: 'demo-priya',
    displayName: 'Priya Nair',
    email: 'priya@example.com',
    title: 'Design',
  },
  {
    id: 'demo-alex',
    displayName: 'Alex Rivera',
    email: 'alex@example.com',
    title: 'Success',
  },
];

function avatarUrl(name: string): string {
  return `https://api.dicebear.com/9.x/lorelei/png?seed=${encodeURIComponent(name)}&size=128`;
}

export function demoWorkspaces(uid = 'preview'): Workspace[] {
  return getDemoDocuments(uid).collections.workspaces as Workspace[];
}

/**
 * Two workspaces the signed-in user can open, plus fake teammate profiles so
 * member lists are not empty after `EXPO_PUBLIC_SEED_DEMO=true`.
 */
export function getDemoDocuments(uid: string): DemoPayload {
  const [maya, jordan, priya, alex] = PEOPLE;

  return {
    collections: {
      users: PEOPLE.map((entry) => ({
        id: entry.id,
        uid: entry.id,
        displayName: entry.displayName,
        email: entry.email,
        photoURL: avatarUrl(entry.displayName),
        role: null,
        providerIds: [],
        isAnonymous: false,
      })),
      workspaces: [
        {
          id: 'demo-acme',
          name: 'Acme Ops',
          ownerId: uid,
          memberIds: [uid, maya.id, jordan.id, priya.id],
          memberRoles: {
            [maya.id]: 'admin',
            [jordan.id]: 'member',
            [priya.id]: 'member',
          },
        },
        {
          id: 'demo-northwind',
          name: 'Northwind Shared',
          ownerId: alex.id,
          memberIds: [alex.id, uid, jordan.id],
          memberRoles: {
            [uid]: 'admin',
            [jordan.id]: 'member',
          },
        },
      ],
    },
  };
}
