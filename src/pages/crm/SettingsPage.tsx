import { useState, useMemo, useRef, useEffect } from 'react';
import {
  Users, Zap, Bot, Building2, Shield, Settings, MessageCircle, Check,
  Eye, EyeOff, Save, RefreshCw, AlertCircle, UserPlus, KeyRound,
  Pencil, Trash2, Power, X, PhoneCall, Copy, Download, ExternalLink,
  Play, CheckCircle2, ChevronRight, Phone, Volume2, Sparkles,
  AlertTriangle, Radio, Sliders, Database, ArrowRight, MapPin,
  Terminal, Clock,
} from 'lucide-react';
import {
  useStore, updateWhatsAppConfig, updateAICallingConfig, resetStore,
  useUsers, addUser, updateUser, deleteUser,
} from '@/store';
import { COMPANY, ROLE_ALLOWED_PAGES } from '@/data';
import { Card, Badge, Modal } from '@/components/ui';
import { validateIndianPhone, uid, formatDate, formatINR } from '@/utils';
import { cn } from '@/utils/cn';
import type { CRMPageProps } from '@/types/crm';
import type { CRMUser, CRMRole, AICallingConfig, AICallingProvider, AICallLog, Lead } from '@/types';
import {
  simulateMetaLeadAdsWebhook, simulateIndiaMartWebhook, simulateCallIVRWebhook, simulateHarveyLeadWebhook,
  SAMPLE_META_PAYLOAD, SAMPLE_INDIAMART_PAYLOAD, SAMPLE_IVR_PAYLOAD,
} from '@/services/leadIngestion';
import { handleAICallWebhook } from '@/services/aiCalling';
import { AICallModal } from '@/components/crm/AICallModal';

type SettingsTab = 'team' | 'integrations' | 'ai-calling' | 'company' | 'system';
type IntegrationsSubTab = 'whatsapp' | 'harvey' | 'webhooks';

const ROLE_COLORS: Record<string, string> = {
  'Super Admin': 'bg-purple-100 text-purple-700',
  'Sales Manager': 'bg-amber-100 text-amber-700',
  'Site Engineer': 'bg-teal-100 text-teal-700',
  'Accountant': 'bg-blue-100 text-blue-700',
};

const ROLES: CRMRole[] = ['Super Admin', 'Sales Manager', 'Site Engineer', 'Accountant'];

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return parts[0]?.slice(0, 2).toUpperCase() || 'U';
}

export function SettingsPage({ onNavigate: _onNavigate }: CRMPageProps) {
  const store = useStore();
  const { whatsappConfig, aiCallingConfig, callLogs, leads, quotations, surveys, projects, tickets } = store;
  const allUsers = useUsers();

  // Active Tab with LocalStorage and URL persistence
  const [activeTab, setActiveTab] = useState<SettingsTab>(() => {
    if (typeof window !== 'undefined') {
      try {
        const params = new URLSearchParams(window.location.search);
        const urlTab = params.get('tab') || params.get('settings_tab');
        if (urlTab && ['team', 'integrations', 'ai-calling', 'company', 'system'].includes(urlTab)) {
          return urlTab as SettingsTab;
        }
      } catch {}
      if (typeof localStorage !== 'undefined') {
        const saved = localStorage.getItem('abc_solar_settings_tab');
        if (saved && ['team', 'integrations', 'ai-calling', 'company', 'system'].includes(saved)) {
          return saved as SettingsTab;
        }
      }
    }
    return 'team';
  });

  const [integrationsSubTab, setIntegrationsSubTab] = useState<IntegrationsSubTab>(() => {
    if (typeof window !== 'undefined') {
      try {
        const params = new URLSearchParams(window.location.search);
        const urlSubTab = params.get('subtab') || params.get('sub_tab');
        if (urlSubTab && ['whatsapp', 'harvey', 'webhooks'].includes(urlSubTab)) {
          return urlSubTab as IntegrationsSubTab;
        }
      } catch {}
      if (typeof localStorage !== 'undefined') {
        const saved = localStorage.getItem('abc_solar_settings_subtab');
        if (saved && ['whatsapp', 'harvey', 'webhooks'].includes(saved)) {
          return saved as IntegrationsSubTab;
        }
      }
    }
    return 'whatsapp';
  });

  function handleTabChange(tab: SettingsTab) {
    setActiveTab(tab);
    if (typeof window !== 'undefined') {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('abc_solar_settings_tab', tab);
      }
      try {
        const url = new URL(window.location.href);
        url.searchParams.set('tab', tab);
        if (tab !== 'integrations') {
          url.searchParams.delete('subtab');
          url.searchParams.delete('sub_tab');
        }
        window.history.replaceState(null, '', url.pathname + url.search);
      } catch {}
    }
  }

  function handleSubTabChange(subTab: IntegrationsSubTab) {
    setIntegrationsSubTab(subTab);
    if (typeof window !== 'undefined') {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('abc_solar_settings_subtab', subTab);
      }
      try {
        const url = new URL(window.location.href);
        url.searchParams.set('tab', 'integrations');
        url.searchParams.set('subtab', subTab);
        window.history.replaceState(null, '', url.pathname + url.search);
      } catch {}
    }
  }

  // Synchronize URL query params
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const url = new URL(window.location.href);
        let changed = false;
        if (url.searchParams.get('tab') !== activeTab) {
          url.searchParams.set('tab', activeTab);
          changed = true;
        }
        if (activeTab === 'integrations') {
          if (url.searchParams.get('subtab') !== integrationsSubTab) {
            url.searchParams.set('subtab', integrationsSubTab);
            changed = true;
          }
        }
        if (changed) {
          window.history.replaceState(null, '', url.pathname + url.search);
        }
      } catch {}
    }
  }, [activeTab, integrationsSubTab]);

  // Copy feedback state
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  function handleCopy(text: string, key: string) {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  }

  // ── Tab 1: Team & Users State ─────────────────────────────────────────────
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<CRMUser | null>(null);

  function handleAddUser() {
    setEditingUser(null);
    setShowUserModal(true);
  }

  function handleEditUser(user: CRMUser) {
    setEditingUser(user);
    setShowUserModal(true);
  }

  function handleDeleteUser(user: CRMUser) {
    if (confirm(`Delete user "${user.name}"? This action cannot be undone.`)) {
      deleteUser(user.id);
    }
  }

  function handleToggleActive(user: CRMUser) {
    updateUser(user.id, { active: !user.active });
  }

  function handleResetPassword(user: CRMUser) {
    const newPwd = prompt(`Enter new password for ${user.name}:`);
    if (newPwd && newPwd.trim().length >= 4) {
      updateUser(user.id, { password: newPwd.trim() });
      alert('Password updated successfully.');
    }
  }

  // ── Tab 2: Integrations & Webhooks State ──────────────────────────────────
  const [waConfig, setWaConfig] = useState(whatsappConfig);
  const [showWaToken, setShowWaToken] = useState(false);
  const [waSaved, setWaSaved] = useState(false);
  const [webhookResult, setWebhookResult] = useState<{ type: 'created' | 'duplicate'; message: string } | null>(null);
  const [scoutTriggerLoading, setScoutTriggerLoading] = useState(false);
  const [scoutToast, setScoutToast] = useState<string | null>(null);

  // Harvey Autonomous Scout Live Execution Logs
  const [scoutLogs, setScoutLogs] = useState<Array<{
    id: string;
    timestamp: string;
    text: string;
  }>>([
    {
      id: 'init-1',
      timestamp: '18:10:00',
      text: '[DAEMON] Harvey Scout Daemon v2.4 (UP Territory) - Standby.',
    },
    {
      id: 'init-2',
      timestamp: '18:10:02',
      text: '[SMTP/IMAP] Authenticated session active (abc.solar7575@gmail.com). Monitoring inbound replies.',
    },
  ]);
  const terminalContainerRef = useRef<HTMLDivElement>(null);
  const lastIngestedTimestampRef = useRef<number>(Date.now());

  // ── Harvey 24x7 Auto-Scout Background Daemon & Scheduler State ──────────
  const [isDaemonActive, setIsDaemonActive] = useState(() => {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      return localStorage.getItem('harvey_daemon_active') === 'true';
    }
    return false;
  });
  const [daemonInterval, setDaemonInterval] = useState(() => {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      return localStorage.getItem('harvey_daemon_interval') || '1h';
    }
    return '1h';
  });

  function getIntervalLabel(val: string): string {
    switch (val) {
      case '30m': return 'every 30 mins';
      case '1h': return 'every 60 mins';
      case '3h': return 'every 3 hours';
      case 'daily': return 'daily at 10:00 AM';
      default: return 'every 60 mins';
    }
  }

  // Fetch initial daemon state from backend or rehydrate backend from persisted preference
  useEffect(() => {
    const savedActive = typeof localStorage !== 'undefined' ? localStorage.getItem('harvey_daemon_active') : null;
    const savedInterval = typeof localStorage !== 'undefined' ? localStorage.getItem('harvey_daemon_interval') : null;

    fetch('/api/harvey/daemon')
      .then(res => res.json())
      .then(data => {
        if (data?.isDaemonActive === true) {
          setIsDaemonActive(true);
          localStorage.setItem('harvey_daemon_active', 'true');
          if (data?.interval) {
            setDaemonInterval(data.interval);
            localStorage.setItem('harvey_daemon_interval', data.interval);
          }
        } else if (savedActive === 'true') {
          // Keep active locally and re-sync backend
          setIsDaemonActive(true);
          fetch('/api/harvey/daemon', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'start',
              interval: savedInterval || daemonInterval,
            }),
          }).catch(() => {});
        } else if (typeof data?.isDaemonActive === 'boolean') {
          setIsDaemonActive(data.isDaemonActive);
        }
      })
      .catch(() => {});
  }, []);

  async function handleToggleDaemon() {
    const nextState = !isDaemonActive;
    setIsDaemonActive(nextState);
    localStorage.setItem('harvey_daemon_active', String(nextState));

    const now = () => new Date().toLocaleTimeString('en-US', { hour12: false });

    try {
      await fetch('/api/harvey/daemon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: nextState ? 'start' : 'stop',
          interval: daemonInterval,
        }),
      });

      if (nextState) {
        setScoutToast(`🟢 24x7 Auto-Scout Daemon activated (Polling ${getIntervalLabel(daemonInterval)})`);
        setScoutLogs(prev => [
          ...prev,
          {
            id: `d-${Date.now()}`,
            timestamp: now(),
            text: `[DAEMON] 24x7 Auto-Scout Daemon activated. Polling frequency: ${getIntervalLabel(daemonInterval)}.`,
          },
        ]);
      } else {
        setScoutToast(`⚪ 24x7 Auto-Scout Daemon paused (Standby)`);
        setScoutLogs(prev => [
          ...prev,
          {
            id: `d-${Date.now()}`,
            timestamp: now(),
            text: `[DAEMON] Background scheduler paused by admin.`,
          },
        ]);
      }
    } catch {
      setScoutToast(nextState ? `🟢 Auto-Scout active` : `⚪ Auto-Scout paused`);
    } finally {
      setTimeout(() => setScoutToast(null), 4000);
    }
  }

  async function handleChangeInterval(newInterval: string) {
    setDaemonInterval(newInterval);
    localStorage.setItem('harvey_daemon_interval', newInterval);

    if (isDaemonActive) {
      try {
        await fetch('/api/harvey/daemon', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'start', interval: newInterval }),
        });
        setScoutToast(`⏱️ Daemon interval updated to ${getIntervalLabel(newInterval)}`);
        setTimeout(() => setScoutToast(null), 3000);
      } catch {}
    }
  }

  useEffect(() => {
    if (terminalContainerRef.current) {
      terminalContainerRef.current.scrollTop = terminalContainerRef.current.scrollHeight;
    }
  }, [scoutLogs, scoutTriggerLoading]);

  // Real-time listener for incoming webhooks and background daemon state
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        // 1. Check for incoming webhook leads
        const res = await fetch('/api/webhooks/latest-harvey-lead');
        const data = await res.json();
        if (data?.timestamp && data.timestamp > lastIngestedTimestampRef.current && data.lead) {
          lastIngestedTimestampRef.current = data.timestamp;
          const result = simulateHarveyLeadWebhook(data.lead);
          logActivity(
            'POST /api/webhooks/harvey-leads',
            'Harvey AI Autonomous Scout',
            `${data.lead.company_or_client_name} (${data.lead.city_district || 'UP'})`,
            result === 'created' ? 'INGESTED' : 'DUPLICATE_UPDATED'
          );
        }

        // 2. Sync background daemon logs if active
        if (isDaemonActive) {
          const dRes = await fetch('/api/harvey/daemon');
          const dData = await dRes.json();
          if (Array.isArray(dData?.logs) && dData.logs.length > 0) {
            setScoutLogs(prev => {
              const existingIds = new Set(prev.map(l => l.id));
              const newLogs = dData.logs.filter((l: any) => !existingIds.has(l.id));
              return newLogs.length > 0 ? [...prev, ...newLogs] : prev;
            });
          }
        }
      } catch {
        // ignore polling network noise
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [isDaemonActive]);

  async function handleTriggerLiveScout() {
    if (scoutTriggerLoading) return;
    setScoutTriggerLoading(true);

    const now = () => new Date().toLocaleTimeString('en-US', { hour12: false });

    setScoutLogs(prev => [
      ...prev,
      {
        id: `start-${Date.now()}`,
        timestamp: now(),
        text: '[DAEMON] Executing: /Users/mohdsaad/harvey/venv/bin/python -m harvey.main --territory "Barabanki,Lucknow,Varanasi" --mode scout',
      },
    ]);

    try {
      const res = await fetch('/api/harvey/trigger', { method: 'POST' });
      if (!res.body) {
        throw new Error('Streaming response body not supported');
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;
          setScoutLogs(prev => [
            ...prev,
            {
              id: `log-${Date.now()}-${Math.random()}`,
              timestamp: now(),
              text: trimmed,
            },
          ]);
        }
      }

      if (buffer.trim()) {
        setScoutLogs(prev => [
          ...prev,
          {
            id: `log-${Date.now()}-${Math.random()}`,
            timestamp: now(),
            text: buffer.trim(),
          },
        ]);
      }

      // Check for the verified lead that arrived at /api/webhooks/harvey-leads
      const leadRes = await fetch('/api/webhooks/latest-harvey-lead');
      const leadData = await leadRes.json();
      if (leadData?.lead && leadData.timestamp > (lastIngestedTimestampRef.current || 0)) {
        lastIngestedTimestampRef.current = leadData.timestamp;
        const result = simulateHarveyLeadWebhook(leadData.lead);
        setScoutToast(`🚀 Harvey AI closed lead: ${leadData.lead.company_or_client_name} (${leadData.lead.city_district})`);
        logActivity(
          'POST /api/webhooks/harvey-leads',
          'Harvey AI Scout',
          `${leadData.lead.company_or_client_name} (${leadData.lead.city_district})`,
          result === 'created' ? 'INGESTED' : 'DUPLICATE_UPDATED'
        );
        setTimeout(() => setScoutToast(null), 6000);
      }
    } catch (err: any) {
      setScoutLogs(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          timestamp: now(),
          text: `[ERROR] Execution error: ${err.message}`,
        },
      ]);
    } finally {
      setScoutTriggerLoading(false);
    }
  }

  // Live Webhook Activity Log (seeded with recent activity)
  const [activityLogs, setActivityLogs] = useState<Array<{
    id: string;
    timestamp: string;
    endpoint: string;
    source: string;
    leadName: string;
    status: 'INGESTED' | 'DUPLICATE_UPDATED';
  }>>([
    { id: 'ACT-1', timestamp: '10 mins ago', endpoint: 'POST /api/webhooks/meta-leads', source: 'Meta Lead Ads', leadName: 'Ajay Verma (Sitapur)', status: 'INGESTED' },
    { id: 'ACT-2', timestamp: '45 mins ago', endpoint: 'POST /api/webhooks/indiamart', source: 'IndiaMART B2B', leadName: 'Awadh Cold Storage (50kW)', status: 'INGESTED' },
    { id: 'ACT-3', timestamp: '2 hours ago', endpoint: 'POST /api/webhooks/call-logs', source: 'Cloud Telephony IVR', leadName: 'Caller 4432 (Barabanki)', status: 'DUPLICATE_UPDATED' },
  ]);

  function logActivity(endpoint: string, source: string, leadName: string, status: 'INGESTED' | 'DUPLICATE_UPDATED') {
    const entry = {
      id: `ACT-${Date.now()}`,
      timestamp: 'Just now',
      endpoint,
      source,
      leadName,
      status,
    };
    setActivityLogs(prev => [entry, ...prev.slice(0, 9)]);
  }

  function handleSaveWhatsApp() {
    updateWhatsAppConfig(waConfig);
    setWaSaved(true);
    setTimeout(() => setWaSaved(false), 2000);
  }

  function handleConnectWhatsApp() {
    updateWhatsAppConfig({ ...waConfig, connected: !waConfig.connected });
    setWaConfig({ ...waConfig, connected: !waConfig.connected });
  }

  function showWebhookResult(result: 'created' | 'duplicate', source: string) {
    const msg = result === 'created'
      ? `✅ Ingested new lead from ${source} into CRM Lead Directory!`
      : `⚠️ Existing phone matched — appended new touchpoint to customer interaction history.`;
    setWebhookResult({ type: result, message: msg });
    setTimeout(() => setWebhookResult(null), 4000);
  }

  function handleSimulateMeta() {
    const randomPhone = `9${String(Math.floor(Math.random() * 900000000) + 100000000)}`;
    const result = simulateMetaLeadAdsWebhook({
      ...SAMPLE_META_PAYLOAD,
      phone_number: randomPhone,
    });
    showWebhookResult(result, 'Meta Lead Ads');
    logActivity('POST /api/webhooks/meta-leads', 'Meta Lead Ads', `${SAMPLE_META_PAYLOAD.full_name} (${SAMPLE_META_PAYLOAD.district})`, result === 'created' ? 'INGESTED' : 'DUPLICATE_UPDATED');
  }

  function handleSimulateIndiamart() {
    const randomPhone = `9${String(Math.floor(Math.random() * 900000000) + 100000000)}`;
    const result = simulateIndiaMartWebhook({
      ...SAMPLE_INDIAMART_PAYLOAD,
      SENDER_MOBILE: randomPhone,
    });
    showWebhookResult(result, 'IndiaMART');
    logActivity('POST /api/webhooks/indiamart', 'IndiaMART B2B', `${SAMPLE_INDIAMART_PAYLOAD.SENDER_NAME} (${SAMPLE_INDIAMART_PAYLOAD.SENDER_CITY})`, result === 'created' ? 'INGESTED' : 'DUPLICATE_UPDATED');
  }

  function handleSimulateIVR() {
    const randomPhone = `9${String(Math.floor(Math.random() * 900000000) + 100000000)}`;
    const result = simulateCallIVRWebhook({
      ...SAMPLE_IVR_PAYLOAD,
      caller_number: randomPhone,
    });
    showWebhookResult(result, 'Cloud Telephony IVR');
    logActivity('POST /api/webhooks/call-logs', 'Cloud Telephony IVR', `Inbound Caller ${randomPhone.slice(-4)}`, result === 'created' ? 'INGESTED' : 'DUPLICATE_UPDATED');
  }

  function handleSimulateAICallWebhook() {
    const randomLead = leads[0];
    if (!randomLead) return;
    handleAICallWebhook({
      event: 'call.completed',
      call_id: `CALL-${Date.now().toString(36).toUpperCase()}`,
      lead_id: randomLead.id,
      customer_phone: randomLead.phone,
      duration_seconds: 110,
      status: 'completed',
      summary: `AI voice survey verified: Customer confirmed 5 kW plant on RCC roof. Site survey booked for tomorrow.`,
      extracted_data: {
        bill_verified: randomLead.monthlyBill,
        kw_confirmed: randomLead.recommendedKw,
        roof_type: 'RCC_FLAT',
        survey_scheduled: true,
        survey_date: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
      },
      transcript: [
        { speaker: 'ai', message: 'नमस्ते! मैं ABC Solar से AI सेल्स असिस्टेंट बात कर रही हूँ।', timestamp: 0 },
        { speaker: 'customer', message: 'हाँ नमस्ते, मुझे साइट सर्वे करवाना है।', timestamp: 8 },
        { speaker: 'ai', message: 'बहुत अच्छा सर! आपका फ्री साइट सर्वे कल के लिए बुक कर दिया गया है।', timestamp: 20 },
      ],
    });
    showWebhookResult('created', 'AI Call Webhook (/api/webhooks/ai-call)');
    logActivity('POST /api/webhooks/ai-call', 'Voice AI Webhook', `${randomLead.name} (Survey Verified)`, 'INGESTED');
  }

  // ── Tab 3: AI Voice Calling Agent State ───────────────────────────────────
  const [aiConfig, setAiConfig] = useState<AICallingConfig>(aiCallingConfig);
  const [showAiKey, setShowAiKey] = useState(false);
  const [aiSaved, setAiSaved] = useState(false);
  const [testPhoneNumber, setTestPhoneNumber] = useState('9278442418');
  const [testingAiCall, setTestingAiCall] = useState(false);
  const [testCallToast, setTestCallToast] = useState<string | null>(null);

  // Selected call log to inspect in modal
  const [selectedCallLog, setSelectedCallLog] = useState<{ log: AICallLog; lead: Lead } | null>(null);

  function handleSaveAiConfig() {
    updateAICallingConfig(aiConfig);
    setAiSaved(true);
    setTimeout(() => setAiSaved(false), 2000);
  }

  function handleTriggerTestCall() {
    if (!testPhoneNumber || testPhoneNumber.length < 10) {
      alert('Please enter a valid 10-digit mobile number for test call.');
      return;
    }
    setTestingAiCall(true);
    setTimeout(() => {
      setTestingAiCall(false);
      setTestCallToast(`✅ Test AI Qualification Call successfully initiated to +91 ${testPhoneNumber} via ${aiConfig.provider.toUpperCase()} (Voice: ${aiConfig.persona})`);
      setTimeout(() => setTestCallToast(null), 5000);
    }, 1500);
  }

  // ── Tab 5: System & Maintenance State ────────────────────────────────────
  const [showResetConfirmModal, setShowResetConfirmModal] = useState(false);

  function handleExportBackup() {
    const backupData = {
      exportDate: new Date().toISOString(),
      platform: 'ABC Solar CRM (A Unit of Avadh Boring Company)',
      data: {
        leads,
        quotations,
        surveys,
        projects,
        tickets,
        callLogs,
        users: allUsers,
        aiCallingConfig,
        whatsappConfig,
      },
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `abc-solar-crm-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleExecuteReset() {
    resetStore();
    setShowResetConfirmModal(false);
    alert('CRM database has been successfully reset to verified factory seed data.');
  }

  return (
    <div className="animate-fade-in space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="font-display font-extrabold text-2xl text-slate-900 tracking-tight">System Settings</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Manage staff users, external API integrations, AI voice agent, company profile, and system maintenance
        </p>
      </div>

      {/* Horizontal Sub-Tab Navigation Bar */}
      <div className="border-b border-slate-200 bg-white rounded-2xl shadow-xs p-1.5 flex items-center gap-1.5 overflow-x-auto">
        {[
          { id: 'team', label: 'Team & Users', icon: Users, badge: `${allUsers.length}` },
          { id: 'integrations', label: 'Integrations & APIs', icon: Zap, badge: 'Active' },
          { id: 'ai-calling', label: 'AI Calling Agent', icon: Bot, badge: aiConfig.enabled ? 'Enabled' : 'Off' },
          { id: 'company', label: 'Company Profile', icon: Building2 },
          { id: 'system', label: 'System & Maintenance', icon: Shield },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabChange(tab.id as SettingsTab)}
              className={cn(
                'inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0',
                isActive
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              )}
            >
              <Icon size={16} className={isActive ? 'text-amber-400' : 'text-slate-400'} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  className={cn(
                    'px-1.5 py-0.2 rounded-full text-[10px] font-bold',
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                  )}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          TAB 1: TEAM & USERS
         ═══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'team' && (
        <div className="space-y-5 animate-fade-in">
          <Card className="p-6">
            <div className="flex items-center justify-between flex-wrap gap-4 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-solar-50 flex items-center justify-center text-solar-600">
                  <Users size={22} />
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-slate-900">Team Staff & Access Roles</h3>
                  <p className="text-sm text-slate-500">Manage internal employees, roles, login credentials, and page authorizations</p>
                </div>
              </div>
              <button onClick={handleAddUser} className="btn-primary text-xs">
                <UserPlus size={15} /> Add Team Member
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-xs text-slate-400 font-semibold uppercase tracking-wide">
                    <th className="py-2.5 pr-3">Staff Name</th>
                    <th className="py-2.5 pr-3">Official Email</th>
                    <th className="py-2.5 pr-3">Role</th>
                    <th className="py-2.5 pr-3">Status</th>
                    <th className="py-2.5 pr-3">Added Date</th>
                    <th className="py-2.5 pr-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {allUsers.map(user => (
                    <tr key={user.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 pr-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
                            {user.initials}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-sm">{user.name}</p>
                            <p className="text-[11px] text-slate-500">{user.phone}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 pr-3 text-slate-600 font-mono text-xs">{user.email}</td>
                      <td className="py-3 pr-3">
                        <span className={cn('inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full', ROLE_COLORS[user.role])}>
                          {user.role}
                        </span>
                      </td>
                      <td className="py-3 pr-3">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(user)}
                          className={cn(
                            'inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-0.5 rounded-full transition-colors cursor-pointer',
                            user.active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-400 border border-slate-200'
                          )}
                          title="Click to toggle status"
                        >
                          <span className={cn('w-1.5 h-1.5 rounded-full', user.active ? 'bg-emerald-500' : 'bg-slate-400')} />
                          {user.active ? 'Active' : 'Deactivated'}
                        </button>
                      </td>
                      <td className="py-3 pr-3 text-xs text-slate-500">{user.createdAt}</td>
                      <td className="py-3 pr-3 text-right">
                        <div className="inline-flex items-center gap-1 justify-end">
                          <button
                            onClick={() => handleResetPassword(user)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                            title="Reset Password"
                          >
                            <KeyRound size={15} />
                          </button>
                          <button
                            onClick={() => handleEditUser(user)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                            title="Edit User"
                          >
                            <Pencil size={15} />
                          </button>
                          {allUsers.length > 1 && (
                            <button
                              onClick={() => handleDeleteUser(user)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              title="Delete User"
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Role Access Matrix Guide */}
            <div className="mt-6 pt-5 border-t border-slate-200">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Role Permission Overview</h4>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-purple-50/50 border border-purple-100 space-y-1">
                  <p className="font-bold text-purple-900">Super Admin</p>
                  <p className="text-slate-500 text-[11px]">Full platform control, settings, user admin, and financial reports.</p>
                </div>
                <div className="p-3 rounded-xl bg-amber-50/50 border border-amber-100 space-y-1">
                  <p className="font-bold text-amber-900">Sales Manager</p>
                  <p className="text-slate-500 text-[11px]">Leads directory, sales pipeline, quotation creation, and WhatsApp chat.</p>
                </div>
                <div className="p-3 rounded-xl bg-teal-50/50 border border-teal-100 space-y-1">
                  <p className="font-bold text-teal-900">Site Engineer</p>
                  <p className="text-slate-500 text-[11px]">Site visit surveys, roof technical specs, and installation progress.</p>
                </div>
                <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-100 space-y-1">
                  <p className="font-bold text-blue-900">Accountant</p>
                  <p className="text-slate-500 text-[11px]">BOQ pricing, GST calculations, project billing, and payments ledger.</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          TAB 2: INTEGRATIONS & APIS
         ═══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'integrations' && (
        <div className="space-y-6 animate-fade-in">
          {/* Pill-Style Secondary Sub-Navigation */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100/90 rounded-xl border border-slate-200/80 w-fit">
            <button
              type="button"
              onClick={() => handleSubTabChange('whatsapp')}
              className={cn(
                'flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer',
                integrationsSubTab === 'whatsapp'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              )}
            >
              <MessageCircle size={15} className="text-forest-600" />
              <span>WhatsApp Cloud API</span>
              {waConfig.connected && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white" />
              )}
            </button>

            <button
              type="button"
              onClick={() => handleSubTabChange('harvey')}
              className={cn(
                'flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer',
                integrationsSubTab === 'harvey'
                  ? 'bg-white text-indigo-900 shadow-xs border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              )}
            >
              <Bot size={15} className="text-indigo-600" />
              <span>Harvey Autonomous Scout</span>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-extrabold bg-indigo-100 text-indigo-700">
                300km
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleSubTabChange('webhooks')}
              className={cn(
                'flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer',
                integrationsSubTab === 'webhooks'
                  ? 'bg-white text-purple-900 shadow-xs border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              )}
            >
              <Zap size={15} className="text-purple-600" />
              <span>Lead Ads &amp; Webhooks</span>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-purple-100 text-purple-700">
                4 Channels
              </span>
            </button>
          </div>

          {/* Sub-Tab 1: WhatsApp Cloud API */}
          {integrationsSubTab === 'whatsapp' && (
          <Card className="p-6">
            <div className="flex items-center justify-between flex-wrap gap-4 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-forest-50 text-forest-700 flex items-center justify-center">
                  <MessageCircle size={22} />
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-slate-900">WhatsApp Business Cloud API</h3>
                  <p className="text-sm text-slate-500">Official Meta Cloud API for customer notifications, quotations, and chat</p>
                </div>
              </div>
              <Badge className={waConfig.connected ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}>
                {waConfig.connected ? '🟢 Connected & Active' : '⚪ Disconnected'}
              </Badge>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label-field">WhatsApp Business Account (WABA) ID</label>
                  <input
                    type="text"
                    value={waConfig.wabaId}
                    onChange={e => setWaConfig({ ...waConfig, wabaId: e.target.value })}
                    className="input-field font-mono"
                  />
                </div>
                <div>
                  <label className="label-field">Phone Number ID</label>
                  <input
                    type="text"
                    value={waConfig.phoneNumberId}
                    onChange={e => setWaConfig({ ...waConfig, phoneNumberId: e.target.value })}
                    className="input-field font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="label-field">Permanent Access Token</label>
                <div className="relative">
                  <input
                    type={showWaToken ? 'text' : 'password'}
                    value={waConfig.accessToken}
                    onChange={e => setWaConfig({ ...waConfig, accessToken: e.target.value })}
                    className="input-field font-mono pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowWaToken(!showWaToken)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showWaToken ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="label-field">Webhook Verification Secret Token</label>
                <input
                  type="text"
                  value={waConfig.webhookVerifyToken}
                  onChange={e => setWaConfig({ ...waConfig, webhookVerifyToken: e.target.value })}
                  className="input-field font-mono"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button type="button" onClick={handleSaveWhatsApp} className="btn-primary">
                  {waSaved ? <><Check size={16} /> Saved!</> : <><Save size={16} /> Save WhatsApp Config</>}
                </button>
                <button
                  type="button"
                  onClick={handleConnectWhatsApp}
                  className={waConfig.connected ? 'btn-outline' : 'btn-secondary'}
                >
                  {waConfig.connected ? 'Disconnect WhatsApp' : 'Connect Account'}
                </button>
              </div>
            </div>
          </Card>
          )}

          {/* ── Sub-Tab 2: Harvey Autonomous Scout ── */}
          {integrationsSubTab === 'harvey' && (
            <div className="space-y-6 animate-fade-in">
              <Card className="p-6 border-indigo-200 bg-gradient-to-b from-indigo-50/20 to-white shadow-sm">
                <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center text-2xl shrink-0 shadow-2xs">
                      🤖
                    </div>
                    <div>
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h3 className="font-display font-bold text-xl text-slate-900">
                          Harvey AI — Autonomous Commercial &amp; Residential Scout
                        </h3>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                          🟢 Active — Scouting 300km Radius including Varanasi
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 mt-0.5">
                        Autonomous B2B &amp; high-ticket residential solar sales scout for ABC SOLAR (M/S Avadh Boring Company, Barabanki)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5 shadow-2xs">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      SMTP/IMAP Connected (abc.solar7575@gmail.com)
                    </span>
                    <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                      UPNEDA Vendor: <strong>BBK2508133242</strong>
                    </span>
                    <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                      Loom Solar Dealer: <strong>24483/UP/08/2028</strong>
                    </span>
                  </div>
                </div>

                {/* Coverage & Territory Showcase */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 mb-4 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span className="flex items-center gap-1.5">
                      <MapPin size={14} className="text-indigo-600" />
                      16 Target Districts (300 km Operational Radius from Barabanki HQ)
                    </span>
                    <span className="text-slate-400 font-normal">Covering DISCOMs: MVVNL, PVVNL, DVVNL, PuVVNL</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      'Barabanki (HQ)', 'Lucknow', 'Sitapur', 'Lakhimpur Kheri', 'Ayodhya',
                      'Gonda', 'Bahraich', 'Rae Bareli', 'Kanpur', 'Unnao', 'Sultanpur',
                      'Amethi', 'Hardoi', 'Basti', 'Gorakhpur', 'Varanasi',
                    ].map(d => (
                      <span key={d} className="px-2.5 py-1 bg-white border border-slate-200 rounded-md text-[11px] font-semibold text-slate-700 shadow-2xs">
                        {d}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Subsidy Matrix Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs mb-4">
                  <div className="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-emerald-950 text-sm">2 kW Residential</span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-extrabold bg-emerald-200 text-emerald-900">Flat ₹90,000</span>
                    </div>
                    <p className="text-emerald-800 font-medium text-[11.5px]">Cost approx ₹90,000</p>
                    <p className="text-[11px] text-emerald-700 leading-snug">
                      Combined Central (₹60k) + UP State (₹30k) direct DBT benefit. Near-zero net investment.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-amber-950 text-sm">3 kW Residential</span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-extrabold bg-amber-200 text-amber-900">Flat ₹1,08,000</span>
                    </div>
                    <p className="text-amber-800 font-medium text-[11.5px]">Cost ₹1.40L – ₹2.00L</p>
                    <p className="text-[11px] text-amber-700 leading-snug">
                      Combined Central (₹78k) + UP State (₹30k). Ideal for homes with bills &gt; ₹4,000/mo.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-purple-50/80 border border-purple-200 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-purple-950 text-sm">10-100 kW+ Commercial</span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-extrabold bg-purple-200 text-purple-900">40% Depr.</span>
                    </div>
                    <p className="text-purple-800 font-medium text-[11.5px]">Cold Storages, Mills &amp; Hospitals</p>
                    <p className="text-[11px] text-purple-700 leading-snug">
                      Accelerated Depreciation under Sec 32, massive tariff cuts, and turnkey net-metering.
                    </p>
                  </div>
                </div>

                {/* Webhook Endpoint Box */}
                <div className="space-y-2 mb-4">
                  <label className="text-xs font-bold text-slate-700">Autonomous Inbound Webhook Receiver</label>
                  <div className="flex items-center justify-between bg-slate-900 text-slate-100 rounded-xl p-3 text-xs font-mono border border-slate-800">
                    <span className="truncate text-emerald-400">POST http://localhost:5173/api/webhooks/harvey-leads</span>
                    <button
                      type="button"
                      onClick={() => handleCopy('http://localhost:5173/api/webhooks/harvey-leads', 'harvey')}
                      className="text-xs font-sans font-bold px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 transition shrink-0 ml-3 cursor-pointer"
                    >
                      {copiedKey === 'harvey' ? '✓ Copied' : 'Copy Endpoint'}
                    </button>
                  </div>
                </div>

                {/* 24x7 Auto-Scout Background Daemon & Scheduler Control Card */}
                <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-xs mb-3 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* Left: Info */}
                    <div className="space-y-0.5 max-w-md">
                      <div className="flex items-center gap-2">
                        <Clock size={16} className="text-indigo-600 shrink-0" />
                        <h4 className="font-display font-bold text-sm text-slate-900">
                          24x7 Auto-Scout Daemon &amp; Scheduler
                        </h4>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed pl-6">
                        When enabled, Harvey runs autonomously in the background at set intervals without manual triggers.
                      </p>
                    </div>

                    {/* Right: Toggle + Status + Interval Selector */}
                    <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap justify-between sm:justify-end pl-6 sm:pl-0">
                      {/* Status indicator pill */}
                      <span className={cn(
                        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-colors whitespace-nowrap',
                        isDaemonActive
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200 shadow-2xs'
                          : 'bg-slate-100 text-slate-500 border-slate-200'
                      )}>
                        <span className={cn(
                          'w-2 h-2 rounded-full shrink-0',
                          isDaemonActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                        )} />
                        {isDaemonActive
                          ? `DAEMON RUNNING — Polling ${getIntervalLabel(daemonInterval)}`
                          : 'STANDBY / PAUSED'}
                      </span>

                      {/* Interval Selector Dropdown */}
                      <select
                        value={daemonInterval}
                        onChange={e => handleChangeInterval(e.target.value)}
                        className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                        title="Daemon Run Interval"
                      >
                        <option value="30m">Every 30 Mins</option>
                        <option value="1h">Every 1 Hour (Default)</option>
                        <option value="3h">Every 3 Hours</option>
                        <option value="daily">Daily at 10:00 AM</option>
                      </select>

                      {/* Active Toggle Switch */}
                      <button
                        type="button"
                        role="switch"
                        aria-checked={isDaemonActive}
                        onClick={handleToggleDaemon}
                        className={cn(
                          'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden',
                          isDaemonActive ? 'bg-emerald-500' : 'bg-slate-300'
                        )}
                        title={isDaemonActive ? 'Click to Pause Daemon' : 'Click to Enable 24x7 Auto-Scout'}
                      >
                        <span
                          className={cn(
                            'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out',
                            isDaemonActive ? 'translate-x-5' : 'translate-x-0'
                          )}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Action Button: Live Real Execution Runner */}
                <div>
                  <button
                    type="button"
                    onClick={handleTriggerLiveScout}
                    disabled={scoutTriggerLoading}
                    className="w-full py-3.5 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold text-sm shadow-md transition flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
                  >
                    <Play size={16} className={scoutTriggerLoading ? 'animate-spin' : 'fill-amber-400'} />
                    {scoutTriggerLoading ? 'Harvey Autonomous Daemon Running (Barabanki, Lucknow, Varanasi)...' : 'Trigger Live Scout Run'}
                  </button>
                </div>

                {/* Live Scout Execution Logs Terminal Console Box */}
                <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950 overflow-hidden shadow-xl">
                  {/* Terminal Top Bar */}
                  <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-900 border-b border-slate-800">
                    <div className="flex items-center gap-2.5">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56] inline-block shadow-xs" />
                        <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e] inline-block shadow-xs" />
                        <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f] inline-block shadow-xs" />
                      </div>
                      <span className="text-xs font-mono text-slate-300 font-semibold flex items-center gap-1.5 ml-1">
                        <Terminal size={13} className="text-emerald-400" />
                        harvey-agent-daemon.log
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-950/70 border border-emerald-800/60">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        LIVE
                      </span>
                      <button
                        type="button"
                        onClick={() => setScoutLogs([])}
                        className="text-[11px] font-mono text-slate-400 hover:text-slate-100 bg-slate-800 hover:bg-slate-700 border border-slate-700/80 px-2 py-0.5 rounded transition cursor-pointer flex items-center gap-1"
                        title="Clear console output"
                      >
                        <Trash2 size={11} /> Clear Logs
                      </button>
                    </div>
                  </div>

                  {/* Terminal Console Output */}
                  <div
                    ref={terminalContainerRef}
                    className="bg-slate-950 text-emerald-400 font-mono text-xs rounded-b-lg p-4 border border-slate-800 shadow-inner max-h-56 overflow-y-auto space-y-1.5"
                  >
                    {scoutLogs.length === 0 ? (
                      <div className="text-slate-500 italic py-2">
                        Logs cleared. Click &quot;Trigger Live Scout Run&quot; to begin streaming real-time crawler logs.
                      </div>
                    ) : (
                      scoutLogs.map(log => (
                        <div key={log.id} className="leading-relaxed flex items-start gap-2 break-all">
                          <span className="text-slate-500 text-[10px] shrink-0 select-none pt-0.5">[{log.timestamp}]</span>
                          <span className={cn(
                            log.text.includes('[SMTP]') ? 'text-amber-300' :
                            log.text.includes('[WHATSAPP]') ? 'text-emerald-300 font-bold' :
                            log.text.includes('[OUTREACH]') || log.text.includes('[CRAWLER]') ? 'text-cyan-300' :
                            log.text.includes('[WEBHOOK]') || log.text.includes('[CRM]') ? 'text-teal-300 font-bold' :
                            log.text.includes('[DAEMON]') || log.text.includes('[SMTP/IMAP]') ? 'text-slate-400' :
                            'text-emerald-400'
                          )}>
                            {log.text}
                          </span>
                        </div>
                      ))
                    )}
                    {scoutTriggerLoading && (
                      <div className="flex items-center gap-2 text-amber-300 text-xs py-1 animate-pulse">
                        <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                        <span>Processing live territory telemetry across 16 UP districts...</span>
                      </div>
                    )}
                  </div>
                </div>

                {scoutToast && (
                  <div className="mt-4 p-3.5 rounded-xl text-xs font-bold flex items-center gap-2 animate-fade-in border bg-emerald-50 text-emerald-900 border-emerald-300 shadow-xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    <span>{scoutToast}</span>
                  </div>
                )}

                {webhookResult && (
                  <div className={cn(
                    'mt-4 p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 animate-fade-in border',
                    webhookResult.type === 'created'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                  )}>
                    <span>{webhookResult.message}</span>
                  </div>
                )}
              </Card>
            </div>
          )}

          {/* ── Sub-Tab 3: Lead Ads & Webhooks ── */}
          {integrationsSubTab === 'webhooks' && (
            <div className="space-y-6 animate-fade-in">
              <Card className="p-6 border-purple-200 bg-gradient-to-b from-purple-50/15 to-white">
                <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                      <Zap size={22} />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-lg text-slate-900">Inbound Lead Generation Webhooks</h3>
                      <p className="text-sm text-slate-500">Live webhook receiver endpoints for digital ads, B2B portals, and telephony</p>
                    </div>
                  </div>
                  <Badge className="bg-purple-100 text-purple-700 font-semibold">4 Channels Active</Badge>
                </div>

                {/* Balanced 2x2 Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  {/* Meta Lead Ads */}
                  <div className="p-4 rounded-xl border border-purple-200 bg-white space-y-3 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">📘</span>
                        <div>
                          <p className="font-bold text-slate-900 text-sm">Meta Lead Ads</p>
                          <p className="text-[11px] text-slate-500">Facebook / Instagram Instant Forms</p>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                        Listening
                      </span>
                    </div>
                    <div className="flex items-center justify-between bg-slate-50 rounded-lg p-2 text-xs font-mono text-slate-700 border border-slate-200">
                      <span className="truncate">POST /api/webhooks/meta-leads</span>
                      <button
                        onClick={() => handleCopy('https://abcsolar.in/api/webhooks/meta-leads', 'meta')}
                        className="text-slate-400 hover:text-slate-700 text-[11px] shrink-0 font-sans ml-2 cursor-pointer"
                      >
                        {copiedKey === 'meta' ? '✓ Copied' : 'Copy'}
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={handleSimulateMeta}
                      className="w-full py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                    >
                      Simulate Meta Lead Ingestion
                    </button>
                  </div>

                  {/* IndiaMART */}
                  <div className="p-4 rounded-xl border border-teal-200 bg-white space-y-3 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">🏭</span>
                        <div>
                          <p className="font-bold text-slate-900 text-sm">IndiaMART B2B Push</p>
                          <p className="text-[11px] text-slate-500">Commercial &amp; Industrial buyer leads</p>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                        Listening
                      </span>
                    </div>
                    <div className="flex items-center justify-between bg-slate-50 rounded-lg p-2 text-xs font-mono text-slate-700 border border-slate-200">
                      <span className="truncate">POST /api/webhooks/indiamart</span>
                      <button
                        onClick={() => handleCopy('https://abcsolar.in/api/webhooks/indiamart', 'indiamart')}
                        className="text-slate-400 hover:text-slate-700 text-[11px] shrink-0 font-sans ml-2 cursor-pointer"
                      >
                        {copiedKey === 'indiamart' ? '✓ Copied' : 'Copy'}
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={handleSimulateIndiamart}
                      className="w-full py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                    >
                      Simulate IndiaMART Lead Ingestion
                    </button>
                  </div>

                  {/* Cloud Telephony / IVR */}
                  <div className="p-4 rounded-xl border border-emerald-200 bg-white space-y-3 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">📞</span>
                        <div>
                          <p className="font-bold text-slate-900 text-sm">Cloud Telephony IVR</p>
                          <p className="text-[11px] text-slate-500">Missed call alert &amp; Exotel/Knowlarity CDR</p>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Listening
                      </span>
                    </div>
                    <div className="flex items-center justify-between bg-slate-50 rounded-lg p-2 text-xs font-mono text-slate-700 border border-slate-200">
                      <span className="truncate">POST /api/webhooks/call-logs</span>
                      <button
                        onClick={() => handleCopy('https://abcsolar.in/api/webhooks/call-logs', 'ivr')}
                        className="text-slate-400 hover:text-slate-700 text-[11px] shrink-0 font-sans ml-2 cursor-pointer"
                      >
                        {copiedKey === 'ivr' ? '✓ Copied' : 'Copy'}
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={handleSimulateIVR}
                      className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                    >
                      Simulate IVR Call Lead
                    </button>
                  </div>

                  {/* AI Voice Call Webhook */}
                  <div className="p-4 rounded-xl border border-amber-200 bg-white space-y-3 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">🤖</span>
                        <div>
                          <p className="font-bold text-slate-900 text-sm">Voice AI Webhook</p>
                          <p className="text-[11px] text-slate-500">Call completion &amp; transcript ready event</p>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        Listening
                      </span>
                    </div>
                    <div className="flex items-center justify-between bg-slate-50 rounded-lg p-2 text-xs font-mono text-slate-700 border border-slate-200">
                      <span className="truncate">POST /api/webhooks/ai-call</span>
                      <button
                        onClick={() => handleCopy('https://abcsolar.in/api/webhooks/ai-call', 'aicall')}
                        className="text-slate-400 hover:text-slate-700 text-[11px] shrink-0 font-sans ml-2 cursor-pointer"
                      >
                        {copiedKey === 'aicall' ? '✓ Copied' : 'Copy'}
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={handleSimulateAICallWebhook}
                      className="w-full py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold transition shadow-xs cursor-pointer"
                    >
                      Simulate AI Call Webhook
                    </button>
                  </div>
                </div>

                {webhookResult && (
                  <div className={cn(
                    'mt-4 p-3 rounded-xl text-xs font-semibold flex items-center gap-2 animate-fade-in border',
                    webhookResult.type === 'created'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                  )}>
                    <span>{webhookResult.message}</span>
                  </div>
                )}
              </Card>

              {/* Live Ingestion Activity Log Table */}
              <Card className="p-6">
                <h4 className="font-display font-bold text-base text-slate-900 mb-3">Recent Webhook Ingestion Activity</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-left text-slate-400 font-semibold uppercase">
                        <th className="py-2 pr-3">Timestamp</th>
                        <th className="py-2 pr-3">Channel / Source</th>
                        <th className="py-2 pr-3">Endpoint</th>
                        <th className="py-2 pr-3">Customer / Detail</th>
                        <th className="py-2 pr-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {activityLogs.map(item => (
                        <tr key={item.id} className="hover:bg-slate-50">
                          <td className="py-2.5 pr-3 text-slate-500">{item.timestamp}</td>
                          <td className="py-2.5 pr-3 font-semibold text-slate-900">{item.source}</td>
                          <td className="py-2.5 pr-3 font-mono text-slate-600 text-[11px]">{item.endpoint}</td>
                          <td className="py-2.5 pr-3 text-slate-700">{item.leadName}</td>
                          <td className="py-2.5 pr-3 text-right">
                            <span className={cn(
                              'px-2 py-0.5 rounded-full text-[10px] font-bold',
                              item.status === 'INGESTED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                            )}>
                              {item.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          TAB 3: AI CALLING AGENT & TELEPHONY
         ═══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'ai-calling' && (
        <div className="space-y-6 animate-fade-in">
          <Card className="p-6 border-amber-200 bg-gradient-to-b from-amber-50/20 to-white">
            <div className="flex items-center justify-between flex-wrap gap-4 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600">
                  <Bot size={22} />
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-slate-900">AI Voice Qualification &amp; Outbound Telephony</h3>
                  <p className="text-sm text-slate-500">Configure conversational voice agent for automatic lead qualification and site survey booking</p>
                </div>
              </div>
              <Badge className={aiConfig.enabled ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}>
                {aiConfig.enabled ? '🟢 Voice Engine Online' : '⚪ Engine Disabled'}
              </Badge>
            </div>

            <div className="space-y-4 text-xs">
              {/* Telephony Provider Selector */}
              <div>
                <label className="label-field">Telephony &amp; Voice AI Engine</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { id: 'bland_ai', name: 'Bland.ai', desc: 'Ultra-fast Hindi Voice AI' },
                    { id: 'vapi', name: 'Vapi.ai', desc: 'Enterprise Voice Engine' },
                    { id: 'exotel', name: 'Exotel', desc: 'Indian Telecom Cloud' },
                    { id: 'twilio', name: 'Twilio', desc: 'Global Programmable Voice' },
                  ].map(p => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setAiConfig({ ...aiConfig, provider: p.id as AICallingProvider })}
                      className={cn(
                        'p-3 rounded-xl border text-left transition-all',
                        aiConfig.provider === p.id
                          ? 'bg-amber-500/10 border-amber-500 text-slate-900 shadow-2xs font-bold'
                          : 'bg-white border-slate-200 hover:border-slate-300 text-slate-600'
                      )}
                    >
                      <p className="font-bold text-xs">{p.name}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{p.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label-field">Account SID / Org ID</label>
                  <input
                    type="text"
                    value={aiConfig.accountSid}
                    onChange={e => setAiConfig({ ...aiConfig, accountSid: e.target.value })}
                    className="input-field font-mono text-xs"
                    placeholder="e.g. bland-org-up-sol-75"
                  />
                </div>
                <div>
                  <label className="label-field">Virtual Outbound Caller ID / Number (+91 format)</label>
                  <input
                    type="text"
                    value={aiConfig.callerId}
                    onChange={e => setAiConfig({ ...aiConfig, callerId: e.target.value })}
                    className="input-field font-mono text-xs"
                    placeholder="+919450942418"
                  />
                </div>
              </div>

              <div>
                <label className="label-field">API Key / Auth Token</label>
                <div className="relative">
                  <input
                    type={showAiKey ? 'text' : 'password'}
                    value={aiConfig.apiKey}
                    onChange={e => setAiConfig({ ...aiConfig, apiKey: e.target.value })}
                    className="input-field font-mono pr-10 text-xs"
                    placeholder="sk-bland-••••••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAiKey(!showAiKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showAiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Persona Selection */}
              <div>
                <label className="label-field">AI Voice Persona &amp; Dialect</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { name: 'Priya (ABC Solar Representative)', gender: 'female', lang: 'Conversational Hindi-English (Hinglish)' },
                    { name: 'Rohit (Commercial Solar Advisor)', gender: 'male', lang: 'Professional Hindi-English' },
                    { name: 'Aarti (UP Subsidy Specialist)', gender: 'female', lang: 'Pure Hindi (Official UPNEDA Tone)' },
                  ].map((persona, idx) => (
                    <div
                      key={idx}
                      onClick={() => setAiConfig({ ...aiConfig, persona: persona.name, voiceGender: persona.gender as any })}
                      className={cn(
                        'p-3 rounded-xl border cursor-pointer transition-all',
                        aiConfig.persona === persona.name
                          ? 'bg-amber-50 border-amber-400 shadow-2xs font-semibold'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      )}
                    >
                      <p className="font-bold text-xs text-slate-900">{persona.name}</p>
                      <p className="text-[11px] text-slate-500 mt-1">{persona.lang}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Auto-Call Toggle */}
              <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/60 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-900">Auto-Call on New Inbound Lead</p>
                  <p className="text-xs text-slate-500">Automatically trigger an AI qualification call when a new lead arrives via Website or Calculator</p>
                </div>
                <button
                  type="button"
                  onClick={() => setAiConfig({ ...aiConfig, autoCallOnNewLead: !aiConfig.autoCallOnNewLead })}
                  className={cn(
                    'relative w-12 h-6 rounded-full transition-colors',
                    aiConfig.autoCallOnNewLead ? 'bg-amber-500' : 'bg-slate-300'
                  )}
                >
                  <span
                    className={cn(
                      'absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform',
                      aiConfig.autoCallOnNewLead ? 'translate-x-6' : ''
                    )}
                  />
                </button>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button type="button" onClick={handleSaveAiConfig} className="btn-primary">
                  {aiSaved ? <><Check size={16} /> Configuration Saved!</> : <><Save size={16} /> Save Voice AI Configuration</>}
                </button>
              </div>
            </div>
          </Card>

          {/* Interactive Test Call Box */}
          <Card className="p-6">
            <h4 className="font-display font-bold text-base text-slate-900 mb-1">Test Outbound AI Qualification Call</h4>
            <p className="text-xs text-slate-500 mb-4">
              Enter any 10-digit mobile number to simulate a live automated voice outreach call using the active persona.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 w-72">
                <span className="text-slate-400 font-bold text-xs">+91</span>
                <input
                  type="tel"
                  value={testPhoneNumber}
                  onChange={e => setTestPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="Enter 10-digit mobile"
                  className="bg-transparent text-xs text-slate-900 font-semibold focus:outline-none w-full"
                />
              </div>
              <button
                type="button"
                onClick={handleTriggerTestCall}
                disabled={testingAiCall}
                className="btn-secondary text-xs"
              >
                <PhoneCall size={15} />
                {testingAiCall ? 'Dialing Number...' : 'Trigger Test Call Now'}
              </button>
            </div>
            {testCallToast && (
              <div className="mt-3 p-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold animate-fade-in">
                {testCallToast}
              </div>
            )}
          </Card>

          {/* Recent AI Call Transcripts & Logs Snippet */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="font-display font-bold text-base text-slate-900">Recent AI Voice Call Recordings &amp; Transcripts</h4>
                <p className="text-xs text-slate-500">Live call logs with sentiment analysis, duration, and survey confirmation status</p>
              </div>
              <Badge className="bg-amber-100 text-amber-800">{callLogs.length} Total Calls Logged</Badge>
            </div>

            <div className="space-y-3">
              {callLogs.slice(0, 5).map(call => {
                const targetLead = leads.find(l => l.id === call.leadId);
                return (
                  <div
                    key={call.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors flex flex-wrap items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                        <Bot size={20} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-sm text-slate-900">{call.customerName}</p>
                          <span className="text-xs text-slate-400">• +91 {call.customerPhone}</span>
                          {call.surveyConfirmed && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              ✓ Survey Booked ({call.confirmedDate})
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 mt-0.5 line-clamp-1 max-w-xl">
                          {call.summary}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block font-mono">Duration</span>
                        <span className="text-xs font-bold font-mono text-slate-700">{call.durationSeconds}s</span>
                      </div>
                      {targetLead && (
                        <button
                          type="button"
                          onClick={() => setSelectedCallLog({ log: call, lead: targetLead })}
                          className="btn-outline text-xs py-1.5 px-3"
                        >
                          <Volume2 size={14} /> View Transcript
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          TAB 4: COMPANY PROFILE & LEGAL
         ═══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'company' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
          {/* Column 1: Business Identity & Registrations */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                <Building2 size={22} />
              </div>
              <div>
                <h3 className="font-display font-bold text-base text-slate-900">Business Identity &amp; Accreditations</h3>
                <p className="text-xs text-slate-500">Official registrations for PM Surya Ghar empanelment</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <InfoRow label="Brand Name" value={COMPANY.name} />
              <InfoRow label="Legal Entity Name" value={`${COMPANY.legalName} (${COMPANY.legalEntityType})`} />
              <InfoRow label="Proprietor / Managing Director" value={COMPANY.proprietor} />
              <InfoRow label="GSTIN Number" value={COMPANY.gstin} />
              <InfoRow label="Income Tax PAN" value={COMPANY.pan} />
              <InfoRow label="UPNEDA Empanelled Vendor Code" value={COMPANY.vendorCode} />
              <InfoRow label="Loom Solar Authorized Dealer Cert" value={`${COMPANY.certifications.loomSolarCertNo} (Valid till ${COMPANY.certifications.loomSolarValidTill})`} />
              <InfoRow label="Operational Headquarters" value={COMPANY.address} />
              <InfoRow label="Primary Telephony &amp; WhatsApp" value={`+91 ${COMPANY.phone} (Calling &amp; WhatsApp)`} />
              <InfoRow label="Official Email Address" value={COMPANY.email} />
            </div>
          </Card>

          {/* Column 2: Official Banking Details */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 rounded-xl bg-forest-50 text-forest-700 flex items-center justify-center">
                <Building2 size={22} />
              </div>
              <div>
                <h3 className="font-display font-bold text-base text-slate-900">Official Bank Accounts (RTGS / NEFT)</h3>
                <p className="text-xs text-slate-500">Disbursed onto formal quotations, BOQs, and customer receipts</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Bank Name</span>
                <span className="font-bold text-slate-900 text-sm">{COMPANY.bank.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Account Type</span>
                <span className="font-semibold text-slate-800">{COMPANY.bank.accountType}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Account Beneficiary</span>
                <span className="font-bold text-slate-900">{COMPANY.bank.accountName}</span>
              </div>
              <div className="flex justify-between items-center bg-white p-2.5 rounded-lg border border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Account Number</span>
                  <span className="font-mono font-bold text-slate-900 text-sm">{COMPANY.bank.accountNumber}</span>
                </div>
                <button
                  onClick={() => handleCopy(COMPANY.bank.accountNumber, 'acct')}
                  className="btn-outline text-xs py-1 px-2.5"
                >
                  {copiedKey === 'acct' ? '✓ Copied' : 'Copy'}
                </button>
              </div>
              <div className="flex justify-between items-center bg-white p-2.5 rounded-lg border border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">IFSC Code</span>
                  <span className="font-mono font-bold text-slate-900 text-sm">{COMPANY.bank.ifsc}</span>
                </div>
                <button
                  onClick={() => handleCopy(COMPANY.bank.ifsc, 'ifsc')}
                  className="btn-outline text-xs py-1 px-2.5"
                >
                  {copiedKey === 'ifsc' ? '✓ Copied' : 'Copy'}
                </button>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Branch Location</span>
                <span className="font-semibold text-slate-700">{COMPANY.bank.branch}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200 text-xs text-amber-900 space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <CheckCircle2 size={15} className="text-amber-600" /> Auto-Watermarking Active
              </p>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                These bank credentials automatically populate the payment settlement section of all customer invoices, BOQs, and PM Surya Ghar agreements.
              </p>
            </div>
          </Card>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          TAB 5: SYSTEM & MAINTENANCE
         ═══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'system' && (
        <div className="space-y-6 animate-fade-in max-w-4xl">
          {/* Database Backup & Export Card */}
          <Card className="p-6">
            <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Database size={22} />
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-slate-900">CRM Database Backup &amp; JSON Export</h3>
                  <p className="text-sm text-slate-500">Download a full snapshot of all records stored in this browser session</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleExportBackup}
                className="btn-primary text-xs"
              >
                <Download size={15} /> Export CRM Backup (.JSON)
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-2">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <p className="text-slate-400 font-semibold text-[10px] uppercase">Leads Stored</p>
                <p className="font-extrabold text-slate-900 text-lg mt-0.5">{leads.length}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <p className="text-slate-400 font-semibold text-[10px] uppercase">Quotations</p>
                <p className="font-extrabold text-slate-900 text-lg mt-0.5">{quotations.length}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <p className="text-slate-400 font-semibold text-[10px] uppercase">Surveys Scheduled</p>
                <p className="font-extrabold text-slate-900 text-lg mt-0.5">{surveys.length}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <p className="text-slate-400 font-semibold text-[10px] uppercase">Active Staff</p>
                <p className="font-extrabold text-slate-900 text-lg mt-0.5">{allUsers.length}</p>
              </div>
            </div>
          </Card>

          {/* Danger Zone Card */}
          <Card className="p-6 border-rose-300 bg-rose-50/20">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
                <AlertTriangle size={22} />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg text-rose-900">Danger Zone</h3>
                <p className="text-xs text-rose-700">Irreversible system data operations</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Resetting CRM database will erase all customized leads, quotations, surveys, and call logs created in this browser, and restore factory defaults.
            </p>
            <button
              type="button"
              onClick={() => setShowResetConfirmModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-rose-300 text-rose-700 bg-white font-bold text-xs hover:bg-rose-50 transition-all shadow-xs"
            >
              <RefreshCw size={15} /> Reset All Lead &amp; Demo Data
            </button>
          </Card>
        </div>
      )}

      {/* ── MODALS ── */}
      {showUserModal && (
        <UserFormModal
          user={editingUser}
          existingUsers={allUsers}
          onClose={() => setShowUserModal(false)}
        />
      )}

      {/* Double Confirmation Modal for Reset */}
      {showResetConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setShowResetConfirmModal(false)} />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-rose-200 p-6 animate-scale-in space-y-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle size={22} />
              </div>
              <div className="space-y-1">
                <h3 className="font-display font-bold text-lg text-slate-900">Reset CRM Database?</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Are you sure you want to reset all CRM data? All newly added inquiries, quotes, surveys, and voice logs will be replaced with clean factory seed data.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowResetConfirmModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteReset}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-all"
              >
                Yes, Reset All Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Call Details Drawer/Modal */}
      {selectedCallLog && (
        <AICallModal
          lead={selectedCallLog.lead}
          callLog={selectedCallLog.log}
          onClose={() => setSelectedCallLog(null)}
        />
      )}
    </div>
  );
}

function UserFormModal({
  user, existingUsers, onClose,
}: {
  user: CRMUser | null;
  existingUsers: CRMUser[];
  onClose: () => void;
}) {
  const isEdit = !!user;
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [role, setRole] = useState<CRMRole>(user?.role || 'Sales Manager');
  const [password, setPassword] = useState(user?.password || '');
  const [active, setActive] = useState(user?.active ?? true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Full name is required';
    if (!email.trim()) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Enter a valid email address';
    else {
      const duplicate = existingUsers.find(u => u.email.toLowerCase() === email.toLowerCase() && u.id !== user?.id);
      if (duplicate) errs.email = 'A user with this email already exists';
    }
    if (!phone.trim()) errs.phone = 'Mobile number is required';
    else if (!validateIndianPhone(phone)) errs.phone = 'Enter a valid 10-digit Indian mobile number';
    if (!password.trim()) errs.password = 'Password is required';
    else if (password.trim().length < 4) errs.password = 'Password must be at least 4 characters';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    if (isEdit && user) {
      updateUser(user.id, {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        role,
        password: password.trim(),
        active,
        initials: getInitials(name),
        allowedPages: ROLE_ALLOWED_PAGES[role],
      });
    } else {
      addUser({
        id: uid('u'),
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        role,
        password: password.trim(),
        active,
        initials: getInitials(name),
        createdAt: new Date().toISOString().slice(0, 10),
        allowedPages: ROLE_ALLOWED_PAGES[role],
      });
    }
    onClose();
  }

  return (
    <Modal open={true} onClose={onClose} title={isEdit ? 'Edit User' : 'Create New User'} maxWidth="max-w-lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label-field">Full Name</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Enter full name" className="input-field" autoFocus />
          {errors.name && <p className="text-xs text-rose-500 mt-1">{errors.name}</p>}
        </div>
        <div>
          <label className="label-field">Official Email ID</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@abcsolar.in" className="input-field" />
          {errors.email && <p className="text-xs text-rose-500 mt-1">{errors.email}</p>}
        </div>
        <div>
          <label className="label-field">Mobile Number</label>
          <input type="tel" value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="10-digit mobile number" className="input-field" />
          {errors.phone && <p className="text-xs text-rose-500 mt-1">{errors.phone}</p>}
        </div>
        <div>
          <label className="label-field">Assigned Role</label>
          <div className="grid grid-cols-2 gap-2">
            {ROLES.map(r => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={cn(
                  'px-3 py-2 rounded-lg text-sm font-semibold border transition-all text-left',
                  role === r
                    ? 'bg-solar-500 text-white border-solar-500'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-solar-300'
                )}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="label-field">{isEdit ? 'Password' : 'Temporary Password'}</label>
          <input type="text" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min 4 characters" className="input-field" />
          {errors.password && <p className="text-xs text-rose-500 mt-1">{errors.password}</p>}
        </div>
        <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
          <div>
            <p className="text-sm font-semibold text-slate-700">Active Status</p>
            <p className="text-xs text-slate-400">Inactive users cannot log in</p>
          </div>
          <button
            type="button"
            onClick={() => setActive(!active)}
            className={cn(
              'relative w-11 h-6 rounded-full transition-colors',
              active ? 'bg-emerald-500' : 'bg-slate-300'
            )}
          >
            <span className={cn(
              'absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform',
              active && 'translate-x-5'
            )} />
          </button>
        </div>
        <div className="flex gap-3 pt-2">
          <button type="submit" className="btn-primary flex-1">
            {isEdit ? <><Save size={16} /> Save Changes</> : <><UserPlus size={16} /> Create User</>}
          </button>
          <button type="button" onClick={onClose} className="btn-outline">
            <X size={16} /> Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{label}</p>
      <p className="font-bold text-slate-800 text-xs mt-0.5">{value}</p>
    </div>
  );
}
