import {
  Users, Phone, FileText, Wallet, CheckCircle2, Zap, TrendingUp,
  Clock, MapPin, ArrowRight, Plus, AlertCircle,
} from 'lucide-react';
import { useStore } from '@/store';
import { formatINR, getStatusMeta, getPriorityMeta, relativeTime } from '@/utils';
import { KpiCard, Card, Badge } from '@/components/ui';
import type { CRMPageProps } from '@/types/crm';

export function DashboardPage({ onNavigate }: CRMPageProps) {
  const store = useStore();
  const { leads, quotations, projects, tickets } = store;

  const newLeads = leads.filter(l => l.status === 'NEW').length;
  const todayFollowUps = leads.filter(l => l.followUpDate === new Date().toISOString().slice(0, 10) && l.status !== 'WON' && l.status !== 'LOST').length;
  const activeProposals = quotations.filter(q => q.status === 'SENT' || q.status === 'DRAFT').length;
  const pipelineValue = leads
    .filter(l => l.status !== 'LOST' && l.status !== 'WON')
    .reduce((sum, l) => sum + l.dealValue, 0);
  const wonDeals = leads.filter(l => l.status === 'WON').length;
  const installedKw = projects.reduce((sum, p) => sum + p.systemKw, 0);

  const recentLeads = [...leads].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);
  const openTickets = tickets.filter(t => t.status === 'OPEN' || t.status === 'IN_PROGRESS');

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-extrabold text-2xl text-slate-900">Dashboard Overview</h1>
          <p className="text-sm text-slate-500 mt-0.5">Welcome back, Rajesh. Here's what's happening today.</p>
        </div>
        <button onClick={() => onNavigate('leads')} className="btn-primary">
          <Plus size={16} /> New Lead
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <KpiCard label="New Leads" value={String(newLeads)} icon={<Users size={20} />} color="blue" trend="Awaiting contact" />
        <KpiCard label="Today's Follow-ups" value={String(todayFollowUps)} icon={<Clock size={20} />} color="amber" trend="Due today" />
        <KpiCard label="Active Proposals" value={String(activeProposals)} icon={<FileText size={20} />} color="solar" trend="Sent/Draft" />
        <KpiCard label="Pipeline Value" value={formatINR(pipelineValue)} icon={<Wallet size={20} />} color="forest" trend="Open deals" />
        <KpiCard label="Won Deals" value={String(wonDeals)} icon={<CheckCircle2 size={20} />} color="forest" trend="This period" />
        <KpiCard label="Installed kW" value={`${installedKw} kW`} icon={<Zap size={20} />} color="solar" trend="Active projects" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold text-lg text-slate-900">Recent Leads</h3>
            <button onClick={() => onNavigate('leads')} className="text-sm text-solar-600 font-semibold hover:underline flex items-center gap-1">
              View All <ArrowRight size={14} />
            </button>
          </div>
          <div className="space-y-3">
            {recentLeads.map(lead => {
              const status = getStatusMeta(lead.status);
              const priority = getPriorityMeta(lead.priority);
              return (
                <div key={lead.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:border-solar-200 hover:bg-solar-50/30 transition-all cursor-pointer" onClick={() => onNavigate('leads')}>
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                      <span className="text-sm font-bold text-slate-600">{lead.name.split(' ').map(n => n[0]).join('').slice(0, 2)}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 text-sm truncate">{lead.name}</p>
                      <p className="text-xs text-slate-500 flex items-center gap-1.5">
                        <MapPin size={12} /> {lead.district} • {lead.recommendedKw}kW • {relativeTime(lead.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge className={priority.color}>{priority.label}</Badge>
                    <Badge className={status.color}>{status.label}</Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold text-lg text-slate-900">Service Tickets</h3>
            <button onClick={() => onNavigate('projects')} className="text-sm text-solar-600 font-semibold hover:underline flex items-center gap-1">
              View All <ArrowRight size={14} />
            </button>
          </div>
          {openTickets.length === 0 ? (
            <div className="text-center py-8 text-sm text-slate-400">No open tickets. All systems running.</div>
          ) : (
            <div className="space-y-3">
              {openTickets.map(ticket => (
                <div key={ticket.id} className="p-3 rounded-lg border border-slate-100 hover:border-forest-200 transition-all">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-mono text-slate-500">{ticket.ticketNumber}</span>
                    <Badge className={ticket.priority === 'URGENT' ? 'bg-red-100 text-red-700' : ticket.priority === 'HIGH' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}>
                      {ticket.priority}
                    </Badge>
                  </div>
                  <p className="font-semibold text-sm text-slate-900">{ticket.customerName}</p>
                  <p className="text-xs text-slate-500">{ticket.description.slice(0, 60)}...</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card className="p-5">
        <div className="flex items-center gap-3 mb-4">
          <TrendingUp className="text-forest-700" size={20} />
          <h3 className="font-display font-bold text-lg text-slate-900">Pipeline Distribution</h3>
        </div>
        <div className="grid grid-cols-4 lg:grid-cols-8 gap-3">
          {['NEW', 'CONTACTED', 'SITE_VISIT_SCHEDULED', 'SURVEY_DONE', 'QUOTATION_SENT', 'NEGOTIATION', 'WON', 'LOST'].map(status => {
            const count = leads.filter(l => l.status === status).length;
            const meta = getStatusMeta(status);
            return (
              <div key={status} className="text-center p-3 rounded-lg border border-slate-100">
                <div className={`w-3 h-3 rounded-full ${meta.dotColor} mx-auto mb-2`} />
                <p className="text-2xl font-display font-bold text-slate-900">{count}</p>
                <p className="text-[10px] text-slate-500 leading-tight mt-0.5">{meta.label}</p>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
