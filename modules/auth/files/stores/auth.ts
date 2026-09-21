import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInAnonymously,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  type User,
} from 'firebase/auth';
import { create } from 'zustand';

import { getFirebaseAuth } from '@/lib/auth';
import { authErrorKey } from '@/lib/auth-errors';
import { appEvents } from '@/lib/events';
import { logger } from '@/lib/logger';

export type AuthUser = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  isAnonymous: boolean;
  providerIds: string[];
};

type AuthState = {
  user: AuthUser | null;
  /** True until Firebase reports the restored session — route guards wait on this. */
  isInitializing: boolean;
  isSubmitting: boolean;
  /** Translation key for the last failure, or null. */
  errorKey: string | null;

  subscribe: () => () => void;
  clearError: () => void;
  signInWithEmail: (email: string, password: string) => Promise<boolean>;
  signUpWithEmail: (email: string, password: string, displayName?: string) => Promise<boolean>;
  signInAsGuest: () => Promise<boolean>;
  sendPasswordReset: (email: string) => Promise<boolean>;
  resendVerificationEmail: () => Promise<boolean>;
  signOut: () => Promise<void>;
};

function toAuthUser(user: User): AuthUser {
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    emailVerified: user.emailVerified,
    isAnonymous: user.isAnonymous,
    providerIds: user.providerData.map((profile) => profile.providerId),
  };
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isInitializing: true,
  isSubmitting: false,
  errorKey: null,

  subscribe: () =>
    onAuthStateChanged(getFirebaseAuth(), (user) => {
      set({ user: user ? toAuthUser(user) : null, isInitializing: false });
    }),

  clearError: () => set({ errorKey: null }),

  signInWithEmail: async (email, password) => {
    set({ isSubmitting: true, errorKey: null });
    try {
      await signInWithEmailAndPassword(getFirebaseAuth(), email.trim(), password);
      return true;
    } catch (error) {
      set({ errorKey: authErrorKey(error) });
      return false;
    } finally {
      set({ isSubmitting: false });
    }
  },

  signUpWithEmail: async (email, password, displayName) => {
    set({ isSubmitting: true, errorKey: null });
    try {
      const credential = await createUserWithEmailAndPassword(
        getFirebaseAuth(),
        email.trim(),
        password,
      );
      if (displayName?.trim()) {
        await updateProfile(credential.user, { displayName: displayName.trim() });
      }
      await sendEmailVerification(credential.user);
      set({ user: toAuthUser(credential.user) });
      return true;
    } catch (error) {
      set({ errorKey: authErrorKey(error) });
      return false;
    } finally {
      set({ isSubmitting: false });
    }
  },

  signInAsGuest: async () => {
    set({ isSubmitting: true, errorKey: null });
    try {
      await signInAnonymously(getFirebaseAuth());
      return true;
    } catch (error) {
      set({ errorKey: authErrorKey(error) });
      return false;
    } finally {
      set({ isSubmitting: false });
    }
  },

  sendPasswordReset: async (email) => {
    set({ isSubmitting: true, errorKey: null });
    try {
      await sendPasswordResetEmail(getFirebaseAuth(), email.trim());
      return true;
    } catch (error) {
      set({ errorKey: authErrorKey(error) });
      return false;
    } finally {
      set({ isSubmitting: false });
    }
  },

  resendVerificationEmail: async () => {
    const current = getFirebaseAuth().currentUser;
    if (!current) return false;
    try {
      await sendEmailVerification(current);
      return true;
    } catch (error) {
      set({ errorKey: authErrorKey(error) });
      return false;
    }
  },

  signOut: async () => {
    await firebaseSignOut(getFirebaseAuth());
    set({ user: null, errorKey: null });
    appEvents.emit('LogOut', { reason: 'user' });
    logger.info('signed out');
  },
}));

export function useCurrentUser(): AuthUser | null {
  return useAuthStore((state) => state.user);
}

export function requireUserId(): string {
  const uid = useAuthStore.getState().user?.uid;
  if (!uid) throw new Error('No authenticated user');
  return uid;
}
