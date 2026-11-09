import type { Product, Branch, Order } from './types';
export const initialProducts: Product[] = [
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
export const initialBranches: Branch[] = [{ id: 1, name: 'Dosti Cafe – Main Branch', code: 'DST001', address: 'Main Branch, India', phone: '', active: true }];
export const initialOrders: Order[] = [{ id: 'DST-1001', date: new Date(Date.now() - 3600000).toISOString(), items: [{ product: initialProducts[0], qty: 2, note: '' }, { product: initialProducts[8], qty: 1, note: '' }], subtotal: 45, discount: 0, total: 45, type: 'Takeaway', payment: 'UPI', status: 'Completed', kot: true, customer: 'Walk-in Customer', branchId: 1 }, { id: 'DST-1002', date: new Date(Date.now() - 1800000).toISOString(), items: [{ product: initialProducts[3], qty: 2, note: 'Less sugar' }], subtotal: 40, discount: 0, total: 40, type: 'Dine-in', table: '2', payment: 'Cash', status: 'Preparing', kot: true, customer: 'Walk-in Customer', branchId: 1 }];

