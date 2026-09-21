/**
 * Shared helpers for `dev-start.mjs` and unit tests. Matches `lib/env.ts`
 * (master switch + per-product `"false"` opt-out).
 */
import { existsSync } from 'node:fs';
import { join } from 'node:path';

/** @typedef {Record<string, string | undefined>} EnvMap */

export const EMULATOR_PRODUCTS = /** @type {const} */ ([
  'auth',
  'firestore',
  'functions',
  'storage',
]);

const PRODUCT_ENV_KEYS = {
  auth: 'EXPO_PUBLIC_EMULATOR_AUTH',
  firestore: 'EXPO_PUBLIC_EMULATOR_FIRESTORE',
  functions: 'EXPO_PUBLIC_EMULATOR_FUNCTIONS',
  storage: 'EXPO_PUBLIC_EMULATOR_STORAGE',
};

/**
 * Parse a dotenv-style file into a flat map. Does not expand variables or quotes
 * beyond stripping matching single/double quotes around a value.
 *
 * @param {string} content
 * @returns {EnvMap}
 */
export function parseEnvFile(content) {
  /** @type {EnvMap} */
  const env = {};
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq <= 0) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}

/**
 * Merge process env over a parsed `.env` file (process wins, matching Expo).
 *
 * @param {EnvMap} fileEnv
 * @param {EnvMap} [processEnv]
 * @returns {EnvMap}
 */
export function mergeEnv(fileEnv, processEnv = process.env) {
  return { ...fileEnv, ...processEnv };
}

/**
 * Products that should be running for the current emulator flags.
 * Empty when the master switch is off.
 *
 * @param {EnvMap} env
 * @returns {typeof EMULATOR_PRODUCTS[number][]}
 */
export function resolveEmulatorProducts(env) {
  if (env.EXPO_PUBLIC_USE_FIREBASE_EMULATORS !== 'true') return [];

  /** @type {typeof EMULATOR_PRODUCTS[number][]} */
  const products = [];
  for (const product of EMULATOR_PRODUCTS) {
    const flag = env[PRODUCT_ENV_KEYS[product]];
    if (flag === 'false') continue;
    products.push(product);
  }
  return products;
}

/**
 * Default emulator host ports (overridable via `firebase.json` → `emulators`).
 */
export const DEFAULT_EMULATOR_PORTS = {
  auth: 9099,
  firestore: 8080,
  functions: 5001,
  storage: 9199,
  ui: 4000,
};

/**
 * @param {unknown} firebaseJson
 * @param {readonly string[]} products
 * @returns {Record<string, number>}
 */
export function resolveEmulatorPorts(firebaseJson, products) {
  /** @type {Record<string, number>} */
  const ports = {};
  const emulators =
    firebaseJson &&
    typeof firebaseJson === 'object' &&
    'emulators' in firebaseJson &&
    firebaseJson.emulators &&
    typeof firebaseJson.emulators === 'object'
      ? /** @type {Record<string, { port?: number }>} */ (firebaseJson.emulators)
      : {};

  for (const product of products) {
    const configured = emulators[product]?.port;
    const fallback =
      DEFAULT_EMULATOR_PORTS[/** @type {keyof typeof DEFAULT_EMULATOR_PORTS} */ (product)];
    if (typeof configured === 'number') ports[product] = configured;
    else if (typeof fallback === 'number') ports[product] = fallback;
  }
  return ports;
}

/**
 * Whether firebase.json's Storage rules path exists. `firebase emulators:start`
 * fails hard if `storage.rules` / `storage.emulator.rules` is missing
 * (starters without the storage module never get the emulator rules file).
 *
 * @param {string} root
 * @param {unknown} firebaseJson
 * @returns {boolean}
 */
export function storageEmulatorRulesExist(root, firebaseJson) {
  const rules =
    firebaseJson &&
    typeof firebaseJson === 'object' &&
    'storage' in firebaseJson &&
    firebaseJson.storage &&
    typeof firebaseJson.storage === 'object' &&
    'rules' in firebaseJson.storage &&
    typeof (/** @type {{ rules?: unknown }} */ (firebaseJson.storage).rules) === 'string'
      ? /** @type {{ rules: string }} */ (firebaseJson.storage).rules.trim()
      : '';
  if (!rules) return false;
  return existsSync(join(root, rules));
}
