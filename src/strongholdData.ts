export const LOGO = 'https://fhwhqoiucfxmfsclianh.databasepad.com/storage/v1/object/public/sop-files/public/Logo.jpg';

const portraits = [
  'https://d64gsuwffb70l.cloudfront.net/6a26ccfe1522feea66d490f4_1780927972793_09ce97a9.png',
  'https://d64gsuwffb70l.cloudfront.net/6a26ccfe1522feea66d490f4_1780927976760_04c0eab5.png',
  'https://d64gsuwffb70l.cloudfront.net/6a26ccfe1522feea66d490f4_1780927976384_5711c2ad.png',
  'https://d64gsuwffb70l.cloudfront.net/6a26ccfe1522feea66d490f4_1780927977895_1ef2f244.png',
];

export interface Guard {
  id: string; name: string; rank: string; site: string; photo: string;
  status: 'on-duty' | 'patrol' | 'break' | 'off'; lat: number; lng: number;
  battery: number; lastSync: string; licenseExpiry: string; nbiExpiry: string;
}

export const guards: Guard[] = [
  { id: 'G-001', name: 'Rodel Mabini', rank: 'SG', site: 'Robinsons Place Tacloban', photo: portraits[0], status: 'on-duty', lat: 11.244, lng: 125.003, battery: 78, lastSync: '2 min ago', licenseExpiry: '2026-07-12', nbiExpiry: '2026-09-01' },
  { id: 'G-002', name: 'Jovencio Reyes', rank: 'SO', site: 'Gaisano Capital', photo: portraits[1], status: 'patrol', lat: 11.241, lng: 125.001, battery: 14, lastSync: 'cached 18 min', licenseExpiry: '2026-06-30', nbiExpiry: '2026-08-15' },
  { id: 'G-003', name: 'Arnel Tupas', rank: 'SG', site: 'EVRMC Hospital', photo: portraits[2], status: 'on-duty', lat: 11.250, lng: 125.005, battery: 92, lastSync: '1 min ago', licenseExpiry: '2026-06-25', nbiExpiry: '2027-01-20' },
  { id: 'G-004', name: 'Wilfredo Cinco', rank: 'SG', site: 'Leyte Park Resort', photo: portraits[3], status: 'break', lat: 11.238, lng: 125.010, battery: 55, lastSync: '5 min ago', licenseExpiry: '2026-12-05', nbiExpiry: '2026-07-02' },
  { id: 'G-005', name: 'Ernesto Lagunoy', rank: 'SO', site: 'Robinsons Place Tacloban', photo: portraits[0], status: 'patrol', lat: 11.245, lng: 125.002, battery: 33, lastSync: 'SMS fallback', licenseExpiry: '2027-03-11', nbiExpiry: '2026-10-30' },
];

export interface Incident {
  id: string; site: string; guard: string; type: string; severity: 'low' | 'medium' | 'high';
  time: string; channel: 'cloud' | 'sms' | 'viber'; drrm: boolean; summary: string;
}

export const incidents: Incident[] = [
  { id: 'INC-7781', site: 'Gaisano Capital', guard: 'Jovencio Reyes', type: 'Suspicious Person', severity: 'medium', time: '13:42', channel: 'sms', drrm: false, summary: 'Unidentified male loitering near loading bay. Endorsed to roving.' },
  { id: 'INC-7780', site: 'EVRMC Hospital', guard: 'Arnel Tupas', type: 'Medical Assist', severity: 'low', time: '12:15', channel: 'cloud', drrm: false, summary: 'Assisted senior visitor to ER triage.' },
  { id: 'INC-7779', site: 'Leyte Park Resort', guard: 'Wilfredo Cinco', type: 'Flood Warning', severity: 'high', time: '11:03', channel: 'viber', drrm: true, summary: 'Storm surge advisory raised. Perimeter sandbagged per DRRM protocol.' },
];

export interface PostOrder { id: string; title: string; site: string; done: boolean; time: string; }
export const postOrders: PostOrder[] = [
  { id: 'PO-1', title: 'Verify main gate access logbook', site: 'Robinsons Place', done: true, time: '06:00' },
  { id: 'PO-2', title: 'Scan NFC checkpoint — North Wing', site: 'Robinsons Place', done: true, time: '07:00' },
  { id: 'PO-3', title: 'Scan QR tag — Parking B2', site: 'Robinsons Place', done: false, time: '08:00' },
  { id: 'PO-4', title: 'Check valve pressure at boiler room', site: 'Robinsons Place', done: false, time: '09:00' },
  { id: 'PO-5', title: 'Photo evidence — Fire exit clearance', site: 'Robinsons Place', done: false, time: '10:00' },
  { id: 'PO-6', title: 'Roving patrol — Perimeter loop', site: 'Robinsons Place', done: false, time: '11:00' },
];

export interface PayrollRow { id: string; name: string; reg: number; ot: number; under: number; gross: number; sss: number; phic: number; pagibig: number; bir: number; net: number; }
export const payroll: PayrollRow[] = guards.map((g, i) => {
  const reg = 160; const ot = [12, 8, 20, 4, 16][i]; const under = [0, 2, 0, 1, 0][i];
  const rate = 86.5; const gross = Math.round((reg + ot * 1.25 - under) * rate);
  const sss = Math.round(gross * 0.045); const phic = Math.round(gross * 0.025);
  const pagibig = 100; const bir = Math.round(gross * 0.03);
  return { id: g.id, name: g.name, reg, ot, under, gross, sss, phic, pagibig, bir, net: gross - sss - phic - pagibig - bir };
});

export interface DocItem { id: string; name: string; type: string; expiry: string; encrypted: boolean; }
export const vault: DocItem[] = [
  { id: 'D1', name: 'SOSIA License Agency Cert', type: 'PNP-SOSIA', expiry: '2026-11-01', encrypted: true },
  { id: 'D2', name: 'Mayor\'s Permit 2026', type: 'LGU', expiry: '2026-12-31', encrypted: true },
  { id: 'D3', name: 'DOLE D.O. 174 Registration', type: 'DOLE', expiry: '2027-02-14', encrypted: true },
  { id: 'D4', name: 'Firearms License Bundle', type: 'FEO-PNP', expiry: '2026-06-22', encrypted: true },
  { id: 'D5', name: 'BIR 2303 Registration', type: 'BIR', expiry: '—', encrypted: true },
];
