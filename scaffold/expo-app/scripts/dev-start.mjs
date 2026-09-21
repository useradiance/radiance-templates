#!/usr/bin/env node
/**
 * Dev entry used by `yarn start` / `android` / `ios` / `web`.
 *
 * Native always uses a local development build (Hermes via expo-dev-client), never Expo Go:
 * `yarn android` / `yarn ios` compile and launch; `yarn start` serves Metro with `--dev-client`.
 *
 * When `.env` enables Firebase emulators (free-plan Storage/Functions posture),
 * this boots the needed emulators alongside Expo so the app is not left talking
 * to dead localhost ports. Paid / cloud-only configs just run Expo.
 */
import { spawn } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { createConnection } from 'node:net';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  mergeEnv,
  parseEnvFile,
  resolveEmulatorPorts,
  resolveEmulatorProducts,
  storageEmulatorRulesExist,
} from './emulator-products.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const expoArgs = process.argv.slice(2);

const fileEnv = existsSync(join(root, '.env'))
  ? parseEnvFile(readFileSync(join(root, '.env'), 'utf8'))
  : {};
const env = mergeEnv(fileEnv);
const products = resolveEmulatorProducts(env);

// Install CocoaPods with live output before Firebase emulators share the terminal.
// Otherwise Expo's silent `pod install` can fail, hide the error under emulator logs,
// and retry with `pod install --repo-update` (looks hung; often cancelled with Ctrl+C).
if (expoArgs.includes('--ios') && process.platform === 'darwin') {
  if (!(await ensureIosPods(root))) {
    process.exit(1);
  }
}

if (products.length === 0) {
  process.exit(await runExpo(expoArgs));
}

const firebaseJson = readFirebaseJson(root);
const configured = products.filter((product) => {
  if (!isEmulatorConfigured(firebaseJson, product)) return false;
  if (product === 'storage' && !storageEmulatorRulesExist(root, firebaseJson)) {
    const rules =
      firebaseJson &&
      typeof firebaseJson === 'object' &&
      'storage' in firebaseJson &&
      firebaseJson.storage &&
      typeof firebaseJson.storage === 'object' &&
      'rules' in firebaseJson.storage
        ? String(/** @type {{ rules?: unknown }} */ (firebaseJson.storage).rules)
        : 'storage.rules';
    console.warn(
      `[radiance] Skipping Storage emulator — ${rules} is missing (install the storage module, or point firebase.json at storage.rules).`,
    );
    return false;
  }
  return true;
});
if (configured.length === 0) {
  console.warn(
    `[radiance] Emulators enabled in .env (${products.join(', ')}) but none are configured in firebase.json — starting Expo only.`,
  );
  process.exit(await runExpo(expoArgs));
}

const ports = resolveEmulatorPorts(firebaseJson, configured);
const alreadyUp = await allPortsListening(Object.values(ports));

if (configured.includes('functions')) {
  await ensureFunctionsBuilt(root);
}

if (alreadyUp) {
  console.log(
    `[radiance] Firebase emulators already running (${configured.join(', ')}); starting Expo.`,
  );
  process.exit(await runExpo(expoArgs));
}

console.log(`[radiance] Starting Firebase emulators (${configured.join(', ')})…`);
/** @type {import('node:child_process').ChildProcess | null} */
let emulators = null;
let emulatorsFailedToStart = false;

try {
  emulators = spawnPrefixed(
    'firebase',
    ['emulators:start', '--only', configured.join(',')],
    {
      cwd: root,
      env: process.env,
      shell: process.platform === 'win32',
      detached: process.platform !== 'win32',
    },
    '[emu] ',
  );
} catch (error) {
  emulatorsFailedToStart = true;
  console.warn(
    `[radiance] Could not start firebase: ${error instanceof Error ? error.message : error}`,
  );
}

if (emulators) {
  emulators.on('error', (error) => {
    emulatorsFailedToStart = true;
    console.warn(`[radiance] Could not start firebase: ${error.message}`);
    console.warn(
      '[radiance] Install firebase-tools (`npm i -g firebase-tools`) or run emulators separately.',
    );
  });
} else {
  emulatorsFailedToStart = true;
}

const ready =
  !emulatorsFailedToStart &&
  (await waitForPorts(Object.values(ports), {
    timeoutMs: 90_000,
    aborted: () => emulatorsFailedToStart || (emulators?.exitCode ?? null) !== null,
  }));

if (!ready) {
  console.warn(
    '[radiance] Emulators did not become ready — starting Expo anyway. Storage/Functions calls may fail.',
  );
  if (emulators) killProcessTree(emulators);
  process.exit(await runExpo(expoArgs));
}

console.log('[radiance] Emulators ready — starting Expo.');

const shutdown = () => {
  if (emulators) killProcessTree(emulators);
};
process.on('SIGINT', () => {
  shutdown();
  process.exit(130);
});
process.on('SIGTERM', () => {
  shutdown();
  process.exit(143);
});

const expoCode = await runExpo(expoArgs);
shutdown();
if (emulators) await waitForExit(emulators);
process.exit(expoCode);

/**
 * @param {string} cwd
 */
function readFirebaseJson(cwd) {
  const path = join(cwd, 'firebase.json');
  if (!existsSync(path)) return {};
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch {
    return {};
  }
}

/**
 * @param {unknown} firebaseJson
 * @param {string} product
 */
function isEmulatorConfigured(firebaseJson, product) {
  if (!firebaseJson || typeof firebaseJson !== 'object') return false;
  const emulators =
    'emulators' in firebaseJson &&
    firebaseJson.emulators &&
    typeof firebaseJson.emulators === 'object'
      ? /** @type {Record<string, unknown>} */ (firebaseJson.emulators)
      : {};
  return Object.prototype.hasOwnProperty.call(emulators, product);
}

/**
 * @param {number[]} ports
 */
async function allPortsListening(ports) {
  if (ports.length === 0) return false;
  const results = await Promise.all(ports.map((port) => isPortOpen(port)));
  return results.every(Boolean);
}

/**
 * @param {number[]} ports
 * @param {{ timeoutMs: number; aborted: () => boolean }} options
 */
async function waitForPorts(ports, options) {
  const deadline = Date.now() + options.timeoutMs;
  while (Date.now() < deadline) {
    if (options.aborted()) return false;
    if (await allPortsListening(ports)) return true;
    await sleep(500);
  }
  return false;
}

/**
 * @param {number} port
 * @returns {Promise<boolean>}
 */
function isPortOpen(port) {
  return new Promise((resolve) => {
    const socket = createConnection({ host: '127.0.0.1', port });
    socket.setTimeout(400);
    socket.once('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.once('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.once('error', () => {
      socket.destroy();
      resolve(false);
    });
  });
}

/**
 * @param {string} cwd
 */
async function ensureFunctionsBuilt(cwd) {
  const functionsDir = join(cwd, 'functions');
  const functionsPkg = join(functionsDir, 'package.json');
  if (!existsSync(functionsPkg)) return;

  const depsInstalled = existsSync(join(functionsDir, 'node_modules', 'firebase-functions'));
  if (!depsInstalled) {
    console.log('[radiance] Installing Cloud Functions dependencies…');
    const install = resolveFunctionsInstall(cwd);
    const installCode = await runCommand(install.command, install.args, cwd);
    if (installCode !== 0) {
      console.warn(
        '[radiance] functions install failed — run `yarn --cwd functions install` (or your package manager), then retry.',
      );
      return;
    }
  }

  console.log('[radiance] Building Cloud Functions for the emulator…');
  const build = resolveFunctionsScript(cwd, 'build');
  const code = await runCommand(build.command, build.args, cwd);
  if (code !== 0) {
    console.warn('[radiance] functions build failed — emulator may not serve callables.');
  }
}

/**
 * Prefer the lockfile / packageManager of the functions package, else the app root.
 * @param {string} cwd
 * @returns {'npm' | 'yarn' | 'pnpm' | 'bun'}
 */
function detectFunctionsPackageManager(cwd) {
  const functionsDir = join(cwd, 'functions');
  if (existsSync(join(functionsDir, 'yarn.lock')) || existsSync(join(cwd, 'yarn.lock'))) {
    return 'yarn';
  }
  if (existsSync(join(functionsDir, 'pnpm-lock.yaml')) || existsSync(join(cwd, 'pnpm-lock.yaml'))) {
    return 'pnpm';
  }
  if (
    existsSync(join(functionsDir, 'bun.lockb')) ||
    existsSync(join(functionsDir, 'bun.lock')) ||
    existsSync(join(cwd, 'bun.lockb')) ||
    existsSync(join(cwd, 'bun.lock'))
  ) {
    return 'bun';
  }
  if (
    existsSync(join(functionsDir, 'package-lock.json')) ||
    existsSync(join(cwd, 'package-lock.json'))
  ) {
    return 'npm';
  }
  // functions/package.json declares yarn; match that when no lockfile is present yet.
  return 'yarn';
}

/**
 * @param {string} cwd
 */
function resolveFunctionsInstall(cwd) {
  switch (detectFunctionsPackageManager(cwd)) {
    case 'npm':
      return { command: 'npm', args: ['install', '--prefix', 'functions'] };
    case 'pnpm':
      return { command: 'pnpm', args: ['--dir', 'functions', 'install'] };
    case 'bun':
      return { command: 'bun', args: ['--cwd', 'functions', 'install'] };
    case 'yarn':
    default:
      return { command: 'yarn', args: ['--cwd', 'functions', 'install'] };
  }
}

/**
 * @param {string} cwd
 * @param {string} script
 */
function resolveFunctionsScript(cwd, script) {
  switch (detectFunctionsPackageManager(cwd)) {
    case 'npm':
      return { command: 'npm', args: ['run', script, '--prefix', 'functions'] };
    case 'pnpm':
      return { command: 'pnpm', args: ['--dir', 'functions', 'run', script] };
    case 'bun':
      return { command: 'bun', args: ['--cwd', 'functions', 'run', script] };
    case 'yarn':
    default:
      return { command: 'yarn', args: ['--cwd', 'functions', script] };
  }
}

/**
 * Native targets always use a local development build (Hermes), never Expo Go.
 * - `yarn android` / `yarn ios` → `expo run:*` (compile + install + launch)
 * - `yarn start` → `expo start --dev-client` (Metro for an already-installed native app)
 * - `yarn web` → Expo web (unchanged)
 *
 * @param {string[]} args
 */
function runExpo(args) {
  const wantsAndroid = args.includes('--android');
  const wantsIos = args.includes('--ios');
  const wantsWeb = args.includes('--web');
  const rest = args.filter((arg) => arg !== '--android' && arg !== '--ios' && arg !== '--web');

  if (wantsAndroid) {
    console.log('[radiance] Building/launching local Android development build (Hermes)…');
    return runCommand('npx', ['expo', 'run:android', ...rest], root);
  }
  if (wantsIos) {
    console.log('[radiance] Building/launching local iOS development build (Hermes)…');
    return runCommand('npx', ['expo', 'run:ios', ...rest], root);
  }

  const startArgs = wantsWeb ? ['--web', ...rest] : withDevClient(rest);
  if (!wantsWeb) {
    console.log(
      '[radiance] Metro in --dev-client mode (local native build / Hermes). Run `yarn android` or `yarn ios` once to install the binary.',
    );
  }
  return runCommand('npx', ['expo', 'start', ...startArgs], root);
}

/**
 * @param {string[]} args
 */
function withDevClient(args) {
  if (args.includes('--dev-client')) return args;
  return ['--dev-client', ...args];
}

/**
 * @param {import('node:child_process').ChildProcess} child
 */
function killProcessTree(child) {
  if (child.killed || child.exitCode !== null) return;
  try {
    if (process.platform === 'win32') {
      if (child.pid) {
        spawn('taskkill', ['/pid', String(child.pid), '/f', '/t'], { stdio: 'ignore' });
      }
    } else if (child.pid) {
      process.kill(-child.pid, 'SIGTERM');
    }
  } catch {
    try {
      child.kill('SIGTERM');
    } catch {
      // already gone
    }
  }
}

/**
 * @param {import('node:child_process').ChildProcess} child
 */
function waitForExit(child) {
  if (child.exitCode !== null) return Promise.resolve();
  return new Promise((resolve) => {
    child.once('exit', () => resolve());
    setTimeout(() => {
      try {
        if (process.platform !== 'win32' && child.pid) {
          process.kill(-child.pid, 'SIGKILL');
        } else {
          child.kill('SIGKILL');
        }
      } catch {
        // ignore
      }
      resolve();
    }, 5_000).unref();
  });
}

/**
 * @param {number} ms
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * CocoaPods before `expo run:ios`, with inherited stdio so the real error is visible.
 * Skips when Pods are already installed; Expo will still refresh them if the lockfile is stale.
 *
 * @param {string} cwd
 * @returns {Promise<boolean>}
 */
async function ensureIosPods(cwd) {
  const iosDir = join(cwd, 'ios');
  const podfile = join(iosDir, 'Podfile');
  const manifest = join(iosDir, 'Pods', 'Manifest.lock');
  if (existsSync(podfile) && existsSync(manifest)) {
    return true;
  }

  console.log('[radiance] Installing iOS CocoaPods (first run can take a few minutes)…');
  if (!existsSync(podfile)) {
    const prebuild = await runCommand(
      'npx',
      ['expo', 'prebuild', '--platform', 'ios', '--no-install'],
      cwd,
    );
    if (prebuild !== 0) {
      console.error('[radiance] `expo prebuild --platform ios` failed.');
      return false;
    }
  }

  const podEnv = {
    ...process.env,
    LANG: process.env.LANG || 'en_US.UTF-8',
    LC_ALL: process.env.LC_ALL || 'en_US.UTF-8',
  };
  const code = await runCommand('pod', ['install'], join(cwd, 'ios'), { env: podEnv });
  if (code !== 0) {
    console.error(
      '[radiance] `pod install` failed. Fix the CocoaPods error above, then re-run `yarn ios`.',
    );
    return false;
  }
  return true;
}

/**
 * Spawn a process and prefix each stdout/stderr line so it cannot be mistaken
 * for Expo / CocoaPods output when both share the terminal.
 *
 * @param {string} command
 * @param {string[]} args
 * @param {import('node:child_process').SpawnOptions} options
 * @param {string} prefix
 */
function spawnPrefixed(command, args, options, prefix) {
  const child = spawn(command, args, {
    ...options,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  attachLinePrefix(child.stdout, process.stdout, prefix);
  attachLinePrefix(child.stderr, process.stderr, prefix);
  return child;
}

/**
 * @param {import('node:stream').Readable | null} source
 * @param {NodeJS.WriteStream} dest
 * @param {string} prefix
 */
function attachLinePrefix(source, dest, prefix) {
  if (!source) return;
  let leftover = '';
  source.on('data', (chunk) => {
    const text = leftover + String(chunk);
    const lines = text.split('\n');
    leftover = lines.pop() ?? '';
    for (const line of lines) {
      dest.write(`${prefix}${line}\n`);
    }
  });
  source.on('end', () => {
    if (leftover) dest.write(`${prefix}${leftover}\n`);
  });
}

/**
 * @param {string} command
 * @param {string[]} args
 * @param {string} cwd
 * @param {{ env?: NodeJS.ProcessEnv }} [options]
 * @returns {Promise<number>}
 */
function runCommand(command, args, cwd, options = {}) {
  return new Promise((resolve) => {
    const child = spawn(command, args, {
      cwd,
      stdio: 'inherit',
      env: options.env ?? process.env,
      shell: process.platform === 'win32',
    });
    child.on('error', (error) => {
      console.error(`[radiance] Failed to run ${command}: ${error.message}`);
      resolve(1);
    });
    child.on('exit', (code, signal) => {
      if (signal) {
        resolve(1);
        return;
      }
      resolve(code ?? 1);
    });
  });
}
