import express from 'express';
import cors from 'cors';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataFile = path.join(__dirname, 'store.json');
const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

const seedProducts = [
  { id: 1, name: 'Regular Tea', category: 'Tea', price: 15, cost: 6, stock: 120, minStock: 20, type: 'Common', active: true, emoji: '🍵' },
  { id: 2, name: 'Ginger Tea', category: 'Tea', price: 20, cost: 8, stock: 85, minStock: 20, type: 'Common', active: true, emoji: '🫖' },
  { id: 3, name: 'Masala Tea', category: 'Tea', price: 25, cost: 10, stock: 65, minStock: 15, type: 'Common', active: true, emoji: '🍵' },
  { id: 4, name: 'Regular Coffee', category: 'Coffee', price: 20, cost: 9, stock: 90, minStock: 20, type: 'Common', active: true, emoji: '☕' },
  { id: 5, name: 'Strong Coffee', category: 'Coffee', price: 25, cost: 11, stock: 55, minStock: 15, type: 'Common', active: true, emoji: '☕' },
  { id: 6, name: 'Special Coffee', category: 'Coffee', price: 35, cost: 15, stock: 40, minStock: 10, type: 'Branch-specific', active: true, emoji: '🥤' },
  { id: 7, name: 'Green Tea', category: 'Green Tea', price: 25, cost: 10, stock: 35, minStock: 10, type: 'Common', active: true, emoji: '🍃' },
  { id: 8, name: 'Lemon Green Tea', category: 'Green Tea', price: 30, cost: 12, stock: 28, minStock: 10, type: 'Common', active: true, emoji: '🍋' },
  { id: 9, name: 'Samosa', category: 'Snacks', price: 15, cost: 8, stock: 48, minStock: 12, type: 'Common', active: true, emoji: '🥟' },
  { id: 10, name: 'Veg Puff', category: 'Snacks', price: 20, cost: 11, stock: 32, minStock: 10, type: 'Common', active: true, emoji: '🥐' },
  { id: 11, name: 'Sandwich', category: 'Fast Food', price: 50, cost: 27, stock: 18, minStock: 5, type: 'Branch-specific', active: true, emoji: '🥪' },
  { id: 12, name: 'Cold Coffee', category: 'Cool Drinks', price: 60, cost: 30, stock: 22, minStock: 5, type: 'Branch-specific', active: true, emoji: '🧋' }
];
const readStore = () => {
  if (!fs.existsSync(dataFile)) fs.writeFileSync(dataFile, JSON.stringify({ products: { 1: seedProducts }, configs: {}, orders: [] }, null, 2));
  return JSON.parse(fs.readFileSync(dataFile, 'utf8'));
};
const writeStore = data => fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));

app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.get('/api/public/menu', (req, res) => {
  const branchId = Number(req.query.branchId || 1); const store = readStore();
  const config = store.configs[branchId] || { branchName: 'Dosti Cafe – Main Branch', upiVpa: '', upiName: 'Dosti Cafe', enabled: true };
  if (!config.enabled) return res.status(403).json({ error: 'Online ordering is currently unavailable.' });
  res.json({ products: store.products[branchId] || seedProducts });
});
app.get('/api/public/config', (req, res) => {
  const branchId = Number(req.query.branchId || 1); const store = readStore();
  res.json(store.configs[branchId] || { branchName: 'Dosti Cafe – Main Branch', upiVpa: '', upiName: 'Dosti Cafe', enabled: true });
});
app.post('/api/admin/branch-config', (req, res) => {
  const { branchId, branchName, upiVpa, upiName, enabled } = req.body || {};
  if (!Number.isInteger(Number(branchId)) || !upiVpa || !/^[\w.-]+@[\w.-]+$/.test(upiVpa)) return res.status(400).json({ error: 'Valid branch and UPI ID are required.' });
  const store = readStore(); store.configs[branchId] = { branchName: branchName || 'Dosti Cafe', upiVpa, upiName: upiName || 'Dosti Cafe', enabled: enabled !== false }; writeStore(store); res.json({ ok: true });
});
app.post('/api/admin/menu', (req, res) => {
  const { branchId, products } = req.body || {};
  if (!Number.isInteger(Number(branchId)) || !Array.isArray(products)) return res.status(400).json({ error: 'Branch and product list are required.' });
  const store = readStore(); store.products[branchId] = products.filter(p => p && Number.isFinite(Number(p.price)) && Number(p.price) >= 0 && p.active !== false); writeStore(store); res.json({ ok: true, count: store.products[branchId].length });
});
app.post('/api/public/orders', (req, res) => {
  const body = req.body || {}; const store = readStore();
  const branchId = Number(body.branchId); const config = store.configs[branchId];
  if (!config?.enabled) return res.status(403).json({ error: 'Online ordering is disabled for this branch.' });
  if (!body.customer?.trim() || !/^[6-9]\d{9}$/.test(String(body.phone || ''))) return res.status(400).json({ error: 'Customer name and valid mobile number are required.' });
  if (!Array.isArray(body.items) || !body.items.length) return res.status(400).json({ error: 'At least one item is required.' });
  const menu = store.products[branchId] || seedProducts;
  const items = [];
  for (const line of body.items) {
    const product = menu.find(p => Number(p.id) === Number(line.product?.id));
    const qty = Number(line.qty);
    if (!product || !Number.isInteger(qty) || qty < 1 || qty > 50) return res.status(400).json({ error: 'Invalid product or quantity in order.' });
    items.push({ product, qty, note: String(line.note || '').slice(0, 180) });
  }
  const subtotal = items.reduce((sum, line) => sum + Number(line.product.price) * line.qty, 0);
  const id = `DST-${Date.now().toString().slice(-8)}`;
  const order = { id, date: new Date().toISOString(), items, subtotal, discount: 0, total: subtotal, type: body.type === 'Takeaway' ? 'Takeaway' : 'Dine-in', table: body.type === 'Takeaway' ? undefined : String(body.table || ''), payment: 'UPI', paymentStatus: 'Awaiting verification', status: 'Pending', kot: false, customer: body.customer.trim().slice(0, 80), phone: String(body.phone), branchId, source: 'QR' };
  store.orders.unshift(order); writeStore(store); res.status(201).json({ order });
});
app.post('/api/public/orders/:id/payment-submitted', (req, res) => {
  const store = readStore(); const order = store.orders.find(item => item.id === req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found.' });
  order.paymentStatus = 'Customer marked paid – verification required'; order.paymentSubmittedAt = new Date().toISOString(); writeStore(store); res.json({ ok: true });
});
app.get('/api/orders', (req, res) => {
  const branchId = req.query.branchId ? Number(req.query.branchId) : null; const store = readStore();
  res.json({ orders: store.orders.filter(order => !branchId || order.branchId === branchId) });
});
app.post('/api/orders/:id/verify-payment', (req, res) => {
  const store = readStore(); const order = store.orders.find(item => item.id === req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found.' });
  if (!['Awaiting verification', 'Customer marked paid – verification required'].includes(order.paymentStatus)) return res.status(409).json({ error: 'Order is not awaiting payment verification.' });
  const branchMenu = store.products[order.branchId] || seedProducts;
  for (const line of order.items) { const product = branchMenu.find(p => Number(p.id) === Number(line.product.id)); if (!product || Number(product.stock) < Number(line.qty)) return res.status(409).json({ error: `Insufficient stock for ${line.product.name}. Update stock before accepting this order.` }); }
  order.items.forEach(line => { const product = branchMenu.find(p => Number(p.id) === Number(line.product.id)); product.stock = Number(product.stock) - Number(line.qty); });
  store.products[order.branchId] = branchMenu;
  order.paymentStatus = 'Paid – manually verified'; order.status = 'Preparing'; order.kot = true; order.verifiedAt = new Date().toISOString(); writeStore(store); res.json({ order });
});
const port = Number(process.env.API_PORT || 4000);
app.listen(port, () => console.log(`Dosti Cafe API running on http://localhost:${port}`));
