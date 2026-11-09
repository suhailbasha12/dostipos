import type { Role } from '../../types';
export type AppPage = 'Dashboard' | 'POS Billing' | 'Orders' | 'Kitchen / KOT' | 'Products' | 'Categories' | 'Inventory' | 'Expenses' | 'Customers' | 'Staff & Users' | 'Branch Management' | 'Reports' | 'Settings' | 'QR Ordering';
const pageAccess: Record<Role, AppPage[]> = {
    Owner: ['Dashboard', 'POS Billing', 'Orders', 'Kitchen / KOT', 'Products', 'Categories', 'Inventory', 'Expenses', 'Customers', 'Staff & Users', 'Branch Management', 'Reports', 'Settings', 'QR Ordering'],
    'Branch Manager': ['Dashboard', 'POS Billing', 'Orders', 'Kitchen / KOT', 'Products', 'Categories', 'Inventory', 'Expenses', 'Customers', 'Staff & Users', 'Reports', 'Settings', 'QR Ordering'],
    Cashier: ['POS Billing', 'Orders'],
    'Kitchen Staff': ['Kitchen / KOT'],
};
export const canAccessPage = (role: Role, page: AppPage) => pageAccess[role]?.includes(page) ?? false;
export const canCreateRole = (actor: Role, target: Role) => {
    if (actor === 'Owner')
        return target !== 'Owner';
    if (actor === 'Branch Manager')
        return target === 'Cashier' || target === 'Kitchen Staff';
    return false;
};
export const rolesCreatableBy = (actor: Role): Role[] => {
    if (actor === 'Owner')
        return ['Branch Manager', 'Cashier', 'Kitchen Staff'];
    if (actor === 'Branch Manager')
        return ['Cashier', 'Kitchen Staff'];
    return [];
};
export const canManageStaff = (role: Role) => role === 'Owner' || role === 'Branch Manager';

