/**
 * ABC SOLAR — Multi-Channel Lead Ingestion Service
 * 
 * In this React client-side SPA, external webhooks and internal touchpoints
 * route through this unified ingestion engine to ensure schema consistency,
 * deduplication, auto-priority assignment, and live notifications.
 */

import type { Lead, LeadPriority } from '@/types';
import { ingestLead } from '@/store';
import { calculateSolar } from '@/utils';

// ── Priority Auto-Calculation ─────────────────────────────────────────────
export function autoPriority(monthlyBill: number, kw: number): LeadPriority {
  if (monthlyBill > 4000 || kw >= 5) return 'HOT';
  if (kw >= 2) return 'WARM';
  return 'COLD';
}

// ── Meta Webhook Verification Handshake (mock GET) ───────────────────────
export const META_VERIFY_TOKEN = 'abc_solar_meta_verify_2026';

export function verifyMetaWebhook(token: string, challenge: string): string | null {
  if (token === META_VERIFY_TOKEN) return challenge;
  return null;
}

// ── 1. Website Callback Form ("Get Free Site Survey") ──────────────────────
export interface WebsiteCallbackPayload {
  name: string;
  phone: string;
  district: string;
  monthlyBill: number;
  email?: string;
  whatsapp?: string;
}

export function ingestWebsiteCallbackLead(payload: WebsiteCallbackPayload): 'created' | 'duplicate' {
  const calc = calculateSolar(payload.monthlyBill);
  const kw = calc.recommendedKw;
  return ingestLead({
    name: payload.name.trim(),
    phone: payload.phone,
    district: payload.district,
    monthlyBill: payload.monthlyBill,
    recommendedKw: kw,
    source: 'WEBSITE_CALLBACK',
    priority: autoPriority(payload.monthlyBill, kw),
    dealValue: Math.round(calc.totalCost),
    notes: `Website callback request. Monthly bill ₹${payload.monthlyBill}. Estimated system: ${kw} kW.`,
    email: payload.email,
    whatsapp: payload.whatsapp || payload.phone,
  });
}

// ── 2. Solar Calculator Proposal Submission ("Claim This Proposal") ────────
export interface CalculatorLeadPayload {
  name: string;
  phone: string;
  district: string;
  monthlyBill: number;
  recommendedKw: number;
  roofArea?: number;
  roofType?: string;
  totalCost: number;
  totalSubsidy: number;
  netInvestment: number;
  whatsapp?: string;
}

export function ingestCalculatorLead(payload: CalculatorLeadPayload): 'created' | 'duplicate' {
  return ingestLead({
    name: payload.name.trim(),
    phone: payload.phone,
    district: payload.district,
    monthlyBill: payload.monthlyBill,
    recommendedKw: payload.recommendedKw,
    roofArea: payload.roofArea,
    roofType: payload.roofType as any,
    source: 'SOLAR_CALCULATOR',
    priority: autoPriority(payload.monthlyBill, payload.recommendedKw),
    dealValue: Math.round(payload.totalCost),
    notes: `Proposal Claimed: ${payload.recommendedKw}kW system. Est. Subsidy: ₹${Math.round(payload.totalSubsidy).toLocaleString('en-IN')}, Net Investment: ₹${Math.round(payload.netInvestment).toLocaleString('en-IN')}.`,
    whatsapp: payload.whatsapp || payload.phone,
  });
}

// ── 3. Meta Lead Ads Webhook (/api/webhooks/meta-leads) ───────────────────
export interface MetaLeadAdsPayload {
  full_name: string;
  phone_number: string;
  district?: string;
  monthly_electricity_bill?: string | number;
  form_id?: string;
  ad_id?: string;
  campaign_name?: string;
}

export function simulateMetaLeadAdsWebhook(payload: MetaLeadAdsPayload): 'created' | 'duplicate' {
  const bill = Number(payload.monthly_electricity_bill) || 4500;
  const calc = calculateSolar(bill);
  const kw = calc.recommendedKw;
  return ingestLead({
    name: payload.full_name.trim(),
    phone: payload.phone_number,
    district: payload.district || 'Lucknow',
    monthlyBill: bill,
    recommendedKw: kw,
    source: 'META_LEAD_ADS',
    priority: 'HOT', // Meta Lead Ads typically carry high purchase intent
    dealValue: Math.round(calc.totalCost),
    notes: `Meta Ad Lead. Form: ${payload.form_id || 'Instant Form'}, Campaign: ${payload.campaign_name || 'PM Surya Ghar UP 2026'}. Bill: ₹${bill}.`,
  });
}

// ── 4. IndiaMART B2B Lead Webhook (/api/webhooks/indiamart) ───────────────
export interface IndiaMartPayload {
  SENDER_NAME: string;
  SENDER_MOBILE: string;
  SENDER_EMAIL?: string;
  SENDER_CITY?: string;
  SUBJECT?: string;
  QUERY_MESSAGE?: string;
}

export function simulateIndiaMartWebhook(payload: IndiaMartPayload): 'created' | 'duplicate' {
  const district = payload.SENDER_CITY || 'Barabanki';
  const isCommercial = (payload.SUBJECT || '').toLowerCase().includes('commercial') ||
    (payload.QUERY_MESSAGE || '').toLowerCase().includes('commercial') ||
    (payload.SUBJECT || '').toLowerCase().includes('plant') ||
    (payload.SUBJECT || '').toLowerCase().includes('kw');
  const bill = isCommercial ? 35000 : 9000;
  const calc = calculateSolar(bill);
  const kw = isCommercial ? Math.max(calc.recommendedKw, 15) : calc.recommendedKw;

  return ingestLead({
    name: payload.SENDER_NAME.trim(),
    phone: payload.SENDER_MOBILE,
    district,
    monthlyBill: bill,
    recommendedKw: kw,
    source: 'INDIAMART',
    priority: isCommercial ? 'HOT' : 'WARM',
    dealValue: Math.round(kw * 55000),
    email: payload.SENDER_EMAIL,
    notes: `IndiaMART Inbound: "${payload.SUBJECT || 'Solar Inquiry'}". Message: "${payload.QUERY_MESSAGE || 'Interested in solar installation.'}"`,
  });
}

// ── 5. Cloud Telephony / IVR Webhook (/api/webhooks/call-logs) ────────────
export interface CallIVRPayload {
  caller_number: string;
  call_duration?: number;
  ivr_selection?: string;
  recording_url?: string;
  virtual_number?: string;
}

export function simulateCallIVRWebhook(payload: CallIVRPayload): 'created' | 'duplicate' {
  const cleanPhone = payload.caller_number.replace(/\D/g, '').slice(-10);
  const durationText = payload.call_duration ? `${payload.call_duration}s` : 'Missed Call';
  return ingestLead({
    name: `Inbound Caller (${cleanPhone.slice(-4)})`,
    phone: cleanPhone,
    district: 'Barabanki', // Default operational hub
    monthlyBill: 4000,
    recommendedKw: 3,
    source: 'CALL_IVR',
    priority: payload.call_duration && payload.call_duration > 30 ? 'HOT' : 'WARM',
    dealValue: 180000,
    notes: `IVR Telephony Lead. Duration: ${durationText}. Keypress Option: ${payload.ivr_selection || 'General Inquiry'}. Virtual Number: ${payload.virtual_number || '05248-ABC-SOLAR'}.`,
  });
}

// ── Sample Payloads for Testing & Verification ────────────────────────────
export const SAMPLE_META_PAYLOAD: MetaLeadAdsPayload = {
  full_name: 'Dr. Alok Verma',
  phone_number: '9839012345',
  district: 'Sitapur',
  monthly_electricity_bill: 6800,
  form_id: 'FB_LEAD_FORM_UP_SUBSIDY_2026',
  ad_id: 'AD_78K_SAVINGS_BBK',
  campaign_name: 'UP Surya Ghar District Campaign',
};

export const SAMPLE_INDIAMART_PAYLOAD: IndiaMartPayload = {
  SENDER_NAME: 'Awadh Cold Storage Pvt Ltd',
  SENDER_MOBILE: '9415088776',
  SENDER_EMAIL: 'ops@awadhcold.in',
  SENDER_CITY: 'Barabanki',
  SUBJECT: '50kW Commercial Solar Rooftop Plant Requirement',
  QUERY_MESSAGE: 'We need 50kW on-grid solar plant with net metering at Deva Road industrial area.',
};

export const SAMPLE_IVR_PAYLOAD: CallIVRPayload = {
  caller_number: '9125044332',
  call_duration: 52,
  ivr_selection: '1 - Residential Subsidy Inquiry',
  recording_url: 'https://telephony.abcsolar.in/rec/call_8932.wav',
  virtual_number: '9450942418',
};

// ── 6. Harvey Autonomous Scout Webhook (/api/webhooks/harvey-leads) ────────
export interface HarveyLeadPayload {
  company_or_client_name: string;
  contact_person?: string;
  phone: string;
  email?: string;
  city_district: string;
  estimated_kw?: number;
  estimated_bill?: number;
  ai_summary?: string;
  target_category?: string;
  outreach_channels?: string[];
  whatsapp_status?: 'Sent' | 'Queued' | 'Failed';
  email_status?: 'Delivered' | 'Skipped' | 'Failed';
}

export function simulateHarveyLeadWebhook(payload: HarveyLeadPayload): 'created' | 'duplicate' {
  const kw = payload.estimated_kw || 10;
  const bill = payload.estimated_bill || Math.round(kw * 125 * 8);
  const isCommercial = kw >= 5 || 
    /cold storage|rice mill|flour mill|petrol pump|hospital|clinic|school|college|complex|hotel|industry/i.test(payload.company_or_client_name);

  const cleanDigits = payload.phone.replace(/\D/g, '').slice(-10);

  return ingestLead({
    name: payload.contact_person 
      ? `${payload.contact_person} (${payload.company_or_client_name})`
      : payload.company_or_client_name.trim(),
    phone: cleanDigits,
    district: payload.city_district || 'Barabanki',
    monthlyBill: bill,
    recommendedKw: kw,
    source: 'HARVEY_AI',
    priority: kw >= 5 || isCommercial ? 'HOT' : 'WARM',
    dealValue: Math.round(kw * 55000),
    email: payload.email,
    whatsapp: cleanDigits,
    outreachChannels: payload.outreach_channels || ['Email', 'WhatsApp'],
    whatsappStatus: payload.whatsapp_status || 'Sent',
    emailStatus: payload.email_status || (payload.email ? 'Delivered' : 'Skipped'),
    notes: `Harvey AI Autonomous Scout Lead (${payload.target_category || 'Commercial Prospect'}).
Dual Outreach: WhatsApp Proposal Alert (${payload.whatsapp_status || 'Sent'}) + Email (${payload.email_status || (payload.email ? 'Delivered' : 'Skipped')}).
Summary: ${payload.ai_summary || 'Identified high rooftop solar potential via satellite & DISCOM data analysis.'}`,
  });
}

export const SAMPLE_HARVEY_PAYLOAD: HarveyLeadPayload = {
  company_or_client_name: 'Awadh Agro & Rice Mill Pvt Ltd',
  contact_person: 'Mohd Irfan Khan',
  phone: '9450123987',
  email: 'director@awadhagro.in',
  city_district: 'Barabanki',
  estimated_kw: 40,
  estimated_bill: 65000,
  target_category: 'Industrial / Rice Mill',
  ai_summary: 'Deva Road Agro hub. Tin shed rooftop area ~4,500 sq ft. Current MVVNL 63kVA sanctioned load. High daylight power consumption profile. Recommended 40kW on-grid with net metering.',
};

