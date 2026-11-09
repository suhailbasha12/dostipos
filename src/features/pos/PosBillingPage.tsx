import type { Dispatch, SetStateAction } from 'react';
import { ArrowUpRight, Minus, Plus, Printer, Search, ShoppingCart, Trash2 } from 'lucide-react';
import type { CartItem, Product } from '../../types';
import { money } from '../../shared/utils/format';
type Props = {
    categories: string[];
    visibleProducts: Product[];
    query: string;
    setQuery: (value: string) => void;
    category: string;
    setCategory: (value: string) => void;
    cart: CartItem[];
    setCart: Dispatch<SetStateAction<CartItem[]>>;
    orderType: 'Dine-in' | 'Takeaway';
    setOrderType: (value: 'Dine-in' | 'Takeaway') => void;
    table: string;
    setTable: (value: string) => void;
    customer: string;
    setCustomer: (value: string) => void;
    customers: {
        id: number;
        name: string;
    }[];
    kotEnabled: boolean;
    setKotEnabled: (value: boolean) => void;
    subtotal: number;
    discount: number;
    setDiscount: (value: number) => void;
    total: number;
    addToCart: (product: Product) => void;
    changeQty: (productId: number, difference: number) => void;
    onProceedPayment: () => void;
};
export default function PosBillingPage(props: Props) {
    const { categories, visibleProducts, query, setQuery, category, setCategory, cart, setCart, orderType, setOrderType, table, setTable, customer, setCustomer, customers, kotEnabled, setKotEnabled, subtotal, discount, setDiscount, total, addToCart, changeQty, onProceedPayment } = props;
    return <div className="pos-layout">
    <section className="pos-products">
      <div className="pos-heading">
        <div><h1>New Order</h1><p className="muted">Select products to add to the bill</p></div>
        <div className="searchbox"><Search size={16}/><input placeholder="Search products..." value={query} onChange={event => setQuery(event.target.value)}/></div>
      </div>
      <div className="category-row">{categories.map(item => <button key={item} className={`category-chip ${category === item ? 'selected' : ''}`} onClick={() => setCategory(item)}>{item}</button>)}</div>
      <div className="product-grid">{visibleProducts.map(product => <button key={product.id} className={`product-tile ${product.stock <= 0 ? 'disabled' : ''}`} disabled={product.stock <= 0} onClick={() => addToCart(product)}><span className="product-emoji">{product.emoji}</span><b>{product.name}</b><span className="product-price">{money(product.price)}</span><small>{product.stock} available</small></button>)}</div>
    </section>
    <section className="cart-panel">
      <div className="cart-title"><div><h3>Current Order</h3><small className="muted">{cart.length} item types</small></div><button className="icon-btn" onClick={() => setCart([])} title="Clear cart"><Trash2 size={17}/></button></div>
      <div className="order-options">
        <div className="segmented"><button className={orderType === 'Takeaway' ? 'chosen' : ''} onClick={() => setOrderType('Takeaway')}>Takeaway</button><button className={orderType === 'Dine-in' ? 'chosen' : ''} onClick={() => setOrderType('Dine-in')}>Dine-in</button></div>
        {orderType === 'Dine-in' && <select value={table} onChange={event => setTable(event.target.value)}><option value="1">Table 1</option><option value="2">Table 2</option><option value="3">Table 3</option><option value="4">Table 4</option><option value="5">Table 5</option></select>}
        <select value={customer} onChange={event => setCustomer(event.target.value)}>{customers.map(item => <option key={item.id} value={item.name}>{item.name}</option>)}</select>
      </div>
      <div className="cart-items">{cart.length === 0 ? <div className="empty-state"><ShoppingCart size={32}/><b>Your cart is empty</b><span>Add products to start an order</span></div> : cart.map(item => <div className="cart-item" key={item.product.id}>
        <div className="cart-item-emoji">{item.product.emoji}</div><div className="cart-item-info"><b>{item.product.name}</b><small>{money(item.product.price)} each</small><input className="note-input" placeholder="Add item note..." value={item.note} onChange={event => setCart(old => old.map(current => current.product.id === item.product.id ? { ...current, note: event.target.value } : current))}/></div>
        <div className="qty-control"><button onClick={() => changeQty(item.product.id, -1)} aria-label="Decrease quantity"><Minus size={12}/></button><b>{item.qty}</b><button onClick={() => changeQty(item.product.id, 1)} aria-label="Increase quantity"><Plus size={12}/></button></div><strong>{money(item.product.price * item.qty)}</strong>
      </div>)}</div>
      <div className="kot-toggle"><label><input type="checkbox" checked={kotEnabled} onChange={event => setKotEnabled(event.target.checked)}/> Send KOT to kitchen</label><small>Optional for every order</small></div>
      <div className="bill-summary"><div><span>Subtotal</span><b>{money(subtotal)}</b></div><div className="discount-row"><span>Discount (₹)</span><input type="number" min="0" max={subtotal} value={discount} onChange={event => setDiscount(Math.min(subtotal, Math.max(0, Number(event.target.value))))}/></div><div className="grand-total"><span>Total</span><strong>{money(total)}</strong></div><button className="btn primary full" disabled={!cart.length} onClick={onProceedPayment}>Proceed to Payment <ArrowUpRight size={16}/></button><small className="print-hint"><Printer size={12}/> Customer bill is generated and sent to print only after payment confirmation.</small></div>
    </section>
  </div>;
}

