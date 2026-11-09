import { useState } from 'react';
import { Printer } from 'lucide-react';
import type { Branch } from '../../types';
import Field from '../../shared/components/Field';
import Toggle from '../../shared/components/Toggle';
export default function SettingsPage({ branch, setBranches, notify, printerSize, setPrinterSize }: {
    branch: Branch;
    setBranches: any;
    notify: (s: string) => void;
    printerSize: '58mm' | '80mm' | 'A4';
    setPrinterSize: (size: '58mm' | '80mm' | 'A4') => void;
}) { const printer = printerSize; const [kot, setKot] = useState(true); const [dine, setDine] = useState(true); const [take, setTake] = useState(true); return <div className="settings-grid"><section className="panel"><h3>Business information</h3><p className="muted">Cafe and branch details</p><div className="form-grid"><Field label="Cafe name" value="Dosti Cafe" onChange={() => { }}/><Field label="Branch name" value={branch?.name || ''} onChange={v => setBranches((old: Branch[]) => old.map(b => b.id === branch.id ? { ...b, name: v } : b))}/><Field label="Address" value={branch?.address || ''} onChange={v => setBranches((old: Branch[]) => old.map(b => b.id === branch.id ? { ...b, address: v } : b))}/><Field label="Phone" value={branch?.phone || ''} onChange={v => setBranches((old: Branch[]) => old.map(b => b.id === branch.id ? { ...b, phone: v } : b))}/></div><button className="btn primary" onClick={() => notify('Business settings saved')}>Save Business Settings</button></section><section className="panel"><h3>Billing & printer</h3><p className="muted">Configure receipt and KOT preferences</p><label className="form-field">Printer paper size<select value={printer} onChange={e => setPrinterSize(e.target.value as '58mm' | '80mm' | 'A4')}><option value="58mm">58mm Thermal</option><option value="80mm">80mm Thermal</option><option value="A4">A4 Printer</option></select></label><Toggle label="Enable KOT by default" checked={kot} onChange={setKot}/><Toggle label="Enable Dine-in" checked={dine} onChange={setDine}/><Toggle label="Enable Takeaway" checked={take} onChange={setTake}/><button className="btn light" onClick={() => { const w = window.open('', '_blank'); if (w) {
    w.document.write('<h2 style="font-family:monospace">DOSTI CAFE - TEST PRINT</h2><p>Printer layout preview</p><script>window.print()</script>');
} }}><Printer size={15}/> Test Print</button><button className="btn primary" onClick={() => notify('Printer settings saved')}>Save Settings</button></section><section className="panel"><h3>About this application</h3><p className="muted">Dosti Cafe POS · Frontend demo v1.0</p><p>Data is stored in this browser using localStorage. It is not yet synced between devices or branches.</p><span className="status warn">Backend not connected</span></section></div>; }

