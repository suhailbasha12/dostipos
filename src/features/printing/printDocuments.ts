import type { Branch, Order } from '../../types';
import { escapeHtml, formatDateTime, money } from '../../shared/utils/format';
type PaperSize = '58mm' | '80mm' | 'A4';
const paperConfig: Record<PaperSize, {
    page: string;
    content: string;
}> = {
    '58mm': { page: '58mm auto', content: '52mm' },
    '80mm': { page: '80mm auto', content: '74mm' },
    A4: { page: 'A4', content: '190mm' },
};
const openPrintWindow = (title: string, body: string, size: PaperSize = '80mm') => {
    const printWindow = window.open('', '_blank', 'width=460,height=720');
    if (!printWindow)
        return false;
    printWindow.document.open();
    printWindow.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(title)}</title><style>
    @page{size:${paperConfig[size].page};margin:2mm}
    *{box-sizing:border-box}body{font-family:Arial,sans-serif;width:${paperConfig[size].content};max-width:100%;margin:0 auto;color:#171717;font-size:11px;line-height:1.4}
    h1,h2,p{margin:3px 0;text-align:center}.brand{font-size:19px;font-weight:800;letter-spacing:.5px}.muted{text-align:center;color:#555;font-size:9px}
    .rule{border:0;border-top:1px dashed #555;margin:8px 0}.row{display:flex;justify-content:space-between;gap:8px;margin:5px 0}.row span:last-child{text-align:right;white-space:nowrap}.items{margin:8px 0}.item{display:flex;justify-content:space-between;gap:8px;padding:4px 0}.item-name{flex:1}.total{font-size:15px;font-weight:800}.center{text-align:center}.note{font-size:9px;color:#444}.kot-item{padding:8px 0;border-bottom:1px dashed #555;font-size:14px}.kot-item strong{font-size:15px}
    @media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
  </style></head><body>${body}<script>window.onload=()=>{window.focus();window.print()}</script></body></html>`);
    printWindow.document.close();
    return true;
};
export const printCustomerBill = (order: Order, branch?: Branch, size: PaperSize = '80mm') => {
    const items = order.items.map((item) => `<div class="item"><span class="item-name">${escapeHtml(item.product.name)} × ${item.qty}</span><span>${money(item.product.price * item.qty)}</span></div>`).join('');
    const body = `<div class="brand">DOSTI CAFE</div><p class="muted">${escapeHtml(branch?.name || 'Main Branch')}</p><p class="muted">${escapeHtml(branch?.address || '')}</p>${branch?.phone ? `<p class="muted">${escapeHtml(branch.phone)}</p>` : ''}<hr class="rule"><div class="row"><span>Bill No.</span><strong>${escapeHtml(order.id)}</strong></div><div class="row"><span>Date</span><span>${escapeHtml(formatDateTime(order.date))}</span></div><div class="row"><span>Order type</span><span>${escapeHtml(order.type)}${order.table ? ` · Table ${escapeHtml(order.table)}` : ''}</span></div><div class="row"><span>Customer</span><span>${escapeHtml(order.customer)}</span></div><hr class="rule"><div class="items">${items}</div><hr class="rule"><div class="row"><span>Subtotal</span><span>${money(order.subtotal)}</span></div><div class="row"><span>Discount</span><span>${money(order.discount)}</span></div><div class="row total"><span>TOTAL</span><span>${money(order.total)}</span></div><div class="row"><span>Payment</span><strong>${escapeHtml(order.payment)}</strong></div><hr class="rule"><p class="center"><strong>Thank you for visiting!</strong></p><p class="muted">Please visit again ☕</p>`;
    return openPrintWindow(`Dosti Cafe Bill ${order.id}`, body, size);
};
export const printKitchenTicket = (order: Order, branch?: Branch, size: PaperSize = '80mm') => {
    const items = order.items.map((item) => `<div class="kot-item"><strong>${item.qty} × ${escapeHtml(item.product.name)}</strong>${item.note ? `<div class="note">Note: ${escapeHtml(item.note)}</div>` : ''}</div>`).join('');
    const body = `<h2>KITCHEN ORDER TICKET</h2><p class="muted">${escapeHtml(branch?.name || 'Dosti Cafe')}</p><hr class="rule"><div class="row"><strong>KOT: ${escapeHtml(order.id)}</strong><strong>${escapeHtml(order.type)}</strong></div><div class="row"><span>${escapeHtml(formatDateTime(order.date))}</span><strong>${order.table ? `TABLE ${escapeHtml(order.table)}` : 'TAKEAWAY'}</strong></div><hr class="rule">${items}<hr class="rule"><p class="center"><strong>PREPARE ORDER</strong></p>`;
    return openPrintWindow(`KOT ${order.id}`, body, size);
};

