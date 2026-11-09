export type Role = 'Owner' | 'Branch Manager' | 'Cashier' | 'Kitchen Staff';
export type Product = {
    id: number;
    name: string;
    category: string;
    price: number;
    cost: number;
    stock: number;
    minStock: number;
    type: 'Common' | 'Branch-specific';
    active: boolean;
    emoji: string;
};
export type CartItem = {
    product: Product;
    qty: number;
    note: string;
};
export type Order = {
    id: string;
    date: string;
    items: CartItem[];
    total: number;
    subtotal: number;
    discount: number;
    type: 'Dine-in' | 'Takeaway';
    table?: string;
    payment: 'Cash' | 'UPI' | 'Card' | 'Split';
    status: 'Pending' | 'Preparing' | 'Ready' | 'Completed' | 'Cancelled';
    kot: boolean;
    customer: string;
    branchId: number;
    paymentStatus?: string;
    phone?: string;
    source?: 'POS' | 'QR';
};
export type Branch = {
    id: number;
    name: string;
    code: string;
    address: string;
    phone: string;
    active: boolean;
};

