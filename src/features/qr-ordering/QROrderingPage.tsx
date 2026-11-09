import { useMemo, useState } from 'react';
import { Download, ExternalLink, RefreshCw, Save } from 'lucide-react';
import type { Branch, Product } from '../../types';
import { apiUrl } from '../../shared/utils/api';

type Props = { branch: Branch; products: Product[]; notify: (message: string) => void };
export default function QROrderingPage({ branch, products, notify }: Props) {
  const [upiVpa, setUpiVpa] = useState(() => localStorage.getItem(`dc_upi_${branch.id}`) || '');
  const [upiName, setUpiName] = useState(() => localStorage.getItem(`dc_upi_name_${branch.id}`) || 'Dosti Cafe');
  const [enabled, setEnabled] = useState(() => localStorage.getItem(`dc_qr_enabled_${branch.id}`) !== 'false');
  const menuUrl = useMemo(() => `${window.location.origin}/customer-menu?branchId=${branch.id}`, [branch.id]);
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=360x360&margin=16&data=${encodeURIComponent(menuUrl)}`;
  const save = async () => {
    if (!upiVpa.trim() || !/^[\w.-]+@[\w.-]+$/.test(upiVpa.trim())) { notify('Enter a valid UPI ID, for example cafe@okaxis'); return; }
    localStorage.setItem(`dc_upi_${branch.id}`, upiVpa.trim());
    localStorage.setItem(`dc_upi_name_${branch.id}`, upiName.trim() || 'Dosti Cafe');
    localStorage.setItem(`dc_qr_enabled_${branch.id}`, String(enabled));
    try {
      const response = await fetch(apiUrl('/api/admin/branch-config'), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ branchId: branch.id, branchName: branch.name, upiVpa: upiVpa.trim(), upiName: upiName.trim() || 'Dosti Cafe', enabled }) });
      if (!response.ok) throw new Error('save failed');
      const menuResponse = await fetch(apiUrl('/api/admin/menu'), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ branchId: branch.id, products: products.filter(product => product.active && product.stock > 0) }) });
      if (!menuResponse.ok) throw new Error('menu sync failed');
      notify('QR ordering settings and menu saved');
    } catch { notify('Saved in this browser. Start the POS server to enable customer phone ordering.'); }
  };
  return <div className="qr-admin-layout"><section className="panel qr-admin-card"><div className="panel-head"><div><h3>Customer QR Ordering</h3><p className="muted">Let customers scan, browse your menu and place orders from their phones.</p></div><span className={`status ${enabled ? 'good' : 'bad'}`}>{enabled ? 'Enabled' : 'Disabled'}</span></div><div className="qr-preview"><img src={qrUrl} alt="Dosti Cafe customer menu QR code"/><div><b>{branch.name}</b><p>Scan to view menu & order</p><small>Branch code: {branch.code}</small></div></div><div className="qr-actions"><a className="btn light" href={qrUrl} download={`dosti-cafe-${branch.code}-qr.png`} target="_blank" rel="noreferrer"><Download size={15}/> Download QR</a><a className="btn light" href={menuUrl} target="_blank" rel="noreferrer"><ExternalLink size={15}/> Preview Menu</a></div><label className="qr-toggle"><span><b>Enable customer QR ordering</b><small>Customers can submit orders from their phone.</small></span><input type="checkbox" checked={enabled} onChange={event => setEnabled(event.target.checked)}/></label><label className="qr-field">UPI ID / VPA<input value={upiVpa} onChange={event => setUpiVpa(event.target.value)} placeholder="yourcafe@okaxis"/></label><label className="qr-field">UPI display name<input value={upiName} onChange={event => setUpiName(event.target.value)} placeholder="Dosti Cafe"/></label><button className="btn primary" onClick={save}><Save size={15}/> Save Settings & Sync Menu</button></section><section className="panel qr-instructions"><h3>How customers will order</h3><ol><li>Customer scans the displayed QR using their phone camera.</li><li>Dosti Cafe menu opens in their mobile browser.</li><li>They select products, enter name and mobile number.</li><li>They choose Dine-in or Takeaway and enter table number if needed.</li><li>They open their UPI app and pay the exact order amount.</li><li>They return to the menu and submit payment status.</li><li>The order appears in POS as <b>Awaiting UPI verification</b>.</li><li>Cashier or manager checks the actual UPI credit and verifies it. Only then is the KOT sent to kitchen.</li></ol><div className="qr-warning"><b>Important for phone scanning</b><p>After deployment, use your public website domain. A QR containing localhost will only work on the same computer. Customer phones and the POS must connect to the same hosted backend.</p></div><div className="qr-warning"><b>UPI verification</b><p>This version uses a UPI app deep link and manual confirmation. Automatic payment verification requires a payment gateway such as Razorpay with server-side verification/webhooks.</p></div></section></div>;
}
