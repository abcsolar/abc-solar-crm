import type { Discom, LeadStatus } from '@/types';

/** Format a number in Indian numbering system (e.g., 485000 -> ₹4,85,000) */
export function formatINR(amount: number, withSymbol = true): string {
  const formatted = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
  minimumFractionDigits: 0,
  }).format(Math.round(amount));
  return withSymbol ? `₹${formatted}` : formatted;
}

/** Validate 10-digit Indian phone number starting with 6-9 */
export function validateIndianPhone(phone: string): boolean {
  return /^[6-9]\d{9}$/.test(phone.replace(/\s/g, ''));
}

/** Format phone for wa.me links */
export function waLink(phone: string, message?: string): string {
  const clean = phone.replace(/\D/g, '');
  const msg = message ? `?text=${encodeURIComponent(message)}` : '';
  return `https://wa.me/91${clean}${msg}`;
}

/** Get status metadata */
export function getStatusMeta(status: string) {
  const meta: Record<string, { label: string; color: string; dotColor: string }> = {
    NEW: { label: 'New Lead', color: 'bg-blue-50 text-blue-700 border-blue-200', dotColor: 'bg-blue-500' },
    CONTACTED: { label: 'Contacted', color: 'bg-purple-50 text-purple-700 border-purple-200', dotColor: 'bg-purple-500' },
    SITE_VISIT_SCHEDULED: { label: 'Site Visit Scheduled', color: 'bg-cyan-50 text-cyan-700 border-cyan-200', dotColor: 'bg-cyan-500' },
    SURVEY_DONE: { label: 'Survey Done', color: 'bg-teal-50 text-teal-700 border-teal-200', dotColor: 'bg-teal-500' },
    QUOTATION_SENT: { label: 'Quotation Sent', color: 'bg-amber-50 text-amber-700 border-amber-200', dotColor: 'bg-amber-500' },
    NEGOTIATION: { label: 'Negotiation', color: 'bg-orange-50 text-orange-700 border-orange-200', dotColor: 'bg-orange-500' },
    WON: { label: 'Won / Project', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', dotColor: 'bg-emerald-500' },
    LOST: { label: 'Lost', color: 'bg-rose-50 text-rose-700 border-rose-200', dotColor: 'bg-rose-500' },
  };
  return meta[status] || meta.NEW;
}

export function getPriorityMeta(priority: string) {
  const meta: Record<string, { label: string; color: string }> = {
    HOT: { label: 'Hot', color: 'bg-red-100 text-red-700' },
    WARM: { label: 'Warm', color: 'bg-amber-100 text-amber-700' },
    COLD: { label: 'Cold', color: 'bg-sky-100 text-sky-700' },
  };
  return meta[priority] || meta.WARM;
}

export function getSourceMeta(source: string) {
  const map: Record<string, { label: string; color: string; icon: string }> = {
    WEBSITE_CALLBACK: { label: 'Web Form', color: 'bg-blue-50 text-blue-700 border-blue-200', icon: '🌐' },
    SOLAR_CALCULATOR: { label: 'Calculator', color: 'bg-amber-50 text-amber-700 border-amber-200', icon: '☀️' },
    META_LEAD_ADS: { label: 'Meta Ads', color: 'bg-purple-50 text-purple-700 border-purple-200', icon: '📘' },
    INDIAMART: { label: 'IndiaMART', color: 'bg-teal-50 text-teal-700 border-teal-200', icon: '🏭' },
    CALL_IVR: { label: 'Inbound Call', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: '📞' },
    WEBSITE: { label: 'Web Form', color: 'bg-blue-50 text-blue-700 border-blue-200', icon: '🌐' },
    CALCULATOR: { label: 'Calculator', color: 'bg-amber-50 text-amber-700 border-amber-200', icon: '☀️' },
    WHATSAPP: { label: 'WhatsApp', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: '💬' },
    REFERRAL: { label: 'Referral', color: 'bg-indigo-50 text-indigo-700 border-indigo-200', icon: '👥' },
    'WALK-IN': { label: 'Walk-in', color: 'bg-slate-100 text-slate-700 border-slate-200', icon: '🚶' },
    MANUAL: { label: 'Manual', color: 'bg-slate-100 text-slate-700 border-slate-200', icon: '✏️' },
    HARVEY_AI: { label: 'Harvey AI', color: 'bg-indigo-50 text-indigo-700 border-indigo-200', icon: '🤖' },
  };
  return map[source] || { label: source, color: 'bg-slate-100 text-slate-600 border-slate-200', icon: '📋' };
}

/** Solar calculation engine */
export interface SolarCalcResult {
  recommendedKw: number;
  areaNeeded: number;
  annualGeneration: number;
  annualSavings: number;
  paybackYears: number;
  centralSubsidy: number;
  stateSubsidy: number;
  totalSubsidy: number;
  netInvestment: number;
  totalCost: number;
}

const COST_PER_KW = 60000;
const UNITS_PER_KW_PER_MONTH = 125;
const AVG_RATE_PER_UNIT = 6.5;

function getCentralSubsidy(kw: number): number {
  if (kw <= 0) return 0;
  if (kw <= 1) return 30000;
  if (kw <= 2) return 60000;
  return 78000;
}

function getStateSubsidy(kw: number): number {
  if (kw <= 0) return 0;
  if (kw <= 1) return 15000;
  return 30000;
}

function getTotalSubsidy(kw: number): number {
  return getCentralSubsidy(kw) + getStateSubsidy(kw);
}

function getAreaNeeded(kw: number): number {
  return Math.round(kw * 100);
}

export function calculateSolar(
  monthlyBill: number,
  roofArea?: number,
  roofType: string = 'RCC_FLAT',
): SolarCalcResult {
  const monthlyUnits = monthlyBill / AVG_RATE_PER_UNIT;
  const annualUnits = monthlyUnits * 12;
  const unitsPerKwPerYear = UNITS_PER_KW_PER_MONTH * 12;
  const recommendedKw = Math.max(1, Math.min(10, Math.ceil(annualUnits / unitsPerKwPerYear * 10) / 10));

  return computeSolarResult(recommendedKw, roofType);
}

export function calculateSolarByKw(
  kw: number,
  roofType: string = 'RCC_FLAT',
): SolarCalcResult {
  const clampedKw = Math.max(1, Math.min(10, kw));
  return computeSolarResult(clampedKw, roofType);
}

function computeSolarResult(kw: number, roofType: string): SolarCalcResult {
  const annualGeneration = Math.round(kw * UNITS_PER_KW_PER_MONTH * 12);
  const annualSavings = Math.round(annualGeneration * AVG_RATE_PER_UNIT);
  const totalCost = Math.round(kw * COST_PER_KW);
  const centralSubsidy = getCentralSubsidy(kw);
  const stateSubsidy = getStateSubsidy(kw);
  const totalSubsidy = centralSubsidy + stateSubsidy;
  const netInvestment = Math.max(0, totalCost - totalSubsidy);
  const paybackYears = Math.round((netInvestment / annualSavings) * 10) / 10;

  return {
    recommendedKw: kw,
    areaNeeded: getAreaNeeded(kw),
    annualGeneration,
    annualSavings,
    paybackYears: Math.min(paybackYears, 99),
    centralSubsidy,
    stateSubsidy,
    totalSubsidy,
    netInvestment,
    totalCost,
  };
}

export function getDiscomForDistrict(district: string): Discom {
  const mvvnl = ['Lucknow', 'Ayodhya', 'Sultanpur', 'Barabanki', 'Sitapur', 'Hardoi', 'Lakhimpur Kheri', 'Gonda', 'Bahraich', 'Shravasti', 'Balrampur'];
  const pvvnl = ['Varanasi', 'Gorakhpur', 'Azamgarh', 'Mau', 'Deoria', 'Basti', 'Sant Kabir Nagar', 'Kushinagar', 'Maharajganj', 'Jaunpur', 'Ghazipur', 'Ballia', 'Chandauli', 'Bhadohi', 'Mirzapur', 'Sonbhadra', 'Prayagraj', 'Pratapgarh', 'Kaushambi', 'Fatehpur'];
  const dvvnl = ['Kanpur Nagar', 'Kanpur Dehat', 'Agra', 'Aligarh', 'Mathura', 'Firozabad', 'Etah', 'Mainpuri', 'Etawah', 'Auraiya', 'Kannauj', 'Farrukhabad'];
  const puvvnl = ['Meerut', 'Ghaziabad', 'Saharanpur', 'Muzaffarnagar', 'Bijnor', 'Moradabad', 'Bareilly', 'Pilibhit', 'Shahjahanpur', 'Budaun', 'Rampur', 'Amroha', 'Sambhal', 'Hapur', 'Shamli', 'Baghpat'];
  if (mvvnl.includes(district)) return 'MVVNL';
  if (pvvnl.includes(district)) return 'PVVNL';
  if (dvvnl.includes(district)) return 'DVVNL';
  if (puvvnl.includes(district)) return 'PuVVNL';
  return 'MVVNL';
}

export function uid(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function nowISO(): string {
  return new Date().toISOString();
}

export function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
}
