import { usePage } from '@inertiajs/react';

export function useAuth() {
    const { auth, impersonation } = usePage().props;
    const user = auth?.user;
    const organization = user?.organization;
    const isSuperAdmin = user?.is_super_admin ?? false;

    return { user, organization, isSuperAdmin, impersonation };
}
