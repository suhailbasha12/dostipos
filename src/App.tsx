import { useEffect, useState } from 'react';
import { ShoppingCart, ChefHat, Wallet, Store, ChartNoAxesCombined, LogOut, Search, Bell, Plus, Trash2, Printer, Menu, X, ArrowUpRight, TrendingUp, CreditCard, Banknote, Smartphone, CircleCheck, Download, Pencil, Receipt } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { initialProducts, initialBranches, initialOrders } from './data';
import type { Product, CartItem, Order, Branch, Role } from './types';
import { canAccessPage, canManageStaff, rolesCreatableBy, type AppPage } from './features/auth/permissions';
import { demoUsers, normalizeUsers } from './features/auth/demoUsers';
import type { StaffUser } from './features/auth/demoUsers';
import { createStaffAccount, getVisibleStaff } from './features/staff/staffAccess';
import { printCustomerBill, printKitchenTicket } from './features/printing/printDocuments';
import { money, formatDateTime } from './shared/utils/format';
import { apiUrl } from './shared/utils/api';
import { navigation } from './app/navigation';
import Field from './shared/components/Field';
import SimpleModal from './shared/components/SimpleModal';
import OrdersTable from './shared/components/OrdersTable';
import Categories from './features/products/CategoriesPage';
import PosBillingPage from './features/pos/PosBillingPage';
import Expenses from './features/expenses/ExpensesPage';
import Reports from './features/reports/ReportsPage';
import SettingsPage from './features/settings/SettingsPage';
import QROrderingPage from './features/qr-ordering/QROrderingPage';
import CustomerMenuPage from './features/customer-menu/CustomerMenuPage';
type Page = AppPage;
const nav = navigation;
const roleLabel = (value: Role) => value === 'Kitchen Staff' ? 'Kitchen Chef' : value;
const read = <T,>(key: string, fallback: T): T => { try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
}
catch {
    return fallback;
} };
const fmtDate = formatDateTime;
export default function App() {
    const [products, setProducts] = useState<Product[]>(() => read('dc_products', initialProducts));
    const [orders, setOrders] = useState<Order[]>(() => read('dc_orders', initialOrders));
    const [branches, setBranches] = useState<Branch[]>(() => read('dc_branches', initialBranches));
    const [page, setPage] = useState<Page>('Dashboard');
    const [role, setRole] = useState<Role>('Owner');
    const [logged, setLogged] = useState(false);
    const [paperSize, setPaperSize] = useState<'58mm' | '80mm' | 'A4'>(() => read<'58mm' | '80mm' | 'A4'>('dc_printer_size', '80mm'));
    const [activeUser, setActiveUser] = useState<StaffUser | null>(null);
    const [branchId, setBranchId] = useState(1);
    const [collapsed, setCollapsed] = useState(false);
    const [query, setQuery] = useState('');
    const [toast, setToast] = useState('');
    const [category, setCategory] = useState('All');
    const [cart, setCart] = useState<CartItem[]>([]);
    const [orderType, setOrderType] = useState<'Dine-in' | 'Takeaway'>('Takeaway');
    const [table, setTable] = useState('1');
    const [customer, setCustomer] = useState('Walk-in Customer');
    const [discount, setDiscount] = useState(0);
    const [showPay, setShowPay] = useState(false);
    const [payment, setPayment] = useState<'Cash' | 'UPI' | 'Card' | 'Split'>('Cash');
    const [received, setReceived] = useState('');
    const [kotEnabled, setKotEnabled] = useState(true);
    const [showProduct, setShowProduct] = useState(false);
    const [editProduct, setEditProduct] = useState<Product | null>(null);
    const [expenses, setExpenses] = useState<any[]>(() => read('dc_expenses', [{ id: 1, category: 'Raw Materials', description: 'Milk and tea powder', amount: 850, date: new Date().toISOString().slice(0, 10), branchId: 1 }, { id: 2, category: 'Electricity', description: 'Monthly electricity', amount: 1200, date: new Date().toISOString().slice(0, 10), branchId: 1 }]));
    const [customers, setCustomers] = useState<any[]>(() => read('dc_customers', [{ id: 1, name: 'Walk-in Customer', phone: '', orders: 0, spent: 0 }, { id: 2, name: 'Rahul', phone: '9876543210', orders: 5, spent: 420 }]));
    const [staff, setStaff] = useState<StaffUser[]>(() => normalizeUsers(read<StaffUser[]>('dc_staff', demoUsers)));
    const [loginEmail, setLoginEmail] = useState('owner@dosticafe.com');
    const [loginPass, setLoginPass] = useState('123456');
    const [modal, setModal] = useState('');
    const [form, setForm] = useState<any>({});
    useEffect(() => { localStorage.setItem('dc_products', JSON.stringify(products)); }, [products]);
    useEffect(() => { localStorage.setItem('dc_orders', JSON.stringify(orders)); }, [orders]);
    useEffect(() => { localStorage.setItem('dc_branches', JSON.stringify(branches)); }, [branches]);
    useEffect(() => { localStorage.setItem('dc_expenses', JSON.stringify(expenses)); }, [expenses]);
    useEffect(() => { localStorage.setItem('dc_customers', JSON.stringify(customers)); }, [customers]);
    useEffect(() => { localStorage.setItem('dc_staff', JSON.stringify(staff)); }, [staff]);
    useEffect(() => { localStorage.setItem('dc_printer_size', paperSize); }, [paperSize]);
    useEffect(() => {
        if (!logged) return;
        let active = true;
        const syncOrders = async () => { try { const response = await fetch(apiUrl(`/api/orders?branchId=${branchId}`)); if (!response.ok) return; const data = await response.json(); if (!active || !Array.isArray(data.orders)) return; setOrders(old => { const merged = new Map<string, Order>(old.map((order: Order) => [order.id, order])); (data.orders as Order[]).forEach((order: Order) => merged.set(order.id, { ...merged.get(order.id), ...order })); return Array.from(merged.values()).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); }); } catch { /* API is optional while running frontend-only */ } };
        syncOrders(); const timer = window.setInterval(syncOrders, 4000); return () => { active = false; window.clearInterval(timer); };
    }, [branchId, logged]);
    const notify = (s: string) => { setToast(s); setTimeout(() => setToast(''), 2600); };
    const currentBranch = branches.find(b => b.id === branchId) || branches[0];
    const branchOrders = orders.filter(o => o.branchId === branchId);
    const todayOrders = branchOrders.filter(o => new Date(o.date).toDateString() === new Date().toDateString() && o.status !== 'Cancelled');
    const todaySales = todayOrders.filter(o => o.status === 'Completed').reduce((a, o) => a + o.total, 0);
    const totalExpenses = expenses.filter(e => e.branchId === branchId).reduce((a, e) => a + Number(e.amount), 0);
    const categories: string[] = ['All', ...Array.from(new Set<string>(products.map(p => p.category)))];
    const visibleProducts = products.filter(p => p.active && p.name.toLowerCase().includes(query.toLowerCase()) && (category === 'All' || p.category === category));
    const subtotal = cart.reduce((a, i) => a + i.product.price * i.qty, 0);
    const total = Math.max(0, subtotal - discount);
    const addToCart = (p: Product) => setCart(old => { const found = old.find(i => i.product.id === p.id); return found ? old.map(i => i.product.id === p.id ? { ...i, qty: i.qty + 1 } : i) : [...old, { product: p, qty: 1, note: '' }]; });
    const changeQty = (id: number, d: number) => setCart(old => old.map(i => i.product.id === id ? { ...i, qty: i.qty + d } : i).filter(i => i.qty > 0));
    const completeOrder = () => {
        if (!cart.length)
            return;
        const id = 'DST-' + Date.now().toString().slice(-8);
        const paidOrder: Order = { id, date: new Date().toISOString(), items: cart.map(item => ({ ...item })), subtotal, discount, total, type: orderType, table: orderType === 'Dine-in' ? table : undefined, payment, status: kotEnabled ? 'Preparing' : 'Completed', kot: kotEnabled, customer, branchId };
        setOrders(old => [paidOrder, ...old]);
        setProducts(old => old.map(p => { const used = cart.find(i => i.product.id === p.id); return used ? { ...p, stock: Math.max(0, p.stock - used.qty) } : p; }));
        setCustomers(old => old.map(c => c.name === customer ? { ...c, orders: c.orders + 1, spent: c.spent + total } : c));
        // The customer bill is generated and sent to the browser print dialog only after payment confirmation.
        const didPrint = printCustomerBill(paidOrder, currentBranch, paperSize);
        setCart([]);
        setDiscount(0);
        setShowPay(false);
        setReceived('');
        setPage('Orders');
        notify(didPrint ? `Payment successful. ${id} bill is ready to print.` : `Payment saved. Allow pop-ups to print bill ${id}.`);
    };
    const verifyQrPayment = async (order: Order) => {
        try { const response = await fetch(apiUrl(`/api/orders/${encodeURIComponent(order.id)}/verify-payment`), { method: 'POST' }); const data = await response.json(); if (!response.ok) throw new Error(data.error || 'Unable to verify payment'); const verified = data.order as Order; setOrders(old => old.map(item => item.id === verified.id ? verified : item)); setProducts(old => old.map(product => { const used = verified.items.find(line => line.product.id === product.id); return used ? { ...product, stock: Math.max(0, product.stock - used.qty) } : product; })); const branch = branches.find(item => item.id === verified.branchId) || currentBranch; printKitchenTicket(verified, branch, paperSize); notify(`UPI manually verified. ${verified.id} sent to kitchen.`); } catch (error) { notify(error instanceof Error ? error.message : 'Unable to verify payment'); }
    };
    const printReceipt = (o: Order) => { if (!printCustomerBill(o, branches.find(b => b.id === o.branchId) || currentBranch, paperSize))
        notify('Allow pop-ups to print receipt'); };
    const printKot = (o: Order) => { if (!printKitchenTicket(o, branches.find(b => b.id === o.branchId) || currentBranch, paperSize))
        notify('Allow pop-ups to print KOT'); };
    const allowed = (p: Page) => canAccessPage(role, p);
    const handleLogin = () => {
        const user = staff.find(item => item.email.toLowerCase() === loginEmail.trim().toLowerCase() && item.password === loginPass && item.status === 'Active');
        if (!user) {
            notify('Invalid login details or account is inactive');
            return;
        }
        setActiveUser(user);
        setRole(user.role);
        setBranchId(user.branchId);
        setPage(user.role === 'Cashier' ? 'POS Billing' : user.role === 'Kitchen Staff' ? 'Kitchen / KOT' : 'Dashboard');
        setLogged(true);
        notify(`Welcome, ${user.name}`);
    };
    const handleLogout = () => { setLogged(false); setActiveUser(null); setRole('Owner'); setPage('Dashboard'); setCart([]); };
    const setPageSafe = (p: Page) => { if (allowed(p))
        setPage(p);
    else
        notify('You do not have permission to access this page'); };
    const staffRows = getVisibleStaff(staff, role, activeUser?.branchId || branchId);
    const creatableRoles = rolesCreatableBy(role);
    if (window.location.pathname === '/customer-menu') return <CustomerMenuPage />;
    if (!logged)
        return <div className="login-wrap"><div className="login-card"><div className="brand-mark">☕</div><h1>Dosti Cafe</h1><p className="muted">Sign in to your POS workspace</p><label>Email</label><input autoComplete="username" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()}/><label>Password</label><input autoComplete="current-password" type="password" value={loginPass} onChange={e => setLoginPass(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()}/><button className="btn primary full" onClick={handleLogin}>Sign In</button><div className="demo-logins"><b>Demo accounts</b><span>Owner: owner@dosticafe.com</span><span>Manager: manager@dosticafe.com</span><span>Cashier: cashier@dosticafe.com</span><span>Kitchen: kitchen@dosticafe.com</span><small>Password for all: 123456</small></div></div></div>;
    return <div className="app-shell">
  <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}><div className="brand"><div className="brand-mark">☕</div>{!collapsed && <div><b>Dosti Cafe</b><small>POS MANAGEMENT</small></div>}<button className="icon-btn collapse" onClick={() => setCollapsed(!collapsed)}><Menu size={18}/></button></div><div className="branch-mini"><Store size={16}/>{!collapsed && <span>{currentBranch?.name || 'Main Branch'}</span>}</div><nav>{['OVERVIEW', 'OPERATIONS', 'MANAGEMENT', 'BUSINESS', 'SYSTEM'].map(group => <div className="nav-group" key={group}>{!collapsed && <div className="nav-label">{group}</div>}{nav.filter(n => n.group === group && allowed(n.name)).map(n => <button key={n.name} className={`nav-item ${page === n.name ? 'active' : ''}`} onClick={() => setPageSafe(n.name)} title={n.name}><n.icon size={18}/>{!collapsed && <span>{n.name}</span>}</button>)}</div>)}</nav><div className="sidebar-bottom"><div className="avatar">{(activeUser?.name || 'U').slice(0, 1).toUpperCase()}</div>{!collapsed && <div className="profile-text"><b>{activeUser?.name || 'User'}</b><small>{roleLabel(role)}</small></div>}{!collapsed && <button className="icon-btn" onClick={handleLogout} title="Logout"><LogOut size={17}/></button>}</div></aside>
  <main className="main-area"><header className="topbar"><div><div className="eyebrow">DOSTI CAFE / {page.toUpperCase()}</div><h2>{page}</h2></div><div className="top-actions"><select value={branchId} disabled={role !== 'Owner'} onChange={e => setBranchId(Number(e.target.value))}>{branches.filter(b => b.active && (role === 'Owner' || b.id === activeUser?.branchId)).map(b => <option value={b.id} key={b.id}>{b.name}</option>)}</select><button className="icon-btn" onClick={() => notify('You are all caught up')}><Bell size={18}/></button><div className="user-chip"><div className="avatar">{(activeUser?.name || 'U').slice(0, 1).toUpperCase()}</div><div><b>{activeUser?.name || 'User'}</b><small>{roleLabel(role)}</small></div><button className="icon-btn" onClick={handleLogout} title="Logout"><LogOut size={16}/></button></div></div></header>
  <div className="content">
   {page === 'Dashboard' && <><div className="welcome-row"><div><h1>Good day! ☕</h1><p className="muted">Here is what's happening at {currentBranch?.name} today.</p></div><button className="btn primary" onClick={() => setPage('POS Billing')}><ShoppingCart size={16}/> New Bill</button></div><div className="stats-grid">{[{ label: "Today's Sales", value: money(todaySales), icon: TrendingUp, change: '+12.8%' }, { label: "Today's Orders", value: String(todayOrders.length), icon: Receipt, change: 'Live' }, { label: 'Total Expenses', value: money(totalExpenses), icon: Wallet, change: 'This branch' }, { label: 'Estimated Profit', value: money(todaySales - totalExpenses), icon: ArrowUpRight, change: 'Before product cost' }].map((s, i) => <div className="stat-card" key={s.label}><div className="stat-top"><span>{s.label}</span><span className="stat-icon"><s.icon size={18}/></span></div><h2>{s.value}</h2><small className="muted">{s.change}</small></div>)}</div><div className="dashboard-grid"><section className="panel"><div className="panel-head"><div><h3>Sales overview</h3><p className="muted">Last 7 days · sample data</p></div><span className="pill">This week</span></div><div className="chart"><ResponsiveContainer width="100%" height="100%"><BarChart data={['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d, i) => ({ day: d, sales: [1250, 1800, 1450, 2200, 1950, 2800, 2400][i] }))}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee7df"/><XAxis dataKey="day" axisLine={false} tickLine={false}/><YAxis axisLine={false} tickLine={false}/><Tooltip formatter={(v: any) => money(Number(v))}/><Bar dataKey="sales" fill="#9b7048" radius={[6, 6, 0, 0]}/></BarChart></ResponsiveContainer></div></section><section className="panel"><div className="panel-head"><div><h3>Quick actions</h3><p className="muted">Common tasks</p></div></div><div className="quick-grid"><button onClick={() => setPage('POS Billing')}><ShoppingCart />New Billing</button><button onClick={() => { setEditProduct(null); setShowProduct(true); }}><Plus />Add Product</button><button onClick={() => setPage('Kitchen / KOT')}><ChefHat />Kitchen Orders</button><button onClick={() => setPage('Reports')}><ChartNoAxesCombined />View Reports</button></div></section></div><section className="panel"><div className="panel-head"><div><h3>Recent orders</h3><p className="muted">Latest activity from this branch</p></div><button className="text-btn" onClick={() => setPage('Orders')}>View all →</button></div><OrdersTable orders={branchOrders.slice(0, 5)} onPrint={printReceipt} onKot={printKot}/></section></>}
   {page === 'POS Billing' && <PosBillingPage categories={categories} visibleProducts={visibleProducts} query={query} setQuery={setQuery} category={category} setCategory={setCategory} cart={cart} setCart={setCart} orderType={orderType} setOrderType={setOrderType} table={table} setTable={setTable} customer={customer} setCustomer={setCustomer} customers={customers} kotEnabled={kotEnabled} setKotEnabled={setKotEnabled} subtotal={subtotal} discount={discount} setDiscount={setDiscount} total={total} addToCart={addToCart} changeQty={changeQty} onProceedPayment={() => setShowPay(true)}/>}
   {page === 'Orders' && <section className="panel"><div className="panel-head"><div><h3>Order history</h3><p className="muted">Track, review and print cafe orders</p></div><button className="btn primary" onClick={() => setPage('POS Billing')}><Plus size={16}/> New Order</button></div><OrdersTable orders={branchOrders} onPrint={printReceipt} onKot={printKot} onStatus={(id, status) => setOrders(old => old.map(o => o.id === id ? { ...o, status } : o))} onVerifyPayment={role === 'Owner' || role === 'Branch Manager' ? verifyQrPayment : undefined}/></section>}
   {page === 'Kitchen / KOT' && <><div className="welcome-row"><div><h1>Kitchen display</h1><p className="muted">Manage incoming kitchen tickets</p></div><span className="pill">{branchOrders.filter(o => o.kot && o.status !== 'Completed' && o.status !== 'Cancelled').length} active tickets</span></div><div className="kitchen-grid">{(['Preparing', 'Ready', 'Completed'] as const).map(status => <section className="panel" key={status}><div className="panel-head"><h3>{status}</h3><span className="pill">{branchOrders.filter(o => o.kot && o.status === status).length}</span></div>{branchOrders.filter(o => o.kot && o.status === status).map(o => <div className="kot-card" key={o.id}><div className="kot-head"><b>{o.id}</b><small>{fmtDate(o.date)}</small></div><span className="pill">{o.type}{o.table ? ' · Table ' + o.table : ''}</span>{o.items.map(i => <div className="kot-line" key={i.product.id}><b>{i.qty} × {i.product.name}</b><small>{i.note}</small></div>)}<div className="kot-actions"><button className="btn light" onClick={() => printKot(o)}><Printer size={14}/> Print KOT</button>{status === 'Preparing' ? <button className="btn primary" onClick={() => setOrders(old => old.map(x => x.id === o.id ? { ...x, status: 'Ready' } : x))}>Mark Ready</button> : status === 'Ready' ? <button className="btn primary" onClick={() => setOrders(old => old.map(x => x.id === o.id ? { ...x, status: 'Completed' } : x))}>Complete</button> : null}</div></div>)}</section>)}</div></>}
   {page === 'Products' && <section className="panel"><div className="panel-head"><div><h3>Products</h3><p className="muted">Manage common and branch-specific products</p></div><button className="btn primary" onClick={() => { setEditProduct(null); setForm({ name: '', category: 'Tea', price: 0, cost: 0, stock: 0, minStock: 5, type: 'Common', emoji: '☕', active: true }); setShowProduct(true); }}><Plus size={16}/> Add Product</button></div><div className="table-tools"><div className="searchbox"><Search size={16}/><input placeholder="Search products..." value={query} onChange={e => setQuery(e.target.value)}/></div></div><div className="table-wrap"><table><thead><tr><th>Product</th><th>Category</th><th>Type</th><th>Price</th><th>Stock</th><th>Status</th><th>Actions</th></tr></thead><tbody>{products.filter(p => p.name.toLowerCase().includes(query.toLowerCase())).map(p => <tr key={p.id}><td><span className="table-product"><span>{p.emoji}</span><b>{p.name}</b></span></td><td>{p.category}</td><td><span className="pill">{p.type}</span></td><td>{money(p.price)}</td><td>{p.stock}</td><td><span className={`status ${p.active ? 'good' : 'bad'}`}>{p.active ? 'Active' : 'Inactive'}</span></td><td><button className="icon-btn" onClick={() => { setEditProduct(p); setForm(p); setShowProduct(true); }}><Pencil size={15}/></button><button className="icon-btn danger" onClick={() => setProducts(old => old.filter(x => x.id !== p.id))}><Trash2 size={15}/></button></td></tr>)}</tbody></table></div></section>}
   {page === 'Categories' && <Categories products={products} setProducts={setProducts} notify={notify}/>}
   {page === 'Inventory' && <section className="panel"><div className="panel-head"><div><h3>Inventory overview</h3><p className="muted">Stock is tracked separately for each branch</p></div><button className="btn light" onClick={() => notify('Inventory report ready to export')}><Download size={15}/> Export</button></div><div className="stats-grid compact">{[{ label: 'Total Products', value: products.length }, { label: 'Low Stock', value: products.filter(p => p.stock <= p.minStock).length }, { label: 'Out of Stock', value: products.filter(p => p.stock === 0).length }].map(x => <div className="stat-card" key={x.label}><span className="muted">{x.label}</span><h2>{x.value}</h2></div>)}</div><div className="table-wrap"><table><thead><tr><th>Product</th><th>Branch</th><th>Available</th><th>Minimum</th><th>Stock Status</th><th>Adjustment</th></tr></thead><tbody>{products.map(p => <tr key={p.id}><td>{p.emoji} {p.name}</td><td>{currentBranch?.name}</td><td>{p.stock}</td><td>{p.minStock}</td><td>{p.stock === 0 ? <span className="status bad">Out of stock</span> : p.stock <= p.minStock ? <span className="status warn">Low stock</span> : <span className="status good">In stock</span>}</td><td><button className="btn light small" onClick={() => { setForm({ qty: 1 }); setModal('stock-' + p.id); }}><Plus size={13}/> Add stock</button>{modal === 'stock-' + p.id && <div className="inline-adjust"><input type="number" min="1" value={form.qty || 1} onChange={e => setForm({ qty: Number(e.target.value) })}/><button className="btn primary small" onClick={() => { setProducts(old => old.map(x => x.id === p.id ? { ...x, stock: x.stock + Number(form.qty || 1) } : x)); setModal(''); notify('Stock updated'); }}>Save</button></div>}</td></tr>)}</tbody></table></div></section>}
   {page === 'Expenses' && <Expenses expenses={expenses} setExpenses={setExpenses} branchId={branchId} notify={notify}/>}
   {page === 'Customers' && <section className="panel"><div className="panel-head"><div><h3>Customers</h3><p className="muted">Customer directory and purchase history</p></div><button className="btn primary" onClick={() => { setForm({ name: '', phone: '' }); setModal('customer'); }}><Plus size={15}/> Add Customer</button></div><div className="table-wrap"><table><thead><tr><th>Name</th><th>Mobile</th><th>Total Orders</th><th>Total Spending</th><th>Last Activity</th></tr></thead><tbody>{customers.map(c => <tr key={c.id}><td><b>{c.name}</b></td><td>{c.phone || '—'}</td><td>{c.orders}</td><td>{money(c.spent)}</td><td>—</td></tr>)}</tbody></table></div></section>}
   {page === 'Staff & Users' && <section className="panel"><div className="panel-head"><div><h3>Staff & access management</h3><p className="muted">{role === 'Owner' ? 'Create and manage access across all cafe branches.' : 'Create cashier and kitchen accounts for your assigned branch.'}</p></div>{canManageStaff(role) && <button className="btn primary" onClick={() => { setForm({ name: '', email: '', password: '123456', role: creatableRoles[0] || 'Cashier', branchId: activeUser?.branchId || branchId, status: 'Active' }); setModal('staff'); }}><Plus size={15}/> Add Staff & Grant Access</button>}</div><div className="access-guide"><div><b>Owner</b><span>Can grant Branch Manager, Cashier and Kitchen Chef access.</span></div><div><b>Branch Manager</b><span>Can grant Cashier and Kitchen Chef access only within their branch.</span></div></div><div className="table-wrap"><table><thead><tr><th>Staff member</th><th>Login email</th><th>Role / Access</th><th>Branch</th><th>Account status</th><th>Access control</th></tr></thead><tbody>{staffRows.map(person => <tr key={person.id}><td><b>{person.name}</b></td><td>{person.email}</td><td><span className="pill">{roleLabel(person.role)}</span></td><td>{branches.find(b => b.id === person.branchId)?.name || '—'}</td><td><span className={`status ${person.status === 'Active' ? 'good' : 'bad'}`}>{person.status === 'Active' ? 'Access granted' : 'Access revoked'}</span></td><td>{person.role !== 'Owner' && (role === 'Owner' || (person.branchId === activeUser?.branchId && person.role !== 'Branch Manager')) && <button className={`btn small ${person.status === 'Active' ? 'light' : 'primary'}`} onClick={() => setStaff(old => old.map(item => item.id === person.id ? { ...item, status: item.status === 'Active' ? 'Inactive' : 'Active' } : item))}>{person.status === 'Active' ? 'Revoke Access' : 'Grant Access'}</button>}</td></tr>)}</tbody></table></div><p className="hint">New demo staff accounts are created with temporary password <b>123456</b>. Change this to individual passwords when real backend authentication is added.</p></section>}
   {page === 'Branch Management' && <section className="panel"><div className="panel-head"><div><h3>Branch management</h3><p className="muted">Start with one branch and add locations as your cafe grows</p></div><button className="btn primary" onClick={() => { setForm({ name: '', code: '', address: '', phone: '', active: true }); setModal('branch'); }}><Plus size={15}/> Add Branch</button></div><div className="branch-grid">{branches.map(b => <div className="branch-card" key={b.id}><div className="branch-icon"><Store /></div><h3>{b.name}</h3><p className="muted">{b.code}</p><p>{b.address}</p><p>{b.phone || 'No phone added'}</p><span className={`status ${b.active ? 'good' : 'bad'}`}>{b.active ? 'Active' : 'Inactive'}</span><button className="btn light full" onClick={() => { setBranchId(b.id); notify('Branch selected'); }}>Switch to branch</button></div>)}</div></section>}
   {page === 'Reports' && <Reports orders={branchOrders} expenses={expenses.filter(e => e.branchId === branchId)} products={products}/>}
   {page === 'QR Ordering' && <QROrderingPage branch={currentBranch} products={products} notify={notify}/>}
   {page === 'Settings' && <SettingsPage branch={currentBranch} setBranches={setBranches} notify={notify} printerSize={paperSize} setPrinterSize={setPaperSize}/>}
  </div></main>
  {showPay && <div className="modal-backdrop"><div className="modal payment-modal"><div className="modal-head"><div><h2>Complete Payment</h2><p className="muted">Confirm payment method for this order</p></div><button className="icon-btn" onClick={() => setShowPay(false)}><X /></button></div><div className="payment-total"><small>Amount to pay</small><h1>{money(total)}</h1><small className="bill-after-payment">Customer bill will be generated only after payment is confirmed.</small></div><div className="payment-methods">{([{ name: 'Cash', icon: Banknote }, { name: 'UPI', icon: Smartphone }, { name: 'Card', icon: CreditCard }, { name: 'Split', icon: Receipt }] as const).map(m => <button key={m.name} className={payment === m.name ? 'selected' : ''} onClick={() => setPayment(m.name as any)}><m.icon /><b>{m.name}</b></button>)}</div>{payment === 'Cash' && <div className="form-field"><label>Amount received</label><input type="number" value={received} onChange={e => setReceived(e.target.value)} placeholder={String(total)}/><small>Change: {money(Math.max(0, Number(received || total) - total))}</small><button className="text-btn" onClick={() => setReceived(String(total))}>Exact amount</button></div>}{payment === 'UPI' && <div className="upi-demo"><div className="fake-qr">▦</div><b>Demo UPI Payment</b><small>Confirm manually after receiving payment on your UPI app.</small></div>}{payment === 'Card' && <div className="form-field"><label>Transaction reference (optional)</label><input placeholder="Enter reference number"/></div>}{payment === 'Split' && <div className="form-field"><label>Split payment note</label><input placeholder="Example: ₹100 Cash + ₹50 UPI"/><small>Record the actual split in your payment terminal / UPI app.</small></div>}<div className="modal-actions"><button className="btn light" onClick={() => setShowPay(false)}>Back</button><button className="btn primary" onClick={() => { if (payment === 'Cash' && Number(received || total) < total) {
        notify('Received amount is less than total');
        return;
    } completeOrder(); }}><CircleCheck size={16}/> Confirm Payment & Print Bill</button></div><small className="muted">Demo mode only. No real payment is processed or verified.</small></div></div>}
  {showProduct && <div className="modal-backdrop"><div className="modal"><div className="modal-head"><h2>{editProduct ? 'Edit Product' : 'Add Product'}</h2><button className="icon-btn" onClick={() => setShowProduct(false)}><X /></button></div><div className="form-grid"><Field label="Product name" value={form.name || ''} onChange={v => setForm({ ...form, name: v })}/><Field label="Category" value={form.category || 'Tea'} onChange={v => setForm({ ...form, category: v })}/><Field label="Selling price (₹)" type="number" value={String(form.price ?? 0)} onChange={v => setForm({ ...form, price: Number(v) })}/><Field label="Purchase cost (₹)" type="number" value={String(form.cost ?? 0)} onChange={v => setForm({ ...form, cost: Number(v) })}/><Field label="Stock" type="number" value={String(form.stock ?? 0)} onChange={v => setForm({ ...form, stock: Number(v) })}/><Field label="Minimum stock" type="number" value={String(form.minStock ?? 5)} onChange={v => setForm({ ...form, minStock: Number(v) })}/><label>Product type<select value={form.type || 'Common'} onChange={e => setForm({ ...form, type: e.target.value })}><option>Common</option><option>Branch-specific</option></select></label><label>Emoji / icon<input value={form.emoji || '☕'} onChange={e => setForm({ ...form, emoji: e.target.value })}/></label></div><div className="modal-actions"><button className="btn light" onClick={() => setShowProduct(false)}>Cancel</button><button className="btn primary" onClick={() => { if (!form.name) {
        notify('Product name is required');
        return;
    } if (editProduct)
        setProducts(old => old.map(p => p.id === editProduct.id ? { ...form, id: p.id } : p));
    else
        setProducts(old => [...old, { ...form, id: Math.max(0, ...old.map(p => p.id)) + 1, active: true }]); setShowProduct(false); notify('Product saved'); }}>Save Product</button></div></div></div>}
  {modal === 'branch' && <SimpleModal title="Add Branch" onClose={() => setModal('')} onSave={() => { if (!form.name)
        return notify('Branch name is required'); setBranches(old => [...old, { ...form, id: Math.max(0, ...old.map(b => b.id)) + 1 }]); setModal(''); notify('Branch added'); }}><Field label="Branch name" value={form.name || ''} onChange={v => setForm({ ...form, name: v })}/><Field label="Branch code" value={form.code || ''} onChange={v => setForm({ ...form, code: v })}/><Field label="Address" value={form.address || ''} onChange={v => setForm({ ...form, address: v })}/><Field label="Phone" value={form.phone || ''} onChange={v => setForm({ ...form, phone: v })}/></SimpleModal>}
  {modal === 'customer' && <SimpleModal title="Add Customer" onClose={() => setModal('')} onSave={() => { if (!form.name)
        return notify('Customer name is required'); setCustomers(old => [...old, { ...form, id: Math.max(0, ...old.map(c => c.id)) + 1, orders: 0, spent: 0 }]); setModal(''); notify('Customer added'); }}><Field label="Customer name" value={form.name || ''} onChange={v => setForm({ ...form, name: v })}/><Field label="Mobile number" value={form.phone || ''} onChange={v => setForm({ ...form, phone: v })}/></SimpleModal>}
  {modal === 'staff' && <SimpleModal title="Create staff login & grant access" onClose={() => setModal('')} onSave={() => { try {
        const newAccount = createStaffAccount(staff, form, role, activeUser?.branchId || branchId, activeUser?.id || null);
        setStaff(old => [...old, newAccount]);
        setModal('');
        notify(`${newAccount.role === 'Kitchen Staff' ? 'Kitchen Chef' : newAccount.role} access granted. Temporary password: ${newAccount.password}`);
    }
    catch (error) {
        notify(error instanceof Error ? error.message : 'Unable to create staff account');
    } }}><Field label="Full name" value={form.name || ''} onChange={v => setForm({ ...form, name: v })}/><Field label="Login email" value={form.email || ''} onChange={v => setForm({ ...form, email: v })}/><label>Role / Access<select value={form.role || creatableRoles[0] || 'Cashier'} onChange={e => setForm({ ...form, role: e.target.value })}>{creatableRoles.map(item => <option key={item} value={item}>{item === 'Kitchen Staff' ? 'Kitchen Chef' : item}</option>)}</select></label><Field label="Temporary password" value={form.password || '123456'} onChange={v => setForm({ ...form, password: v })}/>{role === 'Owner' ? <label>Assigned branch<select value={form.branchId || branchId} onChange={e => setForm({ ...form, branchId: Number(e.target.value) })}>{branches.filter(b => b.active).map(b => <option key={b.id} value={b.id}>{b.name}</option>)}</select></label> : <div className="assigned-branch"><Store size={16}/><span>Access limited to <b>{currentBranch?.name}</b></span></div>}<div className="permission-note"><b>Access included</b><span>{form.role === 'Branch Manager' ? 'Dashboard, POS, Orders, Kitchen, Products, Inventory, Staff and branch reports.' : form.role === 'Cashier' ? 'POS Billing and Orders for the assigned branch.' : 'Kitchen / KOT for the assigned branch.'}</span></div></SimpleModal>}
  {toast && <div className="toast"><CircleCheck size={17}/>{toast}</div>}
 </div>;
}

