import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Container from '@cloudscape-design/components/container';
import Header from '@cloudscape-design/components/header';
import ColumnLayout from '@cloudscape-design/components/column-layout';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Box from '@cloudscape-design/components/box';
import BarChart from '@cloudscape-design/components/bar-chart';
import PieChart from '@cloudscape-design/components/pie-chart';
import { useAuth } from '@/hooks/useAuth';

const statusTranslations = {
    'registered': 'Registrado',
    'checked_in': 'Chequeado',
    'cancelled': 'Cancelado',
    'invited': 'Invitado',
};

export default function ReportsIndex({ metrics, charts }) {
    const { user, organization } = useAuth();

    // Chart dimensions Calculation
    const maxChartYParticipants = Math.max(...(charts?.participants_by_event?.map(d => d.total_participants) || []), 5);
    const xDomainParticipants = charts?.participants_by_event?.map(d => d.event_name) || [];

    const maxChartYCheckInRates = Math.max(...(charts?.check_in_rates?.map(d => d.check_in_rate) || []), 100);
    const xDomainCheckInRates = charts?.check_in_rates?.map(d => d.event_name) || [];

    return (
        <AuthenticatedLayout>
            <Head title="Reportes Analíticos" />
            <SpaceBetween size="l">
                <Header
                    variant="h1"
                    description={`Visualiza las métricas y reportes globales de los eventos de la organización ${organization?.name}.`}
                >
                    Reportes Globales
                </Header>

                {/* Métricas Globales Consolidada */}
                <ColumnLayout columns={5}>
                    <Container>
                        <Box variant="awsui-key-label">Eventos Totales</Box>
                        <Box variant="h1" tagOverride="p">{metrics.total_events}</Box>
                    </Container>
                    <Container>
                        <Box variant="awsui-key-label">Participantes</Box>
                        <Box variant="h1" tagOverride="p">{metrics.total_participants}</Box>
                    </Container>
                    <Container>
                        <Box variant="awsui-key-label">Chequeados</Box>
                        <Box variant="h1" tagOverride="p">{metrics.total_checked_in}</Box>
                    </Container>
                    <Container>
                        <Box variant="awsui-key-label">Speakers</Box>
                        <Box variant="h1" tagOverride="p">{metrics.total_speakers}</Box>
                    </Container>
                    <Container>
                        <Box variant="awsui-key-label">Sponsors</Box>
                        <Box variant="h1" tagOverride="p">{metrics.total_sponsors}</Box>
                    </Container>
                </ColumnLayout>

                {/* Gráficos de Reporte */}
                <ColumnLayout columns={2}>
                    <Container header={<Header variant="h2">Participantes por Evento (Top 10)</Header>}>
                        <BarChart
                            series={[
                                {
                                    title: "Participantes Registrados",
                                    type: "bar",
                                    data: (charts?.participants_by_event || []).map(e => ({
                                        x: e.event_name,
                                        y: e.total_participants
                                    }))
                                }
                            ]}
                            xDomain={xDomainParticipants}
                            yDomain={[0, maxChartYParticipants]}
                            empty={<Box textAlign="center" padding="l">No hay datos suficientes.</Box>}
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

                    <Container header={<Header variant="h2">Tasa de Check-in (Participación Real)</Header>}>
                        <BarChart
                            series={[
                                {
                                    title: "Tasa de Check-in (%)",
                                    type: "bar",
                                    data: (charts?.check_in_rates || []).map(e => ({
                                        x: e.event_name,
                                        y: e.check_in_rate
                                    }))
                                }
                            ]}
                            xDomain={xDomainCheckInRates}
                            yDomain={[0, maxChartYCheckInRates]}
                            empty={<Box textAlign="center" padding="l">No hay datos suficientes.</Box>}
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

                    <Container header={<Header variant="h2">Evolución de Registros (Últimos 30 días)</Header>}>
                        <BarChart
                            series={[
                                {
                                    title: "Nuevos registros",
                                    type: "bar",
                                    data: (charts?.registrations_over_time || []).map(r => ({
                                        x: r.date,
                                        y: r.count
                                    }))
                                }
                            ]}
                            xDomain={charts?.registrations_over_time?.map(d => d.date) || []}
                            yDomain={[0, Math.max(...(charts?.registrations_over_time?.map(d => d.count) || []), 5)]}
                            empty={<Box textAlign="center" padding="l">No hay datos recientes.</Box>}
                            i18nStrings={{
                                filterLabel: "Filtrar por serie",
                                filterPlaceholder: "Filtrar",
                                filterSelectedAriaLabel: "seleccionado",
                                detailPopoverDismissAriaLabel: "Descartar",
                                legendAriaLabel: "Leyenda",
                                chartAriaRoleDescription: "gráfico de barras históricas"
                            }}
                            width="100%"
                            height={300}
                        />
                    </Container>

                    <Container header={<Header variant="h2">Distribución Global de Participantes</Header>}>
                        <PieChart
                            data={(charts?.global_status || []).map(s => ({
                                title: statusTranslations[s.status] || s.status,
                                value: s.count
                            }))}
                            empty={<Box textAlign="center" padding="l">No hay datos suficientes.</Box>}
                            segmentDescription={(datum) => `${datum.value} usuarios`}
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
            </SpaceBetween>
        </AuthenticatedLayout>
    );
}
