import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import EventLayout from '@/Layouts/EventLayout';
import Table from '@cloudscape-design/components/table';
import Header from '@cloudscape-design/components/header';
import Button from '@cloudscape-design/components/button';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Box from '@cloudscape-design/components/box';
import StatusIndicator from '@cloudscape-design/components/status-indicator';
import Link from '@cloudscape-design/components/link';
import Pagination from '@cloudscape-design/components/pagination';
import ConfirmModal from '@/Components/ConfirmModal';
import { formatDate } from '@/utils/formatters';

const statusConfig = {
    draft: { label: 'Preparando', type: 'pending' },
    sending: { label: 'Enviando', type: 'in-progress' },
    sent: { label: 'Enviado', type: 'success' },
    failed: { label: 'Fallido', type: 'error' },
};

export default function CommunicationsIndex({ event, communications }) {
    const [deleteTarget, setDeleteTarget] = useState(null);

    function deleteCommunication() {
        router.delete(`/events/${event.id}/communications/${deleteTarget.id}`, {
            onSuccess: () => setDeleteTarget(null),
        });
    }

    const actions = (
        <Button
            variant="primary"
            iconName="add-plus"
            onClick={() => router.visit(`/events/${event.id}/communications/create`)}
        >
            Nueva comunicacion
        </Button>
    );

    return (
        <EventLayout event={event} actions={actions}>
            <Head title={`Comunicaciones - ${event.name}`} />

            <Table
                header={
                    <Header
                        variant="h2"
                        counter={`(${communications.total || communications.data?.length || 0})`}
                        description="Envia notificaciones por correo a los participantes registrados en el evento."
                    >
                        Comunicaciones
                    </Header>
                }
                columnDefinitions={[
                    {
                        id: 'subject',
                        header: 'Asunto',
                        cell: (item) => (
                            <Link
                                onFollow={(e) => {
                                    e.preventDefault();
                                    router.visit(`/events/${event.id}/communications/${item.id}`);
                                }}
                            >
                                {item.subject}
                            </Link>
                        ),
                    },
                    {
                        id: 'status',
                        header: 'Estado',
                        cell: (item) => {
                            const cfg = statusConfig[item.status] || { label: item.status, type: 'info' };
                            return <StatusIndicator type={cfg.type}>{cfg.label}</StatusIndicator>;
                        },
                    },
                    {
                        id: 'recipients',
                        header: 'Destinatarios',
                        cell: (item) => item.status === 'sent'
                            ? `${item.sent_count} / ${item.recipients_count}`
                            : item.recipients_count,
                    },
                    {
                        id: 'sender',
                        header: 'Enviado por',
                        cell: (item) => item.sender?.name || '-',
                    },
                    {
                        id: 'date',
                        header: 'Fecha',
                        cell: (item) => item.sent_at ? formatDate(item.sent_at) : formatDate(item.created_at),
                    },
                    {
                        id: 'actions',
                        header: 'Acciones',
                        cell: (item) => (
                            <SpaceBetween direction="horizontal" size="xs">
                                <Button
                                    variant="inline-link"
                                    onClick={() => router.visit(`/events/${event.id}/communications/${item.id}`)}
                                >
                                    Ver
                                </Button>
                                <Button
                                    variant="inline-link"
                                    onClick={() => setDeleteTarget(item)}
                                >
                                    Eliminar
                                </Button>
                            </SpaceBetween>
                        ),
                    },
                ]}
                items={communications.data || []}
                pagination={
                    communications.last_page > 1 ? (
                        <Pagination
                            currentPageIndex={communications.current_page}
                            pagesCount={communications.last_page}
                            onChange={({ detail }) => {
                                router.get(`/events/${event.id}/communications`, {
                                    page: detail.currentPageIndex,
                                }, { preserveState: true });
                            }}
                        />
                    ) : null
                }
                empty={
                    <Box textAlign="center" padding={{ vertical: 'l' }}>
                        <SpaceBetween size="m">
                            <Box variant="h3">No hay comunicaciones</Box>
                            <Box variant="p" color="text-body-secondary">
                                Envia tu primera comunicacion a los participantes del evento.
                            </Box>
                            <Button
                                variant="primary"
                                iconName="add-plus"
                                onClick={() => router.visit(`/events/${event.id}/communications/create`)}
                            >
                                Nueva comunicacion
                            </Button>
                        </SpaceBetween>
                    </Box>
                }
            />

            <ConfirmModal
                visible={!!deleteTarget}
                title="Eliminar comunicacion"
                message={`¿Eliminar la comunicacion "${deleteTarget?.subject}"? Esta accion no se puede deshacer.`}
                confirmText="Eliminar"
                danger
                onConfirm={deleteCommunication}
                onCancel={() => setDeleteTarget(null)}
            />
        </EventLayout>
    );
}
