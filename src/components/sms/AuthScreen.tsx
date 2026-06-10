import React, { useState } from 'react';
import { useAuth, Role, ROLE_LABEL } from './AuthContext';
import { LOGO } from '@/data/strongholdData';
import { IconShield, IconLock } from './icons';

const SITES = ['Robinsons Place Tacloban', 'Gaisano Capital', 'EVRMC Hospital', 'Leyte Park Resort'];
const ROLES: Role[] = ['guard', 'supervisor', 'ops', 'admin'];

const AuthScreen: React.FC = () => {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [rank, setRank] = useState('SG');
  const [role, setRole] = useState<Role>('guard');
  const [sites, setSites] = useState<string[]>([SITES[0]]);
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const toggleSite = (s: string) => setSites((p) => (p.includes(s) ? p.filter((x) => x !== s) : [...p, s]));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null); setMsg(null); setBusy(true);
    if (mode === 'login') {
      const e2 = await signIn(email.trim(), password);
      if (e2) setErr(e2);
    } else {
      if (!fullName.trim()) { setErr('Enter full name'); setBusy(false); return; }
      const e2 = await signUp({ email: email.trim(), password, full_name: fullName.trim(), role, rank, assigned_sites: role === 'admin' || role === 'ops' ? SITES : sites });
      if (e2) setErr(e2);
      else setMsg('Account created. You can sign in now (check email if confirmation required).');
    }
    setBusy(false);
  };

  const input = 'w-full bg-white/5 border border-white/15 rounded-2xl px-4 py-3 text-white font-body text-sm focus:outline-none focus:border-gold/50 min-h-[48px]';

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass-strong rounded-3xl p-6 sm:p-8 w-full max-w-md animate-spring">
        <div className="flex flex-col items-center text-center mb-6">
          <img src={LOGO} className="w-20 h-20 object-contain drop-shadow-lg mb-3" alt="Stronghold A3" />
          <h1 className="text-gold font-display text-2xl font-bold leading-none">STRONGHOLD A3</h1>
          <p className="text-white/50 text-xs font-body mt-1">Security Management System · Tacloban City</p>
        </div>

        <div className="flex gap-2 mb-5">
          {(['login', 'signup'] as const).map((m) => (
            <button key={m} onClick={() => { setMode(m); setErr(null); setMsg(null); }}
              className={`flex-1 py-2.5 rounded-2xl font-display text-sm transition ${mode === m ? 'glass-gold text-gold' : 'glass text-white/60'}`}>
              {m === 'login' ? 'Sign In' : 'Register'}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="space-y-3">
          {mode === 'signup' && (
            <input className={input} placeholder="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          )}
          <input className={input} type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input className={input} type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />

          {mode === 'signup' && (
            <>
              <div>
                <p className="text-white/50 text-xs font-body mb-1.5 flex items-center gap-1"><IconShield className="w-3.5 h-3.5 text-gold" /> Role (RBAC)</p>
                <div className="grid grid-cols-2 gap-2">
                  {ROLES.map((r) => (
                    <button type="button" key={r} onClick={() => setRole(r)}
                      className={`py-2.5 rounded-xl text-xs font-body transition ${role === r ? 'glass-gold text-gold' : 'glass text-white/60'}`}>
                      {ROLE_LABEL[r]}
                    </button>
                  ))}
                </div>
              </div>
              {(role === 'guard' || role === 'supervisor') ? (
                <div>
                  <p className="text-white/50 text-xs font-body mb-1.5">Assigned Sites</p>
                  <div className="space-y-1.5">
                    {SITES.map((s) => (
                      <button type="button" key={s} onClick={() => toggleSite(s)}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-body transition ${sites.includes(s) ? 'glass-gold text-gold' : 'glass text-white/60'}`}>{s}</button>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-white/40 text-[11px] font-body">{ROLE_LABEL[role]} has access to all sites & elevated modules.</p>
              )}
              {role === 'guard' && (
                <input className={input} placeholder="Rank (e.g. SG, SO)" value={rank} onChange={(e) => setRank(e.target.value)} />
              )}
            </>
          )}

          {err && <div className="glass-red rounded-xl px-3 py-2 text-red-200 text-xs font-body">{err}</div>}
          {msg && <div className="glass-gold rounded-xl px-3 py-2 text-gold text-xs font-body">{msg}</div>}

          <button type="submit" disabled={busy} className="w-full bg-[#003a7a] hover:bg-[#004a9a] disabled:opacity-50 text-white font-display tracking-wide py-3.5 rounded-2xl min-h-[52px] flex items-center justify-center gap-2 transition">
            <IconLock className="w-4 h-4" /> {busy ? 'Please wait...' : mode === 'login' ? 'SECURE LOGIN' : 'CREATE ACCOUNT'}
          </button>
        </form>

        <p className="text-white/30 text-[11px] font-body text-center mt-4">RA 10173 (DPA) compliant · Role-Based Access Control enforced</p>
      </div>
    </div>
  );
};
export default AuthScreen;
