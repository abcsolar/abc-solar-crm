import { useSyncExternalStore } from 'react';
import type {
  Lead, Quotation, Survey, Conversation, ChatMessage,
  Project, ServiceTicket, WhatsAppConfig, AuthSession, CRMUser,
  CRMNotification, AICallingConfig, AICallLog,
} from '@/types';
import {
  SEED_LEADS, SEED_QUOTATIONS, SEED_SURVEYS, SEED_CONVERSATIONS,
  SEED_PROJECTS, SEED_TICKETS, SEED_WHATSAPP_CONFIG,
  SEED_AI_CALLING_CONFIG, SEED_CALL_LOGS,
} from '@/seed';
import { DEMO_USERS } from '@/data';
import { getDiscomForDistrict } from '@/utils';

export const USERS_KEY = 'abc-solar-users-v1';

function getInitialUsers(): CRMUser[] {
  if (typeof localStorage !== 'undefined') {
    const stored = localStorage.getItem(USERS_KEY);
    if (stored) {
      try {
        const parsed: CRMUser[] = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const hasSaad = parsed.some(u => u.name === 'Mohd Saad');
          if (!hasSaad) {
            return [...DEMO_USERS];
          }
          return parsed;
        }
      } catch { /* fall through */ }
    }
  }
  return [...DEMO_USERS];
}

let users: CRMUser[] = getInitialUsers();
const userListeners = new Set<() => void>();

function emitUsers() {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }
  userListeners.forEach(l => l());
}

function subscribeUsers(listener: () => void) {
  userListeners.add(listener);
  return () => userListeners.delete(listener);
}

function getUsersSnapshot() {
  return users;
}

export function useUsers() {
  return useSyncExternalStore(subscribeUsers, getUsersSnapshot, getUsersSnapshot);
}

export function addUser(user: CRMUser) {
  users = [...users, user];
  emitUsers();
}

export function updateUser(id: string, patch: Partial<CRMUser>) {
  users = users.map(u => u.id === id ? { ...u, ...patch } : u);
  emitUsers();
}

export function deleteUser(id: string) {
  users = users.filter(u => u.id !== id);
  emitUsers();
}

const STORAGE_KEY = 'abc-solar-crm-v1';
const AUTH_KEY = 'abc-solar-auth-v1';

interface StoreData {
  leads: Lead[];
  quotations: Quotation[];
  surveys: Survey[];
  conversations: Conversation[];
  projects: Project[];
  tickets: ServiceTicket[];
  whatsappConfig: WhatsAppConfig;
  aiCallingConfig: AICallingConfig;
  callLogs: AICallLog[];
}

function getInitialData(): StoreData {
  if (typeof localStorage !== 'undefined') {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        let storedLeads: Lead[] = Array.isArray(parsed.leads) ? parsed.leads : [];

        // Ensure all 20 seed leads (including Harvey AI leads) are present
        const hasAllSeedLeads = SEED_LEADS.every(seedLead =>
          storedLeads.some(sl => sl.id === seedLead.id || sl.phone === seedLead.phone)
        );

        if (storedLeads.length < 20 || !hasAllSeedLeads) {
          const existingIds = new Set(storedLeads.map(l => l.id));
          const existingPhones = new Set(storedLeads.map(l => l.phone));
          const missing = SEED_LEADS.filter(sl => !existingIds.has(sl.id) && !existingPhones.has(sl.phone));
          storedLeads = [...storedLeads, ...missing];

          if (storedLeads.length < 20) {
            storedLeads = [...SEED_LEADS];
          }

          try {
            parsed.leads = storedLeads;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
          } catch {}
        }

        return {
          leads: storedLeads,
          quotations: parsed.quotations || SEED_QUOTATIONS,
          surveys: parsed.surveys || SEED_SURVEYS,
          conversations: parsed.conversations || SEED_CONVERSATIONS,
          projects: parsed.projects || SEED_PROJECTS,
          tickets: parsed.tickets || SEED_TICKETS,
          whatsappConfig: parsed.whatsappConfig || SEED_WHATSAPP_CONFIG,
          aiCallingConfig: parsed.aiCallingConfig || SEED_AI_CALLING_CONFIG,
          callLogs: parsed.callLogs || SEED_CALL_LOGS,
        };
      } catch {
        // fall through to seed
      }
    }
  }
  return {
    leads: [...SEED_LEADS],
    quotations: SEED_QUOTATIONS,
    surveys: SEED_SURVEYS,
    conversations: SEED_CONVERSATIONS,
    projects: SEED_PROJECTS,
    tickets: SEED_TICKETS,
    whatsappConfig: SEED_WHATSAPP_CONFIG,
    aiCallingConfig: SEED_AI_CALLING_CONFIG,
    callLogs: SEED_CALL_LOGS,
  };
}

let data: StoreData = getInitialData();
const listeners = new Set<() => void>();

function emit() {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }
  listeners.forEach(l => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return data;
}

export function useStore() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

// Lead actions
export function addLead(lead: Lead) {
  data = { ...data, leads: [lead, ...data.leads] };
  emit();
}

export function updateLead(id: string, patch: Partial<Lead>) {
  data = {
    ...data,
    leads: data.leads.map(l => l.id === id ? { ...l, ...patch } : l),
  };
  emit();
}

export function deleteLead(id: string) {
  data = { ...data, leads: data.leads.filter(l => l.id !== id) };
  emit();
}

// Quotation actions
export function addQuotation(q: Quotation) {
  data = { ...data, quotations: [q, ...data.quotations] };
  emit();
}

export function updateQuotation(id: string, patch: Partial<Quotation>) {
  data = {
    ...data,
    quotations: data.quotations.map(q => q.id === id ? { ...q, ...patch } : q),
  };
  emit();
}

// Survey actions
export function addSurvey(s: Survey) {
  data = { ...data, surveys: [s, ...data.surveys] };
  emit();
}

export function updateSurvey(id: string, patch: Partial<Survey>) {
  data = {
    ...data,
    surveys: data.surveys.map(s => s.id === id ? { ...s, ...patch } : s),
  };
  emit();
}

// Conversation actions
export function sendMessage(conversationId: string, text: string, sender: 'customer' | 'agent', agentNote = false) {
  const msg: ChatMessage = {
    id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    conversationId, sender, text, agentNote,
    timestamp: new Date().toISOString(),
    status: 'sent',
  };
  data = {
    ...data,
    conversations: data.conversations.map(c =>
      c.id === conversationId
        ? {
            ...c,
            messages: [...c.messages, msg],
            lastMessage: agentNote ? '(Internal note)' : text,
            lastMessageTime: msg.timestamp,
            unreadCount: sender === 'customer' ? c.unreadCount + 1 : 0,
          }
        : c
    ),
  };
  emit();
}

export function markConversationRead(conversationId: string) {
  data = {
    ...data,
    conversations: data.conversations.map(c =>
      c.id === conversationId ? { ...c, unreadCount: 0 } : c
    ),
  };
  emit();
}

// Project actions
export function addProject(p: Project) {
  data = { ...data, projects: [p, ...data.projects] };
  emit();
}

export function updateProject(id: string, patch: Partial<Project>) {
  data = {
    ...data,
    projects: data.projects.map(p => p.id === id ? { ...p, ...patch } : p),
  };
  emit();
}

export function advanceProjectStage(projectId: string) {
  data = {
    ...data,
    projects: data.projects.map(p => {
      if (p.id !== projectId) return p;
      const idx = p.stages.findIndex(s => !s.completed);
      if (idx === -1) return p;
      const newStages = p.stages.map((s, i) =>
        i === idx ? { ...s, completed: true, completedAt: new Date().toISOString().slice(0, 10) } : s
      );
      const nextStage = p.stages[idx + 1];
      return {
        ...p,
        stages: newStages,
        currentStage: (nextStage?.stage || p.currentStage) as Project['currentStage'],
      };
    }),
  };
  emit();
}

// Ticket actions
export function addTicket(t: ServiceTicket) {
  data = { ...data, tickets: [t, ...data.tickets] };
  emit();
}

export function updateTicket(id: string, patch: Partial<ServiceTicket>) {
  data = {
    ...data,
    tickets: data.tickets.map(t => t.id === id ? { ...t, ...patch } : t),
  };
  emit();
}

// AI Calling Config & Logs
export function updateAICallingConfig(patch: Partial<AICallingConfig>) {
  data = { ...data, aiCallingConfig: { ...data.aiCallingConfig, ...patch } };
  emit();
}

export function addCallLog(log: AICallLog) {
  data = { ...data, callLogs: [log, ...data.callLogs] };
  emit();
}

export function updateCallLog(id: string, patch: Partial<AICallLog>) {
  data = {
    ...data,
    callLogs: data.callLogs.map(c => c.id === id ? { ...c, ...patch } : c),
  };
  emit();
}

export function completeAICallAndQualify(callLog: AICallLog, surveyConfirmed: boolean) {
  // Add/update call log
  const existingIdx = data.callLogs.findIndex(c => c.id === callLog.id);
  let updatedLogs: AICallLog[];
  if (existingIdx >= 0) {
    updatedLogs = data.callLogs.map(c => c.id === callLog.id ? callLog : c);
  } else {
    updatedLogs = [callLog, ...data.callLogs];
  }

  const targetLead = data.leads.find(l => l.id === callLog.leadId);
  const now = new Date().toLocaleString('en-IN');
  const interactionEntry = `[${now}] 🤖 AI Voice Call (${callLog.durationSeconds}s): ${callLog.summary}`;

  let newSurveys = data.surveys;

  if (surveyConfirmed && targetLead) {
    // Schedule automated Site Survey
    const nextSurveySeq = data.surveys.length + 1;
    const surveyDate = callLog.confirmedDate || new Date(Date.now() + 86400000).toISOString().slice(0, 10);
    const newSurvey: Survey = {
      id: `S-${String(nextSurveySeq).padStart(3, '0')}`,
      leadId: targetLead.id,
      customerName: targetLead.name,
      customerPhone: targetLead.phone,
      siteAddress: `${targetLead.district}, Uttar Pradesh (Verified via AI Call)`,
      district: targetLead.district,
      technician: 'Vikas Yadav',
      scheduledDate: surveyDate,
      status: 'SCHEDULED',
      roofType: callLog.confirmedRoofType || targetLead.roofType || 'RCC_FLAT',
      usableArea: targetLead.roofArea || (targetLead.recommendedKw * 100),
      shadowObstructions: 'None reported during AI voice verification',
      sanctionedLoad: Math.max(3, targetLead.recommendedKw),
      connectionPhase: targetLead.recommendedKw > 5 ? 'THREE' : 'SINGLE',
      meterNumber: `DISCOM-${targetLead.district.toUpperCase().slice(0, 3)}-${Math.floor(Math.random() * 899999 + 100000)}`,
      inverterLocation: 'Near Main Distribution Board (Ground/First Floor)',
      cableDistance: 20,
      recommendedKw: callLog.confirmedKw || targetLead.recommendedKw,
      notes: `Auto-scheduled by AI Voice Calling Agent (${data.aiCallingConfig.persona}). Customer confirmed available at ${surveyDate}.`,
    };

    newSurveys = [newSurvey, ...data.surveys];

    // Update lead
    data = {
      ...data,
      callLogs: updatedLogs,
      surveys: newSurveys,
      leads: data.leads.map(l =>
        l.id === callLog.leadId
          ? {
              ...l,
              status: 'SITE_VISIT_SCHEDULED',
              priority: 'HOT',
              recommendedKw: callLog.confirmedKw || l.recommendedKw,
              roofType: callLog.confirmedRoofType || l.roofType,
              lastCallStatus: callLog.status,
              lastCallDuration: callLog.durationSeconds,
              lastCallSummary: callLog.summary,
              interactionHistory: [...(l.interactionHistory || []), interactionEntry],
              notes: `${l.notes}\n• ${interactionEntry}\n• [Survey Scheduled for ${surveyDate} by AI Agent]`,
            }
          : l
      ),
    };

    addNotification({
      message: `🤖 AI Call qualified ${callLog.customerName}! Site survey auto-booked for ${surveyDate}.`,
      source: 'CALL_IVR',
      leadName: callLog.customerName,
    });
  } else {
    // Normal call completion
    data = {
      ...data,
      callLogs: updatedLogs,
      leads: data.leads.map(l =>
        l.id === callLog.leadId
          ? {
              ...l,
              status: l.status === 'NEW' ? 'CONTACTED' : l.status,
              lastCallStatus: callLog.status,
              lastCallDuration: callLog.durationSeconds,
              lastCallSummary: callLog.summary,
              interactionHistory: [...(l.interactionHistory || []), interactionEntry],
              notes: `${l.notes}\n• ${interactionEntry}`,
            }
          : l
      ),
    };

    addNotification({
      message: `🤖 AI Voice Call completed with ${callLog.customerName} (${callLog.durationSeconds}s)`,
      source: 'CALL_IVR',
      leadName: callLog.customerName,
    });
  }

  emit();
}

// WhatsApp config
export function updateWhatsAppConfig(patch: Partial<WhatsAppConfig>) {
  data = { ...data, whatsappConfig: { ...data.whatsappConfig, ...patch } };
  emit();
}

// Auth
let authSession: AuthSession | null = getInitialAuth();
const authListeners = new Set<() => void>();

function getInitialAuth(): AuthSession | null {
  if (typeof localStorage !== 'undefined') {
    const stored = localStorage.getItem(AUTH_KEY);
    if (stored) {
      try { return JSON.parse(stored); } catch { /* fall through */ }
    }
  }
  return null;
}

function emitAuth() {
  if (typeof localStorage !== 'undefined') {
    if (authSession) localStorage.setItem(AUTH_KEY, JSON.stringify(authSession));
    else localStorage.removeItem(AUTH_KEY);
  }
  authListeners.forEach(l => l());
}

function subscribeAuth(listener: () => void) {
  authListeners.add(listener);
  return () => authListeners.delete(listener);
}

function getAuthSnapshot() {
  return authSession;
}

export function useAuth() {
  return useSyncExternalStore(subscribeAuth, getAuthSnapshot, getAuthSnapshot);
}

export function login(email: string, password: string): { ok: boolean; error?: string } {
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
  if (!user) return { ok: false, error: 'Invalid email or password' };
  if (!user.active) return { ok: false, error: 'Account is deactivated. Contact your administrator.' };
  authSession = {
    userId: user.id,
    name: user.name,
    role: user.role,
    initials: user.initials,
    allowedPages: user.allowedPages,
  };
  emitAuth();
  return { ok: true };
}

export function logout() {
  authSession = null;
  emitAuth();
}

// Reset
export function resetStore() {
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(NOTIFS_KEY);
  }
  data = {
    leads: [...SEED_LEADS],
    quotations: SEED_QUOTATIONS,
    surveys: SEED_SURVEYS,
    conversations: SEED_CONVERSATIONS,
    projects: SEED_PROJECTS,
    tickets: SEED_TICKETS,
    whatsappConfig: SEED_WHATSAPP_CONFIG,
    aiCallingConfig: SEED_AI_CALLING_CONFIG,
    callLogs: SEED_CALL_LOGS,
  };
  emit();
  users = [...DEMO_USERS];
  emitUsers();
  notifications = [];
  emitNotifs();
}

// ── Notification Store ──────────────────────────────────────────────────────
const NOTIFS_KEY = 'abc-solar-notifs-v1';

function getInitialNotifs(): CRMNotification[] {
  if (typeof localStorage !== 'undefined') {
    const stored = localStorage.getItem(NOTIFS_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        /* fall through */
      }
    }
  }
  return [];
}

let notifications: CRMNotification[] = getInitialNotifs();
const notifListeners = new Set<() => void>();

function emitNotifs() {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(NOTIFS_KEY, JSON.stringify(notifications));
  }
  notifListeners.forEach(l => l());
}

function subscribeNotifs(listener: () => void) {
  notifListeners.add(listener);
  return () => notifListeners.delete(listener);
}

function getNotifsSnapshot() {
  return notifications;
}

export function useNotifications() {
  return useSyncExternalStore(subscribeNotifs, getNotifsSnapshot, getNotifsSnapshot);
}

export function addNotification(notif: Omit<CRMNotification, 'id' | 'createdAt' | 'read'>) {
  const n: CRMNotification = {
    ...notif,
    id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    createdAt: new Date().toISOString(),
    read: false,
  };
  notifications = [n, ...notifications.slice(0, 49)];
  emitNotifs();
}

export function markAllNotifsRead() {
  notifications = notifications.map(n => ({ ...n, read: true }));
  emitNotifs();
}

export function clearNotification(id: string) {
  notifications = notifications.filter(n => n.id !== id);
  emitNotifs();
}

// ── Ingest Lead (with Deduplication & Auto-Assignment) ───────────────────────
export function ingestLead(
  leadData: Omit<Lead, 'id' | 'discom' | 'status' | 'assignedTo' | 'followUpDate' | 'createdAt'> & {
    email?: string;
    whatsapp?: string;
  }
): 'created' | 'duplicate' {
  const cleanPhone = leadData.phone.replace(/\D/g, '').slice(-10);
  const normName = leadData.name.trim().toLowerCase();
  const existing = data.leads.find(l => {
    const lPhone = l.phone.replace(/\D/g, '').slice(-10);
    if (cleanPhone && lPhone && cleanPhone === lPhone) return true;
    const lName = l.name.trim().toLowerCase();
    if (normName.length > 3 && (lName.includes(normName) || normName.includes(lName))) return true;
    return false;
  });

  if (existing) {
    const historyEntry = `[${new Date().toLocaleString('en-IN')}] Inquiry via ${leadData.source}: ${leadData.notes || 'No extra notes'}`;
    const updatedHistory = [...(existing.interactionHistory || []), historyEntry];
    updateLead(existing.id, {
      interactionHistory: updatedHistory,
      dealValue: Math.max(existing.dealValue || 0, leadData.dealValue || 0),
      monthlyBill: leadData.monthlyBill || existing.monthlyBill,
      recommendedKw: leadData.recommendedKw || existing.recommendedKw,
      email: leadData.email || existing.email,
      whatsapp: leadData.whatsapp || existing.whatsapp,
      notes: `${existing.notes}\n• ${historyEntry}`,
    });
    addNotification({
      message: `Follow-up inquiry from existing customer: ${existing.name} (${existing.district}) via ${leadData.source}`,
      source: leadData.source,
      leadName: existing.name,
    });
    return 'duplicate';
  }

  const nextSeq = data.leads.length + 1;
  const leadId = `LEAD-${new Date().getFullYear()}-${String(nextSeq).padStart(4, '0')}`;
  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);

  const newLead: Lead = {
    id: leadId,
    discom: getDiscomForDistrict(leadData.district),
    status: 'NEW',
    assignedTo: 'Priya Singh',
    followUpDate: tomorrow,
    createdAt: new Date().toISOString(),
    interactionHistory: [
      `[${new Date().toLocaleString('en-IN')}] Ingested via ${leadData.source}`,
    ],
    ...leadData,
    phone: cleanPhone,
  };

  addLead(newLead);
  addNotification({
    message: `New lead from ${leadData.source}: ${leadData.name} (${leadData.district})`,
    source: leadData.source,
    leadName: leadData.name,
  });

  return 'created';
}
