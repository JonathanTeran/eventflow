import { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import EventLayout from '@/Layouts/EventLayout';
import Container from '@cloudscape-design/components/container';
import Header from '@cloudscape-design/components/header';
import ColumnLayout from '@cloudscape-design/components/column-layout';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Box from '@cloudscape-design/components/box';
import Button from '@cloudscape-design/components/button';
import Grid from '@cloudscape-design/components/grid';
import Table from '@cloudscape-design/components/table';
import Input from '@cloudscape-design/components/input';
import FormField from '@cloudscape-design/components/form-field';
import KeyValuePairs from '@cloudscape-design/components/key-value-pairs';
import ConfirmModal from '@/Components/ConfirmModal';
import { formatCurrency } from '@/utils/formatters';
import { statusActions } from '@/utils/status-config';

export default function EventShow({ event, previewUrl }) {
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [editingLevel, setEditingLevel] = useState(null);
    const [changingStatus, setChangingStatus] = useState(false);
    const sponsorLevelForm = useForm({ name: '', price: '' });
    const editLevelForm = useForm({ name: '', price: '' });

    function changeStatus(newStatus) {
        router.patch(`/events/${event.id}/status`, { status: newStatus }, {
            onStart: () => setChangingStatus(true),
            onFinish: () => setChangingStatus(false),
        });
    }

    function deleteEvent() {
        router.delete(`/events/${event.id}`);
    }

    function addSponsorLevel(e) {
        e.preventDefault();
        sponsorLevelForm.post(`/events/${event.id}/sponsor-levels`, {
            onSuccess: () => sponsorLevelForm.reset(),
        });
    }

    function startEditLevel(level) {
        setEditingLevel(level.id);
        editLevelForm.setData({ name: level.name, price: level.price || '' });
    }

    function saveEditLevel(level) {
        editLevelForm.put(`/events/${event.id}/sponsor-levels/${level.id}`, {
            onSuccess: () => setEditingLevel(null),
        });
    }

    function deleteSponsorLevel(level) {
        router.delete(`/events/${event.id}/sponsor-levels/${level.id}`);
    }

    const availableActions = statusActions.filter((a) => a.from === event.status);

    const actions = (
        <SpaceBetween direction="horizontal" size="xs">
            <Button
                iconName="external"
                onClick={() => window.open(previewUrl, '_blank')}
            >
                Previsualizar
            </Button>
            <Button onClick={() => router.visit(`/events/${event.id}/edit`)}>Editar</Button>
            {availableActions.map((action) => (
                <Button
                    key={action.to}
                    variant={action.danger ? 'normal' : 'primary'}
                    onClick={() => changeStatus(action.to)}
                    loading={changingStatus}
                >
                    {action.label}
                </Button>
            ))}
        </SpaceBetween>
    );

    return (
        <EventLayout event={event} actions={actions}>
            <Head title={event.name} />

            {event.cover_image_url && (
                <Container>
                    <img
                        src={event.cover_image_url}
                        alt={event.name}
                        style={{
                            width: '100%',
                            maxHeight: 280,
                            objectFit: 'cover',
                            borderRadius: 8,
                            display: 'block',
                        }}
                    />
                </Container>
            )}

            <Grid gridDefinition={[{ colspan: 8 }, { colspan: 4 }]}>
                <SpaceBetween size="l">
                    {/* Stats */}
                    <ColumnLayout columns={4} variant="text-grid">
                        <Container>
                            <Box variant="awsui-key-label">Participantes</Box>
                            <Box variant="h1" tagOverride="p">{event.participants_count ?? 0}</Box>
                        </Container>
                        <Container>
                            <Box variant="awsui-key-label">Speakers</Box>
                            <Box variant="h1" tagOverride="p">{event.speakers_count ?? 0}</Box>
                        </Container>
                        <Container>
                            <Box variant="awsui-key-label">Sponsors</Box>
                            <Box variant="h1" tagOverride="p">{event.sponsors_count ?? 0}</Box>
                        </Container>
                        <Container>
                            <Box variant="awsui-key-label">Sesiones</Box>
                            <Box variant="h1" tagOverride="p">{event.agenda_items_count ?? 0}</Box>
                        </Container>
                    </ColumnLayout>

                    {/* Description */}
                    <Container header={<Header variant="h2">Descripción</Header>}>
                        {event.description ? (
                            <Box variant="p">{event.description}</Box>
                        ) : (
                            <Box color="text-body-secondary" fontStyle="italic">Sin descripción.</Box>
                        )}
                    </Container>

                    {/* Sponsor Levels */}
                    <Container header={<Header variant="h2">Niveles de sponsor</Header>}>
                        <SpaceBetween size="m">
                            {event.sponsor_levels?.length > 0 && (
                                <Table
                                    columnDefinitions={[
                                        { id: 'name', header: 'Nombre', cell: (item) => item.name },
                                        {
                                            id: 'price',
                                            header: 'Precio',
                                            cell: (item) => formatCurrency(item.price),
                                        },
                                        {
                                            id: 'actions',
                                            header: 'Acciones',
                                            cell: (item) =>
                                                editingLevel === item.id ? (
                                                    <SpaceBetween direction="horizontal" size="xs">
                                                        <Input
                                                            value={editLevelForm.data.name}
                                                            onChange={({ detail }) =>
                                                                editLevelForm.setData('name', detail.value)
                                                            }
                                                            placeholder="Nombre"
                                                        />
                                                        <Input
                                                            type="number"
                                                            value={String(editLevelForm.data.price)}
                                                            onChange={({ detail }) =>
                                                                editLevelForm.setData('price', detail.value)
                                                            }
                                                            placeholder="Precio"
                                                        />
                                                        <Button onClick={() => saveEditLevel(item)}>Guardar</Button>
                                                        <Button variant="link" onClick={() => setEditingLevel(null)}>
                                                            Cancelar
                                                        </Button>
                                                    </SpaceBetween>
                                                ) : (
                                                    <SpaceBetween direction="horizontal" size="xs">
                                                        <Button variant="link" onClick={() => startEditLevel(item)}>
                                                            Editar
                                                        </Button>
                                                        <Button variant="link" onClick={() => deleteSponsorLevel(item)}>
                                                            Eliminar
                                                        </Button>
                                                    </SpaceBetween>
                                                ),
                                        },
                                    ]}
                                    items={event.sponsor_levels}
                                    variant="embedded"
                                />
                            )}
                            <form onSubmit={addSponsorLevel}>
                                <SpaceBetween direction="horizontal" size="xs" alignItems="end">
                                    <FormField label="Nombre">
                                        <Input
                                            value={sponsorLevelForm.data.name}
                                            onChange={({ detail }) => sponsorLevelForm.setData('name', detail.value)}
                                            placeholder="Ej: Diamante"
                                        />
                                    </FormField>
                                    <FormField label="Precio">
                                        <Input
                                            type="number"
                                            value={sponsorLevelForm.data.price}
                                            onChange={({ detail }) => sponsorLevelForm.setData('price', detail.value)}
                                            placeholder="0.00"
                                        />
                                    </FormField>
                                    <Button
                                        variant="primary"
                                        formAction="submit"
                                        loading={sponsorLevelForm.processing}
                                    >
                                        Agregar
                                    </Button>
                                </SpaceBetween>
                            </form>
                        </SpaceBetween>
                    </Container>
                </SpaceBetween>

                <SpaceBetween size="l">
                    {/* Details */}
                    <Container header={<Header variant="h2">Detalles</Header>}>
                        <KeyValuePairs
                            items={[
                                {
                                    label: 'Tipo de registro',
                                    value: event.registration_type === 'open' ? 'Abierto' : 'Solo por invitación',
                                },
                                ...(event.capacity ? [{ label: 'Capacidad', value: `${event.capacity} personas` }] : []),
                                ...(event.location ? [{ label: 'Ubicación', value: event.location }] : []),
                                ...(event.venue ? [{ label: 'Venue', value: event.venue }] : []),
                                { label: 'Slug', value: event.slug },
                            ]}
                        />
                    </Container>

                    {/* Danger zone */}
                    <Container
                        header={<Header variant="h2">Zona de peligro</Header>}
                    >
                        <SpaceBetween size="s">
                            <Box color="text-body-secondary">Esta acción no se puede deshacer.</Box>
                            <Button
                                variant="normal"
                                onClick={() => setShowDeleteModal(true)}
                                fullWidth
                            >
                                Eliminar evento
                            </Button>
                        </SpaceBetween>
                    </Container>
                </SpaceBetween>
            </Grid>

            <ConfirmModal
                visible={showDeleteModal}
                title="Eliminar evento"
                message={`¿Estás seguro de que deseas eliminar el evento '${event.name}'? Esta acción no se puede deshacer.`}
                confirmText="Eliminar"
                danger
                onConfirm={deleteEvent}
                onCancel={() => setShowDeleteModal(false)}
            />
        </EventLayout>
    );
}
