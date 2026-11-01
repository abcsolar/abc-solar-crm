#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');
const args = process.argv.slice(2);
const command = args[0] || 'build';

console.log(`[Next.js Compatibility Shim] Executing command: ${command}`);

if (command === 'build') {
  const result = spawnSync('npx', ['vite', 'build'], {
    cwd: projectRoot,
    stdio: 'inherit',
    shell: true,
  });
  process.exit(result.status ?? 0);
} else if (command === 'dev') {
  const result = spawnSync('npx', ['vite'], {
    cwd: projectRoot,
    stdio: 'inherit',
    shell: true,
  });
  process.exit(result.status ?? 0);
} else {
  const result = spawnSync('npx', ['vite', ...args], {
    cwd: projectRoot,
    stdio: 'inherit',
    shell: true,
  });
  process.exit(result.status ?? 0);
}

