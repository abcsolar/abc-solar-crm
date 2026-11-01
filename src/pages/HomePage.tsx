import { useState } from 'react';
import {
  Sun, Zap, Shield, Wrench, CheckCircle2, Phone, Calculator,
  ArrowRight, MapPin, Star, TrendingDown, Leaf, Award, Users,
  Sparkles, Check, ChevronRight, BarChart3, Clock, HelpCircle,
} from 'lucide-react';
import { UP_DISTRICTS, COMPANY } from '@/data';
import { validateIndianPhone, formatINR, calculateSolar } from '@/utils';
import { ingestWebsiteCallbackLead } from '@/services/leadIngestion';
import { useLanguage } from '@/i18n/LanguageContext';
import confetti from 'canvas-confetti';

export function HomePage({ onNavigate }: { onNavigate: (page: string) => void }) {
  return (
    <div className="animate-fade-in">
      <HeroSection onNavigate={onNavigate} />
      <TrustBentoGrid onNavigate={onNavigate} />
      <ProcessTimeline />
      <VerifiedProjectsSection onNavigate={onNavigate} />
      <StatsSection />
      <CtaSection onNavigate={onNavigate} />
    </div>
  );
}

function HeroSection({ onNavigate }: { onNavigate: (page: string) => void }) {
  const { t } = useLanguage();
  const [form, setForm] = useState({ name: '', phone: '', district: 'Barabanki', monthlyBill: '4500' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [districtSearch, setDistrictSearch] = useState('');
  const [showDistricts, setShowDistricts] = useState(false);

  const quickDistricts = ['Barabanki', 'Lucknow', 'Ayodhya', 'Sitapur', 'Lakhimpur Kheri', 'Varanasi'];

  const filteredDistricts = UP_DISTRICTS.filter(d =>
    d.toLowerCase().includes(districtSearch.toLowerCase())
  );

  // Live calculation preview based on current input
  const billNum = Number(form.monthlyBill) || 0;
  const liveCalc = billNum >= 500 ? calculateSolar(billNum, 1000, 'RCC_FLAT') : null;

  function handleSubmit() {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Please enter your name';
    if (!validateIndianPhone(form.phone)) errs.phone = 'Enter a valid 10-digit mobile number';
    if (!form.district) errs.district = 'Select your district';
    if (!form.monthlyBill || Number(form.monthlyBill) < 100) errs.monthlyBill = 'Enter monthly bill (₹100+)';
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    ingestWebsiteCallbackLead({
      name: form.name.trim(),
      phone: form.phone,
      district: form.district,
      monthlyBill: Number(form.monthlyBill),
    });
    setSubmitted(true);
    confetti({ particleCount: 90, spread: 70, origin: { y: 0.65 }, colors: ['#F59E0B', '#0F766E', '#10B981'] });
  }

  return (
    <section className="relative overflow-hidden bg-slate-950 text-white">
      {/* Dynamic ambient background with decorative mesh grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#F59E0B_1px,transparent_1px)] [background-size:28px_28px] opacity-15 pointer-events-none" />
      <div className="absolute top-1/4 -left-48 w-96 h-96 bg-amber-500/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-0 w-[30rem] h-[30rem] bg-forest-500/20 rounded-full blur-[140px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 lg:py-24 grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
        {/* Left Column: Value Proposition */}
        <div className="w-full max-w-2xl space-y-6">
          {/* Trust Badge Pill */}
          <div className="inline-flex items-center gap-2.5 bg-gradient-to-r from-amber-500/10 via-amber-500/20 to-teal-500/10 border border-amber-500/30 rounded-full px-3.5 sm:px-4 py-1.5 shadow-sm backdrop-blur-md">
            <span className="flex h-2 w-2 relative shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
            </span>
            <span className="text-[11px] sm:text-xs font-semibold text-amber-300 tracking-wide uppercase">
              {t('heroBadge')}
            </span>
          </div>

          {/* Headline */}
          <h1 className="font-display font-extrabold text-3xl sm:text-5xl lg:text-6xl tracking-tight leading-[1.15] sm:leading-[1.12]">
            {t('heroTitlePrefix')}
            <span className="bg-gradient-to-r from-amber-400 via-amber-300 to-emerald-300 bg-clip-text text-transparent">
              {t('heroTitleHighlight')}
            </span>
            {t('heroTitleSuffix')}
          </h1>

          <p className="text-slate-300 text-sm sm:text-base lg:text-lg leading-relaxed w-full">
            {t('heroDescription')}
          </p>

          {/* Action CTAs */}
          <div className="w-full flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 pt-2">
            <button
              onClick={() => onNavigate('calculator')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <Calculator size={18} /> {t('btnCalcRoi')}
            </button>
            <a
              href={`tel:+91${COMPANY.phone}`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-xl border border-slate-700/60 bg-slate-900/60 hover:bg-slate-800 text-white font-semibold text-sm transition-all hover:border-amber-500/50 backdrop-blur-sm"
            >
              <Phone size={18} className="text-amber-400" /> +91 {COMPANY.phone}
            </a>
          </div>

          {/* Social Proof Badges */}
          <div className="w-full grid grid-cols-3 gap-2 sm:gap-4 pt-4 border-t border-slate-800/80">
            <div className="w-full h-auto bg-slate-900/60 border border-slate-800 rounded-2xl p-2.5 sm:p-4 text-center">
              <div className="text-amber-400 font-extrabold text-base sm:text-xl lg:text-2xl font-display">{t('metric1Val')}</div>
              <div className="text-[10px] sm:text-xs text-slate-400 mt-0.5 leading-tight">{t('metric1Label')}</div>
            </div>
            <div className="w-full h-auto bg-slate-900/60 border border-slate-800 rounded-2xl p-2.5 sm:p-4 text-center">
              <div className="text-emerald-400 font-extrabold text-base sm:text-xl lg:text-2xl font-display">{t('metric2Val')}</div>
              <div className="text-[10px] sm:text-xs text-slate-400 mt-0.5 leading-tight">{t('metric2Label')}</div>
            </div>
            <div className="w-full h-auto bg-slate-900/60 border border-slate-800 rounded-2xl p-2.5 sm:p-4 text-center">
              <div className="text-teal-400 font-extrabold text-base sm:text-xl lg:text-2xl font-display">{t('metric3Val')}</div>
              <div className="text-[10px] sm:text-xs text-slate-400 mt-0.5 leading-tight">{t('metric3Label')}</div>
            </div>
          </div>
        </div>

        {/* Right Column: High-Converting Quick Form with Live Subsidy Preview */}
        <div className="w-full flex justify-center lg:justify-end">
          <div className="w-full max-w-[480px] bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden h-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400">
                  <Zap size={18} />
                </div>
                <div>
                  <h3 className="font-display font-bold text-white text-base">{t('formTitle')}</h3>
                  <p className="text-xs text-slate-400">{t('formSubtitle')}</p>
                </div>
              </div>
              <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-2.5 py-1 rounded-full flex items-center gap-1">
                <Sparkles size={11} /> {t('formCallback')}
              </span>
            </div>

            {submitted ? (
              <div className="py-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
                  <CheckCircle2 size={36} />
                </div>
                <h4 className="font-display font-bold text-xl text-white">
                  {t('formSuccessTitle', { name: form.name })}
                </h4>
                <p className="text-sm text-slate-300 leading-relaxed max-w-sm mx-auto">
                  {t('formSuccessDesc', { phone: form.phone })}
                </p>
                <button
                  onClick={() => onNavigate('calculator')}
                  className="btn-primary w-full mt-4"
                >
                  {t('formExploreCalc')} <ArrowRight size={16} />
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">{t('formNameLabel')}</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    placeholder={t('formNamePlaceholder')}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-3 text-base sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
                  />
                  {errors.name && <p className="text-xs text-rose-400 mt-1">{errors.name}</p>}
                </div>

                {/* Mobile Phone */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">{t('formPhoneLabel')}</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                    placeholder={t('formPhonePlaceholder')}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-3 text-base sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
                  />
                  {errors.phone && <p className="text-xs text-rose-400 mt-1">{errors.phone}</p>}
                </div>

                {/* District with quick pills */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">{t('formDistrictLabel')}</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={form.district}
                      onChange={e => {
                        setForm({ ...form, district: e.target.value });
                        setDistrictSearch(e.target.value);
                        setShowDistricts(true);
                      }}
                      onFocus={() => setShowDistricts(true)}
                      onBlur={() => setTimeout(() => setShowDistricts(false), 200)}
                      placeholder="Type district or choose below"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-3 text-base sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
                    />
                    {showDistricts && filteredDistricts.length > 0 && (
                      <div className="absolute z-30 mt-1 w-full max-h-48 overflow-y-auto bg-slate-900 border border-slate-700 rounded-xl shadow-2xl">
                        {filteredDistricts.slice(0, 10).map(d => (
                          <button
                            key={d}
                            type="button"
                            onClick={() => { setForm({ ...form, district: d }); setShowDistricts(false); }}
                            className="block w-full text-left px-3.5 py-2 text-sm text-slate-200 hover:bg-amber-500/20 hover:text-amber-300 transition-colors"
                          >
                            {d}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {/* Quick District Pills */}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {quickDistricts.map(qd => (
                      <button
                        key={qd}
                        type="button"
                        onClick={() => setForm({ ...form, district: qd })}
                        className={`text-[11px] px-2 py-0.5 rounded-lg border transition-all ${
                          form.district === qd
                            ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-semibold'
                            : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white'
                        }`}
                      >
                        {qd}
                      </button>
                    ))}
                  </div>
                  {errors.district && <p className="text-xs text-rose-400 mt-1">{errors.district}</p>}
                </div>

                {/* Monthly Bill with Quick Slider */}
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-1">
                    <span>{t('formBillLabel')}</span>
                    <span className="text-amber-400 font-bold font-display text-sm">₹{Number(form.monthlyBill || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <input
                    type="range"
                    min="1000"
                    max="25000"
                    step="500"
                    value={form.monthlyBill}
                    onChange={e => setForm({ ...form, monthlyBill: e.target.value })}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  {errors.monthlyBill && <p className="text-xs text-rose-400 mt-1">{errors.monthlyBill}</p>}
                </div>

                {/* Live Subsidy & Savings Micro-Widget */}
                {liveCalc && (
                  <div className="bg-gradient-to-br from-emerald-950/40 via-slate-950 to-amber-950/30 border border-emerald-800/40 rounded-xl p-3 flex items-center justify-between gap-3 animate-fade-in">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">{t('formRecCapacity')}</span>
                      <div className="text-sm font-bold text-white flex items-center gap-1">
                        <Sun size={14} className="text-amber-400" /> {liveCalc.recommendedKw} kW System
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-emerald-400 uppercase font-semibold">{t('formGovtSubsidy')}</span>
                      <div className="text-sm font-bold text-emerald-400">
                        {formatINR(liveCalc.totalSubsidy)}
                      </div>
                    </div>
                  </div>
                )}

                {/* Submit button */}
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-extrabold text-sm shadow-lg shadow-amber-500/25 transition-all hover:scale-[1.01] active:scale-[0.98] cursor-pointer"
                >
                  <Sparkles size={16} /> {t('formSubmitBtn')} <ArrowRight size={16} />
                </button>

                <p className="text-[11px] text-slate-500 text-center flex items-center justify-center gap-1.5">
                  <Shield size={12} className="text-emerald-500" /> {t('formPrivacy')}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function TrustBentoGrid({ onNavigate }: { onNavigate: (page: string) => void }) {
  const { t } = useLanguage();
  return (
    <section className="py-14 sm:py-20 bg-slate-900 text-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 rounded-full px-3.5 py-1 text-xs font-bold text-amber-400 uppercase tracking-wider mb-3">
            {t('bentoTag')}
          </div>
          <h2 className="font-display font-extrabold text-2xl sm:text-4xl text-white tracking-tight">
            {t('bentoTitle')}
          </h2>
          <p className="text-slate-400 text-xs sm:text-base mt-2 sm:mt-3">
            {t('bentoDesc')}
          </p>
        </div>

        {/* 21st.dev Style Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {/* Bento Card 1: Hero Large Feature */}
          <div className="md:col-span-2 bg-gradient-to-br from-slate-800/80 to-slate-900/90 border border-slate-700/80 rounded-2xl sm:rounded-3xl p-5 sm:p-8 relative overflow-hidden group hover:border-amber-500/50 transition-all duration-300">
            <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-amber-500/20 transition-all" />
            <div className="flex items-start justify-between mb-5 sm:mb-6 gap-2">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                <Award size={26} />
              </div>
              <span className="text-[11px] sm:text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-full text-right">
                Vendor Code: BBK2508133242
              </span>
            </div>
            <h3 className="font-display font-bold text-xl sm:text-2xl text-white mb-2">
              {t('bentoCard1Title')}
            </h3>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-6 max-w-xl">
              {t('bentoCard1Desc')}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3">
                <div className="text-emerald-400 font-bold text-sm">{t('bentoGuaranteed')}</div>
                <div className="text-[10px] sm:text-[11px] text-slate-400">{t('bentoGuaranteedSub')}</div>
              </div>
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3">
                <div className="text-amber-400 font-bold text-sm">{t('bentoGuaranteeVal')}</div>
                <div className="text-[10px] sm:text-[11px] text-slate-400">{t('bentoGuaranteeSub')}</div>
              </div>
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 col-span-2 sm:col-span-1">
                <div className="text-teal-400 font-bold text-sm">{t('bentoDiscomVal')}</div>
                <div className="text-[10px] sm:text-[11px] text-slate-400">{t('bentoDiscomSub')}</div>
              </div>
            </div>
          </div>

          {/* Bento Card 2: Authorized Loom Solar Dealer */}
          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/90 border border-slate-700/80 rounded-2xl sm:rounded-3xl p-5 sm:p-8 relative overflow-hidden group hover:border-emerald-500/50 transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mb-5 sm:mb-6">
                <Shield size={24} />
              </div>
              <span className="text-[10px] sm:text-[11px] font-bold text-emerald-400 uppercase tracking-wide">{t('bentoCard2Tag')}</span>
              <h3 className="font-display font-bold text-lg sm:text-xl text-white mt-1 mb-2">
                {t('bentoCard2Title')}
              </h3>
              <p className="text-slate-300 text-xs leading-relaxed mb-4">
                {t('bentoCard2Desc')}
              </p>
            </div>
            <div className="bg-emerald-950/40 border border-emerald-800/50 rounded-xl p-3 text-xs text-emerald-300 flex items-center gap-2">
              <Check size={16} className="text-emerald-400 shrink-0" />
              {t('bentoBisCheck')}
            </div>
          </div>

          {/* Bento Card 3: DISCOM Net-Metering */}
          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/90 border border-slate-700/80 rounded-2xl sm:rounded-3xl p-5 sm:p-8 relative overflow-hidden group hover:border-teal-500/50 transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400 mb-5 sm:mb-6">
                <Zap size={24} />
              </div>
              <h3 className="font-display font-bold text-lg sm:text-xl text-white mb-2">
                {t('bentoCard3Title')}
              </h3>
              <p className="text-slate-300 text-xs leading-relaxed mb-4">
                {t('bentoCard3Desc')}
              </p>
              <div className="flex flex-wrap gap-1.5 mb-4">
                {['MVVNL', 'PVVNL', 'DVVNL', 'PuVVNL', 'KESCo'].map(d => (
                  <span key={d} className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-semibold text-slate-300">
                    {d}
                  </span>
                ))}
              </div>
            </div>
            <p className="text-xs text-slate-400">Zero trips to the electricity board for you.</p>
          </div>

          {/* Bento Card 4: Complete Warranty & Free AMC */}
          <div className="md:col-span-2 bg-gradient-to-br from-slate-800/80 to-slate-900/90 border border-slate-700/80 rounded-2xl sm:rounded-3xl p-5 sm:p-8 relative overflow-hidden group hover:border-amber-500/50 transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <Wrench size={24} />
              </div>
              <button
                onClick={() => onNavigate('subsidy')}
                className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold"
              >
                Learn Subsidy Process <ChevronRight size={14} />
              </button>
            </div>
            <h3 className="font-display font-bold text-xl sm:text-2xl text-white mb-2">
              {t('bentoCard4Title')}
            </h3>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-4 max-w-2xl">
              {t('bentoCard4Desc')}
            </p>
            <div className="flex flex-wrap gap-3 sm:gap-4 text-xs text-slate-300">
              <span className="flex items-center gap-1.5"><Check size={14} className="text-amber-400 shrink-0" /> Tier-1 Inverter Replacement Support</span>
              <span className="flex items-center gap-1.5"><Check size={14} className="text-amber-400 shrink-0" /> Mobile App Generation Tracking</span>
              <span className="flex items-center gap-1.5"><Check size={14} className="text-amber-400 shrink-0" /> Elevated &amp; Custom Hot-Dip GI Structure</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ProcessTimeline() {
  const { t } = useLanguage();
  const steps = [
    {
      num: '01',
      title: t('step1Title'),
      desc: t('step1Desc'),
      highlight: t('step1Badge'),
      icon: MapPin,
    },
    {
      num: '02',
      title: t('step2Title'),
      desc: t('step2Desc'),
      highlight: t('step2Badge'),
      icon: Sun,
    },
    {
      num: '03',
      title: t('step3Title'),
      desc: t('step3Desc'),
      highlight: t('step3Badge'),
      icon: Zap,
    },
    {
      num: '04',
      title: t('step4Title'),
      desc: t('step4Desc'),
      highlight: t('step4Badge'),
      icon: CheckCircle2,
    },
  ];

  return (
    <section className="bg-slate-950 py-14 sm:py-20 text-white border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-16">
          <span className="text-xs font-bold text-amber-400 uppercase tracking-widest bg-amber-500/10 px-3.5 py-1 rounded-full border border-amber-500/20">
            {t('timelineTag')}
          </span>
          <h2 className="font-display font-extrabold text-2xl sm:text-4xl text-white mt-3 mb-2">
            {t('timelineTitle')}
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm">
            {t('timelineDesc')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 relative">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={i} className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 sm:p-6 relative group hover:border-amber-500/40 hover:-translate-y-1 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <Icon size={22} />
                  </div>
                  <span className="font-display font-extrabold text-2xl text-slate-700 group-hover:text-amber-500/60 transition-colors">
                    {step.num}
                  </span>
                </div>
                <h3 className="font-display font-bold text-base sm:text-lg text-white mb-1.5">{step.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">{step.desc}</p>
                <div className="text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2.5 py-1 rounded-md inline-block">
                  {step.highlight}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function VerifiedProjectsSection({ onNavigate }: { onNavigate: (page: string) => void }) {
  const { t } = useLanguage();
  const projects = [
    {
      title: 'Residential 5kW Mono PERC',
      location: 'Barabanki (City Center)',
      discom: 'MVVNL',
      billBefore: '₹7,200',
      billAfter: '₹280',
      subsidy: '₹78,000',
      tag: 'Residential Yojna',
    },
    {
      title: 'Commercial 15kW Industrial',
      location: 'Deva Road, Barabanki',
      discom: 'MVVNL',
      billBefore: '₹26,000',
      billAfter: '₹3,400',
      subsidy: 'Accelerated Depr.',
      tag: 'Commercial C&I',
    },
    {
      title: 'Rooftop 3kW PM Surya Ghar',
      location: 'Gomti Nagar, Lucknow',
      discom: 'MVVNL',
      billBefore: '₹4,500',
      billAfter: '₹190',
      subsidy: '₹78,000',
      tag: 'Residential',
    },
  ];

  return (
    <section className="py-14 sm:py-20 bg-slate-900 text-white border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-12 gap-4">
          <div>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              {t('verifiedTag')}
            </span>
            <h2 className="font-display font-extrabold text-2xl sm:text-4xl text-white mt-2">
              {t('verifiedTitle')}
            </h2>
          </div>
          <button
            onClick={() => onNavigate('calculator')}
            className="text-amber-400 hover:text-amber-300 font-semibold text-sm flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            {t('verifiedCta')} <ChevronRight size={16} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {projects.map((p, i) => (
            <div key={i} className="bg-slate-950 border border-slate-800 rounded-2xl sm:rounded-3xl p-5 sm:p-6 relative overflow-hidden group hover:border-amber-500/40 transition-all">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-bold text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full">
                  {p.tag}
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <MapPin size={12} className="text-amber-400" /> {p.location}
                </span>
              </div>
              <h3 className="font-display font-bold text-base sm:text-lg text-white mb-4">{p.title}</h3>

              {/* Before vs After Bill Box */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 mb-4 grid grid-cols-2 gap-3 text-center">
                <div className="border-r border-slate-800 pr-2">
                  <span className="text-[10px] text-rose-400 uppercase font-semibold">{t('billBefore')}</span>
                  <div className="text-base sm:text-lg font-bold text-slate-300 line-through decoration-rose-500/80">
                    {p.billBefore}
                  </div>
                </div>
                <div className="pl-2">
                  <span className="text-[10px] text-emerald-400 uppercase font-semibold">{t('billAfter')}</span>
                  <div className="text-base sm:text-lg font-bold text-emerald-400 font-display">
                    {p.billAfter}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-900">
                <span>Govt Subsidy: <strong className="text-white">{p.subsidy}</strong></span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <Check size={13} /> {t('activeSync')}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function StatsSection() {
  const { t } = useLanguage();
  const stats = [
    { value: '500+', label: t('stat1Label'), sub: t('stat1Sub'), icon: Zap },
    { value: '200+', label: t('stat2Label'), sub: t('stat2Sub'), icon: Users },
    { value: '₹1.8 Cr+', label: t('stat3Label'), sub: t('stat3Sub'), icon: TrendingDown },
    { value: '75', label: t('stat4Label'), sub: t('stat4Sub'), icon: MapPin },
  ];
  return (
    <section className="bg-slate-950 py-12 sm:py-16 text-white border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {stats.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 sm:p-6 text-center hover:border-slate-700 transition-all">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-2.5 sm:mb-3 text-amber-400">
                  <Icon size={20} className="sm:hidden" />
                  <Icon size={22} className="hidden sm:block" />
                </div>
                <div className="text-2xl sm:text-3xl lg:text-4xl font-display font-extrabold text-white tracking-tight">{s.value}</div>
                <div className="text-xs sm:text-sm font-semibold text-slate-200 mt-1">{s.label}</div>
                <div className="text-[10px] sm:text-xs text-slate-500 mt-0.5">{s.sub}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function CtaSection({ onNavigate }: { onNavigate: (page: string) => void }) {
  const { t } = useLanguage();
  return (
    <section className="bg-slate-950 py-14 sm:py-20 border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r from-forest-900 via-slate-900 to-amber-950/60 p-6 sm:p-10 lg:p-14 border border-amber-500/30 text-center shadow-2xl">
          <div className="absolute -top-24 -right-24 w-80 h-80 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="relative max-w-2xl mx-auto space-y-3 sm:space-y-4">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest bg-amber-500/20 px-3.5 py-1 rounded-full border border-amber-500/30">
              {t('ctaTag')}
            </span>
            <h2 className="font-display font-extrabold text-2xl sm:text-4xl text-white">
              {t('ctaTitle')}
            </h2>
            <p className="text-slate-300 text-xs sm:text-base leading-relaxed">
              {t('ctaDesc')}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center pt-3 sm:pt-4">
              <button
                onClick={() => onNavigate('calculator')}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/30 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <Calculator size={18} className="inline mr-2" />
                {t('ctaCalcBtn')}
              </button>
              <a
                href={`https://wa.me/${COMPANY.whatsapp}?text=${encodeURIComponent(t('waDefaultMsg'))}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-all shadow-lg shadow-emerald-900/30"
              >
                {t('ctaWaBtn')}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
