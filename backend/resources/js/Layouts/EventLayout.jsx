import { router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import BreadcrumbGroup from '@cloudscape-design/components/breadcrumb-group';
import Tabs from '@cloudscape-design/components/tabs';
import Header from '@cloudscape-design/components/header';
import SpaceBetween from '@cloudscape-design/components/space-between';
import StatusBadge from '@/Components/StatusBadge';
import { formatDateLong } from '@/utils/formatters';

export default function EventLayout({ event, actions, children }) {
    const { url } = usePage();

    const tabItems = [
        { id: 'general', label: 'General', href: `/events/${event.id}` },
        { id: 'participants', label: 'Participantes', href: `/events/${event.id}/participants` },
        { id: 'speakers', label: 'Speakers', href: `/events/${event.id}/speakers` },
        { id: 'sponsors', label: 'Sponsors', href: `/events/${event.id}/sponsors` },
        { id: 'communities', label: 'Comunidades', href: `/events/${event.id}/communities` },
        { id: 'agenda', label: 'Agenda', href: `/events/${event.id}/agenda` },
        { id: 'surveys', label: 'Encuestas', href: `/events/${event.id}/surveys` },
        { id: 'scanner', label: 'Scanner', href: `/events/${event.id}/scanner` },
    ];

    function getActiveTab() {
        const cleanUrl = url.split('?')[0];
        for (const tab of tabItems) {
            if (tab.id === 'general') {
                if (cleanUrl === tab.href || cleanUrl === tab.href + '/') return tab.id;
            } else {
                if (cleanUrl.startsWith(tab.href)) return tab.id;
            }
        }
        return 'general';
    }

    function handleTabChange({ detail }) {
        const tab = tabItems.find((t) => t.id === detail.activeTabId);
        if (tab) router.visit(tab.href);
    }

    const description = [
        formatDateLong(event.date_start),
        event.location,
        event.venue,
    ].filter(Boolean).join(' \u00b7 ');

    return (
        <AuthenticatedLayout>
            <SpaceBetween size="l">
                <BreadcrumbGroup
                    items={[
                        { text: 'Eventos', href: '/events' },
                        { text: event.name, href: `/events/${event.id}` },
                    ]}
                    onFollow={(e) => {
                        e.preventDefault();
                        router.visit(e.detail.href);
                    }}
                />
                <Header
                    variant="h1"
                    description={description}
                    info={<StatusBadge status={event.status} />}
                    actions={actions}
                >
                    {event.name}
                </Header>
                <Tabs
                    activeTabId={getActiveTab()}
                    onChange={handleTabChange}
                    tabs={tabItems}
                />
                {children}
            </SpaceBetween>
        </AuthenticatedLayout>
    );
}
