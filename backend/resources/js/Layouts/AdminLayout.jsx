import { useState } from 'react';
import { router } from '@inertiajs/react';
import AppLayout from '@cloudscape-design/components/app-layout';
import SideNavigation from '@cloudscape-design/components/side-navigation';
import TopNavigation from '@cloudscape-design/components/top-navigation';
import Badge from '@cloudscape-design/components/badge';
import { useAuth } from '@/hooks/useAuth';
import { useActiveUrl } from '@/hooks/useActiveUrl';
import FlashNotifications from '@/Components/FlashNotifications';

export default function AdminLayout({ children }) {
    const { user } = useAuth();
    const { isActive } = useActiveUrl();
    const [navOpen, setNavOpen] = useState(true);

    const navItems = [
        { type: 'link', text: 'Dashboard', href: '/admin/dashboard' },
        { type: 'link', text: 'Organizaciones', href: '/admin/organizations' },
        { type: 'link', text: 'Usuarios', href: '/admin/users' },
        { type: 'link', text: 'Eventos', href: '/events' },
        { type: 'divider' },
        { type: 'link', text: 'Volver a la app', href: '/dashboard' },
    ];

    function handleNavFollow(e) {
        e.preventDefault();
        router.visit(e.detail.href);
    }

    function logout() {
        router.post('/logout');
    }

    function handleUtilityClick(e) {
        if (e.detail.id === 'logout') {
            logout();
        }
    }

    const activeHref = navItems.find((i) => i.href && isActive(i.href))?.href || '/admin/dashboard';

    return (
        <>
            <TopNavigation
                identity={{
                    href: '/admin/dashboard',
                    title: 'BuilderApp',
                    onFollow: (e) => {
                        e.preventDefault();
                        router.visit('/admin/dashboard');
                    },
                }}
                utilities={[
                    {
                        type: 'menu-dropdown',
                        text: user ? `${user.first_name} ${user.last_name}` : '',
                        description: user?.email || '',
                        iconName: 'user-profile',
                        items: [{ id: 'logout', text: 'Cerrar sesión' }],
                        onItemClick: handleUtilityClick,
                    },
                ]}
            />
            <AppLayout
                navigation={
                    <SideNavigation
                        header={{
                            text: 'Admin Panel',
                            href: '/admin/dashboard',
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
