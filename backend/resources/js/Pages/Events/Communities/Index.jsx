import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import EventLayout from '@/Layouts/EventLayout';
import Container from '@cloudscape-design/components/container';
import Header from '@cloudscape-design/components/header';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Button from '@cloudscape-design/components/button';
import Box from '@cloudscape-design/components/box';
import ColumnLayout from '@cloudscape-design/components/column-layout';
import ConfirmModal from '@/Components/ConfirmModal';

export default function CommunitiesIndex({ event, communities }) {
    const [deletingId, setDeletingId] = useState(null);

    function confirmDelete(community) {
        setDeletingId(community.id);
    }

    function handleDelete() {
        router.delete(`/events/${event.id}/communities/${deletingId}`, {
            onFinish: () => setDeletingId(null),
        });
    }

    function moveUp(index) {
        if (index === 0) return;
        const reordered = [...communities];
        [reordered[index - 1], reordered[index]] = [reordered[index], reordered[index - 1]];
        submitReorder(reordered);
    }

    function moveDown(index) {
        if (index === communities.length - 1) return;
        const reordered = [...communities];
        [reordered[index], reordered[index + 1]] = [reordered[index + 1], reordered[index]];
        submitReorder(reordered);
    }

    function submitReorder(reordered) {
        router.post(`/events/${event.id}/communities/reorder`, {
            communities: reordered.map((c, i) => ({ id: c.id, sort_order: i + 1 })),
        });
    }

    const deletingCommunity = communities.find((c) => c.id === deletingId);

    const actions = (
        <Button
            variant="primary"
            iconName="add-plus"
            onClick={() => router.visit(`/events/${event.id}/communities/create`)}
        >
            Agregar comunidad
        </Button>
    );

    return (
        <EventLayout event={event} actions={actions}>
            <Head title={`Comunidades - ${event.name}`} />

            <SpaceBetween size="l">
                {communities.length === 0 ? (
                    <Container>
                        <Box textAlign="center" color="text-body-secondary" padding="xl">
                            No hay comunidades registradas para este evento.
                        </Box>
                    </Container>
                ) : (
                    <Container
                        header={
                            <Header variant="h2" counter={`(${communities.length})`}>
                                Comunidades
                            </Header>
                        }
                    >
                        <ColumnLayout columns={3} variant="text-grid">
                            {communities.map((community, index) => (
                                <CommunityCard
                                    key={community.id}
                                    community={community}
                                    event={event}
                                    index={index}
                                    total={communities.length}
                                    onMoveUp={() => moveUp(index)}
                                    onMoveDown={() => moveDown(index)}
                                    onDelete={() => confirmDelete(community)}
                                />
                            ))}
                        </ColumnLayout>
                    </Container>
                )}
            </SpaceBetween>

            <ConfirmModal
                visible={!!deletingId}
                title="Eliminar comunidad"
                message={`¿Estás seguro de que deseas eliminar '${deletingCommunity?.name}'? Esta acción no se puede deshacer.`}
                confirmText="Eliminar"
                danger
                onConfirm={handleDelete}
                onCancel={() => setDeletingId(null)}
            />
        </EventLayout>
    );
}

function CommunityCard({ community, event, index, total, onMoveUp, onMoveDown, onDelete }) {
    return (
        <SpaceBetween size="s">
            {/* Logo */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
                {community.logo_url ? (
                    <img
                        src={community.logo_url}
                        alt={community.name}
                        style={{
                            maxHeight: 64,
                            maxWidth: '100%',
                            objectFit: 'contain',
                            borderRadius: 4,
                        }}
                    />
                ) : (
                    <div
                        style={{
                            width: 80,
                            height: 64,
                            background: '#f0f0f0',
                            borderRadius: 4,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#aaa',
                            fontSize: 12,
                        }}
                    >
                        Sin logo
                    </div>
                )}
            </div>

            {/* Info */}
            <Box variant="h3" tagOverride="p">
                {community.name}
            </Box>

            {community.url && (
                <Box fontSize="body-s">
                    <a href={community.url} target="_blank" rel="noopener noreferrer">
                        {community.url}
                    </a>
                </Box>
            )}

            {community.description && (
                <Box fontSize="body-s" color="text-body-secondary">
                    {community.description.length > 120
                        ? community.description.substring(0, 120) + '...'
                        : community.description}
                </Box>
            )}

            {/* Actions */}
            <SpaceBetween direction="horizontal" size="xs">
                <Button
                    variant="icon"
                    iconName="angle-up"
                    disabled={index === 0}
                    onClick={onMoveUp}
                />
                <Button
                    variant="icon"
                    iconName="angle-down"
                    disabled={index === total - 1}
                    onClick={onMoveDown}
                />
                <Button
                    variant="link"
                    onClick={() => router.visit(`/events/${event.id}/communities/${community.id}/edit`)}
                >
                    Editar
                </Button>
                <Button variant="link" onClick={onDelete}>
                    Eliminar
                </Button>
            </SpaceBetween>
        </SpaceBetween>
    );
}
