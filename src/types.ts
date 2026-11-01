export type Portal = 'website' | 'crm';

export type LeadSource =
  | 'WEBSITE_CALLBACK'
  | 'SOLAR_CALCULATOR'
  | 'META_LEAD_ADS'
  | 'INDIAMART'
  | 'CALL_IVR'
  | 'MANUAL'
  | 'WEBSITE'
  | 'CALCULATOR'
  | 'WHATSAPP'
  | 'REFERRAL'
  | 'WALK-IN'
  | 'HARVEY_AI';

export interface CRMNotification {
  id: string;
  message: string;
  source: LeadSource;
  leadName: string;
  createdAt: string;
  read: boolean;
}

export type LeadPriority = 'HOT' | 'WARM' | 'COLD';
export type LeadStatus =
  | 'NEW'
  | 'CONTACTED'
  | 'SITE_VISIT_SCHEDULED'
  | 'SURVEY_DONE'
  | 'QUOTATION_SENT'
  | 'NEGOTIATION'
  | 'WON'
  | 'LOST';

export type RoofType = 'RCC_FLAT' | 'METAL_SHED' | 'TIN_SHED' | 'ELEVATED';
export type ConnectionPhase = 'SINGLE' | 'THREE';
export type Discom = 'MVVNL' | 'PVVNL' | 'DVVNL' | 'PuVVNL' | 'KESCo';

export interface Lead {
  id: string;
  name: string;
  phone: string;
  district: string;
  discom: Discom;
  monthlyBill: number;
  monthlyUnits?: number;
  roofArea?: number;
  roofType?: RoofType;
  recommendedKw: number;
  source: LeadSource;
  status: LeadStatus;
  priority: LeadPriority;
  assignedTo: string;
  followUpDate: string;
  createdAt: string;
  notes: string;
  dealValue: number;
  email?: string;
  whatsapp?: string;
  outreachChannels?: string[];
  whatsappStatus?: 'Sent' | 'Queued' | 'Failed';
  emailStatus?: 'Delivered' | 'Skipped' | 'Failed';
  interactionHistory?: string[];
  lastCallStatus?: AICallStatus;
  lastCallDuration?: number;
  lastCallSummary?: string;
}

export interface QuotationLineItem {
  id: string;
  description: string;
  brand?: string;
  specification: string;
  unit: string;
  qty: number;
  unitPrice: number;
  gstRate: number;
}

export interface Quotation {
  id: string;
  quoteNumber: string;
  leadId: string;
  customerName: string;
  customerPhone: string;
  customerDistrict: string;
  systemKw: number;
  lineItems: QuotationLineItem[];
  subtotal: number;
  discount: number;
  gstType: 'CGST_SGST' | 'IGST';
  gstAmount: number;
  grandTotal: number;
  subsidyDeduction: number;
  netInvestment: number;
  status: 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED';
  createdAt: string;
  validTill: string;
  notes: string;
}

export type SurveyStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';

export interface Survey {
  id: string;
  leadId: string;
  customerName: string;
  customerPhone: string;
  siteAddress: string;
  district: string;
  technician: string;
  scheduledDate: string;
  status: SurveyStatus;
  roofType: RoofType;
  usableArea: number;
  shadowObstructions: string;
  sanctionedLoad: number;
  connectionPhase: ConnectionPhase;
  meterNumber: string;
  inverterLocation: string;
  cableDistance: number;
  recommendedKw: number;
  roofViewImage?: string;
  dbImage?: string;
  meterImage?: string;
  notes: string;
  completedAt?: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  sender: 'customer' | 'agent';
  text: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
  isTemplate?: boolean;
  agentNote?: boolean;
}

export interface Conversation {
  id: string;
  leadId: string;
  customerName: string;
  customerPhone: string;
  district: string;
  unreadCount: number;
  lastMessage: string;
  lastMessageTime: string;
  online: boolean;
  assignedAgent: string;
  messages: ChatMessage[];
}

export type ProjectStage =
  | 'ORDER_CONFIRMED'
  | 'DETAILED_DESIGN'
  | 'MATERIAL_PROCUREMENT'
  | 'STRUCTURE_MOUNTING'
  | 'PANEL_INVERTER_WIRING'
  | 'DISCOM_NET_METERING'
  | 'TESTING_SYNC'
  | 'HANDOVER';

export interface Project {
  id: string;
  leadId: string;
  quotationId: string;
  customerName: string;
  customerPhone: string;
  district: string;
  systemKw: number;
  projectValue: number;
  currentStage: ProjectStage;
  startDate: string;
  expectedHandover: string;
  stages: { stage: ProjectStage; label: string; completed: boolean; completedAt?: string }[];
}

export type TicketPriority = 'URGENT' | 'HIGH' | 'NORMAL';
export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
export type TicketCategory = 'INVERTER_ERROR' | 'GENERATION_DROP' | 'PHYSICAL_CLEANING' | 'GRID_ISSUE' | 'OTHER';

export interface ServiceTicket {
  id: string;
  ticketNumber: string;
  projectId: string;
  customerName: string;
  customerPhone: string;
  district: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  description: string;
  technician: string;
  createdAt: string;
  resolvedAt?: string;
  resolution?: string;
}

export interface WhatsAppConfig {
  wabaId: string;
  phoneNumberId: string;
  accessToken: string;
  webhookVerifyToken: string;
  connected: boolean;
}

export type CRMRole = 'Super Admin' | 'Sales Manager' | 'Site Engineer' | 'Accountant';

export interface CRMUser {
  id: string;
  name: string;
  role: CRMRole;
  initials: string;
  email: string;
  password: string;
  phone: string;
  active: boolean;
  createdAt: string;
  allowedPages: string[];
}

export interface AuthSession {
  userId: string;
  name: string;
  role: CRMRole;
  initials: string;
  allowedPages: string[];
}

// ── AI Voice Calling & Telephony Types ──────────────────────────────────────
export type AICallingProvider = 'twilio' | 'exotel' | 'bland_ai' | 'vapi';

export interface AICallingConfig {
  provider: AICallingProvider;
  apiKey: string;
  accountSid: string;
  callerId: string;
  persona: string;
  voiceGender: 'female' | 'male';
  language: string;
  autoCallOnNewLead: boolean;
  enabled: boolean;
}

export type AICallStatus =
  | 'QUEUED'
  | 'RINGING'
  | 'IN_PROGRESS'
  | 'ANSWERED'
  | 'COMPLETED'
  | 'BUSY'
  | 'FAILED'
  | 'VOICEMAIL';

export interface AICallTranscriptEntry {
  speaker: 'ai' | 'customer';
  text: string;
  timeOffsetSeconds?: number;
}

export interface AICallLog {
  id: string;
  leadId: string;
  customerName: string;
  customerPhone: string;
  district: string;
  provider: AICallingProvider;
  status: AICallStatus;
  durationSeconds: number;
  startedAt: string;
  completedAt?: string;
  summary: string;
  surveyConfirmed: boolean;
  confirmedDate?: string;
  confirmedKw?: number;
  confirmedRoofType?: RoofType;
  transcript: AICallTranscriptEntry[];
  recordingUrl?: string;
  sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
}
