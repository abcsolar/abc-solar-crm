export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const payload = req.body || {};
    if (!payload.phone || !payload.company_or_client_name) {
      return res.status(400).json({ error: 'Missing required fields: phone or company_or_client_name' });
    }

    const kw = Number(payload.estimated_kw) || 10;
    const bill = Number(payload.estimated_bill) || Math.round(kw * 125 * 8);
    const isCommercial =
      kw >= 5 ||
      /cold storage|rice mill|flour mill|petrol pump|hospital|clinic|school|college|complex|hotel|industry/i.test(
        payload.company_or_client_name
      );

    const leadRecord = {
      name: payload.contact_person
        ? `${payload.contact_person} (${payload.company_or_client_name})`
        : payload.company_or_client_name.trim(),
      phone: String(payload.phone).replace(/\D/g, '').slice(-10),
      district: payload.city_district || 'Barabanki',
      monthlyBill: bill,
      recommendedKw: kw,
      source: 'HARVEY_AI',
      priority: kw >= 5 || isCommercial ? 'HOT' : 'WARM',
      dealValue: Math.round(kw * 55000),
      email: payload.email,
      notes: `Harvey AI Agent Ingestion (${payload.target_category || 'Commercial Scout'}).\nAI Summary: ${payload.ai_summary || 'Rooftop solar qualification'}\nCompany: ${payload.company_or_client_name}`,
    };

    return res.status(200).json({
      success: true,
      message: 'Lead received and queued for CRM sync',
      data: leadRecord,
    });
  } catch (error: any) {
    return res.status(500).json({ error: 'Internal server error', details: error?.message });
  }
}

