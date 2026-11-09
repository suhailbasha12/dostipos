import type { Role } from '../../types';
export type StaffUser = {
    id: number;
    name: string;
    email: string;
    password: string;
    role: Role;
    branchId: number;
    status: 'Active' | 'Inactive';
    createdBy?: number | null;
};
export const demoUsers: StaffUser[] = [
    { id: 1, name: 'Cafe Owner', email: 'owner@dosticafe.com', password: '123456', role: 'Owner', branchId: 1, status: 'Active', createdBy: null },
    { id: 2, name: 'Branch Manager', email: 'manager@dosticafe.com', password: '123456', role: 'Branch Manager', branchId: 1, status: 'Active', createdBy: 1 },
    { id: 3, name: 'Main Cashier', email: 'cashier@dosticafe.com', password: '123456', role: 'Cashier', branchId: 1, status: 'Active', createdBy: 1 },
    { id: 4, name: 'Kitchen Chef', email: 'kitchen@dosticafe.com', password: '123456', role: 'Kitchen Staff', branchId: 1, status: 'Active', createdBy: 1 },
];
export const normalizeUsers = (saved: Partial<StaffUser>[] | null | undefined): StaffUser[] => {
    const merged = [...demoUsers];
    (saved || []).forEach((user) => {
        const index = merged.findIndex((item) => item.email.toLowerCase() === String(user.email || '').toLowerCase());
        const normalized = { ...user, password: user.password || '123456' } as StaffUser;
        if (index >= 0)
            merged[index] = { ...merged[index], ...normalized };
        else
            merged.push(normalized);
    });
    const seenIds = new Set<number>();
    let nextId = Math.max(0, ...merged.map((user) => Number(user.id) || 0)) + 1;
    return merged.map((user) => {
        if (seenIds.has(user.id)) {
            const normalized = { ...user, id: nextId++ };
            seenIds.add(normalized.id);
            return normalized;
        }
        seenIds.add(user.id);
        return user;
    });
};

