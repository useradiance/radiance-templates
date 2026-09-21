import {
  addDoc,
  collection,
  doc,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';

import { getDb } from '@/lib/firestore';
import { tokenizeForSearch } from '@/lib/search';

export type ArticleStatus = 'draft' | 'published';

export type Article = {
  id: string;
  title: string;
  excerpt: string;
  body: string;
  coverUrl?: string | null;
  nameLower: string;
  status: ArticleStatus;
  authorId?: string | null;
  authorName?: string | null;
  publishedAt?: { seconds: number } | null;
  updatedAt?: { seconds: number } | null;
  readMinutes?: number | null;
};

export function articlesQuery() {
  return query(
    collection(getDb(), 'articles'),
    where('status', '==', 'published'),
    orderBy('publishedAt', 'desc'),
  );
}

export function myArticlesQuery(authorId: string) {
  return query(
    collection(getDb(), 'articles'),
    where('authorId', '==', authorId),
    orderBy('updatedAt', 'desc'),
  );
}

export async function saveArticle(input: {
  title: string;
  excerpt: string;
  body: string;
  coverUrl?: string | null;
  authorId: string;
  authorName?: string | null;
  status: ArticleStatus;
}): Promise<string> {
  const title = input.title.trim();
  const now = serverTimestamp();
  const ref = await addDoc(collection(getDb(), 'articles'), {
    title,
    excerpt: input.excerpt.trim(),
    body: input.body.trim(),
    coverUrl: input.coverUrl ?? null,
    nameLower: title.toLowerCase(),
    searchKeywords: tokenizeForSearch(`${title} ${input.excerpt} ${input.body}`),
    status: input.status,
    authorId: input.authorId,
    authorName: input.authorName ?? null,
    readMinutes: Math.max(1, Math.round(input.body.trim().split(/\s+/).length / 200)),
    updatedAt: now,
    publishedAt: input.status === 'published' ? now : null,
    createdAt: now,
  });
  return ref.id;
}

export async function setArticleStatus(articleId: string, status: ArticleStatus): Promise<void> {
  await updateDoc(doc(getDb(), 'articles', articleId), {
    status,
    updatedAt: serverTimestamp(),
    ...(status === 'published' ? { publishedAt: serverTimestamp() } : {}),
  });
}
