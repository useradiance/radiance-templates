import { appEvents } from '@/lib/events';
import { logger, serializeError } from '@/lib/logger';

describe('logger', () => {
  it('exposes leveled methods', () => {
    expect(typeof logger.debug).toBe('function');
    expect(typeof logger.info).toBe('function');
    expect(typeof logger.warn).toBe('function');
    expect(typeof logger.error).toBe('function');
  });

  it('serializes Error instances with optional Firebase code', () => {
    const error = Object.assign(new Error('permission denied'), { code: 'permission-denied' });
    expect(serializeError(error)).toMatchObject({
      name: 'Error',
      message: 'permission denied',
      code: 'permission-denied',
    });
  });
});

describe('appEvents', () => {
  it('emits and receives typed events', () => {
    const handler = jest.fn();
    appEvents.on('LogOut', handler);
    appEvents.emit('LogOut', { reason: 'test' });
    expect(handler).toHaveBeenCalledWith({ reason: 'test' });
    appEvents.off('LogOut', handler);
  });
});
