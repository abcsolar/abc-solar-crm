import { useState, useMemo } from 'react';
import {
  Search, Phone, MessageCircle, FileText, ClipboardCheck, Plus,
  MapPin, Filter, X, ArrowRight, Calendar, Trash2, Bot, PhoneCall, Sparkles,
  Mail,
} from 'lucide-react';
import { useStore, addLead, updateLead, deleteLead } from '@/store';
import { UP_DISTRICTS, LEAD_STATUSES } from '@/data';
import { formatINR, getStatusMeta, getPriorityMeta, waLink, uid, todayISO, nowISO, validateIndianPhone, getDiscomForDistrict, calculateSolar } from '@/utils';
import { Card, Badge, Modal, Select } from '@/components/ui';
import { AICallModal } from '@/components/crm/AICallModal';
import type { CRMPageProps } from '@/types/crm';
import type { Lead, LeadStatus, LeadPriority, AICallLog } from '@/types';

function getSourceMeta(source: string) {
  const map: Record<string, { label: string; color: string; icon: string }> = {
    WEBSITE_CALLBACK: { label: 'Website', color: 'bg-blue-50 text-blue-700 border-blue-200', icon: '🌐' },
    SOLAR_CALCULATOR: { label: 'Calculator', color: 'bg-amber-50 text-amber-700 border-amber-200', icon: '☀️' },
    META_LEAD_ADS: { label: 'Meta Ads', color: 'bg-purple-50 text-purple-700 border-purple-200', icon: '📘' },
    INDIAMART: { label: 'IndiaMART', color: 'bg-teal-50 text-teal-700 border-teal-200', icon: '🏭' },
    CALL_IVR: { label: 'Call/IVR', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: '📞' },
    WEBSITE: { label: 'Website', color: 'bg-blue-50 text-blue-700 border-blue-200', icon: '🌐' },
    CALCULATOR: { label: 'Calculator', color: 'bg-amber-50 text-amber-700 border-amber-200', icon: '☀️' },
    WHATSAPP: { label: 'WhatsApp', color: 'bg-green-50 text-green-700 border-green-200', icon: '💬' },
    REFERRAL: { label: 'Referral', color: 'bg-indigo-50 text-indigo-700 border-indigo-200', icon: '👥' },
    'WALK-IN': { label: 'Walk-in', color: 'bg-slate-100 text-slate-700 border-slate-200', icon: '🚶' },
    MANUAL: { label: 'Manual', color: 'bg-slate-100 text-slate-700 border-slate-200', icon: '✏️' },
    HARVEY_AI: { label: 'Harvey AI', color: 'bg-indigo-50 text-indigo-700 border-indigo-200', icon: '🤖' },
  };
  return map[source] || { label: source, color: 'bg-slate-50 text-slate-600 border-slate-200', icon: '📋' };
}

export function LeadsPage({ onNavigate }: CRMPageProps) {
  const store = useStore();
  const { leads } = store;

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [districtFilter, setDistrictFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null);
  const [callLead, setCallLead] = useState<Lead | null>(null);
  const [callLogToView, setCallLogToView] = useState<AICallLog | null>(null);

  // Deduplicate leads to ensure clean, non-repetitive table
  const uniqueLeads = useMemo(() => {
    const seenIds = new Set<string>();
    const seenPhones = new Set<string>();
    const seenNames = new Set<string>();

    return leads.filter(lead => {
      if (!lead.id || seenIds.has(lead.id)) return false;
      seenIds.add(lead.id);

      const cleanPhone = (lead.phone || '').replace(/\D/g, '').slice(-10);
      if (cleanPhone) {
        if (seenPhones.has(cleanPhone)) return false;
        seenPhones.add(cleanPhone);
      }

      const normName = (lead.name || '').trim().toLowerCase();
      if (normName && normName.length > 2) {
        if (seenNames.has(normName)) return false;
        seenNames.add(normName);
      }

      return true;
    });
  }, [leads]);

  // Sort descending by creation date so new/ingested leads are always at the top
  const sortedLeads = useMemo(() => {
    return [...uniqueLeads].sort((a, b) => {
      const timeA = new Date(a.createdAt || 0).getTime();
      const timeB = new Date(b.createdAt || 0).getTime();
      return timeB - timeA; // Most recent on top
    });
  }, [uniqueLeads]);

  const filteredLeads = useMemo(() => {
    return sortedLeads.filter(l => {
      if (search && !l.name.toLowerCase().includes(search.toLowerCase()) && !l.phone.includes(search)) return false;
      if (statusFilter !== 'ALL' && l.status !== statusFilter) return false;
      if (districtFilter !== 'ALL' && l.district !== districtFilter) return false;
      if (priorityFilter !== 'ALL' && l.priority !== priorityFilter) return false;
      return true;
    });
  }, [sortedLeads, search, statusFilter, districtFilter, priorityFilter]);

  return (
    <div className="animate-fade-in space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-extrabold text-2xl text-slate-900">Lead Directory</h1>
          <p className="text-sm text-slate-500 mt-0.5">{filteredLeads.length} of {uniqueLeads.length} leads</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="btn-primary">
          <Plus size={16} /> Add Lead
        </button>
      </div>

      <Card className="p-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or phone..."
              className="input-field pl-10"
            />
          </div>
          <Select value={statusFilter} onChange={setStatusFilter} className="w-auto min-w-[140px]">
            <option value="ALL">All Statuses</option>
            {LEAD_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </Select>
          <Select value={districtFilter} onChange={setDistrictFilter} className="w-auto min-w-[140px]">
            <option value="ALL">All Districts</option>
            {UP_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
          </Select>
          <Select value={priorityFilter} onChange={setPriorityFilter} className="w-auto min-w-[120px]">
            <option value="ALL">All Priority</option>
            <option value="HOT">Hot</option>
            <option value="WARM">Warm</option>
            <option value="COLD">Cold</option>
          </Select>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left py-3 px-4 font-semibold text-slate-600">Customer</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-600">District</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-600">kW</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-600">Value</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-600">Source</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-600">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-600">Priority</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-600">Assigned</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-600">Follow-up</th>
                <th className="text-right py-3 px-4 font-semibold text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.map(lead => {
                const status = getStatusMeta(lead.status);
                const priority = getPriorityMeta(lead.priority);
                const isToday = lead.followUpDate === todayISO() && lead.status !== 'WON' && lead.status !== 'LOST';
                const leadCall = (store.callLogs || []).find(c => c.leadId === lead.id);
                return (
                  <tr
                    key={lead.id}
                    className="border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer"
                    onClick={() => setSelectedLead(lead)}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                          <span className="text-xs font-bold text-slate-600">{lead.name.split(' ').map(n => n[0]).join('').slice(0, 2)}</span>
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{lead.name}</p>
                          <p className="text-xs text-slate-500">{lead.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{lead.district}</td>
                    <td className="py-3 px-4 font-semibold text-solar-600">{lead.recommendedKw}kW</td>
                    <td className="py-3 px-4 font-semibold text-slate-700">{formatINR(lead.dealValue)}</td>
                    <td className="py-3 px-4">
                      {(() => {
                        const s = getSourceMeta(lead.source);
                        const isHarvey = lead.source === 'HARVEY_AI';
                        return (
                          <div className="space-y-1">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${s.color}`}>
                              <span>{s.icon}</span>
                              <span>{s.label}</span>
                            </span>

                            {isHarvey && (
                              <div className="flex items-center gap-1 flex-wrap pt-0.5">
                                <span
                                  className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[9.5px] font-bold bg-blue-50 text-blue-700 border border-blue-200"
                                  title={`Email Outreach: ${lead.emailStatus || 'Delivered'}`}
                                >
                                  <Mail size={10} /> Email
                                </span>
                                <span
                                  className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[9.5px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  title={`WhatsApp Outreach: ${lead.whatsappStatus || 'Sent'}`}
                                >
                                  <MessageCircle size={10} /> Proposal Sent
                                </span>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </td>
                    <td className="py-3 px-4">
                      <Badge className={status.color}>{status.label}</Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge className={priority.color}>{priority.label}</Badge>
                    </td>
                    <td className="py-3 px-4 text-slate-600 text-xs">{lead.assignedTo}</td>
                    <td className="py-3 px-4">
                      {isToday ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600">
                          <Calendar size={12} /> Today
                        </span>
                      ) : (
                        <span className="text-xs text-slate-500">{lead.followUpDate}</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-1.5" onClick={e => e.stopPropagation()}>
                        {/* Quick WhatsApp Chat Action */}
                        <a
                          href={`https://wa.me/91${lead.phone.replace(/\D/g, '').slice(-10)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold transition shadow-2xs shrink-0"
                          title="Open WhatsApp Chat"
                        >
                          <MessageCircle size={13} className="text-emerald-600" />
                          <span className="hidden xl:inline">WhatsApp</span>
                        </a>

                        {/* AI Voice Calling Action */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setCallLead(lead);
                            setCallLogToView(leadCall || null);
                          }}
                          className={`p-1.5 rounded-md transition-all relative ${
                            leadCall
                              ? 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                              : 'text-amber-600 bg-amber-50 hover:bg-amber-100'
                          }`}
                          title={leadCall ? 'View AI Call Transcript & Recording' : 'Initiate AI Qualification Call'}
                        >
                          <Bot size={16} />
                          {leadCall ? (
                            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white" />
                          ) : (
                            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-500 animate-pulse ring-2 ring-white" />
                          )}
                        </button>

                        <a href={waLink(lead.phone, `Hi ${lead.name}, this is ABC Solar regarding your solar inquiry.`)} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-md hover:bg-forest-50 text-forest-600 transition-colors" title="WhatsApp">
                          <MessageCircle size={16} />
                        </a>
                        <a href={`tel:${lead.phone}`} className="p-1.5 rounded-md hover:bg-blue-50 text-blue-600 transition-colors" title="Call">
                          <Phone size={16} />
                        </a>
                        <button onClick={() => onNavigate('quotations')} className="p-1.5 rounded-md hover:bg-solar-50 text-solar-600 transition-colors" title="Create Quotation">
                          <FileText size={16} />
                        </button>
                        <button onClick={() => onNavigate('surveys')} className="p-1.5 rounded-md hover:bg-teal-50 text-teal-600 transition-colors" title="Schedule Survey">
                          <ClipboardCheck size={16} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setLeadToDelete(lead);
                          }}
                          className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-md transition"
                          title="Delete Lead"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filteredLeads.length === 0 && (
          <div className="text-center py-12 text-slate-400 text-sm">No leads match your filters.</div>
        )}
      </Card>

      {showAddModal && <AddLeadModal onClose={() => setShowAddModal(false)} />}
      {selectedLead && (
        <LeadDetailModal
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onNavigate={onNavigate}
          onDelete={(lead) => {
            setSelectedLead(null);
            setLeadToDelete(lead);
          }}
          onAICall={(lead) => {
            setSelectedLead(null);
            setCallLead(lead);
            setCallLogToView((store.callLogs || []).find(c => c.leadId === lead.id) || null);
          }}
        />
      )}

      {/* AI Voice Calling Modal */}
      {callLead && (
        <AICallModal
          lead={callLead}
          callLog={callLogToView}
          onClose={() => {
            setCallLead(null);
            setCallLogToView(null);
          }}
          onNavigate={onNavigate}
        />
      )}

      {/* Confirmation Modal */}
      {leadToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setLeadToDelete(null)} />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 animate-scale-in space-y-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <Trash2 size={20} />
              </div>
              <div className="space-y-1">
                <h3 className="font-display font-bold text-lg text-slate-900">Delete Lead?</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Are you sure you want to permanently remove <strong className="text-slate-900 font-semibold">{leadToDelete.name}</strong> from the CRM? This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setLeadToDelete(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteLead(leadToDelete.id);
                  if (selectedLead?.id === leadToDelete.id) {
                    setSelectedLead(null);
                  }
                  setLeadToDelete(null);
                }}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold shadow-xs transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AddLeadModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({
    name: '', phone: '', district: 'Lucknow', monthlyBill: '5000', priority: 'WARM' as LeadPriority,
  });
  const [error, setError] = useState('');

  function handleAdd() {
    if (!form.name.trim()) { setError('Enter name'); return; }
    if (!validateIndianPhone(form.phone)) { setError('Enter valid 10-digit phone'); return; }
    const calc = calculateSolar(Number(form.monthlyBill));
    const lead: Lead = {
      id: uid('L'),
      name: form.name.trim(),
      phone: form.phone,
      district: form.district,
      discom: getDiscomForDistrict(form.district),
      monthlyBill: Number(form.monthlyBill),
      recommendedKw: calc.recommendedKw,
      source: 'WALK-IN',
      status: 'NEW',
      priority: form.priority,
      assignedTo: 'Priya Singh',
      followUpDate: todayISO(),
      createdAt: nowISO(),
      notes: `Manual entry. Monthly bill ₹${form.monthlyBill}.`,
      dealValue: Math.round(calc.recommendedKw * 55000),
    };
    addLead(lead);
    onClose();
  }

  return (
    <Modal open={true} onClose={onClose} title="Add New Lead">
      <div className="space-y-4">
        {error && <div className="text-sm text-rose-600 bg-rose-50 p-2 rounded-lg">{error}</div>}
        <div>
          <label className="label-field">Full Name</label>
          <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input-field" placeholder="Customer name" />
        </div>
        <div>
          <label className="label-field">Mobile Number</label>
          <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })} className="input-field" placeholder="10-digit mobile" />
        </div>
        <div>
          <label className="label-field">District</label>
          <Select value={form.district} onChange={v => setForm({ ...form, district: v })}>
            {UP_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
          </Select>
        </div>
        <div>
          <label className="label-field">Monthly Bill (₹)</label>
          <input type="number" value={form.monthlyBill} onChange={e => setForm({ ...form, monthlyBill: e.target.value })} className="input-field" />
        </div>
        <div>
          <label className="label-field">Priority</label>
          <Select value={form.priority} onChange={v => setForm({ ...form, priority: v as LeadPriority })}>
            <option value="HOT">Hot</option>
            <option value="WARM">Warm</option>
            <option value="COLD">Cold</option>
          </Select>
        </div>
        <button onClick={handleAdd} className="btn-primary w-full">Add Lead</button>
      </div>
    </Modal>
  );
}

function LeadDetailModal({
  lead, onClose, onNavigate, onDelete, onAICall,
}: {
  lead: Lead;
  onClose: () => void;
  onNavigate: (page: string) => void;
  onDelete?: (lead: Lead) => void;
  onAICall?: (lead: Lead) => void;
}) {
  const [newStatus, setNewStatus] = useState<LeadStatus>(lead.status);
  const [notes, setNotes] = useState(lead.notes);
  const status = getStatusMeta(lead.status);
  const priority = getPriorityMeta(lead.priority);

  function handleSave() {
    updateLead(lead.id, { status: newStatus, notes });
    onClose();
  }

  return (
    <Modal open={true} onClose={onClose} title="Lead Details" maxWidth="max-w-2xl">
      <div className="space-y-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-solar-400 to-solar-600 flex items-center justify-center text-white font-bold text-lg shrink-0">
            {lead.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
          <div className="flex-1">
            <h3 className="font-display font-bold text-xl text-slate-900">{lead.name}</h3>
            <p className="text-sm text-slate-500">{lead.phone} • {lead.district} • {lead.discom}</p>
          </div>
          <div className="flex gap-2">
            <Badge className={status.color}>{status.label}</Badge>
            <Badge className={priority.color}>{priority.label}</Badge>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <InfoBox label="System Size" value={`${lead.recommendedKw} kW`} />
          <InfoBox label="Deal Value" value={formatINR(lead.dealValue)} />
          <InfoBox label="Monthly Bill" value={formatINR(lead.monthlyBill)} />
          <InfoBox label="Source" value={lead.source} />
        </div>

        <div>
          <label className="label-field">Update Status</label>
          <Select value={newStatus} onChange={v => setNewStatus(v as LeadStatus)}>
            {LEAD_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </Select>
        </div>

        <div>
          <label className="label-field">Notes</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} className="input-field resize-none" />
        </div>

        {lead.interactionHistory && lead.interactionHistory.length > 0 && (
          <div>
            <label className="label-field">Inquiry & Touchpoint History</label>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1.5 max-h-36 overflow-y-auto">
              {lead.interactionHistory.map((item, idx) => (
                <div key={idx} className="text-xs text-slate-700 font-mono flex items-start gap-1.5">
                  <span className="text-amber-500 mt-0.5">•</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
          {onAICall && (
            <button
              type="button"
              onClick={() => onAICall(lead)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-sm shadow-xs transition-all"
            >
              <Bot size={16} /> AI Voice Call
            </button>
          )}
          <a href={waLink(lead.phone, `Hi ${lead.name}, this is ABC Solar regarding your solar inquiry.`)} target="_blank" rel="noopener noreferrer" className="btn-secondary">
            <MessageCircle size={16} /> WhatsApp
          </a>
          <a href={`tel:${lead.phone}`} className="btn-outline">
            <Phone size={16} /> Call
          </a>
          <button onClick={() => { onNavigate('quotations'); onClose(); }} className="btn-outline">
            <FileText size={16} /> Quotation
          </button>
          <button onClick={() => { onNavigate('surveys'); onClose(); }} className="btn-outline">
            <ClipboardCheck size={16} /> Survey
          </button>
          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(lead)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 text-sm font-semibold transition-colors"
              title="Delete Lead"
            >
              <Trash2 size={15} /> Delete
            </button>
          )}
          <button onClick={handleSave} className="btn-primary ml-auto">
            Save Changes
          </button>
        </div>
      </div>
    </Modal>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="font-semibold text-slate-900 text-sm mt-0.5">{value}</p>
    </div>
  );
}
