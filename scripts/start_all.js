import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

console.log("Starting OraSnap Dev Environment with MongoDB Backend...");

// 1. Start Express Backend Server
const serverProcess = spawn('node', ['--env-file=.env', 'server/index.js'], {
  cwd: projectRoot,
  shell: true,
  stdio: 'inherit' // Direct output to parent process
});

// 2. Start Vite Frontend Client
const clientProcess = spawn('npm', ['run', 'dev'], {
  cwd: projectRoot,
  shell: true,
  stdio: 'inherit'
});

// Handle termination gracefully
process.on('SIGINT', () => {
  console.log("\nStopping all processes...");
  serverProcess.kill('SIGINT');
  clientProcess.kill('SIGINT');
  process.exit();
});

process.on('SIGTERM', () => {
  serverProcess.kill('SIGTERM');
  clientProcess.kill('SIGTERM');
  process.exit();
});
