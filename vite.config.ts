import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
import { spawn } from 'node:child_process';

let latestHarveyLead: any = null;
let lastLeadTimestamp = 0;

interface DaemonLogEntry {
  id: string;
  timestamp: string;
  text: string;
}

let isDaemonActive = false;
let daemonInterval = '1h';
let daemonIntervalMinutes = 60;
let daemonTimer: any = null;
let lastRunTimestamp: string | null = null;
let nextRunTimestamp: string | null = null;
let daemonLogs: DaemonLogEntry[] = [
  {
    id: 'd-init-1',
    timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
    text: '[DAEMON] Harvey 24x7 Scheduler Engine initialized. Standby mode.',
  },
];

function getIntervalMinutes(interval: string): number {
  switch (interval) {
    case '30m': return 30;
    case '1h': return 60;
    case '3h': return 180;
    case 'daily': return 1440;
    default: return 60;
  }
}

function appendDaemonLog(text: string) {
  const entry = {
    id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
    text,
  };
  daemonLogs.push(entry);
  if (daemonLogs.length > 250) daemonLogs.shift();
}

function runDaemonScoutCycle(source = 'scheduler') {
  const pythonBin = '/Users/mohdsaad/harvey/venv/bin/python';
  const args = ['-m', 'harvey.main', '--territory', 'Barabanki,Lucknow,Varanasi', '--mode', 'scout'];

  lastRunTimestamp = new Date().toISOString();
  nextRunTimestamp = new Date(Date.now() + daemonIntervalMinutes * 60 * 1000).toISOString();

  appendDaemonLog(`[DAEMON] Executing autonomous scout cycle (${source})...`);

  try {
    const child = spawn(pythonBin, args, {
      cwd: '/Users/mohdsaad/harvey',
      env: {
        ...process.env,
        PYTHONPATH: '/Users/mohdsaad/harvey',
        PYTHONUNBUFFERED: '1',
      },
    });

    child.stdout.on('data', (chunk: Buffer) => {
      const lines = chunk.toString().split('\n');
      for (const line of lines) {
        if (line.trim()) appendDaemonLog(line.trim());
      }
    });

    child.stderr.on('data', (chunk: Buffer) => {
      const lines = chunk.toString().split('\n');
      for (const line of lines) {
        if (line.trim()) appendDaemonLog(`[STDERR] ${line.trim()}`);
      }
    });

    child.on('close', (code: number) => {
      appendDaemonLog(`[DAEMON] Cycle finished (exit code ${code}). Next scheduled scout in ${daemonIntervalMinutes} minutes.`);
    });

    child.on('error', (err: any) => {
      appendDaemonLog(`[DAEMON] Error during crawler pass: ${err.message}. Self-healing enabled — will retry on next schedule.`);
    });
  } catch (err: any) {
    appendDaemonLog(`[DAEMON] Failed to spawn crawler: ${err.message}. Retrying on next interval.`);
  }
}

// Webhook mock middleware for local dev testing
function webhookMockPlugin() {
  return {
    name: 'webhook-mock-server',
    configureServer(server: any) {
      server.middlewares.use((req: any, res: any, next: any) => {
        // 1. Live Scout Execution endpoint — streams real Python process stdout/stderr
        if (req.url === '/api/harvey/trigger' && req.method === 'POST') {
          res.setHeader('Content-Type', 'text/plain; charset=utf-8');
          res.setHeader('Transfer-Encoding', 'chunked');
          res.setHeader('Cache-Control', 'no-cache, no-transform');
          res.statusCode = 200;

          const pythonBin = '/Users/mohdsaad/harvey/venv/bin/python';
          const args = ['-m', 'harvey.main', '--territory', 'Barabanki,Lucknow,Varanasi', '--mode', 'scout'];

          const child = spawn(pythonBin, args, {
            cwd: '/Users/mohdsaad/harvey',
            env: {
              ...process.env,
              PYTHONPATH: '/Users/mohdsaad/harvey',
              PYTHONUNBUFFERED: '1',
            },
          });

          child.stdout.on('data', (chunk: Buffer) => {
            res.write(chunk);
          });

          child.stderr.on('data', (chunk: Buffer) => {
            res.write(chunk);
          });

          child.on('close', (code: number) => {
            res.end(`\n[DAEMON] Process finished with exit code ${code}\n`);
          });

          child.on('error', (err: any) => {
            res.write(`\n[ERROR] Failed to spawn Harvey daemon: ${err.message}\n`);
            res.end();
          });
          return;
        }

        // 2. WhatsApp Proposal Dispatcher (Internal CRM endpoint called by Harvey)
        if (req.url === '/api/whatsapp/send-proposal' && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk: any) => { body += chunk; });
          req.on('end', () => {
            try {
              const data = body ? JSON.parse(body) : {};
              const phone = data.phone || '+919278442418';
              const businessName = data.business_name || data.company_or_client_name || 'Prospect';

              appendDaemonLog(`[WHATSAPP] Proposal message dispatched to ${phone} for ${businessName}`);

              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 200;
              res.end(JSON.stringify({
                success: true,
                messageId: `WAMID-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                status: 'Sent',
                recipient: phone,
                business: businessName,
                template: 'solar_rooftop_feasibility_alert_hi',
              }));
            } catch {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Invalid WhatsApp dispatch payload' }));
            }
          });
          return;
        }

        // 3. Harvey Inbound Webhook Receiver
        if (req.url === '/api/webhooks/harvey-leads' && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk: any) => { body += chunk; });
          req.on('end', () => {
            try {
              const data = body ? JSON.parse(body) : {};
              latestHarveyLead = {
                ...data,
                received_at: new Date().toISOString(),
              };
              lastLeadTimestamp = Date.now();

              appendDaemonLog('[CRM] Ingested dual-channel outreach lead into pipeline.');

              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 200;
              res.end(JSON.stringify({
                success: true,
                message: 'Lead received and processed by ABC Solar CRM',
                leadId: `LEAD-2026-${String(Math.floor(Math.random() * 9000) + 1000)}`,
                company: data.company_or_client_name || 'Commercial Prospect',
                lead: latestHarveyLead,
              }));
            } catch {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Invalid JSON payload' }));
            }
          });
          return;
        }

        // 4. Endpoint for frontend to retrieve latest received lead
        if (req.url === '/api/webhooks/latest-harvey-lead' && req.method === 'GET') {
          res.setHeader('Content-Type', 'application/json');
          res.statusCode = 200;
          res.end(JSON.stringify({
            lead: latestHarveyLead,
            timestamp: lastLeadTimestamp,
          }));
          return;
        }

        // 5. Background Daemon Controller (GET current state & logs)
        if (req.url === '/api/harvey/daemon' && req.method === 'GET') {
          res.setHeader('Content-Type', 'application/json');
          res.statusCode = 200;
          res.end(JSON.stringify({
            isDaemonActive,
            interval: daemonInterval,
            intervalMinutes: daemonIntervalMinutes,
            lastRun: lastRunTimestamp,
            nextRun: nextRunTimestamp,
            logs: daemonLogs,
          }));
          return;
        }

        // 5. Background Daemon Controller (POST start/stop actions)
        if (req.url === '/api/harvey/daemon' && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk: any) => { body += chunk; });
          req.on('end', () => {
            try {
              const data = body ? JSON.parse(body) : {};
              const action = data.action; // 'start' | 'stop'
              const interval = data.interval || daemonInterval;

              if (action === 'start') {
                isDaemonActive = true;
                daemonInterval = interval;
                daemonIntervalMinutes = getIntervalMinutes(interval);

                if (daemonTimer) {
                  clearInterval(daemonTimer);
                }

                appendDaemonLog(`[DAEMON] 24x7 Auto-Scout Daemon activated. Polling frequency: ${daemonInterval} (${daemonIntervalMinutes} mins).`);
                runDaemonScoutCycle('scheduler-start');

                daemonTimer = setInterval(() => {
                  runDaemonScoutCycle('scheduler-interval');
                }, daemonIntervalMinutes * 60 * 1000);

                res.setHeader('Content-Type', 'application/json');
                res.statusCode = 200;
                res.end(JSON.stringify({
                  success: true,
                  isDaemonActive: true,
                  interval: daemonInterval,
                  intervalMinutes: daemonIntervalMinutes,
                  message: `24x7 Auto-Scout Daemon activated (${daemonInterval})`,
                }));
              } else if (action === 'stop') {
                isDaemonActive = false;
                if (daemonTimer) {
                  clearInterval(daemonTimer);
                  daemonTimer = null;
                }
                nextRunTimestamp = null;
                appendDaemonLog('[DAEMON] Background scheduler paused by admin.');

                res.setHeader('Content-Type', 'application/json');
                res.statusCode = 200;
                res.end(JSON.stringify({
                  success: true,
                  isDaemonActive: false,
                  message: '24x7 Auto-Scout Daemon paused',
                }));
              } else {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: "Invalid action. Expected 'start' or 'stop'." }));
              }
            } catch (err: any) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: err.message }));
            }
          });
          return;
        }

        next();
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), webhookMockPlugin()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
