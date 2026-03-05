import { useState, useRef } from 'react';
import { Head, router } from '@inertiajs/react';
import EventLayout from '@/Layouts/EventLayout';
import Table from '@cloudscape-design/components/table';
import Header from '@cloudscape-design/components/header';
import Button from '@cloudscape-design/components/button';
import SpaceBetween from '@cloudscape-design/components/space-between';
import TextFilter from '@cloudscape-design/components/text-filter';
import Select from '@cloudscape-design/components/select';
import Pagination from '@cloudscape-design/components/pagination';
import Box from '@cloudscape-design/components/box';
import StatusIndicator from '@cloudscape-design/components/status-indicator';
import ConfirmModal from '@/Components/ConfirmModal';
import { participantStatusConfig, ticketTypeConfig } from '@/utils/status-config';

const statusOptions = [
    { value: '', label: 'Todos los estados' },
    { value: 'registered', label: 'Registrado' },
    { value: 'confirmed', label: 'Confirmado' },
    { value: 'attended', label: 'Asistido' },
    { value: 'cancelled', label: 'Cancelado' },
];

const ticketTypeOptions = [
    { value: '', label: 'Todos los tipos' },
    { value: 'general', label: 'General' },
    { value: 'vip', label: 'VIP' },
    { value: 'student', label: 'Estudiante' },
];

export default function ParticipantsIndex({ event, participants, filters }) {
    const [search, setSearch] = useState(filters?.search || '');
    const [status, setStatus] = useState(
        statusOptions.find((o) => o.value === (filters?.status || '')) || statusOptions[0]
    );
    const [ticketType, setTicketType] = useState(
        ticketTypeOptions.find((o) => o.value === (filters?.ticket_type || '')) || ticketTypeOptions[0]
    );
    const [deleteTarget, setDeleteTarget] = useState(null);
    const fileInputRef = useRef(null);
    const searchTimeout = useRef(null);

    function applyFilters(newSearch, newStatus, newTicketType) {
        router.get(
            `/events/${event.id}/participants`,
            {
                search: newSearch || undefined,
                status: newStatus || undefined,
                ticket_type: newTicketType || undefined,
            },
            { preserveState: true, replace: true }
        );
    }

    function handleSearchChange(value) {
        setSearch(value);
        clearTimeout(searchTimeout.current);
        searchTimeout.current = setTimeout(() => applyFilters(value, status.value, ticketType.value), 300);
    }

    function handleStatusChange(selected) {
        setStatus(selected);
        applyFilters(search, selected.value, ticketType.value);
    }

    function handleTicketTypeChange(selected) {
        setTicketType(selected);
        applyFilters(search, status.value, selected.value);
    }

    function handlePageChange({ detail }) {
        router.get(
            `/events/${event.id}/participants`,
            {
                search: search || undefined,
                status: status.value || undefined,
                ticket_type: ticketType.value || undefined,
                page: detail.currentPageIndex,
            },
            { preserveState: true }
        );
    }

    function checkIn(id) {
        router.post(`/events/${event.id}/participants/${id}/check-in`);
    }

    function confirmDelete(participant) {
        setDeleteTarget(participant);
    }

    function deleteParticipant() {
        router.delete(`/events/${event.id}/participants/${deleteTarget.id}`, {
            onSuccess: () => setDeleteTarget(null),
        });
    }

    function handleImportCsv(e) {
        const file = e.target.files[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('file', file);
        router.post(`/events/${event.id}/participants/import`, formData, {
            forceFormData: true,
        });
        e.target.value = '';
    }

    const actions = (
        <SpaceBetween direction="horizontal" size="xs">
            <Button variant="normal" iconName="upload" onClick={() => fileInputRef.current.click()}>
                Importar CSV
            </Button>
            <input
                type="file"
                accept=".csv,.txt"
                style={{ display: 'none' }}
                onChange={handleImportCsv}
                ref={fileInputRef}
            />
            <a
                href={`/events/${event.id}/participants/export`}
                style={{ textDecoration: 'none' }}
            >
                <Button variant="normal" iconName="download">
                    Exportar CSV
                </Button>
            </a>
            <Button
                variant="primary"
                iconName="add-plus"
                onClick={() => router.visit(`/events/${event.id}/participants/create`)}
            >
                Agregar participante
            </Button>
        </SpaceBetween>
    );

    return (
        <EventLayout event={event} actions={actions}>
            <Head title={`Participantes - ${event.name}`} />

            <Table
                header={
                    <Header
                        variant="h2"
                        counter={`(${participants.total ?? participants.data?.length ?? 0})`}
                    >
                        Participantes
                    </Header>
                }
                columnDefinitions={[
                    {
                        id: 'name',
                        header: 'Nombre',
                        cell: (item) => (
                            <div>
                                <div style={{ fontWeight: 500 }}>
                                    {item.first_name} {item.last_name}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: '#687078', fontFamily: 'monospace' }}>
                                    {item.registration_code}
                                </div>
                            </div>
                        ),
                    },
                    {
                        id: 'email',
                        header: 'Email',
                        cell: (item) => item.email,
                    },
                    {
                        id: 'company',
                        header: 'Empresa',
                        cell: (item) => item.company || '-',
                    },
                    {
                        id: 'ticket_type',
                        header: 'Tipo de entrada',
                        cell: (item) => {
                            const cfg = ticketTypeConfig[item.ticket_type] || { label: item.ticket_type, type: 'info' };
                            return <StatusIndicator type={cfg.type}>{cfg.label}</StatusIndicator>;
                        },
                    },
                    {
                        id: 'status',
                        header: 'Estado',
                        cell: (item) => {
                            const cfg = participantStatusConfig[item.status] || { label: item.status, type: 'stopped' };
                            return <StatusIndicator type={cfg.type}>{cfg.label}</StatusIndicator>;
                        },
                    },
                    {
                        id: 'actions',
                        header: 'Acciones',
                        cell: (item) => (
                            <SpaceBetween direction="horizontal" size="xs">
                                {item.status !== 'attended' && item.status !== 'cancelled' && (
                                    <Button
                                        variant="inline-icon"
                                        iconName="check"
                                        onClick={() => checkIn(item.id)}
                                        ariaLabel="Check-in"
                                    />
                                )}
                                <Button
                                    variant="inline-link"
                                    onClick={() => router.visit(`/events/${event.id}/participants/${item.id}/edit`)}
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
                items={participants.data || []}
                filter={
                    <SpaceBetween direction="horizontal" size="xs">
                        <TextFilter
                            filteringText={search}
                            filteringPlaceholder="Buscar por nombre o email..."
                            onChange={({ detail }) => handleSearchChange(detail.filteringText)}
                        />
                        <Select
                            selectedOption={status}
                            onChange={({ detail }) => handleStatusChange(detail.selectedOption)}
                            options={statusOptions}
                        />
                        <Select
                            selectedOption={ticketType}
                            onChange={({ detail }) => handleTicketTypeChange(detail.selectedOption)}
                            options={ticketTypeOptions}
                        />
                    </SpaceBetween>
                }
                pagination={
                    participants.last_page > 1 ? (
                        <Pagination
                            currentPageIndex={participants.current_page}
                            pagesCount={participants.last_page}
                            onChange={handlePageChange}
                        />
                    ) : null
                }
                empty={
                    <Box textAlign="center" padding={{ vertical: 'l' }}>
                        <SpaceBetween size="m">
                            <Box variant="h3">No hay participantes</Box>
                            <Box variant="p" color="text-body-secondary">
                                Agrega participantes manualmente o importa desde un CSV.
                            </Box>
                            <Button
                                variant="primary"
                                iconName="add-plus"
                                onClick={() => router.visit(`/events/${event.id}/participants/create`)}
                            >
                                Agregar participante
                            </Button>
                        </SpaceBetween>
                    </Box>
                }
            />

            <ConfirmModal
                visible={!!deleteTarget}
                title="Eliminar participante"
                message={`¿Eliminar a ${deleteTarget?.first_name} ${deleteTarget?.last_name}? Esta acción no se puede deshacer.`}
                confirmText="Eliminar"
                danger
                onConfirm={deleteParticipant}
                onCancel={() => setDeleteTarget(null)}
            />
        </EventLayout>
    );
}
