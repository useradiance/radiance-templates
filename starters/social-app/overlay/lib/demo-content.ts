import type { DemoPayload } from '@/lib/demo-types';
import type { Post } from '@/lib/posts';

type Person = {
  id: string;
  displayName: string;
  bio: string;
};

export const DEMO_PEOPLE: Person[] = [
  { id: 'demo-maya', displayName: 'Maya Chen', bio: 'Chasing light between errands.' },
  { id: 'demo-jordan', displayName: 'Jordan Hale', bio: 'Coffee first. Then the city.' },
  { id: 'demo-priya', displayName: 'Priya Nair', bio: 'Weekends are for dirt paths.' },
  { id: 'demo-alex', displayName: 'Alex Rivera', bio: 'Design, type, and quiet streets.' },
  { id: 'demo-sam', displayName: 'Sam Okonkwo', bio: 'If it is edible, I will photograph it.' },
];

function avatarUrl(name: string): string {
  return `https://api.dicebear.com/9.x/lorelei/png?seed=${encodeURIComponent(name)}&size=128`;
}

function photo(seed: string): string {
  return `https://picsum.photos/seed/${seed}/1200/900`;
}

export const DEMO_POSTS: Post[] = [
  {
    id: 'demo-maya-dawn',
    authorId: 'demo-maya',
    authorName: 'Maya Chen',
    authorPhotoURL: avatarUrl('Maya Chen'),
    text: 'First light over the river. Worth the early alarm.',
    imageUrl: photo('radiance-maya-dawn'),
    likeCount: 4,
    commentCount: 2,
    createdAt: null,
  },
  {
    id: 'demo-jordan-pour',
    authorId: 'demo-jordan',
    authorName: 'Jordan Hale',
    authorPhotoURL: avatarUrl('Jordan Hale'),
    text: 'The new place on Oak does a quieter pour-over. I am ruined for anywhere else.',
    imageUrl: photo('radiance-jordan-pour'),
    likeCount: 2,
    commentCount: 1,
    createdAt: null,
  },
  {
    id: 'demo-priya-ridge',
    authorId: 'demo-priya',
    authorName: 'Priya Nair',
    authorPhotoURL: avatarUrl('Priya Nair'),
    text: 'Ridge loop in 90 minutes. Bring water, leave the headphones.',
    imageUrl: photo('radiance-priya-ridge'),
    likeCount: 3,
    commentCount: 1,
    createdAt: null,
  },
  {
    id: 'demo-alex-type',
    authorId: 'demo-alex',
    authorName: 'Alex Rivera',
    authorPhotoURL: avatarUrl('Alex Rivera'),
    text: 'Still thinking about that bookshop window. Someone kerned the poster by hand.',
    imageUrl: null,
    likeCount: 2,
    commentCount: 1,
    createdAt: null,
  },
  {
    id: 'demo-sam-bowl',
    authorId: 'demo-sam',
    authorName: 'Sam Okonkwo',
    authorPhotoURL: avatarUrl('Sam Okonkwo'),
    text: 'Lunch was a bowl and a lecture from the chef. Both excellent.',
    imageUrl: photo('radiance-sam-bowl'),
    likeCount: 3,
    commentCount: 1,
    createdAt: null,
  },
  {
    id: 'demo-maya-studio',
    authorId: 'demo-maya',
    authorName: 'Maya Chen',
    authorPhotoURL: avatarUrl('Maya Chen'),
    text: 'Studio floor, leftover gaffer tape, and a plant that is trying its best.',
    imageUrl: photo('radiance-maya-studio'),
    likeCount: 1,
    commentCount: 0,
    createdAt: null,
  },
];

function person(id: string): Person {
  const found = DEMO_PEOPLE.find((entry) => entry.id === id);
  if (!found) throw new Error(`unknown demo person ${id}`);
  return found;
}

function follow(followerId: string, followeeId: string) {
  return {
    id: `${followerId}_${followeeId}`,
    followerId,
    followeeId,
  };
}

/**
 * Five people, a handful of posts, comments, likes, and a follow graph that includes
 * the signed-in user so Home / People / Profile are not empty after --demo.
 */
export function getDemoDocuments(uid: string): DemoPayload {
  const maya = person('demo-maya');
  const jordan = person('demo-jordan');
  const priya = person('demo-priya');
  const alex = person('demo-alex');
  const sam = person('demo-sam');

  const posts = [
    {
      id: 'demo-maya-dawn',
      author: maya,
      text: 'First light over the river. Worth the early alarm.',
      image: 'radiance-maya-dawn',
    },
    {
      id: 'demo-jordan-pour',
      author: jordan,
      text: 'The new place on Oak does a quieter pour-over. I am ruined for anywhere else.',
      image: 'radiance-jordan-pour',
    },
    {
      id: 'demo-priya-ridge',
      author: priya,
      text: 'Ridge loop in 90 minutes. Bring water, leave the headphones.',
      image: 'radiance-priya-ridge',
    },
    {
      id: 'demo-alex-type',
      author: alex,
      text: 'Still thinking about that bookshop window. Someone kerned the poster by hand.',
      image: null,
    },
    {
      id: 'demo-sam-bowl',
      author: sam,
      text: 'Lunch was a bowl and a lecture from the chef. Both excellent.',
      image: 'radiance-sam-bowl',
    },
    {
      id: 'demo-maya-studio',
      author: maya,
      text: 'Studio floor, leftover gaffer tape, and a plant that is trying its best.',
      image: 'radiance-maya-studio',
    },
    {
      id: 'demo-jordan-night',
      author: jordan,
      text: 'City after rain. Reflections do half the composition for you.',
      image: 'radiance-jordan-night',
    },
    {
      id: 'demo-alex-desk',
      author: alex,
      text: 'One good typeface and a clean desk. That is the whole mood board.',
      image: 'radiance-alex-desk',
    },
  ];

  const comments = [
    {
      id: 'demo-c-jordan-dawn',
      parentPath: 'posts/demo-maya-dawn',
      authorId: jordan.id,
      authorName: jordan.displayName,
      text: 'The colour on the water is unreal. What time were you out?',
    },
    {
      id: 'demo-c-priya-dawn',
      parentPath: 'posts/demo-maya-dawn',
      authorId: priya.id,
      authorName: priya.displayName,
      text: 'Saving this for the next sunrise walk.',
    },
    {
      id: 'demo-c-maya-pour',
      parentPath: 'posts/demo-jordan-pour',
      authorId: maya.id,
      authorName: maya.displayName,
      text: 'Taking notes. Saturday?',
    },
    {
      id: 'demo-c-sam-ridge',
      parentPath: 'posts/demo-priya-ridge',
      authorId: sam.id,
      authorName: sam.displayName,
      text: 'Packing extra snacks and joining next week.',
    },
    {
      id: 'demo-c-jordan-type',
      parentPath: 'posts/demo-alex-type',
      authorId: jordan.id,
      authorName: jordan.displayName,
      text: 'That window stopped me too. The gold foil caught the streetlight.',
    },
    {
      id: 'demo-c-you-bowl',
      parentPath: 'posts/demo-sam-bowl',
      authorId: uid,
      authorName: 'You',
      text: 'Save me a seat next time.',
    },
  ];

  const likesByPost: Record<string, string[]> = {
    'demo-maya-dawn': [jordan.id, priya.id, alex.id, uid],
    'demo-jordan-pour': [maya.id, sam.id],
    'demo-priya-ridge': [sam.id, jordan.id, uid],
    'demo-alex-type': [maya.id, jordan.id],
    'demo-sam-bowl': [priya.id, maya.id, jordan.id],
    'demo-maya-studio': [alex.id],
    'demo-jordan-night': [maya.id, priya.id, sam.id],
    'demo-alex-desk': [jordan.id, uid],
  };

  const commentCountByPost: Record<string, number> = {};
  for (const comment of comments) {
    const postId = comment.parentPath.replace(/^posts\//, '');
    commentCountByPost[postId] = (commentCountByPost[postId] ?? 0) + 1;
  }

  return {
    collections: {
      users: DEMO_PEOPLE.map((entry) => ({
        id: entry.id,
        uid: entry.id,
        displayName: entry.displayName,
        nameLower: entry.displayName.toLowerCase(),
        photoURL: avatarUrl(entry.displayName),
        bio: entry.bio,
        email: null,
        providerIds: [],
        isAnonymous: false,
      })),
      posts: posts.map((post) => ({
        id: post.id,
        authorId: post.author.id,
        authorName: post.author.displayName,
        authorPhotoURL: avatarUrl(post.author.displayName),
        text: post.text,
        imageUrl: post.image ? photo(post.image) : null,
        likeCount: likesByPost[post.id]?.length ?? 0,
        commentCount: commentCountByPost[post.id] ?? 0,
        searchKeywords: post.text
          .toLowerCase()
          .split(/[^a-z0-9]+/)
          .filter((token) => token.length >= 2),
      })),
      comments: comments.map((comment) => ({
        id: comment.id,
        parentPath: comment.parentPath,
        authorId: comment.authorId,
        authorName: comment.authorName,
        text: comment.text,
      })),
      follows: [
        follow(uid, maya.id),
        follow(uid, jordan.id),
        follow(uid, priya.id),
        follow(maya.id, uid),
        follow(jordan.id, uid),
        follow(alex.id, uid),
        follow(sam.id, uid),
        follow(maya.id, jordan.id),
        follow(jordan.id, priya.id),
        follow(priya.id, maya.id),
        follow(alex.id, maya.id),
        follow(sam.id, jordan.id),
        follow(sam.id, priya.id),
      ],
    },
    nested: Object.entries(likesByPost).flatMap(([postId, userIds]) =>
      userIds.map((userId) => ({
        parent: 'posts',
        parentId: postId,
        subcollection: 'likes',
        id: userId,
        userId,
      })),
    ),
  };
}
