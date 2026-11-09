import { useState } from 'react';
import { Plus } from 'lucide-react';
import type { Product } from '../../types';
export default function Categories({ products, setProducts, notify }: {
    products: Product[];
    setProducts: any;
    notify: (s: string) => void;
}) { const [newCat, setNewCat] = useState(''); const cats = Array.from(new Set(products.map(p => p.category))); return <section className="panel"><div className="panel-head"><div><h3>Categories</h3><p className="muted">Organize products for faster billing</p></div></div><div className="add-inline"><input placeholder="New category name" value={newCat} onChange={e => setNewCat(e.target.value)}/><button className="btn primary" onClick={() => { if (!newCat.trim())
    return; setProducts((old: Product[]) => [...old, { id: Math.max(...old.map(p => p.id)) + 1, name: 'New Product', category: newCat.trim(), price: 0, cost: 0, stock: 0, minStock: 0, type: 'Common', active: false, emoji: '☕' }]); setNewCat(''); notify('Category created. Add products to it.'); }}><Plus size={15}/> Add Category</button></div><div className="category-admin-grid">{cats.map(c => <div className="category-admin" key={c}><div className="category-symbol">{c === 'Coffee' ? '☕' : c === 'Tea' ? '🍵' : '🥡'}</div><b>{c}</b><small className="muted">{products.filter(p => p.category === c && p.active).length} active products</small></div>)}</div><p className="hint">Categories are derived from product records. Add a product and enter a new category to create a category. The quick-add above creates a draft product in that category.</p></section>; }

