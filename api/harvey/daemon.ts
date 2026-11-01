let isDaemonActive = false;
let daemonInterval = '1h';
let daemonIntervalMinutes = 60;
let lastRunTimestamp: string | null = null;
let nextRunTimestamp: string | null = null;

const daemonLogs = [
  {
    id: 'd-init-1',
    timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
    text: '[DAEMON] Harvey 24x7 Scheduler Engine active. Serverless cloud standby.',
  },
];

export default function handler(req: any, res: any) {
  if (req.method === 'POST') {
    const data = req.body || {};
    if (typeof data.active === 'boolean') {
      isDaemonActive = data.active;
    }
    if (data.interval) {
      daemonInterval = data.interval;
      switch (daemonInterval) {
        case '30m': daemonIntervalMinutes = 30; break;
        case '1h': daemonIntervalMinutes = 60; break;
        case '3h': daemonIntervalMinutes = 180; break;
        case 'daily': daemonIntervalMinutes = 1440; break;
        default: daemonIntervalMinutes = 60;
      }
    }

    if (isDaemonActive) {
      lastRunTimestamp = new Date().toISOString();
      nextRunTimestamp = new Date(Date.now() + daemonIntervalMinutes * 60 * 1000).toISOString();
      daemonLogs.push({
        id: `log-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
        text: `[DAEMON] Scheduler enabled (${daemonInterval}). Auto-crawler scheduled.`,
      });
    } else {
      nextRunTimestamp = null;
      daemonLogs.push({
        id: `log-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
        text: '[DAEMON] Scheduler paused by operator.',
      });
    }

    return res.status(200).json({
      success: true,
      isDaemonActive,
      interval: daemonInterval,
      intervalMinutes: daemonIntervalMinutes,
      lastRun: lastRunTimestamp,
      nextRun: nextRunTimestamp,
    });
  }

  return res.status(200).json({
    isDaemonActive,
    interval: daemonInterval,
    intervalMinutes: daemonIntervalMinutes,
    lastRun: lastRunTimestamp,
    nextRun: nextRunTimestamp,
    logs: daemonLogs,
  });
}

