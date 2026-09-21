type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LEVEL_ORDER: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

const minLevel: LogLevel = __DEV__ ? 'debug' : 'info';

function shouldLog(level: LogLevel): boolean {
  return LEVEL_ORDER[level] >= LEVEL_ORDER[minLevel];
}

/** Flatten Errors (incl. Firebase `code`) so console output is actually useful. */
export function serializeError(error: unknown): unknown {
  if (error instanceof Error) {
    const withCode = error as Error & { code?: string; customData?: unknown };
    return {
      name: error.name,
      message: error.message,
      ...(withCode.code ? { code: withCode.code } : {}),
      ...(withCode.customData !== undefined ? { customData: withCode.customData } : {}),
      ...(__DEV__ && error.stack ? { stack: error.stack } : {}),
    };
  }
  if (error !== null && typeof error === 'object') return error;
  return { value: error };
}

function write(level: LogLevel, message: string, meta?: unknown): void {
  if (!shouldLog(level)) return;
  const prefix = `[radiance:${level}]`;
  const payload = meta === undefined ? undefined : serializeError(meta);
  if (payload === undefined) {
    // eslint-disable-next-line no-console
    console[level === 'debug' ? 'log' : level](prefix, message);
    return;
  }
  // eslint-disable-next-line no-console
  console[level === 'debug' ? 'log' : level](prefix, message, payload);
}

export const logger = {
  debug: (message: string, meta?: unknown) => write('debug', message, meta),
  info: (message: string, meta?: unknown) => write('info', message, meta),
  warn: (message: string, meta?: unknown) => write('warn', message, meta),
  error: (message: string, meta?: unknown) => write('error', message, meta),
};
