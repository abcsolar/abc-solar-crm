/**
 * In-memory state / store for latest Harvey Lead ingestion
 * Endpoint: GET /api/webhooks/latest-harvey-lead
 */

let cachedLatestLead: unknown = null;
let lastIngestTime = 0;

export function updateLatestLeadCache(lead: unknown) {
  cachedLatestLead = lead;
  lastIngestTime = Date.now();
}

export async function GET() {
  return new Response(
    JSON.stringify({
      lead: cachedLatestLead,
      timestamp: lastIngestTime,
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, max-age=0',
      },
    }
  );
}

