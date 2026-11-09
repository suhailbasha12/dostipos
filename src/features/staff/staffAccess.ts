import type { Role } from '../../types';
import { canCreateRole } from '../auth/permissions';
import type { StaffUser } from '../auth/demoUsers';
export type NewStaffInput = {
    name: string;
    email: string;
    password?: string;
    role: Role;
    branchId?: number;
};
export const getVisibleStaff = (users: StaffUser[], actorRole: Role, assignedBranchId: number) => actorRole === 'Owner' ? users : users.filter(user => user.branchId === assignedBranchId && user.role !== 'Owner' && user.role !== 'Branch Manager');
export const createStaffAccount = (existing: StaffUser[], input: NewStaffInput, actorRole: Role, actorBranchId: number, actorId: number | null): StaffUser => {
    const name = input.name.trim();
    const email = input.email.trim().toLowerCase();
    if (!name)
        throw new Error('Staff name is required');
    if (!email || !email.includes('@'))
        throw new Error('Enter a valid email address');
    if (existing.some(user => user.email.toLowerCase() === email))
        throw new Error('This email already has an account');
    if (!canCreateRole(actorRole, input.role))
        throw new Error('You cannot grant this role');
    return {
        id: Math.max(0, ...existing.map(user => user.id)) + 1,
        name,
        email,
        password: input.password?.trim() || '123456',
        role: input.role,
        branchId: actorRole === 'Owner' ? Number(input.branchId || actorBranchId) : actorBranchId,
        status: 'Active',
        createdBy: actorId,
    };
};

