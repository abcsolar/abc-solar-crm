import { useState } from 'react';
import { Sun, Lock, Mail, Eye, EyeOff, Shield, ArrowRight, Zap } from 'lucide-react';
import { login, useUsers } from '@/store';
import { cn } from '@/utils/cn';
import { SEOHead } from '@/components/SEOHead';

export function StaffLoginPage({ onSuccess }: { onSuccess: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const allUsers = useUsers();
  const demoUsers = allUsers.filter(u => u.active).slice(0, 4);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const result = login(email, password);
    if (!result.ok) {
      setError(result.error || 'Login failed');
    } else {
      onSuccess();
    }
  }

  function quickLogin(userEmail: string, userPwd: string) {
    setEmail(userEmail);
    setPassword(userPwd);
    setError('');
    const result = login(userEmail, userPwd);
    if (!result.ok) setError(result.error || 'Login failed');
    else onSuccess();
  }

  const roleColors: Record<string, string> = {
    'Super Admin': 'bg-purple-900/60 text-purple-300 border border-purple-700/50',
    'Sales Manager': 'bg-amber-900/60 text-amber-300 border border-amber-700/50',
    'Site Engineer': 'bg-teal-900/60 text-teal-300 border border-teal-700/50',
    'Accountant': 'bg-blue-900/60 text-blue-300 border border-blue-700/50',
  };

  return (
    <div className="min-h-screen bg-[#0F172A] flex flex-col items-center justify-center p-4">
      <SEOHead title="Staff Login | ABC Solar CRM Operations" noindex={true} />
      {/* Subtle background texture */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-[#0F172A] to-teal-950/20 pointer-events-none" />

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">

          {/* Gradient header */}
          <div className="bg-gradient-to-br from-slate-900 to-teal-900 px-8 py-8 text-center relative">
            {/* Decorative glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 bg-amber-500/10 blur-3xl rounded-full pointer-events-none" />

            <div className="relative">
              {/* Logo */}
              <div className="w-16 h-16 rounded-2xl bg-white p-1.5 flex items-center justify-center mx-auto mb-4 shadow-xl border border-slate-700/50">
                <img src="/logo.jpg" alt="A.B.C. Solar Solution" className="w-full h-full object-contain" />
              </div>
              <h1 className="font-extrabold text-2xl text-white tracking-tight">ABC SOLAR</h1>
              <p className="text-xs text-amber-400 font-bold tracking-wider uppercase mt-0.5">
                A.B.C. SOLAR SOLUTION
              </p>
              <p className="text-xs text-slate-400 mt-1 leading-snug">
                Avadh Boring Company · Staff Operations Portal
              </p>
            </div>
          </div>

          {/* Authorization badge */}
          <div className="px-8 pt-5 pb-1">
            <div className="flex items-center justify-center gap-2 bg-amber-950/40 border border-amber-800/40 text-amber-400 rounded-xl px-4 py-2.5 text-xs font-semibold text-center">
              <Zap size={13} className="shrink-0" />
              <span>Authorized Personnel Only — UPNEDA &amp; PM Surya Ghar Partner Operations</span>
            </div>
          </div>

          {/* Login form */}
          <form onSubmit={handleSubmit} className="px-8 pt-5 pb-6 space-y-4">
            {/* Error banner */}
            {error && (
              <div className="bg-red-950/50 border border-red-800/50 text-red-400 rounded-xl px-4 py-3 text-sm flex items-center gap-2">
                <Shield size={15} className="shrink-0" />
                {error}
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">
                Email ID
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={17} />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@abcsolar.in"
                  className={cn(
                    'w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-xl pl-10 pr-4 py-3 text-sm',
                    'focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all'
                  )}
                  autoFocus
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={17} />
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className={cn(
                    'w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-xl pl-10 pr-10 py-3 text-sm',
                    'focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all'
                  )}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPwd ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-amber-900/40 mt-2"
            >
              <Shield size={16} />
              Authenticate &amp; Access CRM
              <ArrowRight size={16} />
            </button>
          </form>

          {/* Quick Demo Login */}
          <div className="px-8 pb-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex-1 h-px bg-slate-700/60" />
              <span className="text-xs text-slate-500 font-semibold whitespace-nowrap">Quick Demo Login</span>
              <div className="flex-1 h-px bg-slate-700/60" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              {demoUsers.map(user => (
                <button
                  key={user.id}
                  onClick={() => quickLogin(user.email, user.password)}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-800/50 border border-slate-700 hover:border-amber-500/50 hover:bg-slate-800 transition-all text-left group"
                >
                  <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300 shrink-0 group-hover:bg-amber-900/50 group-hover:text-amber-300 transition-colors">
                    {user.initials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-300 truncate group-hover:text-white transition-colors">
                      {user.name}
                    </p>
                    <span className={cn('inline-block text-[10px] font-bold px-1.5 py-0.5 rounded mt-0.5', roleColors[user.role])}>
                      {user.role}
                    </span>
                  </div>
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-600 text-center mt-4 flex items-center justify-center gap-1">
              <Shield size={11} /> Access is role-based. Demo credentials are pre-filled.
            </p>
          </div>

          {/* Footer line */}
          <div className="border-t border-slate-800 px-8 py-4">
            <p className="text-[11px] text-slate-600 text-center">
              © 2026 ABC SOLAR — M/S Avadh Boring Company. GSTIN: 09AABPQ3096M1Z5
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
