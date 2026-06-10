import React, { useState } from 'react';
import { useSystem } from './SystemContext';
import { IconX, IconWifi, IconMessage, IconRadio } from './icons';

const presets = ['TYPHOON SIGNAL #3 — All sites secure perimeter, activate DRRM protocol.', 'ALL UNITS report status immediately via active bridge.', 'Storm surge advisory — evacuate ground-floor posts to muster point.'];

const BroadcastModal: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const { pushToast } = useSystem();
  const [msg, setMsg] = useState(presets[0]);
  const [ch, setCh] = useState({ push: true, sms: true, viber: true });
  if (!open) return null;

  const send = () => {
    const list = Object.entries(ch).filter(([, v]) => v).map(([k]) => k.toUpperCase()).join(' + ');
    if (!list) { pushToast('Select at least one channel.', 'alert'); return; }
    pushToast(`RED ALERT broadcast to ALL personnel via ${list}.`, 'alert');
    onClose();
  };

  const Toggle = ({ k, label, Icon }: { k: keyof typeof ch; label: string; Icon: React.FC<{ className?: string }> }) => (
    <button onClick={() => setCh((c) => ({ ...c, [k]: !c[k] }))}
      className={`flex-1 rounded-2xl p-3 flex flex-col items-center gap-1 min-h-[64px] transition ${ch[k] ? 'glass-gold text-gold' : 'glass text-white/50'}`}>
      <Icon className="w-5 h-5" /><span className="text-xs font-body">{label}</span>
    </button>
  );

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60" onClick={onClose}>
      <div className="glass-strong rounded-3xl p-5 max-w-md w-full animate-spring" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white font-display text-xl">Mass Red Alert Broadcast</h3>
          <button onClick={onClose} className="text-white/60"><IconX className="w-5 h-5" /></button>
        </div>
        <p className="text-white/50 text-xs font-body mb-2">Quick presets:</p>
        <div className="space-y-1.5 mb-3">
          {presets.map((p) => (
            <button key={p} onClick={() => setMsg(p)} className={`w-full text-left text-xs font-body rounded-xl px-3 py-2 ${msg === p ? 'glass-gold text-gold' : 'glass text-white/70'}`}>{p}</button>
          ))}
        </div>
        <textarea value={msg} onChange={(e) => setMsg(e.target.value)} rows={3} className="w-full bg-white/5 border border-white/15 rounded-2xl p-3 text-white font-body text-sm focus:outline-none focus:border-gold/50 resize-none mb-3" />
        <div className="flex gap-2 mb-4">
          <Toggle k="push" label="Push" Icon={IconWifi} />
          <Toggle k="sms" label="SMS" Icon={IconMessage} />
          <Toggle k="viber" label="Viber/Radio" Icon={IconRadio} />
        </div>
        <button onClick={send} className="w-full bg-[#DC143C] hover:bg-[#b01030] text-white font-display tracking-wide py-3.5 rounded-2xl min-h-[52px] transition">SEND TO ALL PERSONNEL</button>
      </div>
    </div>
  );
};
export default BroadcastModal;
