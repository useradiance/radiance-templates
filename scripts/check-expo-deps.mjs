#!/usr/bin/env node
/**
 * Fail when catalogue npm pins disagree with Expo's bundledNativeModules.json.
 *
 * Refresh `scripts/bundled-native-modules.json` from
 * `node_modules/expo/bundledNativeModules.json` whenever the scaffold Expo SDK bumps.
 *
 * Packages not in the snapshot (firebase, MMKV, @react-native-firebase/*) are ignored.
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const defaultRoot = join(here, '..');
const defaultSnapshotPath = join(here, 'bundled-native-modules.json');

/**
 * First integer in a semver range (`~57.0.4` → 57, `^15.0.2` → 15, `0.86.2` → 0).
 * @param {string} range
 * @returns {number | null}
 */
export function rangeMajor(range) {
  const match = String(range).match(/(\d+)/);
  if (!match) return null;
  return Number(match[1]);
}

/**
 * @param {Record<string, string> | undefined} deps
 * @param {string} source
 * @returns {{ name: string, range: string, source: string }[]}
 */
export function collectPinsFromDeps(deps, source) {
  if (!deps || typeof deps !== 'object') return [];
  return Object.entries(deps)
    .filter(([, range]) => typeof range === 'string')
    .map(([name, range]) => ({ name, range, source }));
}

/**
 * @param {Record<string, unknown>} manifest
 * @param {string} relPath
 */
export function collectPinsFromManifest(manifest, relPath) {
  const pins = [
    ...collectPinsFromDeps(/** @type {Record<string, string>} */ (manifest.dependencies), relPath),
    ...collectPinsFromDeps(
      /** @type {Record<string, string>} */ (manifest.devDependencies),
      `${relPath} devDependencies`,
    ),
  ];

  const bindings = manifest.optionBindings;
  if (!bindings || typeof bindings !== 'object') return pins;

  for (const [option, choices] of Object.entries(
    /** @type {Record<string, Record<string, { dependencies?: Record<string, string>, devDependencies?: Record<string, string> }>>} */ (
      bindings
    ),
  )) {
    if (!choices || typeof choices !== 'object') continue;
    for (const [choice, binding] of Object.entries(choices)) {
      if (!binding || typeof binding !== 'object') continue;
      pins.push(
        ...collectPinsFromDeps(
          binding.dependencies,
          `${relPath} optionBindings.${option}.${choice}`,
        ),
        ...collectPinsFromDeps(
          binding.devDependencies,
          `${relPath} optionBindings.${option}.${choice} devDependencies`,
        ),
      );
    }
  }

  return pins;
}

/**
 * @param {{ name: string, range: string, source: string }[]} pins
 * @param {Record<string, string>} snapshot
 * @param {number} expoSdk
 * @returns {string[]}
 */
export function findMismatches(pins, snapshot, expoSdk) {
  const errors = [];
  for (const pin of pins) {
    const expected = snapshot[pin.name];
    if (expected == null) continue;
    const got = rangeMajor(pin.range);
    const want = rangeMajor(expected);
    if (got == null || want == null) {
      errors.push(
        `${pin.source}: ${pin.name} ${pin.range} — cannot parse major (expected ${expected})`,
      );
      continue;
    }
    if (got !== want) {
      errors.push(
        `${pin.source}: ${pin.name} ${pin.range} does not match Expo SDK ${expoSdk} (expected ${expected})`,
      );
    }
  }
  return errors;
}

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function listDirs(path) {
  return readdirSync(path)
    .filter((entry) => !entry.startsWith('.') && statSync(join(path, entry)).isDirectory())
    .sort();
}

/**
 * Collect every catalogue pin that must match the Expo snapshot.
 * @param {string} root
 */
export function collectCataloguePins(root) {
  /** @type {{ name: string, range: string, source: string }[]} */
  const pins = [];

  const scaffoldPkg = join(root, 'scaffold/expo-app/package.json');
  if (existsSync(scaffoldPkg)) {
    const pkg = readJson(scaffoldPkg);
    pins.push(
      ...collectPinsFromDeps(pkg.dependencies, 'scaffold/expo-app/package.json'),
      ...collectPinsFromDeps(pkg.devDependencies, 'scaffold/expo-app/package.json devDependencies'),
    );
  }

  const modulesDir = join(root, 'modules');
  if (!existsSync(modulesDir)) return pins;

  for (const id of listDirs(modulesDir)) {
    const relPath = `modules/${id}/module.json`;
    const manifestPath = join(root, relPath);
    if (!existsSync(manifestPath)) continue;
    pins.push(...collectPinsFromManifest(readJson(manifestPath), relPath));
  }

  return pins;
}

/**
 * @param {string} [root]
 * @param {string} [snapshotPath]
 */
export function assertExpoDeps(root = defaultRoot, snapshotPath = defaultSnapshotPath) {
  const scaffold = readJson(join(root, 'scaffold/expo-app/scaffold.json'));
  const expoSdk = Number(scaffold.expoSdk);
  const snapshot = readJson(snapshotPath);
  const errors = findMismatches(collectCataloguePins(root), snapshot, expoSdk);
  if (errors.length > 0) {
    throw new Error(
      `Expo SDK ${expoSdk} dependency pins do not match bundled-native-modules.json.\n` +
        `Refresh the snapshot from node_modules/expo/bundledNativeModules.json when bumping SDK.\n` +
        errors.map((line) => `  - ${line}`).join('\n'),
    );
  }
}

function isMain() {
  const entry = process.argv[1];
  if (!entry) return false;
  return import.meta.url === pathToFileURL(resolve(entry)).href;
}

if (isMain()) {
  try {
    assertExpoDeps();
    console.log('Expo SDK dependency pins match bundled-native-modules.json.');
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}
