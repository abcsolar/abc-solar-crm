import { useState, useRef, useEffect } from 'react';
import {
  Sun, LayoutDashboard, Menu, X, Phone, Mail, MapPin, MessageCircle,
  Users, Kanban, FileText, ClipboardCheck, Hammer, Settings, LogOut,
  Home, Factory, Landmark, Wallet, Zap, Wrench, Shield, Lock, Building2,
  ChevronRight, Sparkles, Check, Bell, CheckCheck,
} from 'lucide-react';
import { COMPANY, SERVICE_DETAILS } from '@/data';
import { cn } from '@/utils/cn';
import type { Portal, AuthSession } from '@/types';
import { Modal } from '@/components/ui';
import { useLanguage } from '@/i18n/LanguageContext';
import { useNotifications, markAllNotifsRead } from '@/store';
import { relativeTime } from '@/utils';

export function AnnouncementBar() {
  const { t } = useLanguage();
  return (
    <div className="bg-gradient-to-r from-solar-600 via-amber-500 to-forest-700 text-white text-[11px] sm:text-xs md:text-sm py-1.5 sm:py-2 px-3 sm:px-4 flex items-center justify-center text-center w-full shadow-xs">
      <span className="inline-flex items-center justify-center gap-1.5 sm:gap-2 font-medium text-center flex-wrap leading-tight">
        <span className="flex h-2 w-2 relative shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-300" />
        </span>
        <span>{t('announcement')}</span>
      </span>
    </div>
  );
}

export function PortalSwitcher({ portal, onSwitch }: { portal: Portal; onSwitch: (p: Portal) => void }) {
  return (
    <div className="inline-flex items-center bg-slate-100 rounded-lg p-1 gap-1">
      <button
        onClick={() => onSwitch('website')}
        className={cn(
          'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-semibold transition-all',
          portal === 'website' ? 'bg-white text-solar-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
        )}
      >
        <Sun size={16} /> Website
      </button>
      <button
        onClick={() => onSwitch('crm')}
        className={cn(
          'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-semibold transition-all',
          portal === 'crm' ? 'bg-white text-forest-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
        )}
      >
        <LayoutDashboard size={16} /> CRM Dashboard
      </button>
    </div>
  );
}

export function WebsiteNav({ currentPage, onNavigate }: { currentPage: string; onNavigate: (page: string) => void }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { lang, toggleLang, t } = useLanguage();

  const navItems = [
    { id: 'home', label: t('navHome') },
    { id: 'calculator', label: t('navCalculator') },
    { id: 'subsidy', label: t('navSubsidy') },
    { id: 'commercial', label: t('navCommercial') },
    { id: 'contact', label: t('navContact') },
  ];

  return (
    <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo with official company brand */}
          <button onClick={() => onNavigate('home')} className="flex items-center gap-2.5 sm:gap-3.5 shrink-0 text-left group">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white border border-slate-200/80 shadow-sm p-1 flex items-center justify-center shrink-0 group-hover:scale-105 transition-all">
              <img
                src="/logo.jpg"
                alt="A.B.C. Solar Solution"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="font-display font-black text-slate-900 leading-tight tracking-tight text-base sm:text-lg group-hover:text-solar-600 transition-colors">
                ABC SOLAR
              </div>
              <div className="text-[10px] sm:text-[11px] font-bold text-solar-600 tracking-wider uppercase leading-none">
                {t('brandSubtitle')}
              </div>
              <div className="hidden sm:block text-[9px] text-slate-500 font-medium">
                {t('brandTagline')}
              </div>
            </div>
          </button>

          {/* Desktop Nav Items */}
          <div className="hidden lg:flex items-center gap-1.5 bg-slate-100/70 p-1.5 rounded-2xl border border-slate-200/60">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={cn(
                  'px-3.5 py-2 rounded-xl text-sm font-bold transition-all relative',
                  currentPage === item.id
                    ? 'text-solar-600 bg-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                )}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Action CTAs */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Language Switcher Button */}
            <button
              onClick={toggleLang}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all hover:border-amber-400 active:scale-95 shadow-2xs cursor-pointer"
              title={lang === 'en' ? 'हिन्दी में बदलें' : 'Switch to English'}
            >
              <span className="text-sm">🌐</span>
              <span>{lang === 'en' ? 'हिन्दी' : 'English'}</span>
            </button>

            <a
              href={`tel:+91${COMPANY.phone}`}
              className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200/80 px-3.5 py-2.5 rounded-xl border border-slate-200 transition-all"
            >
              <Phone size={14} className="text-solar-600" />
              <span>+91 {COMPANY.phone}</span>
            </a>
            <button
              onClick={() => onNavigate('calculator')}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-solar-500 to-amber-600 hover:from-solar-600 hover:to-amber-700 text-white font-extrabold text-xs shadow-md shadow-amber-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <Sparkles size={14} /> {t('getFreeQuote')}
            </button>
          </div>

          {/* Mobile hamburger */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={toggleLang}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 text-xs font-bold active:scale-95 transition-transform"
              aria-label="Change language"
            >
              <span>🌐</span>
              <span>{lang === 'en' ? 'हिन्दी' : 'EN'}</span>
            </button>
            <button
              className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 active:scale-95 transition-all"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileOpen && (
          <div className="lg:hidden pb-5 pt-2 space-y-1.5 animate-slide-up border-t border-slate-100">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => { onNavigate(item.id); setMobileOpen(false); }}
                className={cn(
                  'w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-colors text-left',
                  currentPage === item.id
                    ? 'text-solar-600 bg-solar-50/80 border border-solar-200'
                    : 'text-slate-700 hover:bg-slate-50'
                )}
              >
                <span>{item.label}</span>
                <ChevronRight size={16} className="text-slate-400" />
              </button>
            ))}
            <div className="pt-2 grid grid-cols-2 gap-2">
              <a
                href={`tel:${COMPANY.phone}`}
                className="flex items-center justify-center gap-1.5 py-3 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold text-center transition-colors"
              >
                <Phone size={14} className="text-solar-600" /> {t('callNow')}
              </a>
              <button
                onClick={() => { onNavigate('calculator'); setMobileOpen(false); }}
                className="btn-primary text-xs py-3 font-bold"
              >
                {t('getFreeQuote')}
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

const ICON_MAP: Record<string, any> = {
  Home, Factory, Landmark, Wallet, Zap, Wrench, LayoutDashboard, Users, Kanban, FileText, ClipboardCheck, Hammer, Settings,
};

export function CrmSidebar({ currentPage, onNavigate, allowedPages }: { currentPage: string; onNavigate: (page: string) => void; allowedPages?: string[] }) {
  const items = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'leads', label: 'Lead Directory', icon: Users },
    { id: 'pipeline', label: 'Sales Pipeline', icon: Kanban },
    { id: 'quotations', label: 'Quotations & BOQ', icon: FileText },
    { id: 'surveys', label: 'Site Surveys', icon: ClipboardCheck },
    { id: 'whatsapp', label: 'WhatsApp Inbox', icon: MessageCircle },
    { id: 'projects', label: 'Projects & AMC', icon: Hammer },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const visibleItems = allowedPages ? items.filter(i => allowedPages.includes(i.id)) : items;

  return (
    <aside className="w-64 bg-slate-950 text-white flex flex-col h-screen sticky top-0 shrink-0 border-r border-slate-800 no-print">
      <div className="px-5 py-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white p-1 flex items-center justify-center shrink-0 shadow-md">
            <img src="/logo.jpg" alt="ABC Solar" className="w-full h-full object-contain" />
          </div>
          <div>
            <div className="font-display font-extrabold text-sm text-white">ABC SOLAR</div>
            <div className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">Staff Operations</div>
          </div>
        </div>
      </div>
      <nav className="flex-1 py-3 px-3 space-y-1 overflow-y-auto">
        {visibleItems.map(item => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={cn(
                'w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all',
                currentPage === item.id
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-white'
              )}
            >
              <Icon size={18} />
              {item.label}
            </button>
          );
        })}
      </nav>
      <div className="p-4 border-t border-slate-800/80 text-[11px] text-slate-500 text-center">
        Avadh Boring Co. · Internal Portal
      </div>
    </aside>
  );
}

export function CrmTopbar({ session, onLogout, onSwitchPortal }: { session: AuthSession; onLogout: () => void; onSwitchPortal: () => void }) {
  const notifications = useNotifications();
  const [showNotifs, setShowNotifs] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifs(false);
      }
    }
    if (showNotifs) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifs]);

  const roleColors: Record<string, string> = {
    'Super Admin': 'bg-purple-900/60 text-purple-300 border border-purple-700/50',
    'Sales Manager': 'bg-amber-900/60 text-amber-300 border border-amber-700/50',
    'Site Engineer': 'bg-teal-900/60 text-teal-300 border border-teal-700/50',
    'Accountant': 'bg-blue-900/60 text-blue-300 border border-blue-700/50',
  };

  return (
    <div className="px-6 py-3.5 bg-white border-b border-slate-200 flex items-center justify-between shadow-xs no-print">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-white p-0.5 border border-slate-200 flex items-center justify-center shrink-0">
          <img src="/logo.jpg" alt="Logo" className="w-full h-full object-contain" />
        </div>
        <span className="font-display font-extrabold text-slate-900 text-sm sm:text-base">ABC Solar Operations</span>
      </div>
      <div className="flex items-center gap-3 sm:gap-4">
        <button
          onClick={onSwitchPortal}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-600 hover:text-solar-600 transition-colors"
        >
          <Sun size={16} /> View Public Website
        </button>

        {/* Live Inbound Notifications Bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifs(!showNotifs)}
            className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            title="Lead Ingestion Notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 min-w-[1rem] px-1 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white shadow-xs animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifs && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 py-3 z-50 animate-scale-in">
              <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-display font-bold text-sm text-slate-900">Lead Notifications</span>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-600">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={() => markAllNotifsRead()}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-solar-600 hover:text-solar-700"
                  >
                    <CheckCheck size={13} /> Mark read
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400">
                    No lead alerts yet. Ingested leads will appear here.
                  </div>
                ) : (
                  notifications.slice(0, 15).map(n => (
                    <div
                      key={n.id}
                      className={cn(
                        'px-4 py-2.5 hover:bg-slate-50 transition-colors flex items-start gap-2.5 text-left',
                        !n.read && 'bg-amber-50/50'
                      )}
                    >
                      <span className="text-base shrink-0 mt-0.5">
                        {n.source === 'WEBSITE_CALLBACK' ? '🌐' :
                         n.source === 'SOLAR_CALCULATOR' ? '☀️' :
                         n.source === 'META_LEAD_ADS' ? '📘' :
                         n.source === 'INDIAMART' ? '🏭' :
                         n.source === 'CALL_IVR' ? '📞' : '🔔'}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-800 leading-snug break-words">
                          {n.message}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {relativeTime(n.createdAt)}
                        </p>
                      </div>
                      {!n.read && (
                        <span className="w-2 h-2 rounded-full bg-solar-500 shrink-0 mt-1.5" />
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 pl-3 sm:pl-4 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-solar-500 to-amber-600 flex items-center justify-center text-xs font-bold text-white shadow-xs">
            {session.initials}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-bold text-slate-900 leading-tight">{session.name}</p>
            <span className={cn('inline-block text-[10px] font-bold px-1.5 py-0.2 rounded mt-0.5', roleColors[session.role])}>
              {session.role}
            </span>
          </div>
          <button
            onClick={onLogout}
            className="p-2 rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
            title="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

export function FloatingWhatsApp() {
  const [show, setShow] = useState(false);
  const { t } = useLanguage();

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
      {show && (
        <div className="absolute bottom-16 right-0 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 w-[calc(100vw-2.5rem)] max-w-xs animate-slide-up">
          <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-100">
            <div className="w-7 h-7 rounded-lg bg-white p-0.5 border border-slate-200 flex items-center justify-center">
              <img src="/logo.jpg" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <p className="font-bold text-slate-900 text-xs">{t('waTitle')}</p>
              <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> {t('waOnline')}
              </p>
            </div>
          </div>
          <p className="text-xs text-slate-600 mb-3">{t('waDesc')}</p>
          <a
            href={`https://wa.me/${COMPANY.whatsapp}?text=${encodeURIComponent(t('waDefaultMsg'))}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors w-full justify-center shadow-md shadow-emerald-700/20"
          >
            <MessageCircle size={15} /> {t('waBtn')}
          </a>
        </div>
      )}
      <button
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onClick={() => window.open(`https://wa.me/${COMPANY.whatsapp}?text=${encodeURIComponent(t('waDefaultMsg'))}`, '_blank')}
        className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-emerald-600 hover:bg-emerald-700 shadow-xl hover:shadow-2xl transition-all flex items-center justify-center text-white animate-float cursor-pointer"
        aria-label="WhatsApp"
      >
        <MessageCircle size={24} className="sm:hidden" />
        <MessageCircle size={28} className="hidden sm:block" />
      </button>
    </div>
  );
}

export function Footer({ onNavigate }: { onNavigate: (page: string) => void }) {
  const [activeService, setActiveService] = useState<string | null>(null);
  const selectedService = SERVICE_DETAILS.find(s => s.id === activeService);
  const { t } = useLanguage();

  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-900 mt-16 sm:mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10">
        {/* Brand Col */}
        <div className="space-y-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white p-1 flex items-center justify-center shrink-0 shadow-lg">
              <img src="/logo.jpg" alt="A.B.C. Solar Solution" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="font-display font-black text-white text-lg tracking-tight leading-tight">ABC SOLAR</div>
              <div className="text-[11px] font-bold text-solar-500 tracking-wider uppercase leading-none mt-0.5">{t('brandSubtitle')}</div>
              <div className="text-[10px] text-slate-400 font-medium mt-0.5">{t('brandTagline')} · M/S Avadh Boring Company</div>
            </div>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed font-normal">
            {t('footerAbout')}
          </p>
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 space-y-1.5 text-xs">
            <div className="flex items-center gap-2 text-amber-400 font-bold">
              <Shield size={14} className="shrink-0" />
              <span>UPNEDA Vendor Code: {COMPANY.vendorCode}</span>
            </div>
            <div className="text-slate-400 text-xs">
              Loom Solar Authorized Partner #24483/UP/08/2028
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {COMPANY.serviceAreas.map(area => (
              <span key={area} className="px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-medium text-slate-300">
                {area === 'Barabanki' ? `⭐ ${area} (HQ)` : area}
              </span>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4 pb-1 border-b border-slate-800/60">
            {t('footerNavTitle')}
          </h4>
          <ul className="space-y-3 text-sm">
            <li><button onClick={() => onNavigate('home')} className="text-slate-400 hover:text-amber-400 transition-colors font-medium">{t('navHome')}</button></li>
            <li><button onClick={() => onNavigate('calculator')} className="text-slate-400 hover:text-amber-400 transition-colors font-medium">{t('navCalculator')}</button></li>
            <li><button onClick={() => onNavigate('subsidy')} className="text-slate-400 hover:text-amber-400 transition-colors font-medium">{t('navSubsidy')}</button></li>
            <li><button onClick={() => onNavigate('commercial')} className="text-slate-400 hover:text-amber-400 transition-colors font-medium">{t('navCommercial')}</button></li>
            <li><button onClick={() => onNavigate('contact')} className="text-slate-400 hover:text-amber-400 transition-colors font-medium">{t('navContact')}</button></li>
          </ul>
        </div>

        {/* Services */}
        <div>
          <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4 pb-1 border-b border-slate-800/60">
            {t('footerServicesTitle')}
          </h4>
          <ul className="space-y-3 text-sm text-slate-400">
            {SERVICE_DETAILS.map(s => (
              <li key={s.id}>
                <button onClick={() => setActiveService(s.id)} className="text-slate-400 hover:text-amber-400 transition-colors text-left flex items-center gap-2 font-medium">
                  <span className="text-amber-400 text-xs font-bold">→</span> {s.title}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Legal & Banking Credentials */}
        <div>
          <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4 pb-1 border-b border-slate-800/60">
            {t('footerCredsTitle')}
          </h4>
          <ul className="space-y-3 text-sm text-slate-400">
            <li className="flex items-start gap-2.5">
              <MapPin size={16} className="mt-0.5 shrink-0 text-amber-400" />
              <span className="text-slate-300 font-normal leading-relaxed">{COMPANY.address}</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Phone size={16} className="shrink-0 text-amber-400" />
              <a href={`tel:+91${COMPANY.phone}`} className="hover:text-amber-400 transition-colors font-semibold text-slate-200">+91 {COMPANY.phone}</a>
            </li>
            <li className="flex items-center gap-2.5">
              <Mail size={16} className="shrink-0 text-amber-400" />
              <a href={`mailto:${COMPANY.email}`} className="hover:text-amber-400 transition-colors text-slate-300 font-normal">{COMPANY.email}</a>
            </li>
            <li className="flex items-center gap-2.5">
              <FileText size={16} className="shrink-0 text-amber-400" />
              <span className="text-slate-300 font-normal">{COMPANY.gstin}</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="border-t border-slate-900 py-6 px-6 max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 text-center sm:text-left font-normal">
        <div>
          © 2026 ABC SOLAR — {COMPANY.legalName} (Proprietor: {COMPANY.proprietor}). {t('footerRights')}
        </div>
        <div className="flex items-center gap-4 text-xs text-slate-400 font-medium">
          <span>PM Surya Ghar Partner</span>
          <span className="text-slate-600">•</span>
          <span>UPNEDA Verified</span>
          <span className="text-slate-600">•</span>
          <span>BIS Certified</span>
        </div>
      </div>

      {selectedService && (
        <ServiceDetailModal service={selectedService} onClose={() => setActiveService(null)} />
      )}
    </footer>
  );
}

function ServiceDetailModal({ service, onClose }: { service: typeof SERVICE_DETAILS[number]; onClose: () => void }) {
  const Icon = ICON_MAP[service.icon] || Sun;
  return (
    <Modal open={true} onClose={onClose} title={service.title} maxWidth="max-w-2xl">
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-solar-400 to-solar-600 flex items-center justify-center shrink-0 shadow-md">
            <Icon className="text-white" size={24} />
          </div>
          <div>
            <h4 className="font-display font-bold text-slate-900">{service.title}</h4>
            <p className="text-xs text-slate-500">{service.short}</p>
          </div>
        </div>
        <p className="text-sm text-slate-600 leading-relaxed">{service.description}</p>

        <div>
          <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 mb-2.5">Technical Specifications</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {service.specs.map((spec, i) => (
              <div key={i} className="bg-slate-50 rounded-xl px-3 py-2 border border-slate-100">
                <p className="text-[10px] text-slate-400 font-bold uppercase">{spec.label}</p>
                <p className="text-sm font-bold text-slate-800">{spec.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 mb-2.5">What's Included</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {service.features.map((feature, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-slate-700 bg-emerald-50/50 p-2 rounded-lg border border-emerald-100">
                <Check size={14} className="text-emerald-600 mt-0.5 shrink-0" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}
