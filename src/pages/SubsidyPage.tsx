import { useState } from 'react';
import {
  Shield, CheckCircle2, Info, Building2, Landmark, FileCheck, Clock,
  Wallet, Award, Zap, ArrowRight, FileText, Check, HelpCircle,
} from 'lucide-react';
import { COMPANY } from '@/data';
import { formatINR } from '@/utils';
import { useLanguage } from '@/i18n/LanguageContext';

export function SubsidyPage() {
  const { t, lang } = useLanguage();
  const [selectedKw, setSelectedKw] = useState(3);

  const subsidyTiers = [
    {
      kw: 1,
      central: 30000,
      state: 15000,
      total: 45000,
      cost: 75000,
      net: 30000,
      desc: lang === 'hi' ? '1-2 कमरों के मकान के लिए उपयुक्त (100-150 यूनिट/माह)' : 'Ideal for 1-2 room houses (100-150 units/mo)',
    },
    {
      kw: 2,
      central: 60000,
      state: 30000,
      total: 90000,
      cost: 140000,
      net: 50000,
      desc: lang === 'hi' ? 'छोटे परिवारों व 1 AC / फ्रिज के लिए उत्तम' : 'Ideal for small families with 1 AC / refrigerator',
    },
    {
      kw: 3,
      central: 78000,
      state: 30000,
      total: 108000,
      cost: 200000,
      net: 92000,
      desc: lang === 'hi' ? 'सबसे लोकप्रिय! अधिकतम सरकारी सब्सिडी स्लैब' : 'Most popular! Maximum government subsidy tier',
      popular: true,
    },
    {
      kw: 4,
      central: 78000,
      state: 30000,
      total: 108000,
      cost: 255000,
      net: 147000,
      desc: lang === 'hi' ? '3BHK विला व 2-3 AC वाले बड़े घरों के लिए' : 'Ideal for 3BHK villas with 2-3 ACs',
    },
    {
      kw: 5,
      central: 78000,
      state: 30000,
      total: 108000,
      cost: 310000,
      net: 202000,
      desc: lang === 'hi' ? 'समर्सिबल पंप, भारी लोड व EV चार्जिंग के लिए' : 'High-power homes, submersible pumps & EVs',
    },
    {
      kw: 10,
      central: 78000,
      state: 30000,
      total: 108000,
      cost: 580000,
      net: 472000,
      desc: lang === 'hi' ? 'बड़ी कोठियों, फार्महाउस व संस्थानों के लिए' : 'Large residential estates / institutional trusts',
    },
  ];

  const currentTier = subsidyTiers.find(t => t.kw === selectedKw) || subsidyTiers[2];

  const requiredDocuments = [
    {
      title: lang === 'hi' ? 'बिजली का बिल' : 'Electricity Bill',
      desc: lang === 'hi' ? 'नवीनतम 1-2 महीने का बिजली बिल जिस पर उपभोक्ता (CA) नंबर अंकित हो।' : 'Latest 1-2 months consumer bill with CA number / consumer number in your name.',
      badge: lang === 'hi' ? 'अनिवार्य' : 'Mandatory',
    },
    {
      title: lang === 'hi' ? 'आधार कार्ड' : 'Aadhaar Card',
      desc: lang === 'hi' ? 'पीएम सूर्य घर पोर्टल पर KYC सत्यापन के लिए उपभोक्ता का आधार कार्ड।' : 'Consumer Aadhaar card for PM Surya Ghar portal KYC verification.',
      badge: lang === 'hi' ? 'पहचान प्रमाण' : 'Identity Proof',
    },
    {
      title: lang === 'hi' ? 'बैंक पासबुक / चेक' : 'Bank Passbook / Cancelled Cheque',
      desc: lang === 'hi' ? 'सब्सिडी राशि सीधे खाते (DBT) में पाने के लिए आधार से लिंक बैंक खाता।' : 'Account linked with Aadhaar for Direct Benefit Transfer (DBT) credit.',
      badge: lang === 'hi' ? 'सीधी सब्सिडी' : 'Direct Subsidy Credit',
    },
    {
      title: lang === 'hi' ? 'छत की फोटो व जगह' : 'Rooftop Photo & Space',
      desc: lang === 'hi' ? 'छाया-मुक्त छत की तस्वीर व आवश्यकता पड़ने पर हाउस टैक्स/रजिस्ट्री प्रति।' : 'Shadow-free area photograph and recent house tax / registry copy if required.',
      badge: lang === 'hi' ? 'तकनीकी सत्यापन' : 'Technical Verification',
    },
  ];

  const claimSteps = [
    {
      step: '01',
      title: lang === 'hi' ? 'पोर्टल रजिस्ट्रेशन व आवेदन' : 'Portal Registration & Application',
      desc: lang === 'hi' ? 'ABC Solar आपकी छत का विवरण pmsuryaghar.gov.in पोर्टल पर अपलोड करता है।' : 'ABC Solar registers your rooftop application on pmsuryaghar.gov.in with consumer details and technical feasibility.',
    },
    {
      step: '02',
      title: lang === 'hi' ? 'डिस्कॉम तकनीकी स्वीकृति' : 'DISCOM Feasibility Approval',
      desc: lang === 'hi' ? 'लोकल डिस्कॉम (MVVNL / PVVNL / DVVNL आदि) द्वारा लोड व ट्रांसफार्मर क्षमता की जांच। हम सभी दस्तावेज संभालते हैं।' : 'Your local DISCOM (MVVNL / PVVNL / DVVNL) verifies sanctioned load & transformer capacity. We handle all paperwork.',
    },
    {
      step: '03',
      title: lang === 'hi' ? 'इंस्टॉलेशन व नेट-मीटर सिंक' : 'Installation & Bi-Directional Meter',
      desc: lang === 'hi' ? 'हमारी टीम ALMM प्रमाणित सोलर पैनल लगाती है और बिजली विभाग से बाई-डायरेक्शनल नेट मीटर टेस्ट कराती है।' : 'Our team installs ALMM-approved panels and coordinates the dual-meter sync test with DISCOM officials.',
    },
    {
      step: '04',
      title: lang === 'hi' ? 'सीधे बैंक खाते में सब्सिडी' : 'Direct Bank Subsidy Credit',
      desc: lang === 'hi' ? 'कमीशनिंग रिपोर्ट पोर्टल पर दर्ज होते ही केंद्र (₹78k) व राज्य (₹30k) सब्सिडी सीधे आपके बैंक खाते में आती है।' : 'Post-commissioning report is uploaded on the national portal. Central (₹78k) and State (₹30k) subsidy credits to your bank account.',
    },
  ];

  return (
    <div className="animate-fade-in bg-slate-50 min-h-screen">
      {/* Header */}
      <section className="bg-slate-950 text-white py-14 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#F59E0B_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center relative">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-4 py-1.5 text-xs font-bold text-emerald-400 mb-4 tracking-wide uppercase">
            <Shield size={14} /> {t('subBadge')}
          </div>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight mb-3">
            {t('subTitle')}
          </h1>
          <p className="text-slate-300 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
            {t('subSubtitle')}
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-12">
        {/* Interactive Subsidy Sizing Simulator */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 pb-4 border-b border-slate-100 gap-4">
            <div>
              <span className="text-xs font-bold text-solar-600 uppercase tracking-wider">{t('subMatrixTag')}</span>
              <h3 className="font-display font-extrabold text-2xl text-slate-900 mt-1">
                {t('subMatrixTitle')}
              </h3>
            </div>
            {/* Capacity Pills */}
            <div className="flex flex-wrap gap-2">
              {subsidyTiers.map(tier => (
                <button
                  key={tier.kw}
                  type="button"
                  onClick={() => setSelectedKw(tier.kw)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    selectedKw === tier.kw
                      ? 'bg-solar-500 text-white shadow-md shadow-solar-500/25 scale-105'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {tier.kw} kW {tier.popular && '★'}
                </button>
              ))}
            </div>
          </div>

          {/* Current Selection Spotlight Card */}
          <div className="grid lg:grid-cols-12 gap-8 items-center bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-3xl p-6 sm:p-8 relative overflow-hidden">
            <div className="lg:col-span-6 space-y-4">
              <div className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-full text-xs font-bold">
                {t('subBreakdownTag', { kw: String(currentTier.kw) })}
              </div>
              <h4 className="font-display font-extrabold text-3xl text-white">
                {t('subTotalGovtSub')} <span className="text-amber-400">{formatINR(currentTier.total)}</span>
              </h4>
              <p className="text-slate-300 text-sm leading-relaxed">
                {currentTier.desc}. {t('subCombinedNote')}
              </p>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-3">
                  <div className="text-xs text-slate-400 font-semibold">{t('subCentralDbt')}</div>
                  <div className="text-xl font-bold text-amber-400 mt-1">{formatINR(currentTier.central)}</div>
                  <div className="text-[10px] text-slate-500">{t('subCentralDbtSub')}</div>
                </div>
                <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-3">
                  <div className="text-xs text-slate-400 font-semibold">{t('subStateDbt')}</div>
                  <div className="text-xl font-bold text-teal-400 mt-1">{formatINR(currentTier.state)}</div>
                  <div className="text-[10px] text-slate-500">{t('subStateDbtSub')}</div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 bg-slate-850/80 border border-slate-700/80 rounded-2xl p-6 space-y-4">
              <div className="flex justify-between items-center text-sm border-b border-slate-700 pb-3">
                <span className="text-slate-400">{t('subGrossCost')}</span>
                <span className="font-bold text-slate-300 line-through">{formatINR(currentTier.cost)}</span>
              </div>
              <div className="flex justify-between items-center text-sm border-b border-slate-700 pb-3">
                <span className="text-amber-400 font-semibold">{t('subLessTotal')}</span>
                <span className="font-extrabold text-amber-400">-{formatINR(currentTier.total)}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                <div>
                  <span className="text-xs text-slate-400 uppercase font-bold">{t('subNetInv')}</span>
                  <div className="text-2xl sm:text-3xl font-display font-black text-emerald-400 mt-0.5">
                    {formatINR(currentTier.net)}
                  </div>
                </div>
                <a
                  href={`https://wa.me/${COMPANY.whatsapp}?text=${encodeURIComponent(lang === 'hi' ? `नमस्ते ABC Solar, मैं ₹${currentTier.total} सब्सिडी के साथ ${currentTier.kw}kW का सोलर सिस्टम बुक करना चाहता हूँ।` : `Hi ABC Solar, I want to book the ${currentTier.kw}kW solar system with ₹${currentTier.total} subsidy.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto text-center px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs shadow-lg transition-all"
                >
                  {t('subBookSystem')}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Official Vendor Registration Card */}
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-teal-500/10 border border-amber-300/80 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 shadow-lg">
            <Award size={36} />
          </div>
          <div className="space-y-1 text-center sm:text-left flex-1">
            <div className="text-xs font-bold text-amber-700 uppercase tracking-wider">
              {t('subEmpanelledTag')}
            </div>
            <h4 className="font-display font-bold text-xl text-slate-900">
              {t('subEmpanelledTitle', { code: COMPANY.vendorCode })}
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
              {t('subEmpanelledDesc')}
            </p>
          </div>
        </div>

        {/* 4 Required Documents Cards */}
        <div>
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h3 className="font-display font-extrabold text-2xl text-slate-900">
              {t('subDocsTitle')}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {t('subDocsSubtitle')}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {requiredDocuments.map((doc, idx) => (
              <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs hover:border-solar-400 hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-solar-50 text-solar-600 flex items-center justify-center">
                    <FileText size={20} />
                  </div>
                  <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                    {doc.badge}
                  </span>
                </div>
                <h4 className="font-display font-bold text-sm text-slate-900 mb-1.5">{doc.title}</h4>
                <p className="text-xs text-slate-500 leading-relaxed">{doc.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 4-Step Claim Process */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h3 className="font-display font-extrabold text-2xl text-slate-900">
              {t('subProcessTitle')}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {t('subProcessSubtitle')}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {claimSteps.map((step, idx) => (
              <div key={idx} className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 relative">
                <div className="text-amber-500 font-extrabold font-display text-2xl mb-2">{step.step}</div>
                <h5 className="font-display font-bold text-sm text-slate-900 mb-1">{step.title}</h5>
                <p className="text-xs text-slate-600 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
