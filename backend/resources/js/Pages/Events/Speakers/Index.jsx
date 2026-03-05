import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import EventLayout from '@/Layouts/EventLayout';
import Cards from '@cloudscape-design/components/cards';
import Header from '@cloudscape-design/components/header';
import Button from '@cloudscape-design/components/button';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Box from '@cloudscape-design/components/box';
import StatusIndicator from '@cloudscape-design/components/status-indicator';
import ConfirmModal from '@/Components/ConfirmModal';

const speakerStatusConfig = {
    invited: { label: 'Invitado', type: 'info' },
    confirmed: { label: 'Confirmado', type: 'success' },
    declined: { label: 'Declinado', type: 'stopped' },
};

function SpeakerAvatar({ speaker }) {
    if (speaker.photo_url) {
        return (
            <img
                src={speaker.photo_url}
                alt={`${speaker.first_name} ${speaker.last_name}`}
                style={{
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    objectFit: 'cover',
                    flexShrink: 0,
                }}
            />
        );
    }
    const initials = `${speaker.first_name?.[0] || ''}${speaker.last_name?.[0] || ''}`;
    return (
        <div
            style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                backgroundColor: '#e8eaf6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                fontSize: '1.125rem',
                fontWeight: 600,
                color: '#3f51b5',
            }}
        >
            {initials}
        </div>
    );
}

function SocialLinks({ links }) {
    if (!links) return null;
    return (
        <SpaceBetween direction="horizontal" size="xs">
            {links.twitter && (
                <a href={links.twitter} target="_blank" rel="noopener noreferrer" style={{ color: '#687078', lineHeight: 1 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                </a>
            )}
            {links.linkedin && (
                <a href={links.linkedin} target="_blank" rel="noopener noreferrer" style={{ color: '#687078', lineHeight: 1 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z" />
                    </svg>
                </a>
            )}
            {links.website && (
                <a href={links.website} target="_blank" rel="noopener noreferrer" style={{ color: '#687078', lineHeight: 1 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="2" x2="22" y1="12" y2="12" />
                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                    </svg>
                </a>
            )}
        </SpaceBetween>
    );
}

export default function SpeakersIndex({ event, speakers }) {
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [localSpeakers, setLocalSpeakers] = useState(speakers);

    function moveUp(index) {
        if (index === 0) return;
        const reordered = [...localSpeakers];
        [reordered[index - 1], reordered[index]] = [reordered[index], reordered[index - 1]];
        setLocalSpeakers(reordered);
        submitReorder(reordered);
    }

    function moveDown(index) {
        if (index === localSpeakers.length - 1) return;
        const reordered = [...localSpeakers];
        [reordered[index], reordered[index + 1]] = [reordered[index + 1], reordered[index]];
        setLocalSpeakers(reordered);
        submitReorder(reordered);
    }

    function submitReorder(ordered) {
        router.post(`/events/${event.id}/speakers/reorder`, {
            speakers: ordered.map((s, i) => ({ id: s.id, sort_order: i + 1 })),
        });
    }

    function confirmDelete(speaker) {
        setDeleteTarget(speaker);
    }

    function deleteSpeaker() {
        router.delete(`/events/${event.id}/speakers/${deleteTarget.id}`, {
            onSuccess: () => setDeleteTarget(null),
        });
    }

    const actions = (
        <Button
            variant="primary"
            iconName="add-plus"
            onClick={() => router.visit(`/events/${event.id}/speakers/create`)}
        >
            Agregar speaker
        </Button>
    );

    return (
        <EventLayout event={event} actions={actions}>
            <Head title={`Speakers - ${event.name}`} />

            <Cards
                header={
                    <Header
                        variant="h2"
                        counter={`(${localSpeakers.length})`}
                    >
                        Speakers
                    </Header>
                }
                cardDefinition={{
                    header: (item) => (
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                            <SpeakerAvatar speaker={item} />
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontWeight: 600, fontSize: '0.9375rem' }}>
                                    {item.first_name} {item.last_name}
                                </div>
                                {(item.job_title || item.company) && (
                                    <div style={{ fontSize: '0.8125rem', color: '#687078', marginTop: 2 }}>
                                        {[item.job_title, item.company].filter(Boolean).join(' @ ')}
                                    </div>
                                )}
                                <div style={{ marginTop: 6 }}>
                                    <StatusIndicator type={speakerStatusConfig[item.status]?.type || 'stopped'}>
                                        {speakerStatusConfig[item.status]?.label || item.status}
                                    </StatusIndicator>
                                </div>
                            </div>
                        </div>
                    ),
                    sections: [
                        {
                            id: 'social',
                            content: (item) =>
                                item.social_links && Object.values(item.social_links).some(Boolean) ? (
                                    <SocialLinks links={item.social_links} />
                                ) : null,
                        },
                        {
                            id: 'actions',
                            content: (item) => {
                                const index = localSpeakers.findIndex((s) => s.id === item.id);
                                return (
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <SpaceBetween direction="horizontal" size="xs">
                                            <Button
                                                variant="icon"
                                                iconName="angle-up"
                                                onClick={() => moveUp(index)}
                                                disabled={index === 0}
                                                ariaLabel="Mover arriba"
                                            />
                                            <Button
                                                variant="icon"
                                                iconName="angle-down"
                                                onClick={() => moveDown(index)}
                                                disabled={index === localSpeakers.length - 1}
                                                ariaLabel="Mover abajo"
                                            />
                                        </SpaceBetween>
                                        <SpaceBetween direction="horizontal" size="xs">
                                            <Button
                                                variant="inline-link"
                                                onClick={() =>
                                                    router.visit(`/events/${event.id}/speakers/${item.id}/edit`)
                                                }
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
                                    </div>
                                );
                            },
                        },
                    ],
                }}
                items={localSpeakers}
                empty={
                    <Box textAlign="center" padding={{ vertical: 'l' }}>
                        <SpaceBetween size="m">
                            <Box variant="h3">No hay speakers registrados</Box>
                            <Box variant="p" color="text-body-secondary">
                                Agrega los speakers que participarán en este evento.
                            </Box>
                            <Button
                                variant="primary"
                                iconName="add-plus"
                                onClick={() => router.visit(`/events/${event.id}/speakers/create`)}
                            >
                                Agregar primer speaker
                            </Button>
                        </SpaceBetween>
                    </Box>
                }
            />

            <ConfirmModal
                visible={!!deleteTarget}
                title="Eliminar speaker"
                message={`¿Eliminar a ${deleteTarget?.first_name} ${deleteTarget?.last_name}? Esta acción no se puede deshacer.`}
                confirmText="Eliminar"
                danger
                onConfirm={deleteSpeaker}
                onCancel={() => setDeleteTarget(null)}
            />
        </EventLayout>
    );
}
