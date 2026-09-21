import mitt from 'mitt';

/**
 * Cross-cutting app events. Prefer these over prop-drilling for auth logout,
 * sync failures, and deep-link navigation requests.
 */
export type AppEvents = {
  LogOut: { reason?: string };
  SyncError: { message: string };
  DeepLink: { path: string };
};

export const appEvents = mitt<AppEvents>();
