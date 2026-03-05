import { useState, useMemo } from 'react';
import { Head, router } from '@inertiajs/react';
import EventLayout from '@/Layouts/EventLayout';
import Container from '@cloudscape-design/components/container';
import Header from '@cloudscape-design/components/header';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Button from '@cloudscape-design/components/button';
import Box from '@cloudscape-design/components/box';
import ColumnLayout from '@cloudscape-design/components/column-layout';
import SegmentedControl from '@cloudscape-design/components/segmented-control';
import Select from '@cloudscape-design/components/select';
import ConfirmModal from '@/Components/ConfirmModal';
import CalendarView from './CalendarView';
import { formatDate } from '@/utils/formatters';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
    arrayMove,
} from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { CSS } from '@dnd-kit/utilities';

export default function AgendaIndex({ event, agendaItemsByDate, speakers }) {
    const [viewMode, setViewMode] = useState('list');
    const [deletingId, setDeletingId] = useState(null);
    const [selectedRoom, setSelectedRoom] = useState(null);

    // Local state for immediate reorder feedback
    const [localItemsByDate, setLocalItemsByDate] = useState(() => {
        const result = {};
        for (const [dateKey, items] of Object.entries(agendaItemsByDate)) {
            result[dateKey] = [...items].sort(
                (a, b) =>
                    (a.start_time || '').localeCompare(b.start_time || '') ||
                    (a.sort_order ?? 0) - (b.sort_order ?? 0)
            );
        }
        return result;
    });

    // Sync from server props when they change (e.g. after add/edit/delete)
    const serverKey = useMemo(
        () => JSON.stringify(agendaItemsByDate),
        [agendaItemsByDate]
    );
    const [prevServerKey, setPrevServerKey] = useState(serverKey);
    if (serverKey !== prevServerKey) {
        setPrevServerKey(serverKey);
        const result = {};
        for (const [dateKey, items] of Object.entries(agendaItemsByDate)) {
            result[dateKey] = [...items].sort(
                (a, b) =>
                    (a.start_time || '').localeCompare(b.start_time || '') ||
                    (a.sort_order ?? 0) - (b.sort_order ?? 0)
            );
        }
        setLocalItemsByDate(result);
    }

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    function confirmDelete(item) {
        setDeletingId(item.id);
    }

    function handleDelete() {
        router.delete(`/events/${event.id}/agenda/${deletingId}`, {
            onFinish: () => setDeletingId(null),
        });
    }

    function handleCalendarMove(item, { date, start_time, end_time }) {
        // Optimistic update
        setLocalItemsByDate((prev) => {
            const next = {};
            for (const [dk, items] of Object.entries(prev)) {
                next[dk] = items.filter((i) => i.id !== item.id);
                if (next[dk].length === 0) delete next[dk];
            }
            const updatedItem = { ...item, date, start_time, end_time };
            if (!next[date]) next[date] = [];
            next[date].push(updatedItem);
            next[date].sort(
                (a, b) =>
                    (a.start_time || '').localeCompare(b.start_time || '') ||
                    (a.sort_order ?? 0) - (b.sort_order ?? 0)
            );
            return next;
        });

        router.patch(`/events/${event.id}/agenda/${item.id}/move`, {
            date,
            start_time,
            end_time,
        }, {
            preserveScroll: true,
            preserveState: true,
        });
    }

    function handleDragEnd(dateKey, e) {
        const { active, over } = e;
        if (!over || active.id === over.id) return;

        const items = localItemsByDate[dateKey];
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        if (oldIndex === -1 || newIndex === -1) return;

        const reordered = arrayMove(items, oldIndex, newIndex);

        setLocalItemsByDate((prev) => ({ ...prev, [dateKey]: reordered }));

        const payload = reordered.map((item, idx) => ({
            id: item.id,
            sort_order: idx,
        }));

        router.post(`/events/${event.id}/agenda/reorder`, { items: payload }, {
            preserveScroll: true,
            preserveState: true,
        });
    }

    // Extract unique rooms from all items
    const rooms = useMemo(() => {
        const set = new Set();
        for (const items of Object.values(localItemsByDate)) {
            items.forEach((item) => {
                if (item.location_detail) set.add(item.location_detail);
            });
        }
        return [...set].sort();
    }, [localItemsByDate]);

    // Filter items by selected room (visual only)
    const filteredItemsByDate = useMemo(() => {
        if (!selectedRoom) return localItemsByDate;
        const result = {};
        for (const [dateKey, items] of Object.entries(localItemsByDate)) {
            const filtered = items.filter((i) => i.location_detail === selectedRoom);
            if (filtered.length > 0) result[dateKey] = filtered;
        }
        return result;
    }, [localItemsByDate, selectedRoom]);

    const sortedDates = Object.keys(filteredItemsByDate).sort();

    // Use full data for delete lookup (item may be filtered out)
    const allItems = Object.values(localItemsByDate).flat();
    const deletingItem = allItems.find((i) => i.id === deletingId);

    function speakerName(item) {
        if (item.speaker) return `${item.speaker.first_name} ${item.speaker.last_name}`;
        const found = speakers.find((s) => s.id === item.speaker_id);
        return found ? `${found.first_name} ${found.last_name}` : null;
    }

    function timeRange(item) {
        const parts = [];
        if (item.start_time) parts.push(item.start_time);
        if (item.end_time) parts.push(item.end_time);
        return parts.join(' – ');
    }

    const actions = (
        <Button
            variant="primary"
            iconName="add-plus"
            onClick={() => router.visit(`/events/${event.id}/agenda/create`)}
        >
            Agregar sesión
        </Button>
    );

    return (
        <EventLayout event={event} actions={actions}>
            <Head title={`Agenda - ${event.name}`} />

            <SpaceBetween size="l">
                <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
                    <SegmentedControl
                        selectedId={viewMode}
                        onChange={({ detail }) => setViewMode(detail.selectedId)}
                        options={[
                            { text: 'Lista', id: 'list', iconName: 'view-vertical' },
                            { text: 'Calendario', id: 'calendar', iconName: 'calendar' },
                        ]}
                    />
                    {rooms.length > 0 && (
                        <Select
                            selectedOption={
                                selectedRoom
                                    ? { value: selectedRoom, label: selectedRoom }
                                    : { value: '__all__', label: 'Todos los salones' }
                            }
                            onChange={({ detail }) => {
                                const val = detail.selectedOption.value;
                                setSelectedRoom(val === '__all__' ? null : val);
                            }}
                            options={[
                                { value: '__all__', label: 'Todos los salones' },
                                ...rooms.map((r) => ({ value: r, label: r })),
                            ]}
                        />
                    )}
                </div>

                {sortedDates.length === 0 && (
                    <Container>
                        <Box textAlign="center" color="text-body-secondary" padding="xl">
                            No hay sesiones en la agenda de este evento.
                        </Box>
                    </Container>
                )}

                {sortedDates.length > 0 && viewMode === 'list' && sortedDates.map((dateKey) => (
                    <Container
                        key={dateKey}
                        header={
                            <Header variant="h2">
                                {formatDate(dateKey)}
                            </Header>
                        }
                    >
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            modifiers={[restrictToVerticalAxis]}
                            onDragEnd={(e) => handleDragEnd(dateKey, e)}
                        >
                            <SortableContext
                                items={filteredItemsByDate[dateKey].map((i) => i.id)}
                                strategy={verticalListSortingStrategy}
                            >
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    {filteredItemsByDate[dateKey].map((item) => (
                                        <SortableAgendaItemRow
                                            key={item.id}
                                            item={item}
                                            timeRange={timeRange(item)}
                                            speakerName={speakerName(item)}
                                            event={event}
                                            onDelete={() => confirmDelete(item)}
                                        />
                                    ))}
                                </div>
                            </SortableContext>
                        </DndContext>
                    </Container>
                ))}

                {sortedDates.length > 0 && viewMode === 'calendar' && (
                    <CalendarView
                        localItemsByDate={filteredItemsByDate}
                        sortedDates={sortedDates}
                        event={event}
                        speakers={speakers}
                        onDelete={confirmDelete}
                        onMove={handleCalendarMove}
                    />
                )}
            </SpaceBetween>

            <ConfirmModal
                visible={!!deletingId}
                title="Eliminar sesión"
                message={`¿Estás seguro de que deseas eliminar la sesión '${deletingItem?.title}'? Esta acción no se puede deshacer.`}
                confirmText="Eliminar"
                danger
                onConfirm={handleDelete}
                onCancel={() => setDeletingId(null)}
            />
        </EventLayout>
    );
}

function SortableAgendaItemRow({ item, timeRange, speakerName, event, onDelete }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: item.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div ref={setNodeRef} style={style}>
            <div
                style={{
                    borderLeft: '3px solid #0972d3',
                    paddingLeft: 16,
                    paddingTop: 4,
                    paddingBottom: 4,
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 8,
                }}
            >
                <button
                    type="button"
                    {...attributes}
                    {...listeners}
                    style={{
                        cursor: isDragging ? 'grabbing' : 'grab',
                        padding: '2px 0 0 0',
                        color: '#5f6b7a',
                        flexShrink: 0,
                        touchAction: 'none',
                        background: 'none',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                    }}
                    title="Arrastra para reordenar"
                >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                        <circle cx="5.5" cy="3.5" r="1.5" />
                        <circle cx="10.5" cy="3.5" r="1.5" />
                        <circle cx="5.5" cy="8" r="1.5" />
                        <circle cx="10.5" cy="8" r="1.5" />
                        <circle cx="5.5" cy="12.5" r="1.5" />
                        <circle cx="10.5" cy="12.5" r="1.5" />
                    </svg>
                </button>

                <div style={{ flex: 1, minWidth: 0 }}>
                    <ColumnLayout columns={2}>
                        <SpaceBetween size="xxs">
                            {timeRange && (
                                <Box color="text-body-secondary" fontSize="body-s">
                                    {timeRange}
                                </Box>
                            )}
                            <Box variant="h3" tagOverride="p">
                                {item.title}
                            </Box>
                            {item.description && (
                                <Box color="text-body-secondary" fontSize="body-s">
                                    {item.description}
                                </Box>
                            )}
                            {speakerName && (
                                <Box fontSize="body-s">
                                    <strong>Speaker:</strong> {speakerName}
                                </Box>
                            )}
                            {item.location_detail && (
                                <Box fontSize="body-s">
                                    <strong>Lugar:</strong> {item.location_detail}
                                </Box>
                            )}
                        </SpaceBetween>

                        <Box float="right">
                            <SpaceBetween direction="horizontal" size="xs">
                                <Button
                                    variant="link"
                                    onClick={() =>
                                        router.visit(`/events/${event.id}/agenda/${item.id}/edit`)
                                    }
                                >
                                    Editar
                                </Button>
                                <Button variant="link" onClick={onDelete}>
                                    Eliminar
                                </Button>
                            </SpaceBetween>
                        </Box>
                    </ColumnLayout>
                </div>
            </div>
        </div>
    );
}
