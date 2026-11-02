import { useState, useMemo } from 'react';
import {
  GripVertical, MapPin, Wallet, Clock, AlertCircle, Zap,
  Calendar, Phone, Building2, User, ChevronRight, Mail, MessageCircle,
} from 'lucide-react';
import { useStore, updateLead } from '@/store';
import { PIPELINE_STAGES } from '@/data';
import { formatINR, getStatusMeta, getPriorityMeta, getSourceMeta, todayISO } from '@/utils';
import { Badge } from '@/components/ui';
import type { CRMPageProps } from '@/types/crm';
import type { Lead, LeadStatus } from '@/types';

export function PipelinePage({ onNavigate }: CRMPageProps) {
  const store = useStore();
  const { leads } = store;
  const [dragLead, setDragLead] = useState<Lead | null>(null);

  // 1. Strict Lead Deduplication by unique ID, unique Phone, and Normalized Name
  const uniqueLeads = useMemo(() => {
    const seenIds = new Set<string>();
    const seenPhones = new Set<string>();
    const seenNames = new Set<string>();

    return leads.filter(lead => {
      if (!lead.id || seenIds.has(lead.id)) return false;
      seenIds.add(lead.id);

      // Clean 10-digit phone number
      const cleanPhone = (lead.phone || '').replace(/\D/g, '').slice(-10);
      if (cleanPhone) {
        if (seenPhones.has(cleanPhone)) return false;
        seenPhones.add(cleanPhone);
      }

      // Normalized name check for repeated mock simulation entries (e.g. Dr. Alok Verma)
      const normName = (lead.name || '').trim().toLowerCase();
      if (normName && normName.length > 2) {
        if (seenNames.has(normName)) return false;
        seenNames.add(normName);
      }

      return true;
    });
  }, [leads]);

  // Total Pipeline Value across all unique active leads
  const totalPipelineValue = useMemo(() => {
    return uniqueLeads
      .filter(l => l.status !== 'LOST')
      .reduce((sum, l) => sum + (l.dealValue || 0), 0);
  }, [uniqueLeads]);

  // Group deduplicated leads into columns (sorted newest first)
  const columns = useMemo(() => {
    return PIPELINE_STAGES.map(status => ({
      status,
      meta: getStatusMeta(status),
      leads: uniqueLeads
        .filter(l => l.status === status)
        .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()),
    }));
  }, [uniqueLeads]);

  function handleDrop(status: LeadStatus) {
    if (dragLead && dragLead.status !== status) {
      updateLead(dragLead.id, { status });
    }
    setDragLead(null);
  }

  return (
    <div className="animate-fade-in space-y-4">
      {/* Top Header with KPI summary */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display font-extrabold text-2xl text-slate-900 tracking-tight">Sales Pipeline</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Drag and drop customer cards across stage columns to update live sales status
          </p>
        </div>

        <div className="flex items-center gap-3 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Active Pipeline</span>
            <span className="font-display font-bold text-sm text-emerald-700 tabular-nums">
              {formatINR(totalPipelineValue)}
            </span>
          </div>
          <span className="h-6 w-px bg-slate-200" />
          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Total Deals</span>
            <span className="font-display font-bold text-sm text-slate-900 tabular-nums">
              {uniqueLeads.length} Leads
            </span>
          </div>
        </div>
      </div>

      {/* 2. Board Wrapper: Fixed Viewport Height with Horizontal Scroll */}
      <div className="h-[calc(100vh-140px)] flex gap-4 overflow-x-auto pb-4 items-start select-none">
        {columns.map(col => {
          const colTotalValue = col.leads.reduce((sum, l) => sum + (l.dealValue || 0), 0);
          const isOver = dragLead && dragLead.status !== col.status;

          return (
            <div
              key={col.status}
              className={`w-[280px] min-w-[280px] flex flex-col bg-slate-50/80 rounded-xl border border-slate-200/80 max-h-full shrink-0 shadow-2xs transition-colors ${
                isOver ? 'ring-2 ring-amber-400/50 bg-amber-50/20' : ''
              }`}
              onDragOver={e => e.preventDefault()}
              onDrop={() => handleDrop(col.status)}
            >
              {/* Sticky Column Header */}
              <div className="p-3 bg-white/95 backdrop-blur-xs rounded-t-xl border-b border-slate-200/80 shrink-0 sticky top-0 z-10 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${col.meta.dotColor}`} />
                    <span className="font-bold text-xs text-slate-800 truncate" title={col.meta.label}>
                      {col.meta.label}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full tabular-nums">
                    {col.leads.length}
                  </span>
                </div>
                <div className="text-[11px] font-semibold text-slate-500 tabular-nums">
                  {formatINR(colTotalValue)}
                </div>
              </div>

              {/* Independent Scrollable Cards Container */}
              <div className="overflow-y-auto flex-1 p-2 space-y-2.5 max-h-[calc(100vh-210px)] pr-1.5">
                {col.leads.map(lead => (
                  <PipelineCard
                    key={lead.id}
                    lead={lead}
                    onDragStart={() => setDragLead(lead)}
                    onNavigate={onNavigate}
                  />
                ))}

                {col.leads.length === 0 && (
                  <div className="border-2 border-dashed border-slate-200/80 rounded-lg p-5 text-center text-xs text-slate-400 flex flex-col items-center justify-center min-h-[90px]">
                    <span className="text-slate-300 mb-1">⤓</span>
                    <span>Drop deals here</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── 3. Kanban Card UI & Typography Polish ─────────────────────────────────────
function PipelineCard({
  lead,
  onDragStart,
  onNavigate,
}: {
  lead: Lead;
  onDragStart: () => void;
  onNavigate: (page: string) => void;
}) {
  const priority = getPriorityMeta(lead.priority);
  const source = getSourceMeta(lead.source);
  const isOverdue = lead.followUpDate < todayISO() && lead.status !== 'WON' && lead.status !== 'LOST';
  const isToday = lead.followUpDate === todayISO() && lead.status !== 'WON' && lead.status !== 'LOST';

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onClick={() => onNavigate('leads')}
      className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition cursor-grab active:cursor-grabbing space-y-2.5 group relative select-none"
    >
      {/* Top Row: Customer Name + Priority Badge */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="font-bold text-sm text-slate-900 truncate tracking-tight" title={lead.name}>
            {lead.name}
          </p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${priority.color}`}>
            {priority.label}
          </span>
          <GripVertical className="text-slate-300 group-hover:text-slate-400 shrink-0" size={14} />
        </div>
      </div>

      {/* Middle Row: Location + Capacity Pill */}
      <div className="flex items-center justify-between text-xs text-slate-600 gap-2">
        <div className="flex items-center gap-1 min-w-0 truncate text-slate-500 font-medium">
          <MapPin size={12} className="text-slate-400 shrink-0" />
          <span className="truncate">{lead.district}</span>
        </div>

        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200/80 font-bold text-[11px] shrink-0">
          <Zap size={11} className="text-amber-500" />
          <span>{lead.recommendedKw} kW</span>
        </div>
      </div>

      {/* Bottom Row: Deal Value + Channel Source Tag */}
      <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
        <span className="font-extrabold text-emerald-700 font-mono text-xs tabular-nums">
          {formatINR(lead.dealValue)}
        </span>

        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${source.color}`}
          title={`Lead Source: ${source.label}`}
        >
          <span>{source.icon}</span>
          <span>{source.label}</span>
        </span>
      </div>

      {/* Harvey AI Dual Communication Badges & Quick WhatsApp Action */}
      {lead.source === 'HARVEY_AI' && (
        <div className="pt-1 border-t border-slate-100 flex items-center justify-between gap-1 flex-wrap">
          <div className="flex items-center gap-1">
            <span
              className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-50 text-blue-700 border border-blue-200"
              title={`Email Outreach: ${lead.emailStatus || 'Delivered'}`}
            >
              <Mail size={9} /> Email
            </span>
            <span
              className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200"
              title={`WhatsApp Outreach: ${lead.whatsappStatus || 'Sent'}`}
            >
              <MessageCircle size={9} /> Proposal Sent
            </span>
          </div>

          <a
            href={`https://wa.me/91${lead.phone.replace(/\D/g, '').slice(-10)}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[9.5px] shadow-2xs transition"
            title="Open WhatsApp Chat"
          >
            <MessageCircle size={9} /> Chat
          </a>
        </div>
      )}

      {/* Follow-up reminder indicator if today or overdue */}
      {(isOverdue || isToday) && (
        <div className="pt-0.5">
          <span
            className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded ${
              isOverdue ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'
            }`}
          >
            {isOverdue ? <AlertCircle size={10} /> : <Clock size={10} />}
            <span>{isOverdue ? 'Follow-up Overdue' : 'Follow-up Today'}</span>
          </span>
        </div>
      )}
    </div>
  );
}
