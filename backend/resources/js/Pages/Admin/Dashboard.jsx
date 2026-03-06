import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import Container from '@cloudscape-design/components/container';
import Header from '@cloudscape-design/components/header';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Box from '@cloudscape-design/components/box';
import ColumnLayout from '@cloudscape-design/components/column-layout';
import Table from '@cloudscape-design/components/table';
import Link from '@cloudscape-design/components/link';
import StatusIndicator from '@cloudscape-design/components/status-indicator';
import Button from '@cloudscape-design/components/button';
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

export default function AdminDashboard({ stats, recent_organizations, recent_events }) {
    return (
        <AdminLayout>
            <Head title="Admin Dashboard" />
            <SpaceBetween size="l">
                <Header
                    variant="h1"
                    description="Vista general de la plataforma BuilderApp."
                    actions={
                        <SpaceBetween direction="horizontal" size="xs">
                            <Button
                                variant="primary"
                                iconName="add-plus"
                                onClick={() => router.visit('/admin/organizations/create')}
                            >
                                Nueva organización
                            </Button>
                        </SpaceBetween>
                    }
                >
                    Admin Dashboard
                </Header>

                {/* Stats grid */}
                <ColumnLayout columns={4} variant="text-grid">
                    <Container>
                        <Box variant="awsui-key-label">Organizaciones</Box>
                        <Box variant="h1" tagOverride="p">
                            {stats?.total_organizations ?? 0}
                        </Box>
                        <Box color="text-body-secondary" fontSize="body-s">
                            {stats?.active_organizations ?? 0} activas ·{' '}
                            {stats?.inactive_organizations ?? 0} inactivas
                        </Box>
                    </Container>

                    <Container>
                        <Box variant="awsui-key-label">Usuarios</Box>
                        <Box variant="h1" tagOverride="p">
                            {stats?.total_users ?? 0}
                        </Box>
                        <Box color="text-body-secondary" fontSize="body-s">
                            Registrados en la plataforma
                        </Box>
                    </Container>

                    <Container>
                        <Box variant="awsui-key-label">Eventos totales</Box>
                        <Box variant="h1" tagOverride="p">
                            {stats?.total_events ?? 0}
                        </Box>
                        <Box color="text-body-secondary" fontSize="body-s">
                            {stats?.published_events ?? 0} publicados ·{' '}
                            {stats?.draft_events ?? 0} borradores
                        </Box>
                    </Container>

                    <Container>
                        <Box variant="awsui-key-label">Eventos activos</Box>
                        <Box variant="h1" tagOverride="p">
                            {stats?.active_events ?? 0}
                        </Box>
                        <Box color="text-body-secondary" fontSize="body-s">
                            {stats?.completed_events ?? 0} completados
                        </Box>
                    </Container>
                </ColumnLayout>

                {/* Recent Organizations table */}
                <Table
                    header={
                        <Header
                            actions={
                                <Button
                                    variant="link"
                                    onClick={() => router.visit('/admin/organizations')}
                                >
                                    Ver todas
                                </Button>
                            }
                        >
                            Organizaciones recientes
                        </Header>
                    }
                    columnDefinitions={[
                        {
                            id: 'name',
                            header: 'Nombre',
                            cell: (item) => (
                                <Link
                                    onFollow={(e) => {
                                        e.preventDefault();
                                        router.visit(`/admin/organizations/${item.id}`);
                                    }}
                                >
                                    {item.name}
                                </Link>
                            ),
                        },
                        {
                            id: 'owner',
                            header: 'Propietario',
                            cell: (item) => item.owner?.email ?? item.users?.[0]?.email ?? '-',
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
                    ]}
                    items={recent_organizations || []}
                    empty={
                        <Box textAlign="center" padding="l">
                            No hay organizaciones recientes.
                        </Box>
                    }
                />

                {/* Recent Events table */}
                <Table
                    header={
                        <Header
                            actions={
                                <Button
                                    variant="link"
                                    onClick={() => router.visit('/events')}
                                >
                                    Ver todos los eventos
                                </Button>
                            }
                        >
                            Eventos recientes
                        </Header>
                    }
                    columnDefinitions={[
                        {
                            id: 'name',
                            header: 'Nombre',
                            cell: (item) => (
                                <Link
                                    onFollow={(e) => {
                                        e.preventDefault();
                                        router.visit(`/events/${item.id}`);
                                    }}
                                >
                                    {item.name}
                                </Link>
                            ),
                        },
                        {
                            id: 'organization',
                            header: 'Organización',
                            cell: (item) => item.organization?.name ?? '-',
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
                            id: 'date_start',
                            header: 'Fecha',
                            cell: (item) => formatDate(item.date_start),
                        },
                    ]}
                    items={recent_events || []}
                    empty={
                        <Box textAlign="center" padding="l">
                            No hay eventos recientes.
                        </Box>
                    }
                />
            </SpaceBetween>
        </AdminLayout>
    );
}
