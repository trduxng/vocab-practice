const { spawn } = require('child_process');
const path = require('path');

const backendRoot = path.resolve(__dirname, '..');
const adminRoot = path.join(backendRoot, 'admin-service');
const nodemonBin = path.join(backendRoot, 'node_modules', 'nodemon', 'bin', 'nodemon.js');

require('dotenv').config({ path: path.join(backendRoot, '.env') });

const mainPort = process.env.PORT || '3001';
const adminPort = process.env.ADMIN_SERVICE_PORT || '3003';
const internalToken = process.env.INTERNAL_SERVICE_TOKEN || 'dev-internal-token';

const processes = [];

const startProcess = (name, command, args, options) => {
  const child = spawn(command, args, {
    stdio: 'inherit',
    shell: false,
    ...options,
    env: {
      ...process.env,
      ...options?.env
    }
  });

  child.on('exit', (code, signal) => {
    if (signal) {
      console.log(`[${name}] stopped by ${signal}`);
      return;
    }

    if (code !== 0) {
      console.error(`[${name}] exited with code ${code}`);
      stopAll();
    }
  });

  processes.push(child);
};

const stopAll = () => {
  for (const child of processes) {
    if (!child.killed) {
      child.kill();
    }
  }
};

process.on('SIGINT', () => {
  stopAll();
  process.exit(0);
});

process.on('SIGTERM', () => {
  stopAll();
  process.exit(0);
});

startProcess('admin-service', process.execPath, ['--watch', 'src/index.ts'], {
  cwd: adminRoot,
  env: {
    PORT: adminPort,
    REPORT_SERVICE_URL: `http://localhost:${mainPort}`,
    INTERNAL_SERVICE_TOKEN: internalToken
  }
});

startProcess('api', process.execPath, [nodemonBin, '--watch', 'src', 'src/index.js'], {
  cwd: backendRoot,
  env: {
    PORT: mainPort,
    ADMIN_SERVICE_URL: `http://localhost:${adminPort}`,
    INTERNAL_SERVICE_TOKEN: internalToken
  }
});
