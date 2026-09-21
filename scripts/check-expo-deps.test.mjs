import assert from 'node:assert/strict';
import { dirname, join } from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

import {
  assertExpoDeps,
  collectPinsFromManifest,
  findMismatches,
  rangeMajor,
} from './check-expo-deps.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

describe('rangeMajor', () => {
  it('reads the first integer from common range syntax', () => {
    assert.equal(rangeMajor('~57.0.4'), 57);
    assert.equal(rangeMajor('^15.0.2'), 15);
    assert.equal(rangeMajor('0.86.2'), 0);
    assert.equal(rangeMajor('2.2.0'), 2);
  });

  it('returns null when there is no digit', () => {
    assert.equal(rangeMajor('*'), null);
    assert.equal(rangeMajor('workspace:'), null);
  });
});

describe('findMismatches', () => {
  const snapshot = { 'expo-camera': '~57.0.4', 'expo-font': '~57.0.3' };

  it('rejects expo-camera ~17.0.10 against the SDK 57 snapshot', () => {
    const errors = findMismatches(
      [
        {
          name: 'expo-camera',
          range: '~17.0.10',
          source: 'modules/barcode/module.json',
        },
      ],
      snapshot,
      57,
    );
    assert.equal(errors.length, 1);
    assert.match(errors[0], /modules\/barcode\/module\.json: expo-camera ~17\.0\.10/);
    assert.match(errors[0], /Expo SDK 57 \(expected ~57\.0\.4\)/);
  });

  it('accepts the current SDK 57 camera pin', () => {
    const errors = findMismatches(
      [
        {
          name: 'expo-camera',
          range: '~57.0.4',
          source: 'modules/barcode/module.json',
        },
      ],
      snapshot,
      57,
    );
    assert.deepEqual(errors, []);
  });

  it('ignores packages that are not in the snapshot', () => {
    const errors = findMismatches(
      [
        {
          name: '@react-native-firebase/app',
          range: '^26.1.0',
          source: 'modules/analytics/module.json',
        },
      ],
      snapshot,
      57,
    );
    assert.deepEqual(errors, []);
  });
});

describe('collectPinsFromManifest', () => {
  it('includes optionBinding dependencies', () => {
    const pins = collectPinsFromManifest(
      {
        dependencies: { 'expo-localization': '~57.0.1' },
        optionBindings: {
          providers: {
            google: {
              dependencies: { 'expo-auth-session': '~57.0.6' },
            },
          },
        },
      },
      'modules/auth/module.json',
    );
    assert.ok(pins.some((pin) => pin.name === 'expo-localization'));
    assert.ok(
      pins.some(
        (pin) =>
          pin.name === 'expo-auth-session' &&
          pin.source.includes('optionBindings.providers.google'),
      ),
    );
  });
});

describe('assertExpoDeps', () => {
  it('passes the current catalogue against the vendored snapshot', () => {
    assert.doesNotThrow(() => assertExpoDeps(root));
  });
});
