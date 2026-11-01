import { useState } from 'react';
import {
  Hammer, Wrench, Plus, CheckCircle2, Circle, ArrowRight,
  MapPin, Zap, Calendar, AlertCircle, Ticket, Phone,
} from 'lucide-react';
import { useStore, advanceProjectStage, addTicket, updateTicket } from '@/store';
import { PROJECT_STAGES, TICKET_CATEGORIES } from '@/data';
import { formatINR, formatDate, uid, nowISO, todayISO } from '@/utils';
import { Card, Badge, Modal, Select } from '@/components/ui';
import type { CRMPageProps } from '@/types/crm';
import type { TicketPriority, TicketStatus, TicketCategory } from '@/types';

export function ProjectsPage({ onNavigate: _onNavigate }: CRMPageProps) {
  const store = useStore();
  const { projects, tickets } = store;
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [tab, setTab] = useState<'projects' | 'tickets'>('projects');

  const ticketStatusMeta: Record<string, { label: string; color: string }> = {
    OPEN: { label: 'Open', color: 'bg-rose-100 text-rose-700' },
    IN_PROGRESS: { label: 'In Progress', color: 'bg-amber-100 text-amber-700' },
    RESOLVED: { label: 'Resolved', color: 'bg-emerald-100 text-emerald-700' },
    CLOSED: { label: 'Closed', color: 'bg-slate-100 text-slate-600' },
  };
  const priorityMeta: Record<string, string> = {
    URGENT: 'bg-red-100 text-red-700',
    HIGH: 'bg-amber-100 text-amber-700',
    NORMAL: 'bg-slate-100 text-slate-600',
  };

  return (
    <div className="animate-fade-in space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-extrabold text-2xl text-slate-900">Projects & AMC</h1>
          <p className="text-sm text-slate-500 mt-0.5">Track execution and service tickets</p>
        </div>
        <button onClick={() => setShowTicketModal(true)} className="btn-primary">
          <Plus size={16} /> Log Service Ticket
        </button>
      </div>

      <div className="flex gap-1 bg-slate-100 rounded-lg p-1 w-fit">
        <button onClick={() => setTab('projects')} className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all ${tab === 'projects' ? 'bg-white text-solar-600 shadow-sm' : 'text-slate-500'}`}>
          <Hammer size={14} className="inline mr-1" /> Projects ({projects.length})
        </button>
        <button onClick={() => setTab('tickets')} className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all ${tab === 'tickets' ? 'bg-white text-solar-600 shadow-sm' : 'text-slate-500'}`}>
          <Ticket size={14} className="inline mr-1" /> Tickets ({tickets.length})
        </button>
      </div>

      {tab === 'projects' ? (
        <div className="space-y-4">
          {projects.map(project => {
            const completedCount = project.stages.filter(s => s.completed).length;
            const progress = Math.round((completedCount / project.stages.length) * 100);
            return (
              <Card key={project.id} className="p-5">
                <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-solar-50 flex items-center justify-center shrink-0">
                      <Hammer className="text-solar-600" size={24} />
                    </div>
                    <div>
                      <p className="font-display font-bold text-slate-900">{project.customerName}</p>
                      <p className="text-xs text-slate-500">{project.id} • {project.district} • {project.systemKw}kW • {formatINR(project.projectValue)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500">Progress</p>
                    <p className="font-display font-bold text-lg text-solar-600">{progress}%</p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 bg-slate-100 rounded-full mb-4 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-solar-400 to-solar-600 rounded-full transition-all" style={{ width: `${progress}%` }} />
                </div>

                {/* Stages */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {project.stages.map((stage, i) => (
                    <div key={stage.stage} className={`p-2.5 rounded-lg border text-xs ${stage.completed ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'}`}>
                      <div className="flex items-center gap-1.5 mb-0.5">
                        {stage.completed ? <CheckCircle2 size={14} className="text-emerald-600" /> : <Circle size={14} className="text-slate-300" />}
                        <span className="font-semibold text-slate-700">{stage.label}</span>
                      </div>
                      {stage.completed && stage.completedAt && <p className="text-slate-400 text-[10px]">{formatDate(stage.completedAt)}</p>}
                    </div>
                  ))}
                </div>

                {completedCount < project.stages.length && (
                  <button onClick={() => advanceProjectStage(project.id)} className="btn-primary mt-4">
                    <ArrowRight size={16} /> Advance to Next Stage
                  </button>
                )}
                {completedCount === project.stages.length && (
                  <div className="mt-4 inline-flex items-center gap-2 text-emerald-600 font-semibold text-sm">
                    <CheckCircle2 size={18} /> Project Completed & Handed Over
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map(ticket => {
            const sMeta = ticketStatusMeta[ticket.status];
            const catLabel = TICKET_CATEGORIES.find(c => c.value === ticket.category)?.label || ticket.category;
          return (
            <Card key={ticket.id} className="p-4">
              <div className="flex items-start justify-between flex-wrap gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                    <Wrench className="text-amber-600" size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-mono text-xs text-slate-500">{ticket.ticketNumber}</p>
                      <Badge className={sMeta.color}>{sMeta.label}</Badge>
                      <Badge className={priorityMeta[ticket.priority]}>{ticket.priority}</Badge>
                    </div>
                    <p className="font-semibold text-slate-900 text-sm mt-0.5">{ticket.customerName} • {ticket.district}</p>
                    <p className="text-xs text-slate-500">{catLabel}</p>
                    <p className="text-sm text-slate-600 mt-1">{ticket.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {ticket.status !== 'RESOLVED' && ticket.status !== 'CLOSED' && (
                    <button onClick={() => updateTicket(ticket.id, { status: 'RESOLVED', resolvedAt: nowISO(), resolution: 'Issue resolved by technician.' })} className="btn-outline text-sm">
                      <CheckCircle2 size={14} /> Resolve
                    </button>
                  )}
                  <a href={`tel:${ticket.customerPhone}`} className="btn-ghost text-sm"><Phone size={14} /></a>
                </div>
              </div>
            </Card>
          );
          })}
        </div>
      )}

      {showTicketModal && <NewTicketModal projects={projects} onClose={() => setShowTicketModal(false)} />}
    </div>
  );
}

function NewTicketModal({ projects, onClose }: { projects: any[]; onClose: () => void }) {
  const [projectId, setProjectId] = useState(projects[0]?.id || '');
  const [category, setCategory] = useState<TicketCategory>('INVERTER_ERROR');
  const [priority, setPriority] = useState<TicketPriority>('NORMAL');
  const [description, setDescription] = useState('');

  const selectedProject = projects.find(p => p.id === projectId);

  function handleCreate() {
    if (!selectedProject) return;
    addTicket({
      id: uid('T'),
      ticketNumber: `AMC/2026/${String(Date.now()).slice(-3)}`,
      projectId: selectedProject.id,
      customerName: selectedProject.customerName,
      customerPhone: selectedProject.customerPhone,
      district: selectedProject.district,
      category,
      priority,
      status: 'OPEN',
      description: description || 'Customer reported issue.',
      technician: 'Vikas Yadav',
      createdAt: nowISO(),
    });
    onClose();
  }

  return (
    <Modal open={true} onClose={onClose} title="Log Service Ticket">
      <div className="space-y-4">
        <div>
          <label className="label-field">Select Project</label>
          <Select value={projectId} onChange={setProjectId}>
            {projects.map(p => <option key={p.id} value={p.id}>{p.customerName} — {p.district} ({p.systemKw}kW)</option>)}
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label-field">Category</label>
            <Select value={category} onChange={v => setCategory(v as TicketCategory)}>
              {TICKET_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </Select>
          </div>
          <div>
            <label className="label-field">Priority</label>
            <Select value={priority} onChange={v => setPriority(v as TicketPriority)}>
              <option value="URGENT">Urgent</option>
              <option value="HIGH">High</option>
              <option value="NORMAL">Normal</option>
            </Select>
          </div>
        </div>
        <div>
          <label className="label-field">Description</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="Describe the issue..." className="input-field resize-none" />
        </div>
        <button onClick={handleCreate} className="btn-primary w-full">Create Ticket</button>
      </div>
    </Modal>
  );
}
