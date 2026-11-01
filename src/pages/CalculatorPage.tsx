import { useState, useEffect } from 'react';
import {
  Calculator, Sun, Zap, TrendingDown, Wallet, Calendar, ArrowRight,
  CheckCircle2, Landmark, Building2, AlertTriangle, Factory, Shield,
  Sparkles, Check, ChevronRight, HelpCircle,
} from 'lucide-react';
import { UP_DISTRICTS } from '@/data';
import { calculateSolar, calculateSolarByKw, formatINR, getDiscomForDistrict } from '@/utils';
import type { SolarCalcResult } from '@/utils';
import { ingestCalculatorLead } from '@/services/leadIngestion';
import { useLanguage } from '@/i18n/LanguageContext';
import confetti from 'canvas-confetti';

type CalcMode = 'bill' | 'capacity';

export function CalculatorPage({ onNavigate }: { onNavigate: (page: string) => void }) {
  const { t } = useLanguage();
  const [mode, setMode] = useState<CalcMode>('bill');
  const [monthlyBill, setMonthlyBill] = useState(5500);
  const [systemKw, setSystemKw] = useState(4);
  const [roofArea, setRoofArea] = useState(900);
  const [roofType, setRoofType] = useState('RCC_FLAT');
  const [district, setDistrict] = useState('Barabanki');
  const [claimed, setClaimed] = useState(false);
  const [areaManuallySet, setAreaManuallySet] = useState(false);

  // Claim form state
  const [leadName, setLeadName] = useState('');
  const [leadPhone, setLeadPhone] = useState('');
  const [showClaimModal, setShowClaimModal] = useState(false);

  const result: SolarCalcResult = mode === 'bill'
    ? calculateSolar(monthlyBill, roofArea, roofType)
    : calculateSolarByKw(systemKw, roofType);

  const discom = getDiscomForDistrict(district);
  const areaInsufficient = roofArea < result.areaNeeded;
  const highBill = mode === 'bill' && monthlyBill >= 15000;

  // 25-year cumulative savings estimate
  const lifetimeSavings = Math.round(result.annualSavings * 25);

  useEffect(() => {
    if (mode === 'capacity' && !areaManuallySet) {
      setRoofArea(systemKw * 100);
    }
  }, [systemKw, mode, areaManuallySet]);

  useEffect(() => {
    setAreaManuallySet(false);
    if (mode === 'capacity') {
      setRoofArea(systemKw * 100);
    } else {
      setRoofArea(800);
    }
  }, [mode]);

  function handleRoofAreaChange(value: number) {
    setRoofArea(value);
    setAreaManuallySet(true);
  }

  function handleClaimSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!leadName.trim() || !leadPhone.trim()) return;

    ingestCalculatorLead({
      name: leadName.trim(),
      phone: leadPhone.trim(),
      district,
      monthlyBill: mode === 'bill' ? monthlyBill : Math.round(result.annualSavings / 12),
      roofArea,
      roofType,
      recommendedKw: result.recommendedKw,
      totalCost: result.totalCost,
      totalSubsidy: result.totalSubsidy,
      netInvestment: result.netInvestment,
    });
    setClaimed(true);
    setShowClaimModal(false);
    confetti({ particleCount: 90, spread: 70, origin: { y: 0.65 }, colors: ['#F59E0B', '#0F766E', '#10B981'] });
  }

  const billPresets = [2500, 4500, 7000, 10000, 15000];

  return (
    <div className="animate-fade-in bg-slate-50 min-h-screen">
      {/* Hero Header */}
      <section className="bg-slate-950 text-white py-14 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#F59E0B_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/15 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center relative">
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 rounded-full px-4 py-1.5 text-xs font-bold text-amber-400 mb-4 tracking-wide uppercase">
            <Sparkles size={14} /> Official PM Surya Ghar &amp; UPNEDA Subsidy Engine
          </div>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight mb-3">
            {t('calcTitle')}
          </h1>
          <p className="text-slate-300 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
            {t('calcSubtitle')}
          </p>
        </div>
      </section>

      {/* Main Calculator Body */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        {/* Mode Selector Tabs */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex w-full sm:w-auto p-1 sm:p-1.5 bg-slate-200/80 rounded-2xl border border-slate-300/80 shadow-xs">
            <button
              onClick={() => setMode('bill')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                mode === 'bill'
                  ? 'bg-white text-slate-900 shadow-md shadow-slate-300/50'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Wallet size={16} className={mode === 'bill' ? 'text-solar-600' : 'text-slate-400'} />
              <span>{t('calcTabBill')}</span>
            </button>
            <button
              onClick={() => setMode('capacity')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                mode === 'capacity'
                  ? 'bg-white text-slate-900 shadow-md shadow-slate-300/50'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Zap size={16} className={mode === 'capacity' ? 'text-solar-600' : 'text-slate-400'} />
              <span>{t('calcTabKw')}</span>
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Interactive Sliders & Inputs */}
          <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-display font-bold text-lg text-slate-900 flex items-center gap-2">
                <Calculator size={20} className="text-solar-500" /> System Specifications
              </h3>
              <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                DISCOM: {discom}
              </span>
            </div>

            {/* Input by Monthly Bill */}
            {mode === 'bill' ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                    Monthly Electricity Bill
                  </label>
                  <span className="text-2xl font-display font-extrabold text-solar-600">
                    {formatINR(monthlyBill)}
                  </span>
                </div>
                <input
                  type="range"
                  min="800"
                  max="40000"
                  step="200"
                  value={monthlyBill}
                  onChange={e => setMonthlyBill(Number(e.target.value))}
                  className="w-full accent-solar-500 cursor-pointer h-2 bg-slate-200 rounded-lg"
                />
                {/* Quick Presets */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {billPresets.map(preset => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setMonthlyBill(preset)}
                      className={`text-xs px-2.5 py-1 rounded-lg border font-semibold transition-all ${
                        monthlyBill === preset
                          ? 'bg-solar-500 text-white border-solar-500 shadow-xs'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {formatINR(preset)}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* Input by kW Capacity */
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                    Target Solar Capacity
                  </label>
                  <span className="text-2xl font-display font-extrabold text-solar-600">
                    {systemKw} kW
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={systemKw}
                  onChange={e => setSystemKw(Number(e.target.value))}
                  className="w-full accent-solar-500 cursor-pointer h-2 bg-slate-200 rounded-lg"
                />
                <div className="flex justify-between text-xs text-slate-400 font-semibold">
                  <span>1 kW (Small Home)</span>
                  <span>5 kW (Bungalow)</span>
                  <span>10 kW (Large Villa)</span>
                </div>
              </div>
            )}

            {/* Available Roof Area */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Available Shadow-Free Roof Area
                </label>
                <span className="text-lg font-display font-bold text-slate-800">
                  {roofArea} sq. ft.
                </span>
              </div>
              <input
                type="range"
                min="100"
                max="3000"
                step="50"
                value={roofArea}
                onChange={e => handleRoofAreaChange(Number(e.target.value))}
                className="w-full accent-solar-500 cursor-pointer h-2 bg-slate-200 rounded-lg"
              />
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Min: 100 sq.ft</span>
                <span className={areaInsufficient ? 'text-rose-600 font-bold' : 'text-emerald-600 font-semibold'}>
                  Required for {result.recommendedKw}kW: ~{result.areaNeeded} sq.ft
                </span>
                <span>Max: 3,000 sq.ft</span>
              </div>
            </div>

            {/* Roof Type Selection */}
            <div className="space-y-2 pt-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wide block">
                Roof Type / Structure
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {[
                  { v: 'RCC_FLAT', l: 'RCC Flat Roof', sub: 'Standard GI Frame' },
                  { v: 'METAL_SHED', l: 'Metal / Tin Shed', sub: 'Profile Sheet Clamp' },
                  { v: 'ELEVATED', l: 'Elevated Structure', sub: 'Walkable Gazebo' },
                ].map(r => (
                  <button
                    key={r.v}
                    type="button"
                    onClick={() => setRoofType(r.v)}
                    className={`p-3 rounded-2xl text-left border transition-all ${
                      roofType === r.v
                        ? 'bg-amber-500/10 border-solar-500 text-slate-900 ring-2 ring-solar-500/30'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <div className="text-xs font-bold text-slate-900">{r.l}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{r.sub}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* UP District Selector */}
            <div className="space-y-1.5 pt-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wide block">
                Your UP District (Automatic DISCOM Mapping)
              </label>
              <select
                value={district}
                onChange={e => setDistrict(e.target.value)}
                className="w-full px-3.5 py-3 rounded-xl border border-slate-300 text-sm font-semibold text-slate-800 bg-white focus:ring-2 focus:ring-solar-500/40 focus:border-solar-500 transition-all"
              >
                {UP_DISTRICTS.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Right Column: Financial Results Dashboard */}
          <div className="lg:col-span-6 space-y-5">
            {claimed ? (
              <div className="bg-white border border-emerald-300 rounded-3xl p-8 text-center shadow-lg space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 size={36} />
                </div>
                <h3 className="font-display font-extrabold text-2xl text-slate-900">
                  Detailed Proposal Reserved!
                </h3>
                <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                  Our Barabanki/Lucknow engineering team has received your calculation. We will contact you with the complete DISCOM net-metering feasibility checklist and vendor code quotation.
                </p>
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-700 max-w-sm mx-auto space-y-1">
                  <div><strong>System Size:</strong> {result.recommendedKw} kW Grid-Tied</div>
                  <div><strong>Location:</strong> {district} ({discom})</div>
                  <div><strong>Total Subsidy:</strong> {formatINR(result.totalSubsidy)}</div>
                </div>
                <button
                  onClick={() => onNavigate('contact')}
                  className="btn-primary"
                >
                  Contact Our Engineers Directly <ArrowRight size={16} />
                </button>
              </div>
            ) : (
              <>
                {/* Main Recommended kW Highlight Card */}
                <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                        <Sun size={26} />
                      </div>
                      <div>
                        <span className="text-xs text-slate-400 uppercase font-semibold">Recommended Sizing</span>
                        <h4 className="text-3xl font-display font-extrabold text-white">
                          {result.recommendedKw} kW System
                        </h4>
                      </div>
                    </div>
                    <span className="text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-full">
                      Grid-Tied Net Meter
                    </span>
                  </div>

                  {areaInsufficient && (
                    <div className="bg-rose-950/60 border border-rose-800/50 rounded-xl p-3 text-xs text-rose-300 flex items-start gap-2 mb-4">
                      <AlertTriangle size={16} className="text-rose-400 shrink-0 mt-0.5" />
                      <span>
                        Available area ({roofArea} sq.ft) is less than the required {result.areaNeeded} sq.ft. An elevated rooftop structure can solve this space shortage.
                      </span>
                    </div>
                  )}

                  {highBill && (
                    <div className="bg-blue-950/60 border border-blue-800/50 rounded-xl p-3 text-xs text-blue-300 flex items-center justify-between gap-2 mb-4">
                      <span className="flex items-center gap-1.5">
                        <Factory size={15} className="text-blue-400" />
                        Commercial bill scale detected. 40% Accelerated Depreciation available.
                      </span>
                      <button
                        onClick={() => onNavigate('commercial')}
                        className="text-amber-400 hover:underline font-bold whitespace-nowrap text-[11px]"
                      >
                        Explore B2B &gt;
                      </button>
                    </div>
                  )}

                  {/* 4 Quick Metric Badges */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3">
                      <span className="text-[10px] text-slate-400 uppercase font-bold">{t('calcAnnGen')}</span>
                      <div className="text-lg font-bold text-white font-display">
                        {result.annualGeneration.toLocaleString('en-IN')} kWh
                      </div>
                    </div>
                    <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3">
                      <span className="text-[10px] text-slate-400 uppercase font-bold">{t('calcNetSave')}</span>
                      <div className="text-lg font-bold text-emerald-400 font-display">
                        {formatINR(result.annualSavings)}
                      </div>
                    </div>
                    <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3">
                      <span className="text-[10px] text-slate-400 uppercase font-bold">{t('calcPayback')}</span>
                      <div className="text-lg font-bold text-amber-400 font-display">
                        {result.paybackYears} {t('metric3Val').includes('वर्ष') ? 'वर्ष' : 'Years'}
                      </div>
                    </div>
                    <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3">
                      <span className="text-[10px] text-slate-400 uppercase font-bold">25-Yr ROI</span>
                      <div className="text-lg font-bold text-teal-400 font-display">
                        {formatINR(lifetimeSavings)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Subsidy Matrix Card */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-3">
                  <h4 className="font-display font-bold text-sm text-slate-900 flex items-center justify-between">
                    <span>{t('calcTotalSub')}</span>
                    <span className="text-xs text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md">
                      DBT Direct to Bank
                    </span>
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50/70 border border-amber-200/60 text-xs">
                      <div className="flex items-center gap-2">
                        <Landmark size={16} className="text-amber-600" />
                        <div>
                          <p className="font-bold text-slate-900">{t('calcCentralSub')}</p>
                          <p className="text-[10px] text-slate-500">MNRE DBT Credit</p>
                        </div>
                      </div>
                      <span className="text-sm font-extrabold text-amber-700 font-display">
                        {formatINR(result.centralSubsidy)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-teal-50/70 border border-teal-200/60 text-xs">
                      <div className="flex items-center gap-2">
                        <Building2 size={16} className="text-teal-600" />
                        <div>
                          <p className="font-bold text-slate-900">{t('calcStateSub')}</p>
                          <p className="text-[10px] text-slate-500">UPNEDA Incentive</p>
                        </div>
                      </div>
                      <span className="text-sm font-extrabold text-teal-700 font-display">
                        {formatINR(result.stateSubsidy)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 text-white text-xs">
                      <span className="font-bold text-slate-200">{t('calcTotalSub')}</span>
                      <span className="text-base font-extrabold text-amber-400 font-display">
                        {formatINR(result.totalSubsidy)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Final Net Investment Card & CTA */}
                <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wide opacity-80">
                        {t('calcNetInv')}
                      </span>
                      <div className="text-3xl sm:text-4xl font-display font-black text-slate-950">
                        {formatINR(result.netInvestment)}
                      </div>
                    </div>
                    <div className="text-left sm:text-right">
                      <span className="text-xs font-semibold opacity-75">{t('calcGrossCost')}</span>
                      <div className="text-sm font-bold line-through opacity-70">
                        {formatINR(result.totalCost)}
                      </div>
                      <span className="text-xs font-extrabold bg-slate-950 text-amber-300 px-2.5 py-0.5 rounded-full inline-block mt-1">
                        SAVE {formatINR(result.totalSubsidy)}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowClaimModal(true)}
                    className="w-full flex items-center justify-center gap-2 bg-slate-950 hover:bg-slate-900 text-white font-extrabold py-3.5 rounded-2xl shadow-lg transition-all hover:scale-[1.01] active:scale-[0.99] text-sm cursor-pointer"
                  >
                    <Sparkles size={16} className="text-amber-400" />
                    {t('calcClaimBtn')}
                    <ArrowRight size={16} />
                  </button>
                  <p className="text-[11px] text-slate-900/80 text-center font-medium">
                    Backed by UPNEDA Empanelled Vendor #BBK2508133242 · Free Feasibility Report
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Claim Modal */}
      {showClaimModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative border border-slate-200 max-h-[90vh] overflow-y-auto">
            <h3 className="font-display font-extrabold text-xl text-slate-900 mb-1">
              Lock In Your {result.recommendedKw}kW Solar Subsidy
            </h3>
            <p className="text-xs text-slate-500 mb-5 leading-relaxed">
              We will prepare your official proposal with PM Surya Ghar subsidy approval checklist for {district}.
            </p>

            <form onSubmit={handleClaimSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Your Full Name</label>
                <input
                  type="text"
                  required
                  value={leadName}
                  onChange={e => setLeadName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 outline-none"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Mobile / WhatsApp Number</label>
                <input
                  type="tel"
                  required
                  value={leadPhone}
                  onChange={e => setLeadPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="10-digit mobile number"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 outline-none"
                />
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 space-y-1">
                <div className="flex justify-between">
                  <span>Capacity:</span>
                  <strong>{result.recommendedKw} kW</strong>
                </div>
                <div className="flex justify-between">
                  <span>Net Investment:</span>
                  <strong className="text-emerald-700">{formatINR(result.netInvestment)}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Government Subsidy:</span>
                  <strong className="text-amber-700">{formatINR(result.totalSubsidy)}</strong>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowClaimModal(false)}
                  className="w-1/2 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 rounded-xl bg-solar-500 hover:bg-solar-600 text-white text-sm font-bold shadow-md transition-all"
                >
                  Confirm &amp; Book
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
