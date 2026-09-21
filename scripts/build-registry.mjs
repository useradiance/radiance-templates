#!/usr/bin/env node
/**
 * Regenerates registry.json from scaffold.json, modules/<id>/module.json and
 * starters/<id>/starter.json.
 *
 * Run with --check in CI to fail when the committed registry is stale.
 */
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { assertExpoDeps } from './check-expo-deps.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const checkOnly = process.argv.includes('--check');

const readJson = (path) => JSON.parse(readFileSync(path, 'utf8'));

const listDirs = (path) =>
  readdirSync(path)
    .filter((entry) => !entry.startsWith('.') && statSync(join(path, entry)).isDirectory())
    .sort();

function walkTsx(dir, acc = []) {
  if (!existsSync(dir)) return acc;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walkTsx(full, acc);
    else if (entry.name.endsWith('.tsx')) acc.push(full);
  }
  return acc;
}

function isPushedAppScreen(rel) {
  if (!rel.includes('/app/(app)/')) return false;
  if (rel.includes('/(tabs)/') || rel.includes('/(drawer)/')) return false;
  if (rel.endsWith('/_layout.tsx')) return false;
  return true;
}

function setsStackHeader(source) {
  if (/<Redirect[\s>/]/.test(source)) return true;
  return /<Stack\.Screen\b[\s\S]{0,800}?\btitle\b/.test(source);
}

/** Expo Router uses the file path (`admin/index`) unless pushed screens set a title. */
function assertPushedStackTitles() {
  const files = [...walkTsx(join(root, 'modules')), ...walkTsx(join(root, 'starters'))];
  const missing = [];
  for (const file of files) {
    const rel = file
      .slice(root.length + 1)
      .split('\\')
      .join('/');
    if (!isPushedAppScreen(rel)) continue;
    if (!setsStackHeader(readFileSync(file, 'utf8'))) missing.push(rel);
  }
  if (missing.length > 0) {
    throw new Error(
      `Pushed stack screens must set <Stack.Screen options={{ title: … }}>:\n${missing
        .map((path) => `  - ${path}`)
        .join('\n')}`,
    );
  }
}

const scaffold = readJson(join(root, 'scaffold/expo-app/scaffold.json'));

const modules = listDirs(join(root, 'modules')).map((id) => {
  const relPath = `modules/${id}/module.json`;
  const manifest = readJson(join(root, 'modules', id, 'module.json'));
  if (manifest.id !== id) {
    throw new Error(`${relPath} declares id "${manifest.id}"`);
  }
  for (const marker of manifest.wire?.markers ?? []) {
    if (typeof marker.block !== 'string') continue;
    if (marker.block.includes('\\n') || marker.block.includes('\\t')) {
      throw new Error(
        `${relPath}: marker block for ${marker.file} contains a literal \\\\n or \\\\t. Use a JSON newline so spliced files get real line breaks (see modules/stripe/module.json).`,
      );
    }
  }
  return {
    id: manifest.id,
    path: `modules/${id}`,
    version: manifest.version,
    title: manifest.title,
    description: manifest.description,
    side: manifest.side ?? 'app',
    capabilities: manifest.capabilities ?? [],
    requires: manifest.requires ?? [],
    conflicts: manifest.conflicts ?? [],
  };
});

const moduleIds = new Set(modules.map((module) => module.id));

for (const module of modules) {
  for (const dependency of module.requires) {
    if (!moduleIds.has(dependency)) {
      throw new Error(`Module "${module.id}" requires unknown module "${dependency}"`);
    }
  }
}

const starters = listDirs(join(root, 'starters')).map((id) => {
  const manifest = readJson(join(root, 'starters', id, 'starter.json'));
  if (manifest.id !== id) {
    throw new Error(`starters/${id}/starter.json declares id "${manifest.id}"`);
  }
  for (const moduleId of manifest.modules ?? []) {
    if (!moduleIds.has(moduleId)) {
      throw new Error(`Starter "${id}" lists unknown module "${moduleId}"`);
    }
  }
  return {
    id: manifest.id,
    path: `starters/${id}`,
    version: manifest.version,
    extends: manifest.extends,
    title: manifest.title,
    description: manifest.description,
    modules: manifest.modules ?? [],
    capabilities: manifest.capabilities ?? [],
    defaults: manifest.defaults ?? {},
  };
});

for (const required of scaffold.requiredModules ?? []) {
  if (!moduleIds.has(required)) {
    throw new Error(`Scaffold requires unknown module "${required}"`);
  }
}

assertPushedStackTitles();
assertExpoDeps(root);

const registry = {
  version: readJson(join(root, 'package.json')).version,
  expoSdk: scaffold.expoSdk,
  generatedAt: null,
  scaffold: {
    id: scaffold.id,
    path: 'scaffold/expo-app',
    version: scaffold.version,
    requiredModules: scaffold.requiredModules ?? [],
  },
  starters,
  modules,
};

const registryPath = join(root, 'registry.json');
const serialized = `${JSON.stringify(registry, null, 2)}\n`;

if (checkOnly) {
  const current = readFileSync(registryPath, 'utf8');
  if (current !== serialized) {
    console.error('registry.json is out of date — run `yarn registry:build`.');
    process.exit(1);
  }
  console.log(`registry.json is current (${modules.length} modules, ${starters.length} starters).`);
} else {
  writeFileSync(registryPath, serialized);
  console.log(`Wrote registry.json: ${modules.length} modules, ${starters.length} starters.`);
}
