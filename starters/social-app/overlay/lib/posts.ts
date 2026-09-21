import {
  collection,
  deleteDoc,
  doc,
  increment,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
  type DocumentReference,
  type Query,
  type Timestamp,
} from 'firebase/firestore';

import { getDb } from '@/lib/firestore';
import { createLocalId } from '@/lib/optimistic';
import { tokenizeForSearch } from '@/lib/search';

export const POSTS_COLLECTION = 'posts';
export const FEED_PAGE_SIZE = 50;

export type Post = {
  id: string;
  authorId: string;
  authorName: string | null;
  authorPhotoURL: string | null;
  text: string;
  imageUrl: string | null;
  likeCount: number;
  commentCount?: number;
  createdAt: Timestamp | null;
};

export type NewPostInput = {
  authorId: string;
  authorName: string | null;
  authorPhotoURL: string | null;
  text: string;
  imageUrl: string | null;
};

export type PostLike = {
  userId: string;
};

export function postRef(postId: string): DocumentReference<Post> {
  return doc(getDb(), POSTS_COLLECTION, postId) as DocumentReference<Post>;
}

export function postLikeRef(postId: string, userId: string): DocumentReference<PostLike> {
  return doc(getDb(), POSTS_COLLECTION, postId, 'likes', userId) as DocumentReference<PostLike>;
}

export function feedQuery(): Query<Post> {
  return query(
    collection(getDb(), POSTS_COLLECTION),
    orderBy('createdAt', 'desc'),
    limit(FEED_PAGE_SIZE),
  ) as Query<Post>;
}

export function authorPostsQuery(authorId: string): Query<Post> {
  return query(
    collection(getDb(), POSTS_COLLECTION),
    where('authorId', '==', authorId),
    limit(FEED_PAGE_SIZE),
  ) as Query<Post>;
}

export function sortPostsNewestFirst<T extends Pick<Post, 'id' | 'createdAt'>>(posts: T[]): T[] {
  return [...posts].sort((a, b) => {
    const aTime = a.createdAt?.seconds ?? 0;
    const bTime = b.createdAt?.seconds ?? 0;
    return bTime !== aTime ? bTime - aTime : b.id.localeCompare(a.id);
  });
}

export function createPost(input: NewPostInput): { id: string; write: () => Promise<void> } {
  const id = createLocalId();

  const write = async () => {
    await setDoc(doc(getDb(), POSTS_COLLECTION, id), {
      ...input,
      text: input.text.trim(),
      likeCount: 0,
      commentCount: 0,
      searchKeywords: tokenizeForSearch(`${input.text} ${input.authorName ?? ''}`),
      createdAt: serverTimestamp(),
    });
  };

  return { id, write };
}

export async function deletePost(postId: string): Promise<void> {
  await deleteDoc(doc(getDb(), POSTS_COLLECTION, postId));
}

/**
 * Likes are stored as a document per user so the rules can enforce one vote each, with a
 * denormalised counter on the post for cheap reads.
 */
export async function setLike(postId: string, userId: string, liked: boolean): Promise<void> {
  const likeRef = doc(getDb(), POSTS_COLLECTION, postId, 'likes', userId);
  const ref = doc(getDb(), POSTS_COLLECTION, postId);

  if (liked) {
    await setDoc(likeRef, { userId, createdAt: serverTimestamp() });
  } else {
    await deleteDoc(likeRef);
  }

  await setDoc(ref, { likeCount: increment(liked ? 1 : -1) }, { merge: true });
}
