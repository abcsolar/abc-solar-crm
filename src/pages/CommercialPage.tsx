import { useState } from 'react';
import {
  Building2, Factory, TrendingDown, Wallet, Zap, Sun, CheckCircle2,
  ArrowRight, BarChart3, Shield, Award, Sparkles, Phone, Check,
} from 'lucide-react';
import { COMPANY } from '@/data';
import { formatINR } from '@/utils';
import { useLanguage } from '@/i18n/LanguageContext';
import { SEOHead } from '@/components/SEOHead';

export function CommercialPage({ onNavigate }: { onNavigate: (page: string) => void }) {
  const { t, lang } = useLanguage();
  const [selectedModel, setSelectedModel] = useState<'capex' | 'opex'>('capex');

  const industryVerticals = [
    {
      title: lang === 'hi' ? 'आटा व राइस मिल्स' : 'Flour & Rice Mills',
      savings: lang === 'hi' ? '₹8 - 18 लाख / वर्ष' : '₹8 - 18 Lakhs / Year',
      payback: lang === 'hi' ? '2.8 - 3.2 वर्ष' : '2.8 - 3.2 Years',
      icon: Factory,
      desc: lang === 'hi'
        ? 'बाराबंकी, सीतापुर व लखीमपुर बेल्ट में मिलिंग के समय दिन के भारी मोटर लोड को सोलर से चलाएं।'
        : 'Offset high daytime motor loads during heavy milling operations in Barabanki, Sitapur & Lakhimpur belts.',
    },
    {
      title: lang === 'hi' ? 'कोल्ड स्टोरेज व वेयरहाउस' : 'Cold Storage & Warehouses',
      savings: lang === 'hi' ? '₹14 - 30 लाख / वर्ष' : '₹14 - 30 Lakhs / Year',
      payback: lang === 'hi' ? '3.0 - 3.5 वर्ष' : '3.0 - 3.5 Years',
      icon: Building2,
      desc: lang === 'hi'
        ? 'कंप्रेसर व चिलिंग की सर्वाधिक बिजली आवश्यकता तेज धूप के समय होती है, जिससे बिजली बिल में भारी कटौती होती है।'
        : 'Peak compressor chilling demands directly coincide with maximum solar radiance hours, minimizing grid tariff.',
    },
    {
      title: lang === 'hi' ? 'अस्पताल व ट्रॉमा सेंटर' : 'Hospitals & Healthcare',
      savings: lang === 'hi' ? '₹6 - 15 लाख / वर्ष' : '₹6 - 15 Lakhs / Year',
      payback: lang === 'hi' ? '3.2 - 3.8 वर्ष' : '3.2 - 3.8 Years',
      icon: Shield,
      desc: lang === 'hi'
        ? '24/7 अनवरत बिजली बैकअप और डीजल जनरेटर (DG) के महंगे खर्चे से पूर्ण मुक्ति।'
        : 'Clean 24/7 power backup integration, dramatic reduction in diesel generator (DG) operational expenses.',
    },
    {
      title: lang === 'hi' ? 'स्कूल व कॉलेज' : 'Schools & Universities',
      savings: lang === 'hi' ? '₹4 - 10 लाख / वर्ष' : '₹4 - 10 Lakhs / Year',
      payback: lang === 'hi' ? '3.4 - 4.0 वर्ष' : '3.4 - 4.0 Years',
      icon: Award,
      desc: lang === 'hi'
        ? 'बड़ी खाली छतों को स्वच्छ सौर ऊर्जा में बदलकर संस्थान का बिजली खर्च शून्य करें।'
        : 'Large unshaded institutional roofs transformed into revenue-saving green power generation stations.',
    },
  ];

  const tableRows = [
    { kw: '10 kW', area: lang === 'hi' ? '1,000 वर्ग फीट' : '1,000 sq.ft', gen: '16,400 kWh', save: '₹1,25,000', payback: lang === 'hi' ? '3.2 वर्ष' : '3.2 Years' },
    { kw: '25 kW', area: lang === 'hi' ? '2,500 वर्ग फीट' : '2,500 sq.ft', gen: '41,000 kWh', save: '₹3,15,000', payback: lang === 'hi' ? '3.1 वर्ष' : '3.1 Years' },
    { kw: '50 kW', area: lang === 'hi' ? '5,000 वर्ग फीट' : '5,000 sq.ft', gen: '82,000 kWh', save: '₹6,40,000', payback: lang === 'hi' ? '2.9 वर्ष' : '2.9 Years' },
    { kw: '100 kW', area: lang === 'hi' ? '10,000 वर्ग फीट' : '10,000 sq.ft', gen: '1,64,000 kWh', save: '₹12,80,000', payback: lang === 'hi' ? '2.8 वर्ष' : '2.8 Years' },
    { kw: '250 kW', area: lang === 'hi' ? '25,000 वर्ग फीट' : '25,000 sq.ft', gen: '4,10,000 kWh', save: '₹32,50,000', payback: lang === 'hi' ? '2.7 वर्ष' : '2.7 Years' },
    { kw: '500 kW', area: lang === 'hi' ? '50,000 वर्ग फीट' : '50,000 sq.ft', gen: '8,20,000 kWh', save: '₹65,00,000', payback: lang === 'hi' ? '2.6 वर्ष' : '2.6 Years' },
  ];

  const commercialServiceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'Commercial & Industrial Solar EPC in Uttar Pradesh',
    serviceType: 'Commercial Solar EPC & Net-Metering',
    provider: {
      '@type': 'LocalBusiness',
      name: 'ABC Solar',
      url: 'https://abcsolar.in',
    },
    areaServed: {
      '@type': 'AdministrativeArea',
      name: 'Uttar Pradesh',
    },
    description:
      'Turnkey commercial rooftop solar installations for cold storages, rice mills, factories, and schools with MVVNL & PuVVNL net metering and 40% accelerated depreciation.',
  };

  return (
    <div className="animate-fade-in bg-slate-50 min-h-screen">
      <SEOHead
        title="Commercial & Industrial Solar EPC Contractor UP | ABC Solar"
        description="Turnkey rooftop solar solutions for cold storages, rice mills, factories, hospitals & petrol pumps across UP. Net metering under MVVNL, PuVVNL, PVVNL, DVVNL & 40% accelerated depreciation."
        canonical="https://abcsolar.in/commercial"
        keywords="commercial solar EPC contractor Uttar Pradesh, solar for cold storage UP, solar power plant rice mill Barabanki, industrial solar net metering MVVNL, 100kW rooftop solar cost UP"
        schemas={[commercialServiceSchema]}
      />
      {/* Hero Header */}
      <section className="bg-slate-950 text-white py-14 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#F59E0B_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center relative">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 rounded-full px-4 py-1.5 text-xs font-bold text-blue-400 mb-4 tracking-wide uppercase">
            <Factory size={14} /> {t('commBadge')}
          </div>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight mb-3">
            {t('commTitle')}
          </h1>
          <p className="text-slate-300 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
            {t('commSubtitle')}
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-12">
        {/* Tax Benefit & Financial Models Dual Cards */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Card 1: Accelerated Depreciation */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col justify-between hover:border-amber-400 transition-all">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-solar-600 flex items-center justify-center mb-5">
                <TrendingDown size={26} />
              </div>
              <span className="text-xs font-bold text-solar-600 uppercase tracking-wider">{t('commAdTag')}</span>
              <h3 className="font-display font-extrabold text-2xl text-slate-900 mt-1 mb-3">
                {t('commAdTitle')}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
                {t('commAdDesc')}
              </p>
            </div>
            <div className="space-y-2.5 bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs text-slate-700">
              <div className="flex items-center gap-2">
                <Check size={16} className="text-emerald-600 shrink-0" />
                <span>{t('commAdPoint1')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Check size={16} className="text-emerald-600 shrink-0" />
                <span>{t('commAdPoint2')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Check size={16} className="text-emerald-600 shrink-0" />
                <span>{t('commAdPoint3')}</span>
              </div>
            </div>
          </div>

          {/* Card 2: CAPEX vs OPEX */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col justify-between hover:border-teal-400 transition-all">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center mb-5">
                <Wallet size={26} />
              </div>
              <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">{t('commFinTag')}</span>
              <h3 className="font-display font-extrabold text-2xl text-slate-900 mt-1 mb-3">
                {t('commFinTitle')}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                {t('commFinDesc')}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-2">
              <button
                type="button"
                onClick={() => setSelectedModel('capex')}
                className={`p-3.5 rounded-2xl text-left border transition-all ${
                  selectedModel === 'capex'
                    ? 'bg-amber-50 border-solar-500 ring-2 ring-solar-500/20'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="text-xs font-bold text-slate-900">{t('commCapexModel')}</div>
                <div className="text-[11px] text-slate-500 mt-1">{t('commCapexSub')}</div>
              </button>
              <button
                type="button"
                onClick={() => setSelectedModel('opex')}
                className={`p-3.5 rounded-2xl text-left border transition-all ${
                  selectedModel === 'opex'
                    ? 'bg-teal-50 border-teal-600 ring-2 ring-teal-600/20'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="text-xs font-bold text-slate-900">{t('commOpexModel')}</div>
                <div className="text-[11px] text-slate-500 mt-1">{t('commOpexSub')}</div>
              </button>
            </div>

            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs text-slate-600">
              {selectedModel === 'capex' ? t('commCapexDesc') : t('commOpexDesc')}
            </div>
          </div>
        </div>

        {/* C&I Payback & Sizing Matrix */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <BarChart3 size={22} />
              </div>
              <div>
                <h3 className="font-display font-extrabold text-xl text-slate-900">
                  {t('commMatrixTitle')}
                </h3>
                <p className="text-xs text-slate-500">{t('commMatrixSubtitle')}</p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto -mx-2 sm:mx-0 px-2 sm:px-0">
            <table className="w-full text-xs sm:text-sm min-w-[540px]">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 text-[11px] uppercase tracking-wider font-semibold">
                  <th className="text-left py-3.5 px-4">{t('commColCapacity')}</th>
                  <th className="text-left py-3.5 px-4">{t('commColRoof')}</th>
                  <th className="text-left py-3.5 px-4">{t('commColAnnualGen')}</th>
                  <th className="text-left py-3.5 px-4">{t('commColSavings')}</th>
                  <th className="text-left py-3.5 px-4">{t('commColPayback')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tableRows.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-4 font-bold text-slate-900">{row.kw} Industrial</td>
                    <td className="py-4 px-4 text-slate-500">{row.area}</td>
                    <td className="py-4 px-4 text-slate-700 font-semibold">{row.gen}</td>
                    <td className="py-4 px-4 text-emerald-600 font-extrabold">{row.save} / yr</td>
                    <td className="py-4 px-4 text-solar-600 font-bold">{row.payback}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Industry Verticals Bento */}
        <div>
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h3 className="font-display font-extrabold text-2xl text-slate-900">
              {t('commIndustriesTitle')}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {t('commIndustriesSubtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {industryVerticals.map((ind, i) => {
              const Icon = ind.icon;
              return (
                <div key={i} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs hover:border-solar-400 hover:shadow-md transition-all flex flex-col justify-between">
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-800 mb-4">
                      <Icon size={24} />
                    </div>
                    <h4 className="font-display font-bold text-base text-slate-900 mb-2">{ind.title}</h4>
                    <p className="text-xs text-slate-500 leading-relaxed mb-4">{ind.desc}</p>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-[11px] space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">{lang === 'hi' ? 'अनुमानित बचत:' : 'Est. Savings:'}</span>
                      <strong className="text-emerald-700">{ind.savings}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">{lang === 'hi' ? 'वसूली समय:' : 'ROI Period:'}</span>
                      <strong className="text-solar-600">{ind.payback}</strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 text-white border border-slate-800 rounded-3xl p-8 sm:p-12 text-center shadow-xl">
          <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-white mb-2">
            {t('commCtaTitle')}
          </h3>
          <p className="text-slate-400 text-xs sm:text-sm max-w-xl mx-auto mb-6">
            {t('commCtaDesc')}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
            <button
              onClick={() => onNavigate('contact')}
              className="btn-primary w-full sm:w-auto"
            >
              {t('commBookBtn')} <ArrowRight size={16} />
            </button>
            <a
              href={`tel:${COMPANY.phone}`}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-slate-700 bg-slate-800/80 text-white font-semibold text-sm hover:bg-slate-700 transition-colors w-full sm:w-auto"
            >
              <Phone size={16} className="text-amber-400" /> {t('commSpeakBtn')}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
