import {
  connectFunctionsEmulator,
  getFunctions,
  httpsCallable,
  type Functions,
  type FunctionsError,
} from 'firebase/functions';

import type { CallableContracts } from '@/lib/callable-contracts';
import { emulatorHost, functionsEmulatorPort, useFunctionsEmulator } from '@/lib/env';
import { appEvents } from '@/lib/events';
import { getFirebaseApp } from '@/lib/firebase';
import { logger } from '@/lib/logger';

const DEFAULT_REGION = 'us-central1';

let functions: Functions | undefined;

export function getFunctionsInstance(): Functions {
  if (functions) return functions;

  functions = getFunctions(getFirebaseApp(), DEFAULT_REGION);

  if (useFunctionsEmulator) {
    connectFunctionsEmulator(functions, emulatorHost, functionsEmulatorPort);
  }

  return functions;
}

/** Backend error codes mapped to translation keys. Mirrors functions/src/lib/errors.ts. */
const ERROR_KEYS: Record<string, string> = {
  unauthenticated: 'api.errors.unauthenticated',
  'permission-denied': 'api.errors.permissionDenied',
  'invalid-argument': 'api.errors.invalidArgument',
  'not-found': 'errors.notFound',
  'already-exists': 'api.errors.alreadyExists',
  'resource-exhausted': 'api.errors.quotaExceeded',
  'failed-precondition': 'api.errors.failedPrecondition',
  unavailable: 'errors.network',
  'deadline-exceeded': 'errors.network',
  internal: 'errors.generic',
};

export class CallableError extends Error {
  readonly code: string;
  readonly translationKey: string;
  readonly details: unknown;

  constructor(error: FunctionsError) {
    super(error.message);
    this.name = 'CallableError';
    this.code = error.code.replace(/^functions\//, '');
    this.translationKey = ERROR_KEYS[this.code] ?? 'errors.generic';
    this.details = error.details;
  }
}

export type CallOptions = {
  /** Retries transient failures. Only enable for calls without side effects. */
  retries?: number;
  timeoutMs?: number;
};

function isRetryable(code: string): boolean {
  return code === 'unavailable' || code === 'deadline-exceeded' || code === 'internal';
}

/**
 * Calls a Cloud Function by name with typed request and response payloads.
 *
 * ```ts
 * const result = await call('ping', {});
 * ```
 */
export async function call<Name extends keyof CallableContracts>(
  name: Name,
  payload: CallableContracts[Name]['request'],
  options: CallOptions = {},
): Promise<CallableContracts[Name]['response']> {
  const { retries = 0, timeoutMs = 30_000 } = options;
  const callable = httpsCallable(getFunctionsInstance(), name as string, { timeout: timeoutMs });

  let attempt = 0;

  for (;;) {
    try {
      const result = await callable(payload);
      return result.data as CallableContracts[Name]['response'];
    } catch (error) {
      const callableError = new CallableError(error as FunctionsError);
      logger.warn(`callable ${String(name)} failed`, {
        code: callableError.code,
        attempt,
      });
      if (callableError.code === 'unauthenticated') {
        appEvents.emit('LogOut', { reason: 'callable-unauthenticated' });
      }
      if (attempt < retries && isRetryable(callableError.code)) {
        attempt += 1;
        await new Promise((resolve) => setTimeout(resolve, 2 ** attempt * 250));
        continue;
      }
      throw callableError;
    }
  }
}

export function callableErrorKey(error: unknown): string {
  return error instanceof CallableError ? error.translationKey : 'errors.generic';
}
