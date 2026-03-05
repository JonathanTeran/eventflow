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

export default function SponsorsIndex({ event, sponsors, sponsorLevels }) {
    const [deletingId, setDeletingId] = useState(null);

    function confirmDelete(sponsor) {
        setDeletingId(sponsor.id);
    }

    function handleDelete() {
        router.delete(`/events/${event.id}/sponsors/${deletingId}`, {
            onFinish: () => setDeletingId(null),
        });
    }

    // Group sponsors by sponsor_level_id
    const grouped = sponsorLevels.map((level) => ({
        level,
        items: sponsors.filter((s) => s.sponsor_level_id === level.id),
    }));

    // Sponsors with no level (unassigned)
    const unassigned = sponsors.filter(
        (s) => !sponsorLevels.some((l) => l.id === s.sponsor_level_id)
    );

    const deletingSponsor = sponsors.find((s) => s.id === deletingId);

    const actions = (
        <Button
            variant="primary"
            iconName="add-plus"
            onClick={() => router.visit(`/events/${event.id}/sponsors/create`)}
        >
            Agregar sponsor
        </Button>
    );

    return (
        <EventLayout event={event} actions={actions}>
            <Head title={`Sponsors - ${event.name}`} />

            <SpaceBetween size="l">
                {sponsors.length === 0 && (
                    <Container>
                        <Box textAlign="center" color="text-body-secondary" padding="xl">
                            No hay sponsors registrados para este evento.
                        </Box>
                    </Container>
                )}

                {grouped.map(({ level, items }) =>
                    items.length > 0 ? (
                        <Container
                            key={level.id}
                            header={
                                <Header variant="h2">
                                    {level.name}
                                </Header>
                            }
                        >
                            <ColumnLayout columns={3} variant="text-grid">
                                {items.map((sponsor) => (
                                    <SponsorCard
                                        key={sponsor.id}
                                        sponsor={sponsor}
                                        levelName={level.name}
                                        event={event}
                                        onDelete={() => confirmDelete(sponsor)}
                                    />
                                ))}
                            </ColumnLayout>
                        </Container>
                    ) : null
                )}

                {unassigned.length > 0 && (
                    <Container
                        header={<Header variant="h2">Sin nivel asignado</Header>}
                    >
                        <ColumnLayout columns={3} variant="text-grid">
                            {unassigned.map((sponsor) => (
                                <SponsorCard
                                    key={sponsor.id}
                                    sponsor={sponsor}
                                    levelName="—"
                                    event={event}
                                    onDelete={() => confirmDelete(sponsor)}
                                />
                            ))}
                        </ColumnLayout>
                    </Container>
                )}
            </SpaceBetween>

            <ConfirmModal
                visible={!!deletingId}
                title="Eliminar sponsor"
                message={`¿Estás seguro de que deseas eliminar a '${deletingSponsor?.company_name}'? Esta acción no se puede deshacer.`}
                confirmText="Eliminar"
                danger
                onConfirm={handleDelete}
                onCancel={() => setDeletingId(null)}
            />
        </EventLayout>
    );
}

function SponsorCard({ sponsor, levelName, event, onDelete }) {
    return (
        <SpaceBetween size="s">
            {/* Logo */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
                {sponsor.logo_url ? (
                    <img
                        src={sponsor.logo_url}
                        alt={sponsor.company_name}
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
                {sponsor.company_name}
            </Box>

            <Box color="text-body-secondary" fontSize="body-s">
                Nivel: {levelName}
            </Box>

            {sponsor.contact_name && (
                <Box fontSize="body-s">
                    <strong>Contacto:</strong> {sponsor.contact_name}
                </Box>
            )}

            {sponsor.contact_email && (
                <Box fontSize="body-s">
                    <strong>Email:</strong>{' '}
                    <a href={`mailto:${sponsor.contact_email}`}>{sponsor.contact_email}</a>
                </Box>
            )}

            {sponsor.website && (
                <Box fontSize="body-s">
                    <a href={sponsor.website} target="_blank" rel="noopener noreferrer">
                        {sponsor.website}
                    </a>
                </Box>
            )}

            {/* Actions */}
            <SpaceBetween direction="horizontal" size="xs">
                <Button
                    variant="link"
                    onClick={() => router.visit(`/events/${event.id}/sponsors/${sponsor.id}/edit`)}
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
