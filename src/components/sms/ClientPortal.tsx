import React from 'react';
import { guards, incidents, LOGO } from '@/data/strongholdData';
import { useSystem } from './SystemContext';
import { IconDownload, IconUsers, IconCheck } from './icons';

const ClientPortal: React.FC<{ sites?: string[] }> = ({ sites }) => {
  const { pushToast, bridge } = useSystem();
  const clientGuards = (sites ? guards.filter((g) => sites.includes(g.site)) : guards).slice(0, 4);
  const clientName = sites && sites.length > 0 ? sites[0] : 'Robinsons Place Tacloban';

  const genPdf = (range: string) => {
    const lines = [
      'STRONGHOLD A3 SECURITY — CLIENT SITE REPORT',
      'Client: Robinsons Place Tacloban',
      `Period: ${range}   Generated: ${new Date().toLocaleString('en-PH')}`,
      '----------------------------------------',
      'GUARDS ON SITE:',
      ...guards.slice(0, 3).map((g) => ` - ${g.name} (${g.rank}) ${g.status.toUpperCase()} | last sync ${g.lastSync}`),
      '',
      'INCIDENTS:',
      ...incidents.map((i) => ` - ${i.time} ${i.id} ${i.type} [${i.severity}] ${i.drrm ? '(DRRM)' : ''}`),
      '',
      'Tours completed: 18/20  | Checkpoints scanned: 96%',
      bridge !== 'cloud' ? '** Generated OFFLINE on supervisor device **' : '',
    ].filter(Boolean);
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `A3_Client_Report_${range.replace(/\s/g, '_')}.txt`; a.click();
    URL.revokeObjectURL(url);
    pushToast(`${range} PDF report generated${bridge !== 'cloud' ? ' offline' : ''} & queued to client email.`, 'ok');
  };

  return (
    <div className="space-y-4">
      <div className="glass-strong rounded-3xl p-4 flex items-center gap-4 flex-wrap">
        <img src={LOGO} className="w-12 h-12 object-contain" alt="brand" />
        <div className="flex-1 min-w-[160px]">
          <h3 className="text-white font-display text-lg">White-Label Client Portal</h3>
          <p className="text-white/50 text-xs font-body">Branded view for {clientName} · live transparency</p>

        </div>
        <span className="text-green-300 text-xs font-body flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-400 pulse-green" />Live feed active</span>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="glass-strong rounded-3xl p-4">
          <h3 className="text-white font-display text-base flex items-center gap-2 mb-3"><IconUsers className="w-5 h-5 text-gold" />Live Guard Activity</h3>
          <div className="space-y-2">
            {clientGuards.map((g) => (
              <div key={g.id} className="glass rounded-2xl p-3 flex items-center gap-3">
                <img src={g.photo} className="w-10 h-10 rounded-xl object-cover" alt={g.name} />
                <div className="flex-1">
                  <div className="text-white text-sm font-body">{g.name}</div>
                  <div className="text-white/40 text-xs font-body">{g.site} · {g.lastSync}</div>
                </div>
                <span className={`text-[11px] font-body px-2 py-1 rounded-lg ${g.status === 'patrol' ? 'glass-gold text-gold' : 'text-green-300 glass'}`}>{g.status}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-strong rounded-3xl p-4 flex flex-col">
          <h3 className="text-white font-display text-base mb-3">Automated PDF Reports</h3>
          <div className="space-y-2 flex-1">
            {['Daily Summary · Jun 8', 'Weekly Tour Report · Wk 23'].map((r) => (
              <button key={r} onClick={() => genPdf(r)} className="w-full glass rounded-2xl p-3 flex items-center justify-between hover:glass-gold transition group min-h-[52px]">
                <span className="text-white text-sm font-body group-hover:text-gold">{r}</span>
                <IconDownload className="w-4 h-4 text-white/60 group-hover:text-gold" />
              </button>
            ))}
          </div>
          <div className="glass-gold rounded-2xl p-3 mt-3 text-[11px] font-body text-white/70">
            <span className="text-gold flex items-center gap-1 mb-1"><IconCheck className="w-3.5 h-3.5" />Auto-emailed</span>
            Polished summaries dispatch daily/weekly. Generates locally if cloud unreachable.
          </div>
        </div>
      </div>
    </div>
  );
};
export default ClientPortal;
