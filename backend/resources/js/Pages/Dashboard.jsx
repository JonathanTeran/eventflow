import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Container from '@cloudscape-design/components/container';
import Header from '@cloudscape-design/components/header';
import ColumnLayout from '@cloudscape-design/components/column-layout';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Box from '@cloudscape-design/components/box';
import Button from '@cloudscape-design/components/button';
import Table from '@cloudscape-design/components/table';
import Link from '@cloudscape-design/components/link';
import BarChart from '@cloudscape-design/components/bar-chart';
import PieChart from '@cloudscape-design/components/pie-chart';
import StatusBadge from '@/Components/StatusBadge';
import { useAuth } from '@/hooks/useAuth';
import { formatDate, formatTime } from '@/utils/formatters';

const statusTranslations = {
    'registered': 'Registrado',
    'checked_in': 'Chequeado',
    'cancelled': 'Cancelado',
    'invited': 'Invitado',
};

const eventStatusTranslations = {
    'draft': 'Borrador',
    'published': 'Publicado',
    'active': 'Activo',
    'completed': 'Completado',
};

export default function Dashboard({ stats, charts, upcoming_events, recent_events }) {
    const { user } = useAuth();

    const maxChartYEvents = Math.max(...(charts?.events_by_month?.map(d => d.y) || []), 5);
    const xDomainEvents = charts?.events_by_month?.map(d => d.x) || [];

    const maxChartYTopEvents = Math.max(...(charts?.top_events_by_participants?.map(d => d.y) || []), 5);
    const xDomainTopEvents = charts?.top_events_by_participants?.map(d => d.x) || [];

    return (
        <AuthenticatedLayout>
            <Head title="Dashboard" />
            <SpaceBetween size="l">
                <Header
                    variant="h1"
                    description={`Bienvenido, ${user?.first_name}. Aquí tienes un resumen de tu actividad.`}
                >
                    Dashboard General
                </Header>

                {/* Métricas Generales Unificadas */}
                <ColumnLayout columns={4}>
                    <Container>
                        <Box variant="awsui-key-label">Eventos activos</Box>
                        <Box variant="h1" tagOverride="p">{stats.active_events}</Box>
                    </Container>
                    <Container>
                        <Box variant="awsui-key-label">Eventos borrador</Box>
                        <Box variant="h1" tagOverride="p">{stats.draft_events}</Box>
                    </Container>
                    <Container>
                        <Box variant="awsui-key-label">Total de eventos</Box>
                        <Box variant="h1" tagOverride="p">{stats.total_events}</Box>
                    </Container>
                    <Container>
                        <Box variant="awsui-key-label">Total Participantes</Box>
                        <Box variant="h1" tagOverride="p">{stats.total_participants}</Box>
                    </Container>

                    <Container>
                        <Box variant="awsui-key-label">Completados</Box>
                        <Box variant="h1" tagOverride="p">{stats.completed_events}</Box>
                    </Container>
                    <Container>
                        <Box variant="awsui-key-label">Total Speakers</Box>
                        <Box variant="h1" tagOverride="p">{stats.total_speakers}</Box>
                    </Container>
                    <Container>
                        <Box variant="awsui-key-label">Total Sponsors</Box>
                        <Box variant="h1" tagOverride="p">{stats.total_sponsors}</Box>
                    </Container>
                </ColumnLayout>

                {/* Gráficos en grilla de 2x2 */}
                <ColumnLayout columns={2}>
                    <Container header={<Header variant="h2">Eventos Creados por Mes</Header>}>
                        <BarChart
                            series={[
                                {
                                    title: "Eventos",
                                    type: "bar",
                                    data: charts?.events_by_month || []
                                }
                            ]}
                            xDomain={xDomainEvents}
                            yDomain={[0, maxChartYEvents]}
                            empty={<Box textAlign="center" padding="l">No hay datos suficientes para graficar.</Box>}
                            i18nStrings={{
                                filterLabel: "Filtrar por serie",
                                filterPlaceholder: "Filtrar",
                                filterSelectedAriaLabel: "seleccionado",
                                detailPopoverDismissAriaLabel: "Descartar",
                                legendAriaLabel: "Leyenda",
                                chartAriaRoleDescription: "gráfico de barras"
                            }}
                            width="100%"
                            height={300}
                        />
                    </Container>

                    <Container header={<Header variant="h2">Top Eventos por Participantes</Header>}>
                        <BarChart
                            series={[
                                {
                                    title: "Participantes",
                                    type: "bar",
                                    data: charts?.top_events_by_participants || []
                                }
                            ]}
                            xDomain={xDomainTopEvents}
                            yDomain={[0, maxChartYTopEvents]}
                            empty={<Box textAlign="center" padding="l">No hay datos suficientes para graficar.</Box>}
                            i18nStrings={{
                                filterLabel: "Filtrar por serie",
                                filterPlaceholder: "Filtrar",
                                filterSelectedAriaLabel: "seleccionado",
                                detailPopoverDismissAriaLabel: "Descartar",
                                legendAriaLabel: "Leyenda",
                                chartAriaRoleDescription: "gráfico de barras horizontales"
                            }}
                            width="100%"
                            height={300}
                        />
                    </Container>

                    <Container header={<Header variant="h2">Estado de Eventos</Header>}>
                        <PieChart
                            data={(charts?.events_by_status || []).map(s => ({
                                title: eventStatusTranslations[s.status] || s.status,
                                value: s.count
                            }))}
                            empty={<Box textAlign="center" padding="l">No hay datos suficientes para graficar.</Box>}
                            segmentDescription={(datum) => `${datum.value} eventos`}
                            i18nStrings={{
                                detailPopoverDismissAriaLabel: "Descartar",
                                legendAriaLabel: "Leyenda",
                                chartAriaRoleDescription: "gráfico de pastel",
                                segmentAriaRoleDescription: "segmento"
                            }}
                            width="100%"
                            height={300}
                        />
                    </Container>

                    <Container header={<Header variant="h2">Estado de Participantes (Global)</Header>}>
                        <PieChart
                            data={(charts?.participants_by_status || []).map(s => ({
                                title: statusTranslations[s.status] || s.status,
                                value: s.count
                            }))}
                            empty={<Box textAlign="center" padding="l">No hay datos suficientes para graficar.</Box>}
                            segmentDescription={(datum) => `${datum.value} participantes`}
                            i18nStrings={{
                                detailPopoverDismissAriaLabel: "Descartar",
                                legendAriaLabel: "Leyenda",
                                chartAriaRoleDescription: "gráfico de pastel",
                                segmentAriaRoleDescription: "segmento"
                            }}
                            width="100%"
                            height={300}
                        />
                    </Container>
                </ColumnLayout>

                {/* Tablas de próximos eventos y recientes */}
                <ColumnLayout columns={2}>
                    <Table
                        header={
                            <Header
                                actions={
                                    <Button variant="link" onClick={() => router.visit('/events')}>
                                        Ver todos
                                    </Button>
                                }
                            >
                                Próximos eventos
                            </Header>
                        }
                        columnDefinitions={[
                            {
                                id: 'name',
                                header: 'Nombre',
                                cell: (item) => (
                                    <Link onFollow={(e) => { e.preventDefault(); router.visit(`/events/${item.id}`); }}>
                                        {item.name}
                                    </Link>
                                ),
                            },
                            {
                                id: 'date',
                                header: 'Fecha',
                                cell: (item) => `${formatDate(item.date_start)} · ${formatTime(item.date_start)}`,
                            },
                            {
                                id: 'status',
                                header: 'Estado',
                                cell: (item) => <StatusBadge status={item.status} />,
                            },
                        ]}
                        items={upcoming_events || []}
                        empty={<Box textAlign="center" padding="l">No hay eventos próximos.</Box>}
                    />

                    <Table
                        header={
                            <Header
                                actions={
                                    <Button variant="primary" onClick={() => router.visit('/events/create')}>
                                        Crear nuevo
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
                                    <Link onFollow={(e) => { e.preventDefault(); router.visit(`/events/${item.id}`); }}>
                                        {item.name}
                                    </Link>
                                ),
                            },
                            {
                                id: 'location',
                                header: 'Ubicación',
                                cell: (item) => item.location || 'Sin ubicación',
                            },
                            {
                                id: 'status',
                                header: 'Estado',
                                cell: (item) => <StatusBadge status={item.status} />,
                            },
                        ]}
                        items={recent_events || []}
                        empty={
                            <Box textAlign="center" padding="l">
                                <SpaceBetween size="s">
                                    <Box>No hay eventos aún.</Box>
                                    <Button variant="primary" onClick={() => router.visit('/events/create')}>
                                        Crear evento
                                    </Button>
                                </SpaceBetween>
                            </Box>
                        }
                    />
                </ColumnLayout>
            </SpaceBetween>
        </AuthenticatedLayout>
    );
}

