import {
  collection,
  deleteDoc,
  doc,
  query,
  serverTimestamp,
  setDoc,
  where,
  type DocumentReference,
  type Query,
} from 'firebase/firestore';

import { getDb } from '@/lib/firestore';

export const FOLLOWS_COLLECTION = 'follows';

export type Follow = {
  id: string;
  followerId: string;
  followeeId: string;
  createdAt?: unknown;
};

export type Relation = 'self' | 'friends' | 'following' | 'follower' | 'none';

export function followDocId(followerId: string, followeeId: string): string {
  return `${followerId}_${followeeId}`;
}

export function followRef(followerId: string, followeeId: string): DocumentReference<Follow> {
  return doc(
    getDb(),
    FOLLOWS_COLLECTION,
    followDocId(followerId, followeeId),
  ) as DocumentReference<Follow>;
}

export function followingQuery(uid: string): Query<Follow> {
  return query(
    collection(getDb(), FOLLOWS_COLLECTION),
    where('followerId', '==', uid),
  ) as Query<Follow>;
}

export function followersQuery(uid: string): Query<Follow> {
  return query(
    collection(getDb(), FOLLOWS_COLLECTION),
    where('followeeId', '==', uid),
  ) as Query<Follow>;
}

export async function setFollow(
  followerId: string,
  followeeId: string,
  following: boolean,
): Promise<void> {
  if (followerId === followeeId) return;
  const ref = followRef(followerId, followeeId);
  if (following) {
    await setDoc(ref, { followerId, followeeId, createdAt: serverTimestamp() } as Follow);
  } else {
    await deleteDoc(ref);
  }
}

export function followeeIds(follows: Follow[]): Set<string> {
  return new Set(follows.map((item) => item.followeeId));
}

export function followerIds(follows: Follow[]): Set<string> {
  return new Set(follows.map((item) => item.followerId));
}

export function mutualIds(following: Follow[], followers: Follow[]): string[] {
  const incoming = followerIds(followers);
  return [...followeeIds(following)].filter((id) => incoming.has(id));
}

export function relationTo(
  uid: string,
  otherId: string,
  following: Set<string>,
  followers: Set<string>,
): Relation {
  if (uid === otherId) return 'self';
  const isFollowing = following.has(otherId);
  const isFollower = followers.has(otherId);
  if (isFollowing && isFollower) return 'friends';
  if (isFollowing) return 'following';
  if (isFollower) return 'follower';
  return 'none';
}
