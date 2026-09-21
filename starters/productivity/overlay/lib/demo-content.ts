import type { DemoPayload } from '@/lib/demo-types';
import type { Project, Task } from '@/lib/projects';

export const DEMO_PROJECTS: Project[] = [
  {
    id: 'p-launch',
    ownerId: 'preview',
    memberIds: ['preview'],
    name: 'Launch week',
    openTaskCount: 4,
    createdAt: null,
  },
  {
    id: 'p-site',
    ownerId: 'preview',
    memberIds: ['preview'],
    name: 'Marketing site',
    openTaskCount: 3,
    createdAt: null,
  },
  {
    id: 'p-app',
    ownerId: 'preview',
    memberIds: ['preview'],
    name: 'Mobile polish',
    openTaskCount: 5,
    createdAt: null,
  },
  {
    id: 'p-ops',
    ownerId: 'preview',
    memberIds: ['preview'],
    name: 'Ops backlog',
    openTaskCount: 2,
    createdAt: null,
  },
  {
    id: 'p-research',
    ownerId: 'preview',
    memberIds: ['preview'],
    name: 'Research',
    openTaskCount: 1,
    createdAt: null,
  },
];

export const DEMO_TASKS: Record<string, Task[]> = {
  'p-launch': [
    { id: 't1', title: 'Cut the release notes', done: true, createdAt: null },
    { id: 't2', title: 'Record the walkthrough', done: false, createdAt: null },
    { id: 't3', title: 'Ping the mailing list', done: false, createdAt: null },
    { id: 't4', title: 'Ship the status page copy', done: false, createdAt: null },
  ],
  'p-site': [
    { id: 't5', title: 'Hero photograph', done: true, createdAt: null },
    { id: 't6', title: 'Pricing table', done: false, createdAt: null },
    { id: 't7', title: 'Footer links', done: false, createdAt: null },
  ],
  'p-app': [
    { id: 't8', title: 'Empty states', done: false, createdAt: null },
    { id: 't9', title: 'Haptics on check-in', done: true, createdAt: null },
    { id: 't10', title: 'Tablet sidebar', done: false, createdAt: null },
  ],
  'p-ops': [
    { id: 't11', title: 'Rotate keys', done: false, createdAt: null },
    { id: 't12', title: 'Archive last quarter', done: false, createdAt: null },
  ],
  'p-research': [{ id: 't13', title: 'Five customer calls', done: false, createdAt: null }],
};

export function getDemoDocuments(uid: string): DemoPayload {
  return {
    collections: {
      projects: DEMO_PROJECTS.map((project) => ({ ...project, ownerId: uid, memberIds: [uid] })),
    },
  };
}
