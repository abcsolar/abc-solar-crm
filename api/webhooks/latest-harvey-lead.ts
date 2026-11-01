let cachedLead: any = null;
let lastTimestamp = 0;

export default function handler(req: any, res: any) {
  if (req.method === 'POST') {
    cachedLead = req.body;
    lastTimestamp = Date.now();
    return res.status(200).json({ success: true, lead: cachedLead });
  }

  return res.status(200).json({
    lead: cachedLead,
    timestamp: lastTimestamp,
  });
}
