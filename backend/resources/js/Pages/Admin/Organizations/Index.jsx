import { useState, useCallback, useRef } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import Header from '@cloudscape-design/components/header';
import Table from '@cloudscape-design/components/table';
import Button from '@cloudscape-design/components/button';
import SpaceBetween from '@cloudscape-design/components/space-between';
import TextFilter from '@cloudscape-design/components/text-filter';
import Select from '@cloudscape-design/components/select';
import Pagination from '@cloudscape-design/components/pagination';
import Box from '@cloudscape-design/components/box';
import Link from '@cloudscape-design/components/link';
import StatusIndicator from '@cloudscape-design/components/status-indicator';
import ConfirmModal from '@/Components/ConfirmModal';
import { formatDate } from '@/utils/formatters';

const activeOptions = [
    { value: '', label: 'Todos los estados' },
    { value: '1', label: 'Activas' },
    { value: '0', label: 'Inactivas' },
];

export default function OrganizationsIndex({ organizations, filters }) {
    const [search, setSearch] = useState(filters?.search || '');
    const [activeFilter, setActiveFilter] = useState(
        activeOptions.find((o) => o.value === String(filters?.is_active ?? '')) || activeOptions[0]
    );
    const [confirmDelete, setConfirmDelete] = useState(null);
    const searchTimeout = useRef(null);

    const applyFilters = useCallback((newSearch, newActive) => {
        router.get(
            '/admin/organizations',
            {
                search: newSearch || undefined,
                is_active: newActive !== '' ? newActive : undefined,
            },
            { preserveState: true, replace: true }
        );
    }, []);

    function handleSearch(value) {
        setSearch(value);
        clearTimeout(searchTimeout.current);
        searchTimeout.current = setTimeout(() => applyFilters(value, activeFilter.value), 300);
    }

    function handleActiveChange(selected) {
        setActiveFilter(selected);
        applyFilters(search, selected.value);
    }

    function handlePageChange({ detail }) {
        router.get(
            '/admin/organizations',
            {
                search: search || undefined,
                is_active: activeFilter.value !== '' ? activeFilter.value : undefined,
                page: detail.currentPageIndex,
            },
            { preserveState: true }
        );
    }

    function toggleActive(org) {
        router.patch(`/admin/organizations/${org.id}/toggle-active`);
    }

    function impersonate(org) {
        router.post(`/admin/impersonate/${org.id}`);
    }

    function deleteOrganization() {
        router.delete(`/admin/organizations/${confirmDelete.id}`, {
            onSuccess: () => setConfirmDelete(null),
        });
    }

    return (
        <AdminLayout>
            <Head title="Organizaciones" />
            <SpaceBetween size="l">
                <Table
                    header={
                        <Header
                            variant="h1"
                            description="Gestiona todas las organizaciones de la plataforma."
                            actions={
                                <Button
                                    variant="primary"
                                    iconName="add-plus"
                                    onClick={() => router.visit('/admin/organizations/create')}
                                >
                                    Crear organización
                                </Button>
                            }
                        >
                            Organizaciones
                        </Header>
                    }
                    filter={
                        <SpaceBetween direction="horizontal" size="xs">
                            <TextFilter
                                filteringText={search}
                                filteringPlaceholder="Buscar por nombre, email o slug..."
                                onChange={({ detail }) => handleSearch(detail.filteringText)}
                            />
                            <Select
                                selectedOption={activeFilter}
                                onChange={({ detail }) => handleActiveChange(detail.selectedOption)}
                                options={activeOptions}
                            />
                        </SpaceBetween>
                    }
                    columnDefinitions={[
                        {
                            id: 'name',
                            header: 'Nombre',
                            cell: (item) => (
                                <SpaceBetween size="xxxs">
                                    <Link
                                        onFollow={(e) => {
                                            e.preventDefault();
                                            router.visit(`/admin/organizations/${item.id}`);
                                        }}
                                    >
                                        {item.name}
                                    </Link>
                                    <Box color="text-body-secondary" fontSize="body-s">
                                        {item.slug}
                                    </Box>
                                </SpaceBetween>
                            ),
                        },
                        {
                            id: 'owner',
                            header: 'Propietario (email)',
                            cell: (item) =>
                                item.owner?.email ?? item.users?.[0]?.email ?? '-',
                        },
                        {
                            id: 'events_count',
                            header: 'Eventos',
                            cell: (item) => item.events_count ?? 0,
                        },
                        {
                            id: 'is_active',
                            header: 'Estado',
                            cell: (item) =>
                                item.is_active ? (
                                    <StatusIndicator type="success">Activa</StatusIndicator>
                                ) : (
                                    <StatusIndicator type="stopped">Inactiva</StatusIndicator>
                                ),
                        },
                        {
                            id: 'created_at',
                            header: 'Creada',
                            cell: (item) => formatDate(item.created_at),
                        },
                        {
                            id: 'actions',
                            header: 'Acciones',
                            cell: (item) => (
                                <SpaceBetween direction="horizontal" size="xs">
                                    <Button
                                        variant="link"
                                        onClick={() =>
                                            router.visit(`/admin/organizations/${item.id}`)
                                        }
                                    >
                                        Ver
                                    </Button>
                                    <Button
                                        variant="link"
                                        onClick={() =>
                                            router.visit(`/admin/organizations/${item.id}/edit`)
                                        }
                                    >
                                        Editar
                                    </Button>
                                    <Button
                                        variant="link"
                                        onClick={() => toggleActive(item)}
                                    >
                                        {item.is_active ? 'Desactivar' : 'Activar'}
                                    </Button>
                                    {item.is_active && (
                                        <Button
                                            variant="link"
                                            onClick={() => impersonate(item)}
                                        >
                                            Impersonar
                                        </Button>
                                    )}
                                    <Button
                                        variant="link"
                                        onClick={() => setConfirmDelete(item)}
                                    >
                                        Eliminar
                                    </Button>
                                </SpaceBetween>
                            ),
                        },
                    ]}
                    items={organizations?.data || []}
                    pagination={
                        organizations?.last_page > 1 ? (
                            <Pagination
                                currentPageIndex={organizations.current_page}
                                pagesCount={organizations.last_page}
                                onChange={handlePageChange}
                            />
                        ) : null
                    }
                    empty={
                        <Box textAlign="center" padding={{ vertical: 'l' }}>
                            <SpaceBetween size="m">
                                <Box variant="h3">No hay organizaciones</Box>
                                <Box color="text-body-secondary">
                                    No se encontraron organizaciones con los filtros actuales.
                                </Box>
                                <Button
                                    variant="primary"
                                    onClick={() => router.visit('/admin/organizations/create')}
                                >
                                    Crear organización
                                </Button>
                            </SpaceBetween>
                        </Box>
                    }
                />
            </SpaceBetween>

            <ConfirmModal
                visible={!!confirmDelete}
                title="Eliminar organización"
                message={
                    confirmDelete
                        ? `¿Estás seguro de eliminar la organización '${confirmDelete.name}'? Esta acción no se puede deshacer.`
                        : ''
                }
                confirmText="Eliminar"
                danger
                onConfirm={deleteOrganization}
                onCancel={() => setConfirmDelete(null)}
            />
        </AdminLayout>
    );
}
