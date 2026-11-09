import { LayoutDashboard, ShoppingCart, ClipboardList, ChefHat, Package, Tags, Boxes, Wallet, Users, Store, ChartNoAxesCombined, Settings, QrCode } from 'lucide-react';
import type { AppPage } from '../features/auth/permissions';
export const navigation: {
    name: AppPage;
    icon: any;
    group: string;
}[] = [
    { name: 'Dashboard', icon: LayoutDashboard, group: 'OVERVIEW' },
    { name: 'POS Billing', icon: ShoppingCart, group: 'OPERATIONS' },
    { name: 'Orders', icon: ClipboardList, group: 'OPERATIONS' },
    { name: 'Kitchen / KOT', icon: ChefHat, group: 'OPERATIONS' },
    { name: 'Products', icon: Package, group: 'MANAGEMENT' },
    { name: 'Categories', icon: Tags, group: 'MANAGEMENT' },
    { name: 'Inventory', icon: Boxes, group: 'MANAGEMENT' },
    { name: 'Expenses', icon: Wallet, group: 'MANAGEMENT' },
    { name: 'Customers', icon: Users, group: 'MANAGEMENT' },
    { name: 'Staff & Users', icon: Users, group: 'MANAGEMENT' },
    { name: 'Branch Management', icon: Store, group: 'BUSINESS' },
    { name: 'Reports', icon: ChartNoAxesCombined, group: 'BUSINESS' },
    { name: 'QR Ordering', icon: QrCode, group: 'OPERATIONS' },
    { name: 'Settings', icon: Settings, group: 'SYSTEM' },
];

