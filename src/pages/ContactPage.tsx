import { useState } from 'react';
import {
  MapPin, Phone, Mail, MessageCircle, Clock, Send, CheckCircle2,
  Shield, Building2, Sparkles, Check, ArrowRight, FileText,
} from 'lucide-react';
import { COMPANY, UP_DISTRICTS } from '@/data';
import { validateIndianPhone, waLink } from '@/utils';
import { createLeadFromForm } from '@/seed';
import { addLead } from '@/store';
import confetti from 'canvas-confetti';
import { useLanguage } from '@/i18n/LanguageContext';

export function ContactPage() {
  const { t, lang } = useLanguage();
  const [form, setForm] = useState({ name: '', phone: '', district: 'Barabanki', message: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = lang === 'hi' ? 'कृपया अपना नाम दर्ज करें' : 'Please enter your name';
    if (!validateIndianPhone(form.phone)) errs.phone = lang === 'hi' ? '10 अंकों का मान्य मोबाइल नंबर दर्ज करें' : 'Enter a valid 10-digit mobile number';
    if (!form.district) errs.district = lang === 'hi' ? 'कृपया अपना जिला चुनें' : 'Select your district';
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const lead = createLeadFromForm({
      name: form.name.trim(),
      phone: form.phone,
      district: form.district,
      monthlyBill: 5000,
      source: 'WEBSITE',
    });
    lead.notes = form.message || lead.notes;
    addLead(lead);
    setSubmitted(true);
    confetti({ particleCount: 90, spread: 70, origin: { y: 0.65 }, colors: ['#F59E0B', '#0F766E', '#10B981'] });
  }

  return (
    <div className="animate-fade-in bg-slate-50 min-h-screen">
      {/* Header */}
      <section className="bg-slate-950 text-white py-14 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#F59E0B_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center relative">
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 rounded-full px-4 py-1.5 text-xs font-bold text-amber-400 mb-4 tracking-wide uppercase">
            <Phone size={14} /> {t('contactBadge')}
          </div>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight mb-3">
            {t('contactTitle')}
          </h1>
          <p className="text-slate-300 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
            {t('contactSubtitle')}
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Office Details & Official Credentials */}
          <div className="lg:col-span-6 space-y-6">
            {/* Quick Contact Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <a
                href={`tel:${COMPANY.phone}`}
                className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs hover:border-amber-400 hover:shadow-md transition-all flex items-center gap-4 group"
              >
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-solar-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Phone size={22} />
                </div>
                <div>
                  <div className="text-[11px] text-slate-400 font-bold uppercase">{t('contactDirectPhone')}</div>
                  <div className="text-sm font-extrabold text-slate-900 group-hover:text-solar-600 transition-colors">
                    +91 {COMPANY.phone}
                  </div>
                  <div className="text-[10px] text-slate-500">{t('contactTiming')}</div>
                </div>
              </a>

              <a
                href={waLink(COMPANY.whatsapp, lang === 'hi' ? 'नमस्ते ABC Solar, मुझे सोलर साइट सर्वे बुक करना है।' : 'Hi ABC Solar, I would like to schedule a site survey.')}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs hover:border-emerald-400 hover:shadow-md transition-all flex items-center gap-4 group"
              >
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <MessageCircle size={22} />
                </div>
                <div>
                  <div className="text-[11px] text-emerald-600 font-bold uppercase flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> {t('contactWa')}
                  </div>
                  <div className="text-sm font-extrabold text-slate-900 group-hover:text-emerald-600 transition-colors">
                    {t('contactChatExpert')}
                  </div>
                  <div className="text-[10px] text-slate-500">{t('contactInstantResponse')}</div>
                </div>
              </a>
            </div>

            {/* Registered Business Office */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-xs space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                  <MapPin size={20} className="text-solar-600" />
                </div>
                <div>
                  <h4 className="font-display font-bold text-base text-slate-900">
                    {t('contactHeadOffice')}
                  </h4>
                  <p className="text-xs text-slate-500">{COMPANY.legalName}</p>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
                {COMPANY.address}
              </p>
              <div className="grid grid-cols-2 gap-3 text-xs text-slate-600 pt-1">
                <div>
                  <span className="text-[11px] text-slate-400 block font-semibold">{t('contactProprietor')}</span>
                  <strong className="text-slate-800">{COMPANY.proprietor}</strong>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block font-semibold">{t('contactVendorCode')}</span>
                  <strong className="text-solar-600">{COMPANY.vendorCode}</strong>
                </div>
              </div>
            </div>

            {/* Official Banking & Legal Credentials */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-lg space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                  <Building2 size={20} />
                </div>
                <div>
                  <h4 className="font-display font-bold text-base text-white">
                    {t('contactBankTitle')}
                  </h4>
                  <p className="text-[11px] text-slate-400">{t('contactBankSub')}</p>
                </div>
              </div>

              <div className="space-y-2 text-xs bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-sans">{lang === 'hi' ? 'बैंक:' : 'Bank:'}</span>
                  <span className="font-bold text-white">{COMPANY.bank.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-sans">{lang === 'hi' ? 'खाता धारक:' : 'Account Name:'}</span>
                  <span className="font-bold text-white">{COMPANY.legalName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-sans">{lang === 'hi' ? 'खाता संख्या:' : 'Account No:'}</span>
                  <span className="font-bold text-amber-400">{COMPANY.bank.accountNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-sans">{lang === 'hi' ? 'IFSC कोड:' : 'IFSC Code:'}</span>
                  <span className="font-bold text-white">{COMPANY.bank.ifsc}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-700 text-[11px]">
                  <span className="text-slate-400 font-sans">GSTIN:</span>
                  <span className="text-slate-300">{COMPANY.gstin}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-6 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
            {submitted ? (
              <div className="py-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 size={36} />
                </div>
                <h3 className="font-display font-extrabold text-2xl text-slate-900">
                  {t('contactSuccessTitle')}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">
                  {t('contactSuccessDesc', { name: form.name, phone: form.phone })}
                </p>
                <button
                  type="button"
                  onClick={() => { setSubmitted(false); setForm({ name: '', phone: '', district: 'Barabanki', message: '' }); }}
                  className="btn-primary mt-2 text-xs"
                >
                  {t('contactAnotherBtn')}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="pb-3 border-b border-slate-100">
                  <h3 className="font-display font-extrabold text-xl text-slate-900">
                    {t('contactFormTitle')}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {t('contactFormSub')}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                    {t('contactNameLabel')}
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    placeholder={lang === 'hi' ? 'उदा. रमेश कुमार' : 'e.g. Ramesh Kumar'}
                    className="w-full px-3.5 py-3 rounded-xl border border-slate-300 text-base sm:text-sm focus:ring-2 focus:ring-solar-500/40 focus:border-solar-500 outline-none"
                  />
                  {errors.name && <p className="text-xs text-rose-500 mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                    {t('contactPhoneLabel')}
                  </label>
                  <input
                    type="tel"
                    required
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                    placeholder={lang === 'hi' ? '10 अंकों का मोबाइल नंबर' : '10-digit mobile number'}
                    className="w-full px-3.5 py-3 rounded-xl border border-slate-300 text-base sm:text-sm focus:ring-2 focus:ring-solar-500/40 focus:border-solar-500 outline-none"
                  />
                  {errors.phone && <p className="text-xs text-rose-500 mt-1">{errors.phone}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                    {t('contactDistrictLabel')}
                  </label>
                  <select
                    value={form.district}
                    onChange={e => setForm({ ...form, district: e.target.value })}
                    className="w-full px-3.5 py-3 rounded-xl border border-slate-300 text-base sm:text-sm font-semibold text-slate-800 bg-white focus:ring-2 focus:ring-solar-500/40 focus:border-solar-500 outline-none"
                  >
                    {UP_DISTRICTS.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                    {t('contactMsgLabel')}
                  </label>
                  <textarea
                    rows={4}
                    value={form.message}
                    onChange={e => setForm({ ...form, message: e.target.value })}
                    placeholder={t('contactMsgPlaceholder')}
                    className="w-full px-3.5 py-3 rounded-xl border border-slate-300 text-base sm:text-sm focus:ring-2 focus:ring-solar-500/40 focus:border-solar-500 outline-none resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-solar-500 via-solar-500 to-amber-600 hover:from-solar-600 hover:to-amber-700 text-white font-extrabold text-sm shadow-md shadow-amber-500/20 transition-all hover:scale-[1.01] active:scale-[0.98] cursor-pointer"
                >
                  <Send size={16} /> {t('contactSubmitBtn')}
                </button>

                <p className="text-[11px] text-slate-400 text-center flex items-center justify-center gap-1">
                  <Shield size={12} className="text-emerald-600" />
                  {t('contactPrivacyNote')}
                </p>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
