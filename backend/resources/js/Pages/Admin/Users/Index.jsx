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
import Badge from '@cloudscape-design/components/badge';
import ConfirmModal from '@/Components/ConfirmModal';
import { formatDate } from '@/utils/formatters';

const roleColors = {
    super_admin: 'red',
    org_admin: 'blue',
    collaborator: 'grey',
    participant: 'green',
    speaker: 'blue',
    sponsor: 'red',
};

export default function UsersIndex({ users, filters, organizations, roles }) {
    const [search, setSearch] = useState(filters?.search || '');
    const [roleFilter, setRoleFilter] = useState(null);
    const [orgFilter, setOrgFilter] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(null);
    const searchTimeout = useRef(null);

    const roleOptions = [
        { value: '', label: 'Todos los roles' },
        ...(roles || []).map((r) => ({ value: r, label: r })),
    ];

    const orgOptions = [
        { value: '', label: 'Todas las organizaciones' },
        ...(organizations || []).map((o) => ({ value: o.id, label: o.name })),
    ];

    // Initialize from filters
    const initialRole = roleOptions.find((o) => o.value === (filters?.role || '')) || roleOptions[0];
    const initialOrg =
        orgOptions.find((o) => o.value === (filters?.organization_id || '')) || orgOptions[0];

    const [selectedRole, setSelectedRole] = useState(initialRole);
    const [selectedOrg, setSelectedOrg] = useState(initialOrg);

    const applyFilters = useCallback((newSearch, newRole, newOrg) => {
        router.get(
            '/admin/users',
            {
                search: newSearch || undefined,
                role: newRole || undefined,
                organization_id: newOrg || undefined,
            },
            { preserveState: true, replace: true }
        );
    }, []);

    function handleSearch(value) {
        setSearch(value);
        clearTimeout(searchTimeout.current);
        searchTimeout.current = setTimeout(
            () => applyFilters(value, selectedRole.value, selectedOrg.value),
            300
        );
    }

    function handleRoleChange(selected) {
        setSelectedRole(selected);
        applyFilters(search, selected.value, selectedOrg.value);
    }

    function handleOrgChange(selected) {
        setSelectedOrg(selected);
        applyFilters(search, selectedRole.value, selected.value);
    }

    function handlePageChange({ detail }) {
        router.get(
            '/admin/users',
            {
                search: search || undefined,
                role: selectedRole.value || undefined,
                organization_id: selectedOrg.value || undefined,
                page: detail.currentPageIndex,
            },
            { preserveState: true }
        );
    }

    function deleteUser() {
        router.delete(`/admin/users/${confirmDelete.id}`, {
            onSuccess: () => setConfirmDelete(null),
        });
    }

    return (
        <AdminLayout>
            <Head title="Usuarios" />
            <SpaceBetween size="l">
                <Table
                    header={
                        <Header
                            variant="h1"
                            description="Gestiona todos los usuarios de la plataforma."
                            actions={
                                <Button
                                    variant="primary"
                                    iconName="add-plus"
                                    onClick={() => router.visit('/admin/users/create')}
                                >
                                    Crear usuario
                                </Button>
                            }
                        >
                            Usuarios
                        </Header>
                    }
                    filter={
                        <SpaceBetween direction="horizontal" size="xs">
                            <TextFilter
                                filteringText={search}
                                filteringPlaceholder="Buscar por nombre o email..."
                                onChange={({ detail }) => handleSearch(detail.filteringText)}
                            />
                            <Select
                                selectedOption={selectedRole}
                                onChange={({ detail }) => handleRoleChange(detail.selectedOption)}
                                options={roleOptions}
                            />
                            <Select
                                selectedOption={selectedOrg}
                                onChange={({ detail }) => handleOrgChange(detail.selectedOption)}
                                options={orgOptions}
                            />
                        </SpaceBetween>
                    }
                    columnDefinitions={[
                        {
                            id: 'name',
                            header: 'Nombre',
                            cell: (item) => (
                                <SpaceBetween size="xxxs">
                                    <Box fontWeight="bold">
                                        {item.first_name} {item.last_name}
                                    </Box>
                                    <Box color="text-body-secondary" fontSize="body-s">
                                        {item.email}
                                    </Box>
                                </SpaceBetween>
                            ),
                        },
                        {
                            id: 'role',
                            header: 'Rol',
                            cell: (item) => {
                                const roleName = item.roles?.[0]?.name;
                                return roleName ? (
                                    <Badge color={roleColors[roleName] ?? 'grey'}>
                                        {roleName}
                                    </Badge>
                                ) : (
                                    <Box color="text-body-secondary">Sin rol</Box>
                                );
                            },
                        },
                        {
                            id: 'organization',
                            header: 'Organización',
                            cell: (item) => item.organization?.name ?? (
                                <Box color="text-body-secondary">Sin organización</Box>
                            ),
                        },
                        {
                            id: 'created_at',
                            header: 'Creado',
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
                                            router.visit(`/admin/users/${item.id}/edit`)
                                        }
                                    >
                                        Editar
                                    </Button>
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
                    items={users?.data || []}
                    pagination={
                        users?.last_page > 1 ? (
                            <Pagination
                                currentPageIndex={users.current_page}
                                pagesCount={users.last_page}
                                onChange={handlePageChange}
                            />
                        ) : null
                    }
                    empty={
                        <Box textAlign="center" padding={{ vertical: 'l' }}>
                            <SpaceBetween size="m">
                                <Box variant="h3">No hay usuarios</Box>
                                <Box color="text-body-secondary">
                                    No se encontraron usuarios con los filtros actuales.
                                </Box>
                                <Button
                                    variant="primary"
                                    onClick={() => router.visit('/admin/users/create')}
                                >
                                    Crear usuario
                                </Button>
                            </SpaceBetween>
                        </Box>
                    }
                />
            </SpaceBetween>

            <ConfirmModal
                visible={!!confirmDelete}
                title="Eliminar usuario"
                message={
                    confirmDelete
                        ? `¿Estás seguro de eliminar al usuario '${confirmDelete.first_name} ${confirmDelete.last_name}'? Esta acción no se puede deshacer.`
                        : ''
                }
                confirmText="Eliminar"
                danger
                onConfirm={deleteUser}
                onCancel={() => setConfirmDelete(null)}
            />
        </AdminLayout>
    );
}
