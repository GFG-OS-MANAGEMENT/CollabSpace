const path = require('node:path');
const fs = require('node:fs');
const { spawnSync } = require('node:child_process');

const root = path.join(__dirname, '..');

require('dotenv').config({ path: path.join(root, '.env'), quiet: true });

if (!process.env.DATABASE_URL) {
  console.error(
    'DATABASE_URL is required to run tests.\n' +
      'Start Postgres with `docker compose up -d --wait db`, then copy backend/.env.example to backend/.env.'
  );
  process.exit(1);
}

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET =
  process.env.JWT_SECRET || 'test-only-secret-that-is-at-least-32-characters';

function run(command, args, { shell = false } = {}) {
  const result = spawnSync(command, args, {
    cwd: root,
    env: process.env,
    stdio: 'inherit',
    shell,
  });

  if (result.error) {
    console.error(result.error);
    process.exit(1);
  }
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

const prismaCli = path.join(root, 'node_modules', 'prisma', 'build', 'index.js');

console.log('Applying database migrations...');
run(process.execPath, [prismaCli, 'migrate', 'deploy']);

console.log('Running API tests...');
const testFiles = fs
  .readdirSync(path.join(root, 'tests'))
  .filter((file) => file.endsWith('.test.js'))
  .map((file) => path.join('tests', file));
run(process.execPath, ['--test', '--test-concurrency=1', ...testFiles]);
