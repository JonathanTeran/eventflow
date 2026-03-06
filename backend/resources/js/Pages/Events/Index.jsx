import { useState, useCallback, useRef } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Cards from '@cloudscape-design/components/cards';
import Header from '@cloudscape-design/components/header';
import Button from '@cloudscape-design/components/button';
import SpaceBetween from '@cloudscape-design/components/space-between';
import TextFilter from '@cloudscape-design/components/text-filter';
import Select from '@cloudscape-design/components/select';
import Pagination from '@cloudscape-design/components/pagination';
import Box from '@cloudscape-design/components/box';
import Link from '@cloudscape-design/components/link';
import StatusBadge from '@/Components/StatusBadge';
import { formatEventDateRange } from '@/utils/formatters';

const statusOptions = [
    { value: '', label: 'Todos los estados' },
    { value: 'draft', label: 'Borrador' },
    { value: 'published', label: 'Publicado' },
    { value: 'active', label: 'Activo' },
    { value: 'completed', label: 'Completado' },
    { value: 'cancelled', label: 'Cancelado' },
];

export default function EventsIndex({ events, filters, isSuperAdmin }) {
    const [search, setSearch] = useState(filters?.search || '');
    const [status, setStatus] = useState(
        statusOptions.find((o) => o.value === (filters?.status || '')) || statusOptions[0]
    );

    const applyFilters = useCallback(
        (newSearch, newStatus) => {
            router.get(
                '/events',
                {
                    search: newSearch || undefined,
                    status: newStatus || undefined,
                },
                { preserveState: true, replace: true }
            );
        },
        []
    );

    const searchTimeout = useRef(null);
    function handleSearch(value) {
        setSearch(value);
        clearTimeout(searchTimeout.current);
        searchTimeout.current = setTimeout(() => applyFilters(value, status.value), 300);
    }

    function handleStatusChange(selected) {
        setStatus(selected);
        applyFilters(search, selected.value);
    }

    function handlePageChange({ detail }) {
        const url = events.links?.find((_, i) => i === detail.currentPageIndex)?.url;
        if (url) router.visit(url);
        else {
            router.get('/events', {
                search: search || undefined,
                status: status.value || undefined,
                page: detail.currentPageIndex,
            }, { preserveState: true });
        }
    }

    return (
        <AuthenticatedLayout>
            <Head title="Eventos" />
            <Cards
                header={
                    <Header
                        variant="h1"
                        description={isSuperAdmin ? 'Gestiona todos los eventos de la plataforma.' : 'Gestiona todos los eventos de tu organización.'}
                        actions={
                            <Button variant="primary" iconName="add-plus" onClick={() => router.visit('/events/create')}>
                                Crear evento
                            </Button>
                        }
                    >
                        Eventos
                    </Header>
                }
                cardDefinition={{
                    header: (item) => (
                        <Link
                            fontSize="heading-m"
                            onFollow={(e) => {
                                e.preventDefault();
                                router.visit(`/events/${item.id}`);
                            }}
                        >
                            {item.name}
                        </Link>
                    ),
                    sections: [
                        ...(isSuperAdmin ? [{
                            id: 'organization',
                            header: 'Organización',
                            content: (item) => item.organization?.name || '-',
                        }] : []),
                        {
                            id: 'status',
                            header: 'Estado',
                            content: (item) => <StatusBadge status={item.status} />,
                        },
                        {
                            id: 'date',
                            header: 'Fecha',
                            content: (item) =>
                                formatEventDateRange(item.date_start, item.date_end),
                        },
                        {
                            id: 'location',
                            header: 'Ubicación',
                            content: (item) => item.venue || item.location || '-',
                        },
                        {
                            id: 'capacity',
                            header: 'Capacidad',
                            content: (item) => (item.capacity ? `${item.capacity} personas` : '-'),
                        },
                    ],
                }}
                items={events.data || []}
                filter={
                    <SpaceBetween direction="horizontal" size="xs">
                        <TextFilter
                            filteringText={search}
                            filteringPlaceholder="Buscar eventos..."
                            onChange={({ detail }) => handleSearch(detail.filteringText)}
                        />
                        <Select
                            selectedOption={status}
                            onChange={({ detail }) => handleStatusChange(detail.selectedOption)}
                            options={statusOptions}
                        />
                    </SpaceBetween>
                }
                pagination={
                    events.last_page > 1 ? (
                        <Pagination
                            currentPageIndex={events.current_page}
                            pagesCount={events.last_page}
                            onChange={handlePageChange}
                        />
                    ) : null
                }
                empty={
                    <Box textAlign="center" padding={{ vertical: 'l' }}>
                        <SpaceBetween size="m">
                            <Box variant="h3">No hay eventos</Box>
                            <Box variant="p" color="text-body-secondary">
                                Crea tu primer evento para empezar a gestionar participantes, speakers y sponsors.
                            </Box>
                            <Button variant="primary" iconName="add-plus" onClick={() => router.visit('/events/create')}>
                                Crear evento
                            </Button>
                        </SpaceBetween>
                    </Box>
                }
            />
        </AuthenticatedLayout>
    );
}
