import { useState } from 'react';
import { Sun, Lock, Mail, Eye, EyeOff, Shield, ArrowRight, X } from 'lucide-react';
import { login, useUsers } from '@/store';
import { cn } from '@/utils/cn';

export function LoginModal({ onClose, onSuccess }: { onClose: () => void; onSuccess?: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const allUsers = useUsers();
  const demoUsers = allUsers.filter(u => u.active).slice(0, 4);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = login(email, password);
    if (!result.ok) {
      setError(result.error || 'Login failed');
    } else if (onSuccess) {
      onSuccess();
    }
  }

  function quickLogin(userEmail: string, userPwd: string) {
    setEmail(userEmail);
    setPassword(userPwd);
    setError('');
    const result = login(userEmail, userPwd);
    if (!result.ok) setError(result.error || 'Login failed');
    else if (onSuccess) onSuccess();
  }

  const roleColors: Record<string, string> = {
    'Super Admin': 'bg-purple-100 text-purple-700',
    'Sales Manager': 'bg-amber-100 text-amber-700',
    'Site Engineer': 'bg-teal-100 text-teal-700',
    'Accountant': 'bg-blue-100 text-blue-700',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors z-10">
          <X size={20} />
        </button>

        <div className="bg-gradient-to-br from-slate-900 to-forest-900 px-8 py-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-solar-400 to-solar-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Sun className="text-white" size={28} />
          </div>
          <h2 className="font-display font-extrabold text-xl text-white">ABC SOLAR CRM</h2>
          <p className="text-sm text-slate-400 mt-1">Sign in to access the dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-4">
          {error && (
            <div className="bg-rose-50 border border-rose-200 rounded-lg px-4 py-2.5 text-sm text-rose-700">
              {error}
            </div>
          )}
          <div>
            <label className="label-field">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@abcsolar.in"
                className="input-field pl-10"
                autoFocus
              />
            </div>
          </div>
          <div>
            <label className="label-field">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type={showPwd ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter password"
                className="input-field pl-10 pr-10"
              />
              <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <button type="submit" className="btn-primary w-full">
            Sign In <ArrowRight size={16} />
          </button>
        </form>

        <div className="px-8 pb-8">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-xs text-slate-400 font-semibold">Quick Demo Login</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            {demoUsers.map(user => (
              <button
                key={user.id}
                onClick={() => quickLogin(user.email, user.password)}
                className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 hover:border-solar-300 hover:bg-solar-50 transition-all text-left group"
              >
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600 shrink-0 group-hover:bg-solar-100 group-hover:text-solar-700">
                  {user.initials}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-700 truncate">{user.name}</p>
                  <span className={cn('inline-block text-[10px] font-bold px-1.5 py-0.5 rounded mt-0.5', roleColors[user.role])}>
                    {user.role}
                  </span>
                </div>
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-400 text-center mt-4 flex items-center justify-center gap-1">
            <Shield size={12} /> Access is role-based. Demo credentials are pre-filled.
          </p>
        </div>
      </div>
    </div>
  );
}
