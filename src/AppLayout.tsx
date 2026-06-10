import React, { useMemo, useState } from 'react';
import { SystemProvider } from './sms/SystemContext';
import { AuthProvider, useAuth, ROLE_TABS, ROLE_LABEL } from './sms/AuthContext';
import Sidebar, { Tab } from './sms/Sidebar';
import StatusBar from './sms/StatusBar';
import OpsDashboard from './sms/OpsDashboard';
import PatrolModule from './sms/PatrolModule';
import DTRPayroll from './sms/DTRPayroll';
import Compliance from './sms/Compliance';
import ClientPortal from './sms/ClientPortal';
import SOSButton from './sms/SOSButton';
import BroadcastModal from './sms/BroadcastModal';
import PilotTest from './sms/PilotTest';
import Toasts from './sms/Toasts';
import AuthScreen from './sms/AuthScreen';
import { IconMenu } from './sms/icons';
import { LOGO } from '@/data/strongholdData';

const titles: Record<Tab, string> = {
  ops: 'Operations Command Center',
  patrol: 'Field Patrol · Offline-First',
  dtr: 'DTR Consolidation & Payroll',
  compliance: 'Compliance & Document Vault',
  client: 'Client Transparency Portal',
};

const Shell: React.FC = () => {
  const { loading, profile } = useAuth();
  const allowed = useMemo<Tab[]>(() => (profile ? ROLE_TABS[profile.role] : []), [profile]);
  const [tab, setTab] = useState<Tab>('ops');
  const [sidebar, setSidebar] = useState(false);
  const [broadcast, setBroadcast] = useState(false);

  // keep active tab within permitted set
  const activeTab = allowed.includes(tab) ? tab : allowed[0];

  // sites this user is allowed to see (admins/ops = all)
  const allowedSites = profile && (profile.role === 'admin' || profile.role === 'ops')
    ? undefined
    : profile?.assigned_sites;

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <img src={LOGO} className="w-20 h-20 object-contain animate-pulse" alt="A3" />
        <p className="text-white/50 font-body text-sm">Securing session…</p>
      </div>
    );
  }
  if (!profile) return <AuthScreen />;

  const canBroadcast = profile.role === 'ops' || profile.role === 'admin' || profile.role === 'supervisor';

  return (
    <SystemProvider>
      <div className="flex min-h-screen text-white">
        <Sidebar tab={activeTab} setTab={setTab} open={sidebar} onClose={() => setSidebar(false)} allowed={allowed} />
        <main className="flex-1 min-w-0 p-3 sm:p-5 space-y-4">
          <div className="flex items-center gap-3">
            <button className="lg:hidden glass rounded-xl p-2.5" onClick={() => setSidebar(true)}><IconMenu className="w-5 h-5 text-white" /></button>
            <img src={LOGO} className="w-9 h-9 object-contain lg:hidden" alt="A3" />
            <div className="flex-1">
              <h2 className="font-display text-xl sm:text-2xl text-white leading-none">{titles[activeTab]}</h2>
              <p className="text-white/40 text-xs font-body">{profile.full_name || 'Operative'} · {ROLE_LABEL[profile.role]}</p>
            </div>
          </div>

          <StatusBar />

          <div className="animate-spring" key={activeTab}>
            {activeTab === 'ops' && <OpsDashboard onBroadcast={() => setBroadcast(true)} sites={allowedSites} canBroadcast={canBroadcast} />}
            {activeTab === 'patrol' && <PatrolModule sites={allowedSites} />}
            {activeTab === 'dtr' && <DTRPayroll />}
            {activeTab === 'compliance' && <Compliance />}
            {activeTab === 'client' && <ClientPortal sites={allowedSites} />}
          </div>

          {activeTab === 'ops' && (profile.role === 'admin' || profile.role === 'ops') && <PilotTest />}

          <footer className="glass rounded-2xl p-4 text-center text-white/40 text-xs font-body">
            Stronghold A3 Security Agency · Tacloban City · Regional Support (Viber/Phone) Mon–Sat 8AM–6PM PHT ·
            <span className="text-gold"> RA 10173 · RA 10121 · DOLE D.O. 174 · PNP-SOSIA</span>
          </footer>
        </main>
      </div>
      <SOSButton />
      {canBroadcast && <BroadcastModal open={broadcast} onClose={() => setBroadcast(false)} />}
      <Toasts />
    </SystemProvider>
  );
};

const AppLayout: React.FC = () => (
  <AuthProvider>
    <Shell />
  </AuthProvider>
);

export default AppLayout;
