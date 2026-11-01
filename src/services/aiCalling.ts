/**
 * ABC SOLAR — AI Voice Calling Agent & Telephony Engine
 * 
 * Provides:
 * 1. AI Conversation generation in polite Hindi / Hinglish.
 * 2. Automated qualification & survey scheduling logic.
 * 3. Webhook listener for /api/webhooks/ai-call (call.initiated, call.completed, call.transcription.ready).
 */

import type { Lead, AICallLog, AICallTranscriptEntry, RoofType } from '@/types';
import { completeAICallAndQualify } from '@/store';
import { formatINR } from '@/utils';

// ── Webhook Event Interfaces ────────────────────────────────────────────────
export interface AICallWebhookPayload {
  event: 'call.initiated' | 'call.completed' | 'call.transcription.ready';
  call_id: string;
  lead_id: string;
  customer_phone: string;
  duration_seconds?: number;
  status: 'answered' | 'completed' | 'busy' | 'failed' | 'voicemail';
  recording_url?: string;
  transcript?: { speaker: 'ai' | 'customer'; message: string; timestamp: number }[];
  summary?: string;
  extracted_data?: {
    bill_verified?: number;
    kw_confirmed?: number;
    roof_type?: RoofType;
    survey_scheduled?: boolean;
    survey_date?: string;
  };
}

/**
 * Handle incoming webhook POST /api/webhooks/ai-call
 */
export function handleAICallWebhook(payload: AICallWebhookPayload): { success: boolean; message: string } {
  if (payload.event === 'call.initiated') {
    return { success: true, message: `Call ${payload.call_id} initiated for lead ${payload.lead_id}` };
  }

  const isCompleted = payload.event === 'call.completed' || payload.event === 'call.transcription.ready';
  if (isCompleted) {
    const surveyConfirmed = Boolean(payload.extracted_data?.survey_scheduled);
    const transcript: AICallTranscriptEntry[] = (payload.transcript || []).map(t => ({
      speaker: t.speaker,
      text: t.message,
      timeOffsetSeconds: t.timestamp,
    }));

    const callLog: AICallLog = {
      id: payload.call_id,
      leadId: payload.lead_id,
      customerName: 'Customer',
      customerPhone: payload.customer_phone,
      district: 'Uttar Pradesh',
      provider: 'bland_ai',
      status: 'COMPLETED',
      durationSeconds: payload.duration_seconds || 95,
      startedAt: new Date(Date.now() - (payload.duration_seconds || 95) * 1000).toISOString(),
      completedAt: new Date().toISOString(),
      summary: payload.summary || 'AI qualification call completed successfully.',
      surveyConfirmed,
      confirmedDate: payload.extracted_data?.survey_date,
      confirmedKw: payload.extracted_data?.kw_confirmed,
      confirmedRoofType: payload.extracted_data?.roof_type || 'RCC_FLAT',
      transcript,
      recordingUrl: payload.recording_url || 'https://telephony.abcsolar.in/recordings/call_demo.mp3',
      sentiment: surveyConfirmed ? 'POSITIVE' : 'NEUTRAL',
    };

    completeAICallAndQualify(callLog, surveyConfirmed);
    return { success: true, message: `Call processed and Lead ${payload.lead_id} updated!` };
  }

  return { success: true, message: 'Event acknowledged' };
}

// ── Conversational Script Generator ─────────────────────────────────────────
export function generateCallScript(lead: Lead, persona = 'Priya (ABC Solar)'): {
  transcript: AICallTranscriptEntry[];
  summary: string;
  surveyConfirmed: boolean;
  confirmedDate: string;
  durationSeconds: number;
} {
  const firstName = lead.name.split(' ')[0] || lead.name;
  const kw = lead.recommendedKw || 4;
  const billFormatted = formatINR(lead.monthlyBill || 4500);
  const district = lead.district || 'Barabanki';
  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);

  const transcript: AICallTranscriptEntry[] = [
    {
      speaker: 'ai',
      text: `नमस्ते ${firstName} जी! मैं ABC Solar (M/s Avadh Boring Company) से Priya बात कर रही हूँ। आपने हमारी वेबसाइट पर PM Surya Ghar सोलर योजना और सब्सिडी के लिए जानकारी माँगी थी?`,
      timeOffsetSeconds: 0,
    },
    {
      speaker: 'customer',
      text: `हाँ नमस्ते! जी बिल्कुल, मैंने फॉर्म भरा था। मुझे अपनी छत पर सोलर लगवाना है, बिजली बिल बहुत बढ़ गया है।`,
      timeOffsetSeconds: 9,
    },
    {
      speaker: 'ai',
      text: `जी ${firstName} जी, बिल्कुल सही समय है! केंद्र सरकार के PM सूर्य घर योजना और उत्तर प्रदेश UPNEDA के तहत आपको सीधे ₹1,08,000 तक की कुल सब्सिडी मिल रही है। आपका मासिक बिजली बिल लगभग ${billFormatted} है, सही है सर?`,
      timeOffsetSeconds: 21,
    },
    {
      speaker: 'customer',
      text: `जी हाँ, लगभग ${billFormatted} के आसपास ही आता है हर महीने।`,
      timeOffsetSeconds: 38,
    },
    {
      speaker: 'ai',
      text: `बहुत बढ़िया! इस बिल के आधार पर आपके घर के लिए ${kw} kW का ऑन-ग्रिड सोलर सिस्टम बिल्कुल परफेक्ट रहेगा, जिससे आपका बिजली बिल 85% से 95% तक कम हो जाएगा। क्या आपके पास पक्की RCC छत (RCC Flat Roof) उपलब्ध है?`,
      timeOffsetSeconds: 47,
    },
    {
      speaker: 'customer',
      text: `हाँ, हमारी छत पक्की RCC है और पूरी तरह खाली है। धूप भी दिन भर अच्छी आती है।`,
      timeOffsetSeconds: 65,
    },
    {
      speaker: 'ai',
      text: `अति उत्तम सर! हमारे UPNEDA सर्टिफाइड सोलर इंजीनियर कल ${tomorrow} को आपके ${district} वाले पते पर 100% फ्री साइट सर्वे और शैडो एनालिसिस के लिए आ सकते हैं। क्या कल सुबह 11:30 AM का समय आपके लिए ठीक रहेगा?`,
      timeOffsetSeconds: 77,
    },
    {
      speaker: 'customer',
      text: `हाँ, कल सुबह 11:30 बजे बिल्कुल सही रहेगा। आप इंजीनियर को भेज दीजिए।`,
      timeOffsetSeconds: 94,
    },
    {
      speaker: 'ai',
      text: `बहुत-बहुत धन्यवाद ${firstName} जी! आपका फ्री साइट सर्वे कल 11:30 AM के लिए कन्फर्म कर दिया गया है। हमारे इंजीनियर विकास यादव जी आने से 30 मिनट पहले आपको कॉल करेंगे। ABC Solar में कॉल करने के लिए धन्यवाद, आपका दिन मंगलमय हो!`,
      timeOffsetSeconds: 102,
    },
  ];

  const summary = `AI Voice Qualification Successful: Customer verified ${kw}kW system interest with monthly electricity bill of ${billFormatted}. Confirmed RCC roof available with zero shadow in ${district}. Site survey confirmed for tomorrow (${tomorrow}) at 11:30 AM.`;

  return {
    transcript,
    summary,
    surveyConfirmed: true,
    confirmedDate: tomorrow,
    durationSeconds: 118,
  };
}

