import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Coffee, Minus, Plus, ShoppingBag } from 'lucide-react';
import type { CartItem, Product } from '../../types';
import { money } from '../../shared/utils/format';
import { apiUrl } from '../../shared/utils/api';

type Props = { onExit?: () => void };
type PublicConfig = { branchName: string; upiVpa: string; upiName: string; enabled: boolean };

export default function CustomerMenuPage({ onExit }: Props) {
  const params = new URLSearchParams(window.location.search);
  const branchId = Number(params.get('branchId') || 1);
  const [products, setProducts] = useState<Product[]>([]);
  const [config, setConfig] = useState<PublicConfig>({ branchName: 'Dosti Cafe', upiVpa: '', upiName: 'Dosti Cafe', enabled: true });
  const [cart, setCart] = useState<CartItem[]>([]);
  const [category, setCategory] = useState('All');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [orderType, setOrderType] = useState<'Dine-in' | 'Takeaway'>('Dine-in');
  const [table, setTable] = useState(params.get('table') || '');
  const [step, setStep] = useState<'menu' | 'details' | 'payment' | 'submitted'>('menu');
  const [orderId, setOrderId] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.qty, 0);
  const categories = ['All', ...Array.from(new Set(products.map(product => product.category)))];
  const visible = useMemo(() => products.filter(product => product.active && product.stock > 0 && (category === 'All' || product.category === category)), [products, category]);

  useEffect(() => {
    Promise.all([
      fetch(apiUrl(`/api/public/menu?branchId=${branchId}`)).then(response => { if (!response.ok) throw new Error('menu'); return response.json(); }),
      fetch(apiUrl(`/api/public/config?branchId=${branchId}`)).then(response => { if (!response.ok) throw new Error('config'); return response.json(); })
    ]).then(([menu, settings]) => { setProducts(menu.products || []); setConfig(settings); })
      .catch(() => setError('Customer ordering service is not connected. Please contact the cafe team.'));
  }, [branchId]);

  const add = (product: Product) => setCart(old => {
    const existing = old.find(item => item.product.id === product.id);
    return existing ? old.map(item => item.product.id === product.id ? { ...item, qty: item.qty + 1 } : item) : [...old, { product, qty: 1, note: '' }];
  });
  const change = (id: number, delta: number) => setCart(old => old.map(item => item.product.id === id ? { ...item, qty: item.qty + delta } : item).filter(item => item.qty > 0));
  const placeOrder = async () => {
    setError('');
    if (!name.trim() || !/^[6-9]\d{9}$/.test(phone)) { setError('Enter your name and a valid 10-digit mobile number.'); return; }
    if (orderType === 'Dine-in' && !table.trim()) { setError('Enter your table number.'); return; }
    if (!cart.length) { setError('Please add at least one item.'); return; }
    if (!config.upiVpa) { setError('Cafe UPI ID is not configured. Please ask the cashier.'); return; }
    setBusy(true);
    try {
      const response = await fetch(apiUrl('/api/public/orders'), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ branchId, customer: name.trim(), phone, type: orderType, table: orderType === 'Dine-in' ? table.trim() : undefined, items: cart, subtotal, total: subtotal, payment: 'UPI', paymentStatus: 'Awaiting verification', status: 'Pending', kot: false, source: 'QR' }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Unable to create order');
      setOrderId(result.order.id);
      setStep('payment');
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to place order.'); }
    finally { setBusy(false); }
  };
  const upiLink = `upi://pay?pa=${encodeURIComponent(config.upiVpa)}&pn=${encodeURIComponent(config.upiName)}&am=${subtotal.toFixed(2)}&cu=INR&tn=${encodeURIComponent(`Dosti Cafe ${orderId}`)}`;
  const markPaid = async () => {
    setBusy(true); setError('');
    try {
      const response = await fetch(apiUrl(`/api/public/orders/${encodeURIComponent(orderId)}/payment-submitted`), { method: 'POST' });
      if (!response.ok) throw new Error('Could not submit payment status');
      setStep('submitted');
    } catch { setError('Could not submit payment status. Please show your payment screenshot to the cashier.'); }
    finally { setBusy(false); }
  };

  return <div className="customer-order-page">
    <header className="customer-order-header"><div className="customer-brand-icon"><Coffee/></div><div><b>{config.branchName}</b><small>Freshly made, just for you</small></div><span className="customer-order-badge">ONLINE ORDER</span></header>
    <main className="customer-order-main">
      {step === 'menu' && <>
        <div className="customer-hero"><span>WELCOME TO</span><h1>{config.branchName}</h1><p>Choose your favourites and order from your phone.</p></div>
        {error && <div className="customer-error">{error}</div>}
        <div className="customer-categories">{categories.map(item => <button key={item} className={category === item ? 'active' : ''} onClick={() => setCategory(item)}>{item}</button>)}</div>
        <div className="customer-product-grid">{visible.map(product => <article className="customer-product" key={product.id}><div className="customer-product-emoji">{product.emoji}</div><div className="customer-product-info"><b>{product.name}</b><small>{product.category}</small><strong>{money(product.price)}</strong></div><button aria-label={`Add ${product.name}`} onClick={() => add(product)}><Plus size={18}/></button></article>)}</div>
        {products.length === 0 && <div className="customer-empty">Menu is not available right now.</div>}
        {cart.length > 0 && <section className="customer-cart"><div className="customer-cart-heading"><b><ShoppingBag size={17}/> Your order ({cart.reduce((n, item) => n + item.qty, 0)})</b><strong>{money(subtotal)}</strong></div>{cart.map(item => <div className="customer-cart-row" key={item.product.id}><span>{item.product.name}</span><div><button onClick={() => change(item.product.id, -1)}><Minus size={13}/></button><b>{item.qty}</b><button onClick={() => change(item.product.id, 1)}><Plus size={13}/></button></div><strong>{money(item.product.price * item.qty)}</strong></div>)}<button className="customer-primary-btn" onClick={() => setStep('details')}>Continue <span>{money(subtotal)}</span></button></section>}
      </>}
      {step === 'details' && <section className="customer-form-card"><button className="customer-back" onClick={() => setStep('menu')}>← Back to menu</button><h2>Your details</h2><p>Tell us where to prepare your order.</p><label>Your name<input value={name} onChange={e => setName(e.target.value)} placeholder="Enter your name"/></label><label>Mobile number<input value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} inputMode="numeric" placeholder="10-digit mobile number"/></label><div className="customer-order-type"><button className={orderType === 'Dine-in' ? 'active' : ''} onClick={() => setOrderType('Dine-in')}>Dine-in</button><button className={orderType === 'Takeaway' ? 'active' : ''} onClick={() => setOrderType('Takeaway')}>Takeaway</button></div>{orderType === 'Dine-in' && <label>Table number<input value={table} onChange={e => setTable(e.target.value)} placeholder="Enter table number"/></label>}<div className="customer-total-line"><span>Amount to pay</span><b>{money(subtotal)}</b></div>{error && <div className="customer-error">{error}</div>}<button className="customer-primary-btn" disabled={busy} onClick={placeOrder}>{busy ? 'Creating order…' : 'Continue to UPI Payment'}</button></section>}
      {step === 'payment' && <section className="customer-form-card customer-payment-card"><div className="customer-success-icon"><CheckCircle2/></div><h2>Order created!</h2><p>Order <b>{orderId}</b> · Pay {money(subtotal)} using your UPI app.</p><div className="customer-upi-details"><small>PAYING TO</small><b>{config.upiName}</b><span>{config.upiVpa}</span><strong>{money(subtotal)}</strong></div><a className="customer-primary-btn customer-upi-link" href={upiLink}>Open Google Pay / PhonePe / UPI App</a><p className="customer-payment-note">After completing the payment in your UPI app, return here and tap the button below. The cafe will verify the payment before accepting your order.</p>{error && <div className="customer-error">{error}</div>}<button className="customer-primary-btn" disabled={busy} onClick={markPaid}>{busy ? 'Submitting…' : 'I have completed the payment'}</button></section>}
      {step === 'submitted' && <section className="customer-form-card customer-payment-card"><div className="customer-success-icon"><CheckCircle2/></div><h2>Payment submitted</h2><p>Your order <b>{orderId}</b> has been sent to Dosti Cafe.</p><div className="customer-pending-note">Payment verification pending. The cafe team will confirm your UPI payment and then send the order to the kitchen.</div><p>Show your order number to the cashier if you need help.</p><button className="customer-primary-btn" onClick={() => window.location.reload()}>Done</button></section>}
    </main><footer className="customer-order-footer">Powered by Dosti Cafe · Thank you for choosing us ☕</footer>
    {onExit && <button className="customer-exit" onClick={onExit}>Back to POS</button>}
  </div>;
}
