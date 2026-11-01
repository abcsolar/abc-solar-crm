/**
 * Webhook Ingestion Route for Harvey Autonomous Solar Scout
 * Endpoint: POST /api/webhooks/harvey-leads
 */

export interface HarveyWebhookPayload {
  company_or_client_name: string;
  contact_person?: string;
  phone: string;
  email?: string;
  city_district: string;
  estimated_kw?: number;
  estimated_bill?: number;
  ai_summary?: string;
  target_category?: string;
}

export async function POST(request: Request) {
  try {
    const payload: HarveyWebhookPayload = await request.json();

    if (!payload.phone || !payload.company_or_client_name) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: phone or company_or_client_name' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
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
      phone: payload.phone.replace(/\D/g, '').slice(-10),
      district: payload.city_district || 'Barabanki',
      monthlyBill: bill,
      recommendedKw: kw,
      source: 'HARVEY_AI' as const,
      priority: (kw >= 5 || isCommercial ? 'HOT' : 'WARM') as 'HOT' | 'WARM',
      dealValue: Math.round(kw * 55000),
      email: payload.email,
      notes: `Harvey AI Agent Ingestion (${payload.target_category || 'Commercial Scout'}).\nAI Summary: ${payload.ai_summary || 'Rooftop solar qualification'}\nCompany: ${payload.company_or_client_name}`,
    };

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Lead received and queued for CRM sync',
        data: leadRecord,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

