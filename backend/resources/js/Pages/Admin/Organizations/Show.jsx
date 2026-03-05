import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import Container from '@cloudscape-design/components/container';
import Header from '@cloudscape-design/components/header';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Box from '@cloudscape-design/components/box';
import Button from '@cloudscape-design/components/button';
import Table from '@cloudscape-design/components/table';
import KeyValuePairs from '@cloudscape-design/components/key-value-pairs';
import StatusIndicator from '@cloudscape-design/components/status-indicator';
import Badge from '@cloudscape-design/components/badge';
import BreadcrumbGroup from '@cloudscape-design/components/breadcrumb-group';
import ColumnLayout from '@cloudscape-design/components/column-layout';
import ConfirmModal from '@/Components/ConfirmModal';
import { formatDate } from '@/utils/formatters';

const statusTypeMap = {
    draft: 'stopped',
    published: 'info',
    active: 'success',
    completed: 'success',
    cancelled: 'error',
};

const statusLabelMap = {
    draft: 'Borrador',
    published: 'Publicado',
    active: 'Activo',
    completed: 'Completado',
    cancelled: 'Cancelado',
};

const roleColors = {
    super_admin: 'red',
    org_admin: 'blue',
    collaborator: 'grey',
    participant: 'green',
    speaker: 'blue',
    sponsor: 'red',
};

export default function OrganizationShow({ organization, users, events }) {
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const orgUsers = users || organization?.users || [];
    const orgEvents = events || organization?.events || [];

    function deleteOrganization() {
        router.delete(`/admin/organizations/${organization.id}`);
    }

    function impersonate() {
        router.post(`/admin/impersonate/${organization.id}`);
    }

    return (
        <AdminLayout>
            <Head title={organization.name} />
            <SpaceBetween size="l">
                <BreadcrumbGroup
                    items={[
                        { text: 'Organizaciones', href: '/admin/organizations' },
                        { text: organization.name, href: '#' },
                    ]}
                    onFollow={(e) => {
                        e.preventDefault();
                        router.visit(e.detail.href);
                    }}
                />

                {/* Page header with actions */}
                <Header
                    variant="h1"
                    description={organization.slug}
                    actions={
                        <SpaceBetween direction="horizontal" size="xs">
                            {organization.is_active && (
                                <Button variant="normal" onClick={impersonate}>
                                    Impersonar
                                </Button>
                            )}
                            <Button
                                variant="normal"
                                onClick={() =>
                                    router.visit(`/admin/organizations/${organization.id}/edit`)
                                }
                            >
                                Editar
                            </Button>
                            <Button
                                variant="normal"
                                onClick={() => setShowDeleteModal(true)}
                            >
                                Eliminar
                            </Button>
                        </SpaceBetween>
                    }
                >
                    {organization.name}
                </Header>

                {/* Details section */}
                <ColumnLayout columns={2}>
                    <Container header={<Header variant="h2">Detalles de la organización</Header>}>
                        <KeyValuePairs
                            columns={2}
                            items={[
                                {
                                    label: 'Nombre',
                                    value: organization.name,
                                },
                                {
                                    label: 'Slug',
                                    value: organization.slug,
                                },
                                {
                                    label: 'Email',
                                    value: organization.email || '-',
                                },
                                {
                                    label: 'Teléfono',
                                    value: organization.phone || '-',
                                },
                                {
                                    label: 'Sitio web',
                                    value: organization.website || '-',
                                },
                                {
                                    label: 'Dirección',
                                    value: organization.address || '-',
                                },
                                {
                                    label: 'Estado',
                                    value: organization.is_active ? (
                                        <StatusIndicator type="success">Activa</StatusIndicator>
                                    ) : (
                                        <StatusIndicator type="stopped">Inactiva</StatusIndicator>
                                    ),
                                },
                                {
                                    label: 'Creada',
                                    value: formatDate(organization.created_at),
                                },
                            ]}
                        />
                    </Container>

                    <Container header={<Header variant="h2">Estadísticas</Header>}>
                        <ColumnLayout columns={2} variant="text-grid">
                            <Box>
                                <Box variant="awsui-key-label">Usuarios</Box>
                                <Box variant="h1" tagOverride="p">
                                    {organization.users_count ?? orgUsers.length}
                                </Box>
                            </Box>
                            <Box>
                                <Box variant="awsui-key-label">Eventos</Box>
                                <Box variant="h1" tagOverride="p">
                                    {organization.events_count ?? orgEvents.length}
                                </Box>
                            </Box>
                        </ColumnLayout>
                    </Container>
                </ColumnLayout>

                {/* Users table */}
                <Table
                    header={<Header variant="h2">Usuarios</Header>}
                    columnDefinitions={[
                        {
                            id: 'name',
                            header: 'Nombre',
                            cell: (item) => `${item.first_name} ${item.last_name}`,
                        },
                        {
                            id: 'email',
                            header: 'Email',
                            cell: (item) => item.email,
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
                    ]}
                    items={orgUsers}
                    empty={
                        <Box textAlign="center" padding="l">
                            No hay usuarios en esta organización.
                        </Box>
                    }
                />

                {/* Events table */}
                <Table
                    header={<Header variant="h2">Eventos</Header>}
                    columnDefinitions={[
                        {
                            id: 'name',
                            header: 'Nombre',
                            cell: (item) => item.name,
                        },
                        {
                            id: 'status',
                            header: 'Estado',
                            cell: (item) => (
                                <StatusIndicator type={statusTypeMap[item.status] ?? 'stopped'}>
                                    {statusLabelMap[item.status] ?? item.status}
                                </StatusIndicator>
                            ),
                        },
                        {
                            id: 'date',
                            header: 'Fecha',
                            cell: (item) => formatDate(item.date_start),
                        },
                        {
                            id: 'participants',
                            header: 'Participantes',
                            cell: (item) => item.participants_count ?? '-',
                        },
                    ]}
                    items={orgEvents}
                    empty={
                        <Box textAlign="center" padding="l">
                            No hay eventos en esta organización.
                        </Box>
                    }
                />
            </SpaceBetween>

            <ConfirmModal
                visible={showDeleteModal}
                title="Eliminar organización"
                message={`¿Estás seguro de que deseas eliminar la organización '${organization.name}'? Esta acción no se puede deshacer.`}
                confirmText="Eliminar"
                danger
                onConfirm={deleteOrganization}
                onCancel={() => setShowDeleteModal(false)}
            />
        </AdminLayout>
    );
}
