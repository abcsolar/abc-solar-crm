import { useState } from 'react';
import {
  FileText, Plus, Trash2, Printer, Send, CheckCircle2, Download,
  Building2, MapPin, Phone, Wallet, Shield, ArrowRight,
} from 'lucide-react';
import { useStore, addQuotation, updateQuotation, updateLead, addProject } from '@/store';
import { COMPANY, UP_DISTRICTS } from '@/data';
import { formatINR, formatDate, uid, nowISO, todayISO, getDiscomForDistrict } from '@/utils';
import { Card, Badge, Modal, Select } from '@/components/ui';
import type { CRMPageProps } from '@/types/crm';
import type { Quotation, QuotationLineItem } from '@/types';
import confetti from 'canvas-confetti';

export function QuotationsPage({ onNavigate }: CRMPageProps) {
  const store = useStore();
  const { quotations, leads } = store;
  const [showBuilder, setShowBuilder] = useState(false);
  const [previewQuote, setPreviewQuote] = useState<Quotation | null>(null);

  const statusMeta: Record<string, { label: string; color: string }> = {
    DRAFT: { label: 'Draft', color: 'bg-slate-100 text-slate-600' },
    SENT: { label: 'Sent', color: 'bg-blue-100 text-blue-700' },
    ACCEPTED: { label: 'Accepted', color: 'bg-emerald-100 text-emerald-700' },
    REJECTED: { label: 'Rejected', color: 'bg-rose-100 text-rose-700' },
  };

  return (
    <>
      <div className={`animate-fade-in space-y-5 ${previewQuote ? 'print:hidden' : ''}`}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display font-extrabold text-2xl text-slate-900">Quotations &amp; BOQ Builder</h1>
            <p className="text-sm text-slate-500 mt-0.5">{quotations.length} quotations</p>
          </div>
          <button onClick={() => setShowBuilder(true)} className="btn-primary">
            <Plus size={16} /> New Quotation
          </button>
        </div>

        <div className="grid gap-4">
          {quotations.map(q => {
            const meta = statusMeta[q.status];
            return (
              <Card key={q.id} className="p-5 hover:shadow-md transition-all">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-solar-50 flex items-center justify-center shrink-0">
                      <FileText className="text-solar-600" size={24} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-display font-bold text-slate-900">{q.quoteNumber}</p>
                        <Badge className={meta.color}>{meta.label}</Badge>
                      </div>
                      <p className="text-sm text-slate-500">{q.customerName} • {q.customerDistrict} • {q.systemKw}kW</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xs text-slate-500">Net Investment</p>
                      <p className="font-display font-bold text-lg text-solar-600">{formatINR(q.netInvestment)}</p>
                    </div>
                    <button onClick={() => setPreviewQuote(q)} className="btn-outline">
                      View / Print
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {showBuilder && <QuotationBuilder leads={leads} onClose={() => setShowBuilder(false)} />}
      {previewQuote && <QuotationPreview quote={previewQuote} onClose={() => setPreviewQuote(null)} onNavigate={onNavigate} />}
    </>
  );
}

function QuotationBuilder({ leads, onClose }: { leads: any[]; onClose: () => void }) {
  const [leadId, setLeadId] = useState(leads[0]?.id || '');
  const [systemKw, setSystemKw] = useState('5');
  const [lineItems, setLineItems] = useState<QuotationLineItem[]>([
    { id: '1', description: 'Solar PV Modules', brand: 'Waaree', specification: '550W Mono PERC, BIS/ALMM', unit: 'Nos', qty: 10, unitPrice: 13500, gstRate: 12 },
    { id: '2', description: 'Grid-Tie Inverter', brand: 'Growatt', specification: '5kW 1-Phase', unit: 'Nos', qty: 1, unitPrice: 40000, gstRate: 12 },
    { id: '3', description: 'Mounting Structure', brand: 'ABC Solar', specification: 'GI Galvanized, RCC', unit: 'kW', qty: 5, unitPrice: 8000, gstRate: 18 },
    { id: '4', description: 'DC & AC Armoured Cables', brand: 'Polycab', specification: '4 sq mm', unit: 'Set', qty: 1, unitPrice: 18000, gstRate: 18 },
    { id: '5', description: 'ACDB & DCDB', brand: 'ABC Solar', specification: 'With SPD, MCB', unit: 'Set', qty: 1, unitPrice: 12000, gstRate: 18 },
    { id: '6', description: 'Lightning Arrester & Earthing', brand: 'OBO', specification: 'LA + Chemical Earthing', unit: 'Set', qty: 1, unitPrice: 10000, gstRate: 18 },
    { id: '7', description: 'Net-Metering Charges', brand: 'DISCOM', specification: 'Application + Meter', unit: 'Lot', qty: 1, unitPrice: 12000, gstRate: 18 },
    { id: '8', description: 'Installation & Commissioning', brand: 'ABC Solar', specification: 'Full Installation', unit: 'Lot', qty: 1, unitPrice: 25000, gstRate: 18 },
  ]);
  const [discount, setDiscount] = useState('0');
  const [subsidy, setSubsidy] = useState('78000');
  const [gstType, setGstType] = useState<'CGST_SGST' | 'IGST'>('CGST_SGST');

  const selectedLead = leads.find(l => l.id === leadId);
  const kw = Number(systemKw) || 1;

  const subtotal = lineItems.reduce((sum, item) => sum + item.qty * item.unitPrice, 0);
  const afterDiscount = Math.max(0, subtotal - Number(discount));
  const gstAmount = lineItems.reduce((sum, item) => {
    const base = item.qty * item.unitPrice;
    if (Number(discount) > 0) {
      const proportion = base / subtotal;
      const discountedBase = base - Number(discount) * proportion;
      return sum + discountedBase * (item.gstRate / 100);
    }
    return sum + base * (item.gstRate / 100);
  }, 0);
  const grandTotal = Math.round(afterDiscount + gstAmount);
  const netInvestment = Math.max(0, grandTotal - Number(subsidy));

  function updateItem(id: string, patch: Partial<QuotationLineItem>) {
    setLineItems(items => items.map(i => i.id === id ? { ...i, ...patch } : i));
  }
  function addItem() {
    setLineItems(items => [...items, { id: String(Date.now()), description: 'New Item', specification: '', unit: 'Nos', qty: 1, unitPrice: 0, gstRate: 18 }]);
  }
  function removeItem(id: string) {
    setLineItems(items => items.filter(i => i.id !== id));
  }

  function handleSave(status: 'DRAFT' | 'SENT') {
    if (!selectedLead) return;
    const quote: Quotation = {
      id: uid('Q'),
      quoteNumber: `ABC/2026/${String(Date.now()).slice(-3)}`,
      leadId: selectedLead.id,
      customerName: selectedLead.name,
      customerPhone: selectedLead.phone,
      customerDistrict: selectedLead.district,
      systemKw: kw,
      lineItems,
      subtotal: Math.round(subtotal),
      discount: Number(discount),
      gstType,
      gstAmount: Math.round(gstAmount),
      grandTotal,
      subsidyDeduction: Number(subsidy),
      netInvestment,
      status,
      createdAt: nowISO(),
      validTill: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
      notes: `${kw}kW system quotation.`,
    };
    addQuotation(quote);
    if (status === 'SENT') {
      updateLead(selectedLead.id, { status: 'QUOTATION_SENT' });
    }
    onClose();
  }

  return (
    <Modal open={true} onClose={onClose} title="Build Quotation" maxWidth="max-w-4xl">
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label-field">Select Lead</label>
            <Select value={leadId} onChange={setLeadId}>
              {leads.map(l => <option key={l.id} value={l.id}>{l.name} — {l.district} ({l.recommendedKw}kW)</option>)}
            </Select>
          </div>
          <div>
            <label className="label-field">System Size (kW)</label>
            <input type="number" value={systemKw} onChange={e => setSystemKw(e.target.value)} className="input-field" />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-display font-bold text-slate-900">Bill of Quantities</h4>
            <button onClick={addItem} className="btn-ghost text-solar-600"><Plus size={16} /> Add Item</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-y border-slate-200">
                  <th className="text-left py-2 px-2 font-semibold text-slate-600">Description</th>
                  <th className="text-left py-2 px-2 font-semibold text-slate-600">Spec</th>
                  <th className="text-left py-2 px-2 font-semibold text-slate-600">Unit</th>
                  <th className="text-left py-2 px-2 font-semibold text-slate-600">Qty</th>
                  <th className="text-left py-2 px-2 font-semibold text-slate-600">Rate</th>
                  <th className="text-left py-2 px-2 font-semibold text-slate-600">GST%</th>
                  <th className="text-right py-2 px-2 font-semibold text-slate-600">Total</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {lineItems.map(item => (
                  <tr key={item.id} className="border-b border-slate-100">
                    <td className="py-1.5 px-2"><input type="text" value={item.description} onChange={e => updateItem(item.id, { description: e.target.value })} className="w-full px-1.5 py-1 rounded border border-slate-200 text-xs" /></td>
                    <td className="py-1.5 px-2"><input type="text" value={item.specification} onChange={e => updateItem(item.id, { specification: e.target.value })} className="w-full px-1.5 py-1 rounded border border-slate-200 text-xs" /></td>
                    <td className="py-1.5 px-2"><input type="text" value={item.unit} onChange={e => updateItem(item.id, { unit: e.target.value })} className="w-16 px-1.5 py-1 rounded border border-slate-200 text-xs" /></td>
                    <td className="py-1.5 px-2"><input type="number" value={item.qty} onChange={e => updateItem(item.id, { qty: Number(e.target.value) })} className="w-16 px-1.5 py-1 rounded border border-slate-200 text-xs" /></td>
                    <td className="py-1.5 px-2"><input type="number" value={item.unitPrice} onChange={e => updateItem(item.id, { unitPrice: Number(e.target.value) })} className="w-20 px-1.5 py-1 rounded border border-slate-200 text-xs" /></td>
                    <td className="py-1.5 px-2">
                      <select value={item.gstRate} onChange={e => updateItem(item.id, { gstRate: Number(e.target.value) })} className="w-16 px-1.5 py-1 rounded border border-slate-200 text-xs">
                        <option value={0}>0%</option>
                        <option value={12}>12%</option>
                        <option value={18}>18%</option>
                      </select>
                    </td>
                    <td className="py-1.5 px-2 text-right font-semibold text-slate-700">{formatINR(item.qty * item.unitPrice)}</td>
                    <td className="py-1.5 px-1"><button onClick={() => removeItem(item.id)} className="text-rose-400 hover:text-rose-600"><Trash2 size={14} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <div>
              <label className="label-field">Discount (₹)</label>
              <input type="number" value={discount} onChange={e => setDiscount(e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="label-field">Subsidy Deduction (₹)</label>
              <input type="number" value={subsidy} onChange={e => setSubsidy(e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="label-field">GST Type</label>
              <Select value={gstType} onChange={v => setGstType(v as 'CGST_SGST' | 'IGST')}>
                <option value="CGST_SGST">CGST + SGST (Intra-UP)</option>
                <option value="IGST">IGST (Inter-State)</option>
              </Select>
            </div>
          </div>
          <div className="card p-4 bg-slate-50 space-y-2">
            <Row label="Subtotal" value={formatINR(subtotal)} />
            {Number(discount) > 0 && <Row label="Discount" value={`- ${formatINR(Number(discount))}`} />}
            <Row label={`GST (${gstType === 'CGST_SGST' ? 'CGST+SGST' : 'IGST'})`} value={formatINR(gstAmount)} />
            <div className="border-t border-slate-200 pt-2">
              <Row label="Grand Total" value={formatINR(grandTotal)} bold />
            </div>
            <Row label="Subsidy Deduction" value={`- ${formatINR(Number(subsidy))}`} className="text-forest-700" />
            <div className="border-t border-slate-200 pt-2">
              <Row label="Net Customer Investment" value={formatINR(netInvestment)} bold className="text-solar-600" />
            </div>
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <button onClick={() => handleSave('DRAFT')} className="btn-outline">Save as Draft</button>
          <button onClick={() => handleSave('SENT')} className="btn-primary"><Send size={16} /> Save & Mark Sent</button>
        </div>
      </div>
    </Modal>
  );
}

function Row({ label, value, bold, className }: { label: string; value: string; bold?: boolean; className?: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className={bold ? 'font-bold text-slate-900' : 'text-slate-500'}>{label}</span>
      <span className={`${bold ? 'font-display font-bold' : 'font-semibold'} ${className || 'text-slate-700'}`}>{value}</span>
    </div>
  );
}

function QuotationPreview({ quote, onClose, onNavigate }: { quote: Quotation; onClose: () => void; onNavigate: (page: string) => void }) {
  const discom = getDiscomForDistrict(quote.customerDistrict);

  function handleAccept() {
    updateQuotation(quote.id, { status: 'ACCEPTED' });
    updateLead(quote.leadId, { status: 'WON' });
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ['#F59E0B', '#0F766E', '#FCD34D'] });
    const newProject = {
      id: uid('P'),
      leadId: quote.leadId,
      quotationId: quote.id,
      customerName: quote.customerName,
      customerPhone: quote.customerPhone,
      district: quote.customerDistrict,
      systemKw: quote.systemKw,
      projectValue: quote.netInvestment,
      currentStage: 'ORDER_CONFIRMED' as const,
      startDate: todayISO(),
      expectedHandover: new Date(Date.now() + 25 * 86400000).toISOString().slice(0, 10),
      stages: [
        { stage: 'ORDER_CONFIRMED' as const, label: 'Order Confirmed', completed: true, completedAt: todayISO() },
        { stage: 'DETAILED_DESIGN' as const, label: 'Detailed Design', completed: false },
        { stage: 'MATERIAL_PROCUREMENT' as const, label: 'Material Procurement', completed: false },
        { stage: 'STRUCTURE_MOUNTING' as const, label: 'Structure Mounting', completed: false },
        { stage: 'PANEL_INVERTER_WIRING' as const, label: 'Panel & Inverter Wiring', completed: false },
        { stage: 'DISCOM_NET_METERING' as const, label: 'Discom Net-Metering', completed: false },
        { stage: 'TESTING_SYNC' as const, label: 'Testing & Synchronization', completed: false },
        { stage: 'HANDOVER' as const, label: 'Handover', completed: false },
      ],
    };
    addProject(newProject);
    onClose();
    onNavigate('projects');
  }

  function handlePrint() {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;
    document.body.classList.add('printing-quotation');
    window.print();
    setTimeout(() => {
      document.body.classList.remove('printing-quotation');
    }, 1500);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto bg-slate-900/60 backdrop-blur-sm animate-fade-in print:p-0 print:m-0 print:bg-white print:static print:overflow-visible">
      {/* Click outside to close (disabled during print) */}
      <div className="fixed inset-0 no-print" onClick={onClose} />

      <div className="relative w-full max-w-[225mm] bg-slate-100 rounded-2xl shadow-2xl border border-slate-300 overflow-hidden flex flex-col my-auto max-h-[96vh] animate-scale-in print:w-full print:max-w-none print:max-h-none print:bg-white print:border-none print:shadow-none print:rounded-none print:m-0 print:p-0 print:overflow-visible">
        {/* Top Control Toolbar (Hidden in Print) */}
        <div className="px-5 py-3 bg-slate-900 text-white flex items-center justify-between no-print shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">
              A4
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-bold text-sm sm:text-base">Quotation &amp; BOQ Preview</h3>
                <Badge className={
                  quote.status === 'ACCEPTED' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                  quote.status === 'SENT' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                  'bg-slate-700 text-slate-300'
                }>
                  {quote.status}
                </Badge>
              </div>
              <p className="text-[11px] text-slate-400">Standard Single-Page A4 Geometry · Print &amp; PDF Optimized</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-xs transition active:scale-95 cursor-pointer"
            >
              <Printer size={15} /> Print / Save PDF
            </button>
            {quote.status !== 'ACCEPTED' && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    updateQuotation(quote.id, { status: 'SENT' });
                    updateLead(quote.leadId, { status: 'QUOTATION_SENT' });
                    onClose();
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition"
                >
                  <Send size={14} /> Mark Sent
                </button>
                <button
                  type="button"
                  onClick={handleAccept}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition"
                >
                  <CheckCircle2 size={14} /> Accept &amp; Win
                </button>
              </>
            )}
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-lg leading-none transition ml-1"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Scrollable Canvas for A4 sheet */}
        <div className="overflow-y-auto p-3 sm:p-6 flex-1 flex justify-center bg-slate-200/70 print:p-0 print:m-0 print:bg-white print:overflow-visible print:block">
          {/* Strict A4 Printable Sheet (210mm x 297mm) */}
          <div className="a4-quotation-sheet w-full max-w-[210mm] min-h-[297mm] bg-white text-slate-900 shadow-xl p-6 sm:p-7 rounded-sm text-[11px] leading-tight font-sans relative flex flex-col justify-between select-text border border-slate-200 print:border-none print:shadow-none print:p-8">
            <div>
              {/* 1. Top Header Strip (2-Column Balanced) */}
              <div className="flex items-start justify-between border-b-2 border-amber-500 pb-2.5 mb-2.5">
                {/* Left: ABC Solar Details */}
                <div className="max-w-[62%] space-y-0.5">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-9 h-9 rounded-xl bg-white p-0.5 border border-slate-200 flex items-center justify-center shrink-0 shadow-2xs">
                      <img src="/logo.jpg" alt="ABC Solar" className="w-full h-full object-contain" />
                    </div>
                    <div>
                      <h2 className="font-display font-extrabold text-lg text-slate-900 tracking-tight leading-none">ABC SOLAR</h2>
                      <p className="text-[9.5px] font-bold text-slate-600 tracking-wide uppercase mt-0.5">A Unit of Avadh Boring Company</p>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-tight">
                    {COMPANY.address}
                  </p>
                  <p className="text-[10px] text-slate-600 font-medium">
                    GSTIN: <span className="font-mono font-bold text-slate-800">{COMPANY.gstin}</span> | PAN: <span className="font-mono font-bold text-slate-800">{COMPANY.pan}</span>
                  </p>
                  <p className="text-[10px] text-slate-600 font-medium">
                    Phone: <span className="font-bold text-slate-900">+91 {COMPANY.phone}</span> | Email: <span className="text-slate-800">{COMPANY.email}</span>
                  </p>
                  <div className="flex items-center gap-1.5 pt-0.5 flex-wrap">
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 font-bold text-[8.5px] border border-emerald-200">
                      UPNEDA Empanelled Vendor: {COMPANY.vendorCode}
                    </span>
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 font-bold text-[8.5px] border border-amber-200">
                      Loom Solar Auth. Dealer: 24483/UP/08/2028
                    </span>
                  </div>
                </div>

                {/* Right: Document Title, Number, Dates */}
                <div className="text-right space-y-1 max-w-[36%]">
                  <span className="inline-block px-2 py-0.5 rounded bg-slate-900 text-amber-400 font-display font-extrabold text-[11px] uppercase tracking-wider">
                    QUOTATION / BOQ ESTIMATE
                  </span>
                  <p className="text-sm font-display font-extrabold text-slate-900 font-mono pt-0.5">
                    {quote.quoteNumber}
                  </p>
                  <div className="text-[9.5px] text-slate-500 space-y-0.5">
                    <p>Issue Date: <strong className="text-slate-700">{formatDate(quote.createdAt)}</strong></p>
                    <p>Validity: <strong className="text-slate-700">30 Days ({formatDate(quote.validTill)})</strong></p>
                    <p className="text-emerald-700 font-semibold">PM Surya Ghar Empanelled</p>
                  </div>
                </div>
              </div>

              {/* 2. Client Details & Project Meta Card (50/50 Split) */}
              <div className="bg-slate-50 border border-slate-200 rounded-md p-2.5 mb-2.5 grid grid-cols-2 gap-3 text-[10.5px]">
                {/* Bill To */}
                <div className="space-y-1 border-r border-slate-200/80 pr-2.5">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Building2 size={11} className="text-amber-500" /> BILL TO (CLIENT DETAILS)
                  </p>
                  <p className="font-display font-bold text-slate-900 text-xs">{quote.customerName}</p>
                  <p className="text-slate-600 flex items-center gap-1">
                    <MapPin size={11} className="text-slate-400 shrink-0" />
                    <span>{quote.customerDistrict}, Uttar Pradesh</span>
                  </p>
                  <p className="text-slate-600 flex items-center gap-1">
                    <Phone size={11} className="text-slate-400 shrink-0" />
                    <span>+91 {quote.customerPhone}</span>
                  </p>
                  <p className="text-slate-500 text-[9.5px]">
                    DISCOM Utility: <strong className="text-slate-700">{discom}</strong>
                  </p>
                </div>

                {/* Project Details */}
                <div className="space-y-1 pl-1">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Shield size={11} className="text-emerald-600" /> PROJECT &amp; PLANT DETAILS
                  </p>
                  <p className="font-display font-bold text-slate-900 text-xs">
                    {quote.systemKw} kW On-Grid Solar Plant
                  </p>
                  <p className="text-slate-600">
                    Plant Type: <span className="text-slate-800 font-medium">Grid-Tie Rooftop with Net-Metering</span>
                  </p>
                  <p className="text-slate-600">
                    Roof Type: <span className="text-slate-800 font-medium">RCC Flat Roof / Metal Shed (Hot-Dip GI)</span>
                  </p>
                  <p className="text-emerald-700 text-[9.5px] font-semibold">
                    Subsidy Scheme: Central PM Surya Ghar + UPNEDA State DBT
                  </p>
                </div>
              </div>

              {/* 3. BOQ Table (Precise Ratios: 5%, 32%, 28%, 10%, 12%, 13%) */}
              <div className="border border-slate-200 rounded-md overflow-hidden mb-2.5">
                <table className="w-full text-[10.5px] table-fixed">
                  <thead>
                    <tr className="bg-slate-900 text-white text-[9.5px] uppercase tracking-wider">
                      <th className="w-[5%] text-center py-1.5 px-1 font-semibold">#</th>
                      <th className="w-[32%] text-left py-1.5 px-2 font-semibold">Description &amp; Brand</th>
                      <th className="w-[28%] text-left py-1.5 px-2 font-semibold">Technical Specification</th>
                      <th className="w-[10%] text-center py-1.5 px-1 font-semibold">Qty / Unit</th>
                      <th className="w-[12%] text-right py-1.5 px-2 font-semibold">Rate (₹)</th>
                      <th className="w-[13%] text-right py-1.5 px-2 font-semibold">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quote.lineItems.map((item, i) => (
                      <tr
                        key={item.id}
                        className={`border-b border-slate-200 ${
                          i % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'
                        }`}
                      >
                        <td className="w-[5%] py-1.5 px-1 text-center text-slate-400 font-mono text-[9.5px]">{i + 1}</td>
                        <td className="w-[32%] py-1.5 px-2 font-bold text-slate-800 whitespace-normal">
                          {item.description}
                          {item.brand && (
                            <span className="block text-[9.5px] font-semibold text-amber-700 mt-0.5">
                              Brand: {item.brand}
                            </span>
                          )}
                        </td>
                        <td className="w-[28%] py-1.5 px-2 text-slate-600 text-[10px] leading-snug whitespace-normal">
                          {item.specification}
                        </td>
                        <td className="w-[10%] py-1.5 px-1 text-center text-slate-700 font-medium whitespace-nowrap">
                          {item.qty} {item.unit}
                        </td>
                        <td className="w-[12%] py-1.5 px-2 text-right text-slate-600 tabular-nums whitespace-nowrap">
                          {formatINR(item.unitPrice, false)}
                        </td>
                        <td className="w-[13%] py-1.5 px-2 text-right font-bold text-slate-900 tabular-nums whitespace-nowrap">
                          {formatINR(item.qty * item.unitPrice, false)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 4. Totals, Subsidy Breakdown & Payment Milestones */}
              <div className="grid grid-cols-2 gap-3 mb-2.5 items-start">
                {/* Left: Payment Milestones */}
                <div className="space-y-1.5">
                  <p className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider">
                    PAYMENT MILESTONES &amp; SCHEDULE
                  </p>
                  <div className="grid grid-cols-3 gap-1.5 text-center text-[9.5px]">
                    <div className="p-1.5 rounded-md bg-slate-50 border border-slate-200">
                      <p className="font-extrabold text-slate-900 text-xs text-amber-600">20%</p>
                      <p className="font-bold text-slate-700 mt-0.5">Advance Booking</p>
                      <p className="text-[8.5px] text-slate-400">Design &amp; SLD</p>
                    </div>
                    <div className="p-1.5 rounded-md bg-slate-50 border border-slate-200">
                      <p className="font-extrabold text-slate-900 text-xs text-amber-600">60%</p>
                      <p className="font-bold text-slate-700 mt-0.5">Material Dispatch</p>
                      <p className="text-[8.5px] text-slate-400">Modules &amp; Inverter</p>
                    </div>
                    <div className="p-1.5 rounded-md bg-slate-50 border border-slate-200">
                      <p className="font-extrabold text-slate-900 text-xs text-emerald-600">20%</p>
                      <p className="font-bold text-slate-700 mt-0.5">Commissioning</p>
                      <p className="text-[8.5px] text-slate-400">Net-Meter Sync</p>
                    </div>
                  </div>
                  <p className="text-[9px] text-slate-400 italic leading-snug">
                    * Subsidy deduction of up to ₹1,08,000 is credited directly into customer's bank account post-inspection under PM Surya Ghar DBT scheme.
                  </p>
                </div>

                {/* Right: Calculations Summary Card */}
                <div className="bg-slate-50 border border-slate-200 rounded-md p-2 space-y-1 text-[10.5px]">
                  <div className="flex justify-between items-center text-slate-600">
                    <span>Subtotal (Equipment &amp; EPC)</span>
                    <span className="font-semibold text-slate-800 tabular-nums">{formatINR(quote.subtotal)}</span>
                  </div>
                  {quote.discount > 0 && (
                    <div className="flex justify-between items-center text-rose-600">
                      <span>Special Promotional Discount</span>
                      <span className="font-semibold tabular-nums">- {formatINR(quote.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-slate-600">
                    <span>GST ({quote.gstType === 'CGST_SGST' ? 'CGST + SGST Intra-UP' : 'IGST'})</span>
                    <span className="font-semibold text-slate-800 tabular-nums">{formatINR(quote.gstAmount)}</span>
                  </div>
                  <div className="border-t border-slate-200 pt-0.5 flex justify-between items-center font-bold text-slate-900">
                    <span>Grand Total (Gross Project Cost)</span>
                    <span className="tabular-nums">{formatINR(quote.grandTotal)}</span>
                  </div>

                  {/* Subsidy Highlight Pill */}
                  <div className="p-1.5 rounded bg-emerald-50 border border-emerald-200 flex justify-between items-center text-emerald-800 font-bold text-[10px]">
                    <span className="flex items-center gap-1">
                      <span>🏛️</span> Applicable UP &amp; Central Subsidy
                    </span>
                    <span className="tabular-nums font-extrabold">- {formatINR(quote.subsidyDeduction)}</span>
                  </div>

                  {/* Net Customer Investment Box */}
                  <div className="bg-amber-500/10 text-amber-950 border border-amber-300 rounded p-1.5 flex justify-between items-center font-extrabold text-xs">
                    <span>NET CUSTOMER INVESTMENT</span>
                    <span className="text-sm text-amber-700 tabular-nums">{formatINR(quote.netInvestment)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 5. Footer: Terms, Bank Account & Authorized Signature */}
            <div className="pt-2 border-t-2 border-slate-200 grid grid-cols-3 gap-2 text-[9px] leading-tight text-slate-600 mt-auto">
              {/* Section A: Terms */}
              <div className="space-y-0.5 pr-1">
                <p className="font-bold text-slate-900 uppercase text-[8.5px] tracking-wider">
                  TERMS &amp; CONDITIONS
                </p>
                <ul className="space-y-0.5 list-disc pl-2.5 text-slate-500">
                  <li>25-Year Linear Performance Warranty on ALMM PV modules.</li>
                  <li>5–10 Year Standard Manufacturer Warranty on Grid Inverter.</li>
                  <li>Central &amp; UPNEDA subsidy credited directly via DBT after meter sync.</li>
                  <li>Includes 2-Year comprehensive installation &amp; O&M support.</li>
                </ul>
              </div>

              {/* Section B: Bank Details */}
              <div className="space-y-0.5 border-x border-slate-200 px-2 text-[9px]">
                <p className="font-bold text-slate-900 uppercase text-[8.5px] tracking-wider mb-0.5">
                  CANARA BANK DETAILS (RTGS / NEFT)
                </p>
                <p>Bank Name: <strong className="text-slate-800 font-semibold">Canara Bank</strong></p>
                <p>Account Name: <strong className="text-slate-800 font-semibold">M/S AVADH BORING COMPANY</strong></p>
                <p>A/C No: <strong className="font-mono text-slate-900 font-bold">120034396413</strong></p>
                <p>IFSC Code: <strong className="font-mono text-slate-900 font-bold">CNRB0018631</strong></p>
                <p>Account Type: <strong className="text-slate-900 font-bold">Current Account</strong></p>
                <p>Branch: <span className="text-slate-600">Barabanki, Uttar Pradesh - 225001</span></p>
              </div>

              {/* Section C: Authorized Signatory & Official Stamp */}
              <div className="space-y-0.5 text-center pl-1 flex flex-col justify-between items-center">
                <div className="w-full text-right">
                  <p className="font-bold text-slate-800 text-[8.5px] uppercase">
                    FOR M/S AVADH BORING COMPANY
                  </p>
                  <p className="text-[7.5px] text-slate-400">UPNEDA Empanelled Rooftop Solar Channel Partner</p>
                </div>

                <div className="my-auto py-0.5 flex flex-col items-center justify-center">
                  <img
                    src="/images/avadh-stamp-sign.png"
                    alt="Official Stamp & Sign - M/S Avadh Boring Company"
                    className="w-44 max-h-16 object-contain mx-auto my-1 print:max-h-14"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = '/avadh-stamp-sign.png';
                    }}
                  />
                  <div className="border-t border-slate-300 w-36 pt-0.5 text-center">
                    <p className="font-bold text-slate-900 text-[9px] leading-tight">Abdul Qari (Proprietor)</p>
                    <p className="text-[7.5px] text-slate-500 font-medium">Authorized Signatory</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
