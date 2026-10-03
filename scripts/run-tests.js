import { spawn } from 'child_process';

const rawArgs = process.argv.slice(2);
const filteredArgs = [];

for (let i = 0; i < rawArgs.length; i++) {
  const arg = rawArgs[i];
  if (arg.startsWith('--testPathPattern=')) {
    filteredArgs.push(arg.replace('--testPathPattern=', ''));
  } else if (arg === '--testPathPattern' && i + 1 < rawArgs.length) {
    filteredArgs.push(rawArgs[i + 1]);
    i++;
  } else {
    filteredArgs.push(arg);
  }
}

const child = spawn('npx', ['vitest', 'run', ...filteredArgs], {
  stdio: 'inherit',
  shell: true,
  env: process.env,
});

child.on('exit', (code) => {
  process.exit(code || 0);
});
