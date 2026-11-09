import { ChefHat, Printer } from 'lucide-react';
import type { Order } from '../../types';
import { formatDateTime, money } from '../utils/format';
type Props = {
    orders: Order[];
    onPrint: (order: Order) => void;
    onKot: (order: Order) => void;
    onStatus?: (id: string, status: Order['status']) => void;
    onVerifyPayment?: (order: Order) => void;
};
export default function OrdersTable({ orders, onPrint, onKot, onStatus, onVerifyPayment }: Props) {
    return <div className="table-wrap"><table><thead><tr><th>Order</th><th>Date & time</th><th>Type</th><th>Amount</th><th>Payment</th><th>Status</th><th>Actions</th></tr></thead><tbody>{orders.map(order => <tr key={order.id}><td><b>{order.id}</b><small className="table-sub">{order.items.length} item types</small></td><td>{formatDateTime(order.date)}</td><td>{order.type}{order.table ? ` · ${order.table}` : ''}</td><td><b>{money(order.total)}</b></td><td>{order.payment}<small className="table-sub">{order.paymentStatus || (order.status === 'Completed' ? 'Paid' : '')}</small></td><td><span className={`status ${order.status === 'Completed' ? 'good' : order.status === 'Cancelled' ? 'bad' : order.status === 'Ready' ? 'info' : 'warn'}`}>{order.status}</span></td><td><button className="icon-btn" title="Print bill" onClick={() => onPrint(order)}><Printer size={15}/></button>{order.kot && <button className="icon-btn" title="Print KOT" onClick={() => onKot(order)}><ChefHat size={15}/></button>}{order.source === 'QR' && order.paymentStatus !== 'Paid – manually verified' && <small className="table-sub">{order.paymentStatus?.includes('Customer marked paid') ? 'Payment submitted' : 'Waiting for customer payment'}</small>}{onVerifyPayment && order.source === 'QR' && order.paymentStatus?.includes('Customer marked paid') && <button className="btn primary small" onClick={() => onVerifyPayment(order)}>Verify UPI & Accept</button>}{onStatus && order.status === 'Preparing' && <button className="btn light small" onClick={() => onStatus(order.id, 'Ready')}>Ready</button>}</td></tr>)}</tbody></table>{orders.length === 0 && <div className="empty-state">No orders found</div>}</div>;
}

