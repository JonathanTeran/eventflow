import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import EventLayout from '@/Layouts/EventLayout';
import Table from '@cloudscape-design/components/table';
import Header from '@cloudscape-design/components/header';
import Button from '@cloudscape-design/components/button';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Box from '@cloudscape-design/components/box';
import StatusIndicator from '@cloudscape-design/components/status-indicator';
import Badge from '@cloudscape-design/components/badge';
import Link from '@cloudscape-design/components/link';
import ConfirmModal from '@/Components/ConfirmModal';

const surveyStatusConfig = {
    draft: { label: 'Borrador', type: 'stopped' },
    active: { label: 'Activa', type: 'success' },
    closed: { label: 'Cerrada', type: 'info' },
};

const surveyTypeConfig = {
    pre_event: { label: 'Pre-evento', color: 'blue' },
    post_event: { label: 'Post-evento', color: 'green' },
};

export default function SurveysIndex({ event, surveys }) {
    const [deleteTarget, setDeleteTarget] = useState(null);

    function confirmDelete(survey) {
        setDeleteTarget(survey);
    }

    function deleteSurvey() {
        router.delete(`/events/${event.id}/surveys/${deleteTarget.id}`, {
            onSuccess: () => setDeleteTarget(null),
        });
    }

    function copyPublicLink(survey) {
        const url = `${window.location.origin}/e/${event.slug}/survey/${survey.id}`;
        navigator.clipboard.writeText(url);
    }

    const actions = (
        <Button
            variant="primary"
            iconName="add-plus"
            onClick={() => router.visit(`/events/${event.id}/surveys/create`)}
        >
            Nueva encuesta
        </Button>
    );

    return (
        <EventLayout event={event} actions={actions}>
            <Head title={`Encuestas - ${event.name}`} />

            <Table
                header={
                    <Header
                        variant="h2"
                        counter={`(${surveys.length})`}
                        description="Crea encuestas para recopilar feedback de los participantes antes o después del evento."
                    >
                        Encuestas
                    </Header>
                }
                columnDefinitions={[
                    {
                        id: 'title',
                        header: 'Título',
                        cell: (item) => (
                            <Link
                                href={`/events/${event.id}/surveys/${item.id}/edit`}
                                fontSize="body-m"
                            >
                                {item.title}
                            </Link>
                        ),
                    },
                    {
                        id: 'type',
                        header: 'Tipo',
                        cell: (item) => {
                            const cfg = surveyTypeConfig[item.type] || { label: item.type };
                            return <Badge color={cfg.color}>{cfg.label}</Badge>;
                        },
                    },
                    {
                        id: 'questions',
                        header: 'Preguntas',
                        cell: (item) => item.questions_count,
                    },
                    {
                        id: 'responses',
                        header: 'Respuestas',
                        cell: (item) => item.response_count,
                    },
                    {
                        id: 'status',
                        header: 'Estado',
                        cell: (item) => {
                            const cfg = surveyStatusConfig[item.status] || { label: item.status, type: 'info' };
                            return <StatusIndicator type={cfg.type}>{cfg.label}</StatusIndicator>;
                        },
                    },
                    {
                        id: 'actions',
                        header: 'Acciones',
                        cell: (item) => (
                            <SpaceBetween direction="horizontal" size="xs">
                                {item.status === 'active' && (
                                    <Button
                                        variant="inline-icon"
                                        iconName="copy"
                                        onClick={() => copyPublicLink(item)}
                                        ariaLabel="Copiar enlace"
                                    />
                                )}
                                <Button
                                    variant="inline-link"
                                    onClick={() => router.visit(`/events/${event.id}/surveys/${item.id}/results`)}
                                >
                                    Resultados
                                </Button>
                                <Button
                                    variant="inline-link"
                                    onClick={() => router.visit(`/events/${event.id}/surveys/${item.id}/edit`)}
                                >
                                    Editar
                                </Button>
                                <Button
                                    variant="inline-link"
                                    onClick={() => confirmDelete(item)}
                                >
                                    Eliminar
                                </Button>
                            </SpaceBetween>
                        ),
                    },
                ]}
                items={surveys}
                empty={
                    <Box textAlign="center" padding={{ vertical: 'l' }}>
                        <SpaceBetween size="m">
                            <Box variant="h3">No hay encuestas</Box>
                            <Box variant="p" color="text-body-secondary">
                                Crea una encuesta para recopilar feedback de tus participantes.
                            </Box>
                            <Button
                                variant="primary"
                                iconName="add-plus"
                                onClick={() => router.visit(`/events/${event.id}/surveys/create`)}
                            >
                                Nueva encuesta
                            </Button>
                        </SpaceBetween>
                    </Box>
                }
            />

            <ConfirmModal
                visible={!!deleteTarget}
                title="Eliminar encuesta"
                message={`¿Eliminar la encuesta "${deleteTarget?.title}"? También se eliminarán todas las respuestas. Esta acción no se puede deshacer.`}
                confirmText="Eliminar"
                danger
                onConfirm={deleteSurvey}
                onCancel={() => setDeleteTarget(null)}
            />
        </EventLayout>
    );
}
