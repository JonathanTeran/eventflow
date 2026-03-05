import { usePage } from '@inertiajs/react';

export function useActiveUrl() {
    const { url } = usePage();

    function isActive(href) {
        if (href === '/dashboard' || href === '/admin/dashboard') {
            return url === href;
        }
        return url.startsWith(href);
    }

    return { currentUrl: url, isActive };
}
