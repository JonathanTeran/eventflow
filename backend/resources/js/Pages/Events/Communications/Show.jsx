import { Head, router } from '@inertiajs/react';
import EventLayout from '@/Layouts/EventLayout';
import Container from '@cloudscape-design/components/container';
import Header from '@cloudscape-design/components/header';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Box from '@cloudscape-design/components/box';
import ColumnLayout from '@cloudscape-design/components/column-layout';
import StatusIndicator from '@cloudscape-design/components/status-indicator';
import Button from '@cloudscape-design/components/button';
import { formatDate } from '@/utils/formatters';

const statusConfig = {
    draft: { label: 'Preparando', type: 'pending' },
    sending: { label: 'Enviando', type: 'in-progress' },
    sent: { label: 'Enviado', type: 'success' },
    failed: { label: 'Fallido', type: 'error' },
};

export default function CommunicationShow({ event, communication }) {
    const cfg = statusConfig[communication.status] || { label: communication.status, type: 'info' };

    return (
        <EventLayout event={event}>
            <Head title={`${communication.subject} - ${event.name}`} />

            <SpaceBetween size="l">
                <Container
                    header={
                        <Header
                            variant="h2"
                            actions={
                                <Button
                                    variant="link"
                                    onClick={() => router.visit(`/events/${event.id}/communications`)}
                                >
                                    Volver a comunicaciones
                                </Button>
                            }
                        >
                            {communication.subject}
                        </Header>
                    }
                >
                    <SpaceBetween size="l">
                        <ColumnLayout columns={4} variant="text-grid">
                            <div>
                                <Box variant="awsui-key-label">Estado</Box>
                                <StatusIndicator type={cfg.type}>{cfg.label}</StatusIndicator>
                            </div>
                            <div>
                                <Box variant="awsui-key-label">Destinatarios</Box>
                                <Box>{communication.status === 'sent'
                                    ? `${communication.sent_count} / ${communication.recipients_count}`
                                    : communication.recipients_count}
                                </Box>
                            </div>
                            <div>
                                <Box variant="awsui-key-label">Enviado por</Box>
                                <Box>{communication.sender?.name || '-'}</Box>
                            </div>
                            <div>
                                <Box variant="awsui-key-label">Fecha de envio</Box>
                                <Box>{communication.sent_at ? formatDate(communication.sent_at) : 'Pendiente'}</Box>
                            </div>
                        </ColumnLayout>

                        <div>
                            <Box variant="awsui-key-label" margin={{ bottom: 'xs' }}>Mensaje</Box>
                            <Box variant="p" color="text-body-secondary" style={{ whiteSpace: 'pre-wrap' }}>
                                {communication.body}
                            </Box>
                        </div>
                    </SpaceBetween>
                </Container>
            </SpaceBetween>
        </EventLayout>
    );
}
