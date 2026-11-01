import { useState } from 'react';
import {
  ClipboardCheck, Plus, MapPin, Calendar, User, CheckCircle2,
  Clock, Camera, Zap, Home, Wrench,
} from 'lucide-react';
import { useStore, addSurvey, updateSurvey } from '@/store';
import { UP_DISTRICTS, ROOF_TYPES } from '@/data';
import { formatDate, uid, todayISO, nowISO } from '@/utils';
import { Card, Badge, Modal, Select } from '@/components/ui';
import type { CRMPageProps } from '@/types/crm';
import type { Survey, RoofType, ConnectionPhase, SurveyStatus } from '@/types';

export function SurveysPage({ onNavigate: _onNavigate }: CRMPageProps) {
  const store = useStore();
  const { surveys, leads } = store;
  const [showBookModal, setShowBookModal] = useState(false);
  const [completeSurvey, setCompleteSurvey] = useState<Survey | null>(null);

  const statusMeta: Record<string, { label: string; color: string }> = {
    SCHEDULED: { label: 'Scheduled', color: 'bg-cyan-100 text-cyan-700' },
    COMPLETED: { label: 'Completed', color: 'bg-emerald-100 text-emerald-700' },
    CANCELLED: { label: 'Cancelled', color: 'bg-rose-100 text-rose-700' },
  };

  return (
    <div className="animate-fade-in space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-extrabold text-2xl text-slate-900">Site Surveys</h1>
          <p className="text-sm text-slate-500 mt-0.5">{surveys.length} surveys</p>
        </div>
        <button onClick={() => setShowBookModal(true)} className="btn-primary">
          <Plus size={16} /> Book Survey
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {surveys.map(survey => {
          const meta = statusMeta[survey.status];
          return (
            <Card key={survey.id} className="p-5 hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-teal-50 flex items-center justify-center shrink-0">
                    <ClipboardCheck className="text-teal-600" size={22} />
                  </div>
                  <div>
                    <p className="font-display font-bold text-slate-900">{survey.customerName}</p>
                    <p className="text-xs text-slate-500">{survey.id} • {survey.district}</p>
                  </div>
                </div>
                <Badge className={meta.color}>{meta.label}</Badge>
              </div>
              <div className="space-y-2 text-sm text-slate-600">
                <div className="flex items-center gap-2"><MapPin size={14} className="text-slate-400" /> {survey.siteAddress}</div>
                <div className="flex items-center gap-2"><Calendar size={14} className="text-slate-400" /> {formatDate(survey.scheduledDate)}</div>
                <div className="flex items-center gap-2"><User size={14} className="text-slate-400" /> Technician: {survey.technician}</div>
                {survey.status === 'COMPLETED' && (
                  <div className="flex items-center gap-2"><Zap size={14} className="text-solar-500" /> Recommended: <span className="font-semibold text-solar-600">{survey.recommendedKw}kW</span></div>
                )}
              </div>
              {survey.status === 'SCHEDULED' && (
                <button onClick={() => setCompleteSurvey(survey)} className="btn-secondary w-full mt-4">
                  <CheckCircle2 size={16} /> Complete Survey
                </button>
              )}
            </Card>
          );
        })}
      </div>

      {showBookModal && <BookSurveyModal leads={leads} onClose={() => setShowBookModal(false)} />}
      {completeSurvey && <CompleteSurveyModal survey={completeSurvey} onClose={() => setCompleteSurvey(null)} />}
    </div>
  );
}

function BookSurveyModal({ leads, onClose }: { leads: any[]; onClose: () => void }) {
  const [leadId, setLeadId] = useState(leads[0]?.id || '');
  const [date, setDate] = useState(todayISO());
  const [technician, setTechnician] = useState('Vikas Yadav');
  const [address, setAddress] = useState('');

  const selectedLead = leads.find(l => l.id === leadId);

  function handleBook() {
    if (!selectedLead) return;
    const survey: Survey = {
      id: uid('S'),
      leadId: selectedLead.id,
      customerName: selectedLead.name,
      customerPhone: selectedLead.phone,
      siteAddress: address || `${selectedLead.district}, UP`,
      district: selectedLead.district,
      technician,
      scheduledDate: date,
      status: 'SCHEDULED',
      roofType: 'RCC_FLAT',
      usableArea: 0,
      shadowObstructions: '',
      sanctionedLoad: 0,
      connectionPhase: 'SINGLE',
      meterNumber: '',
      inverterLocation: '',
      cableDistance: 0,
      recommendedKw: selectedLead.recommendedKw,
      notes: '',
    };
    addSurvey(survey);
    onClose();
  }

  return (
    <Modal open={true} onClose={onClose} title="Book Site Survey">
      <div className="space-y-4">
        <div>
          <label className="label-field">Select Lead</label>
          <Select value={leadId} onChange={setLeadId}>
            {leads.map(l => <option key={l.id} value={l.id}>{l.name} — {l.district}</option>)}
          </Select>
        </div>
        <div>
          <label className="label-field">Site Address</label>
          <textarea value={address} onChange={e => setAddress(e.target.value)} placeholder="Full site address..." rows={2} className="input-field resize-none" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label-field">Scheduled Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="label-field">Technician</label>
            <Select value={technician} onChange={setTechnician}>
              <option value="Vikas Yadav">Vikas Yadav</option>
              <option value="Rajesh Verma">Rajesh Verma</option>
            </Select>
          </div>
        </div>
        <button onClick={handleBook} className="btn-primary w-full">Book Survey</button>
      </div>
    </Modal>
  );
}

function CompleteSurveyModal({ survey, onClose }: { survey: Survey; onClose: () => void }) {
  const [form, setForm] = useState({
    roofType: survey.roofType,
    usableArea: String(survey.usableArea || ''),
    shadowObstructions: survey.shadowObstructions || '',
    sanctionedLoad: String(survey.sanctionedLoad || ''),
    connectionPhase: survey.connectionPhase,
    meterNumber: survey.meterNumber || '',
    inverterLocation: survey.inverterLocation || '',
    cableDistance: String(survey.cableDistance || ''),
    recommendedKw: String(survey.recommendedKw),
    notes: survey.notes || '',
  });

  function handleComplete() {
    updateSurvey(survey.id, {
      status: 'COMPLETED',
      roofType: form.roofType as RoofType,
      usableArea: Number(form.usableArea) || 0,
      shadowObstructions: form.shadowObstructions,
      sanctionedLoad: Number(form.sanctionedLoad) || 0,
      connectionPhase: form.connectionPhase as ConnectionPhase,
      meterNumber: form.meterNumber,
      inverterLocation: form.inverterLocation,
      cableDistance: Number(form.cableDistance) || 0,
      recommendedKw: Number(form.recommendedKw),
      notes: form.notes,
      completedAt: nowISO(),
    });
    onClose();
  }

  return (
    <Modal open={true} onClose={onClose} title="Complete Survey Form" maxWidth="max-w-2xl">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label-field">Roof Type</label>
            <Select value={form.roofType} onChange={v => setForm({ ...form, roofType: v as RoofType })}>
              {ROOF_TYPES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </Select>
          </div>
          <div>
            <label className="label-field">Usable Area (sq. ft.)</label>
            <input type="number" value={form.usableArea} onChange={e => setForm({ ...form, usableArea: e.target.value })} className="input-field" />
          </div>
        </div>
        <div>
          <label className="label-field">Shadow Obstructions</label>
          <input type="text" value={form.shadowObstructions} onChange={e => setForm({ ...form, shadowObstructions: e.target.value })} placeholder="e.g. Water tank on south, minor" className="input-field" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label-field">Sanctioned Load (kW)</label>
            <input type="number" value={form.sanctionedLoad} onChange={e => setForm({ ...form, sanctionedLoad: e.target.value })} className="input-field" />
          </div>
          <div>
            <label className="label-field">Connection Phase</label>
            <Select value={form.connectionPhase} onChange={v => setForm({ ...form, connectionPhase: v as ConnectionPhase })}>
              <option value="SINGLE">Single Phase</option>
              <option value="THREE">Three Phase</option>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label-field">Meter Number</label>
            <input type="text" value={form.meterNumber} onChange={e => setForm({ ...form, meterNumber: e.target.value })} className="input-field" />
          </div>
          <div>
            <label className="label-field">Cable Distance (m)</label>
            <input type="number" value={form.cableDistance} onChange={e => setForm({ ...form, cableDistance: e.target.value })} className="input-field" />
          </div>
        </div>
        <div>
          <label className="label-field">Inverter Suggested Location</label>
          <input type="text" value={form.inverterLocation} onChange={e => setForm({ ...form, inverterLocation: e.target.value })} placeholder="e.g. Near main DB" className="input-field" />
        </div>
        <div>
          <label className="label-field">Recommended Solar Capacity (kW)</label>
          <input type="number" value={form.recommendedKw} onChange={e => setForm({ ...form, recommendedKw: e.target.value })} className="input-field" />
        </div>
        <div>
          <label className="label-field">Site Photos (Placeholders)</label>
          <div className="grid grid-cols-3 gap-3">
            {['Roof View', 'Distribution Board', 'Meter'].map(label => (
              <div key={label} className="border-2 border-dashed border-slate-200 rounded-lg p-4 text-center">
                <Camera className="mx-auto text-slate-300" size={24} />
                <p className="text-xs text-slate-400 mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
        <div>
          <label className="label-field">Notes</label>
          <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2} className="input-field resize-none" />
        </div>
        <button onClick={handleComplete} className="btn-primary w-full"><CheckCircle2 size={16} /> Complete Survey</button>
      </div>
    </Modal>
  );
}
