import { useState } from 'react';
import { router, Link } from '@inertiajs/react';
import AppLayout from '@cloudscape-design/components/app-layout';
import SideNavigation from '@cloudscape-design/components/side-navigation';
import TopNavigation from '@cloudscape-design/components/top-navigation';
import { useAuth } from '@/hooks/useAuth';
import { useActiveUrl } from '@/hooks/useActiveUrl';
import FlashNotifications from '@/Components/FlashNotifications';
import ImpersonationBanner from '@/Components/ImpersonationBanner';

export default function AuthenticatedLayout({ children }) {
    const { user, organization, isSuperAdmin } = useAuth();
    const { isActive } = useActiveUrl();
    const [navOpen, setNavOpen] = useState(true);

    const navItems = [
        { type: 'link', text: 'Dashboard', href: '/dashboard' },
        { type: 'link', text: 'Eventos', href: '/events' },
        { type: 'link', text: 'Reportes', href: '/reports' },
        { type: 'link', text: 'Organización', href: '/organization' },
    ];

    function handleNavFollow(e) {
        e.preventDefault();
        router.visit(e.detail.href);
    }

    function logout() {
        router.post('/logout');
    }

    const userMenuItems = [
        ...(isSuperAdmin
            ? [{ id: 'admin', text: 'Panel Admin', href: '/admin/dashboard' }]
            : []),
        { id: 'logout', text: 'Cerrar sesión' },
    ];

    function handleUtilityClick(e) {
        const { id, href } = e.detail;
        if (id === 'admin' && href) {
            e.preventDefault();
            router.visit(href);
        } else if (id === 'logout') {
            logout();
        }
    }

    const activeHref = navItems.find((i) => isActive(i.href))?.href || '/dashboard';

    return (
        <>
            <ImpersonationBanner />
            <TopNavigation
                identity={{
                    href: '/dashboard',
                    title: 'BuilderApp',
                    onFollow: (e) => {
                        e.preventDefault();
                        router.visit('/dashboard');
                    },
                }}
                utilities={[
                    {
                        type: 'menu-dropdown',
                        text: user ? `${user.first_name} ${user.last_name}` : '',
                        description: user?.email || '',
                        iconName: 'user-profile',
                        items: userMenuItems,
                        onItemClick: handleUtilityClick,
                    },
                ]}
            />
            <AppLayout
                navigation={
                    <SideNavigation
                        header={{
                            text: organization?.name || 'BuilderApp',
                            href: '/dashboard',
                        }}
                        activeHref={activeHref}
                        items={navItems}
                        onFollow={handleNavFollow}
                    />
                }
                navigationOpen={navOpen}
                onNavigationChange={({ detail }) => setNavOpen(detail.open)}
                toolsHide={true}
                notifications={<FlashNotifications />}
                content={children}
                headerSelector="#top-nav"
            />
        </>
    );
}
