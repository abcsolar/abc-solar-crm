import { useState, useEffect } from 'react';
import {
  AnnouncementBar, WebsiteNav, CrmSidebar,
  FloatingWhatsApp, Footer, CrmTopbar,
} from '@/components/Layout';
import { StaffLoginPage } from '@/pages/StaffLoginPage';
import { useAuth, logout } from '@/store';
import { HomePage } from '@/pages/HomePage';
import { CalculatorPage } from '@/pages/CalculatorPage';
import { SubsidyPage } from '@/pages/SubsidyPage';
import { CommercialPage } from '@/pages/CommercialPage';
import { ContactPage } from '@/pages/ContactPage';
import { DashboardPage } from '@/pages/crm/DashboardPage';
import { LeadsPage } from '@/pages/crm/LeadsPage';
import { PipelinePage } from '@/pages/crm/PipelinePage';
import { QuotationsPage } from '@/pages/crm/QuotationsPage';
import { SurveysPage } from '@/pages/crm/SurveysPage';
import { WhatsAppPage } from '@/pages/crm/WhatsAppPage';
import { ProjectsPage } from '@/pages/crm/ProjectsPage';
import { SettingsPage } from '@/pages/crm/SettingsPage';
import { SEOHead } from '@/components/SEOHead';

type AppView = 'website' | 'staff-login' | 'crm';

function getViewFromPath(path: string): AppView {
  if (path === '/staff-login' || path === '/admin/login') {
    return 'staff-login';
  }
  if (path.startsWith('/admin') || path.startsWith('/crm')) {
    return 'crm';
  }
  return 'website';
}

function getWebsitePageFromPath(path: string): string {
  const clean = path.replace(/^\//, '').split('/')[0];
  if (['calculator', 'subsidy', 'commercial', 'contact'].includes(clean)) {
    return clean;
  }
  return 'home';
}

const VALID_CRM_PAGES = [
  'dashboard', 'leads', 'pipeline', 'quotations', 'surveys', 'whatsapp', 'projects', 'settings'
];

function getCrmPageFromUrlAndStorage(): string {
  if (typeof window === 'undefined') return 'dashboard';

  // 1. Check path e.g. /admin/leads, /crm/settings
  const pathParts = window.location.pathname.replace(/^\//, '').split('/');
  if (pathParts.length >= 2 && (pathParts[0] === 'admin' || pathParts[0] === 'crm')) {
    const pageInPath = pathParts[1].toLowerCase();
    if (VALID_CRM_PAGES.includes(pageInPath)) return pageInPath;
  }

  // 2. Check search params: ?page=leads or ?tab=leads
  try {
    const params = new URLSearchParams(window.location.search);
    const qPage = params.get('page') || params.get('tab') || params.get('crm_page');
    if (qPage && VALID_CRM_PAGES.includes(qPage.toLowerCase())) {
      return qPage.toLowerCase();
    }
  } catch {}

  // 3. Check localStorage
  try {
    const saved = localStorage.getItem('admin_active_tab');
    if (saved && VALID_CRM_PAGES.includes(saved)) {
      return saved;
    }
  } catch {}

  return 'dashboard';
}

function App() {
  const [view, setView] = useState<AppView>(() =>
    getViewFromPath(typeof window !== 'undefined' ? window.location.pathname : '/')
  );
  const [websitePage, setWebsitePage] = useState(() =>
    getWebsitePageFromPath(typeof window !== 'undefined' ? window.location.pathname : '/')
  );
  const [crmPage, setCrmPage] = useState<string>(() => getCrmPageFromUrlAndStorage());
  const session = useAuth();

  // Handle browser back/forward buttons
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handlePopState = () => {
      const currentPath = window.location.pathname;
      const newView = getViewFromPath(currentPath);
      setView(newView);
      if (newView === 'website') {
        setWebsitePage(getWebsitePageFromPath(currentPath));
      } else if (newView === 'crm') {
        setCrmPage(getCrmPageFromUrlAndStorage());
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Sync active CRM sub-route in URL and storage
  useEffect(() => {
    if (view === 'crm' && typeof window !== 'undefined') {
      try {
        localStorage.setItem('admin_active_tab', crmPage);
      } catch {}
      const currentPath = window.location.pathname;
      const targetPath = `/admin/${crmPage}`;
      if (currentPath !== targetPath && !currentPath.startsWith(`/crm/${crmPage}`)) {
        window.history.replaceState(null, '', targetPath + window.location.search);
      }
    }
  }, [crmPage, view]);

  function navigateToView(newView: AppView, path: string) {
    if (typeof window !== 'undefined' && window.location.pathname !== path) {
      window.history.pushState(null, '', path);
    }
    setView(newView);
  }

  function navigateWebsite(page: string) {
    setWebsitePage(page);
    const newPath = page === 'home' ? '/' : `/${page}`;
    if (typeof window !== 'undefined') {
      if (window.location.pathname !== newPath) {
        window.history.pushState(null, '', newPath);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  function navigateCrm(page: string) {
    setCrmPage(page);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('admin_active_tab', page);
      } catch {}
      const targetPath = `/admin/${page}`;
      if (window.location.pathname !== targetPath) {
        window.history.pushState(null, '', targetPath);
      }
    }
  }

  function handleLogout() {
    logout();
    navigateToView('staff-login', '/staff-login');
  }

  // ── Staff Login Page ──────────────────────────────────────────────
  if (view === 'staff-login') {
    if (session) {
      // Already authenticated -> auto-redirect to admin
      const target = getCrmPageFromUrlAndStorage();
      navigateToView('crm', `/admin/${target}`);
      return null;
    }
    return (
      <StaffLoginPage onSuccess={() => navigateToView('crm', `/admin/${getCrmPageFromUrlAndStorage()}`)} />
    );
  }

  // ── CRM / Admin Dashboard ─────────────────────────────────────────
  if (view === 'crm') {
    if (!session) {
      // Guard: unauthenticated access to CRM → redirect to staff login
      navigateToView('staff-login', '/staff-login');
      return null;
    }
    const allowedPage = session.allowedPages.includes(crmPage) ? crmPage : 'dashboard';
    return (
      <div className="min-h-screen bg-slate-50 flex print:bg-white print:block print:min-h-0 print:p-0">
        <SEOHead title="Staff Operations Portal | ABC Solar CRM" noindex={true} />
        <CrmSidebar currentPage={allowedPage} onNavigate={navigateCrm} allowedPages={session.allowedPages} />
        <div className="flex-1 flex flex-col min-w-0 print:block print:p-0 print:m-0">
          <CrmTopbar
            session={session}
            onLogout={handleLogout}
            onSwitchPortal={() => navigateToView('website', '/')}
          />
          <main className="flex-1 p-6 overflow-y-auto print:p-0 print:m-0 print:overflow-visible print:block">
            {allowedPage === 'dashboard' && <DashboardPage onNavigate={navigateCrm} />}
            {allowedPage === 'leads' && <LeadsPage onNavigate={navigateCrm} />}
            {allowedPage === 'pipeline' && <PipelinePage onNavigate={navigateCrm} />}
            {allowedPage === 'quotations' && <QuotationsPage onNavigate={navigateCrm} />}
            {allowedPage === 'surveys' && <SurveysPage onNavigate={navigateCrm} />}
            {allowedPage === 'whatsapp' && <WhatsAppPage onNavigate={navigateCrm} />}
            {allowedPage === 'projects' && <ProjectsPage onNavigate={navigateCrm} />}
            {allowedPage === 'settings' && <SettingsPage onNavigate={navigateCrm} />}
          </main>
        </div>
      </div>
    );
  }

  // ── Public Website ────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <AnnouncementBar />
      <WebsiteNav currentPage={websitePage} onNavigate={navigateWebsite} />
      <main className="flex-1">
        {websitePage === 'home' && <HomePage onNavigate={navigateWebsite} />}
        {websitePage === 'calculator' && <CalculatorPage onNavigate={navigateWebsite} />}
        {websitePage === 'subsidy' && <SubsidyPage />}
        {websitePage === 'commercial' && <CommercialPage onNavigate={navigateWebsite} />}
        {websitePage === 'contact' && <ContactPage />}
      </main>
      <Footer onNavigate={navigateWebsite} />
      <FloatingWhatsApp />
    </div>
  );
}

export default App;
