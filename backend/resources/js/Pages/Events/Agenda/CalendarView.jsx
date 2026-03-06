import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { router } from '@inertiajs/react';
import Box from '@cloudscape-design/components/box';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Button from '@cloudscape-design/components/button';
import Container from '@cloudscape-design/components/container';
import Header from '@cloudscape-design/components/header';
import { formatDate } from '@/utils/formatters';
import { agendaTypeConfig } from '@/utils/status-config';

const HOUR_HEIGHT = 60;
const SNAP_MINUTES = 15;

const TYPE_COLORS = Object.fromEntries(
    Object.entries(agendaTypeConfig).map(([k, v]) => [k, { border: v.border, bg: v.bg }])
);
const DEFAULT_COLOR = { border: '#0972d3', bg: '#e8f0fe' };

function parseMinutes(timeStr) {
    if (!timeStr) return null;
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
}

function minutesToTime(totalMin) {
    const h = Math.floor(totalMin / 60);
    const m = totalMin % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function snapToInterval(minutes) {
    return Math.round(minutes / SNAP_MINUTES) * SNAP_MINUTES;
}

function formatHour(hour) {
    return `${String(hour).padStart(2, '0')}:00`;
}

export default function CalendarView({ localItemsByDate, sortedDates, event, speakers, onDelete, onMove }) {
    const [drag, setDrag] = useState(null);
    const columnRefs = useRef({});
    const gridRef = useRef(null);

    const isMultiDay = event.date_start && event.date_end &&
        event.date_start.slice(0, 10) !== event.date_end.slice(0, 10);

    function dayLabel(dateKey) {
        const label = formatDate(dateKey);
        if (!isMultiDay) return label;
        const start = new Date(event.date_start.slice(0, 10));
        const current = new Date(dateKey);
        const dayNum = Math.round((current - start) / 86400000) + 1;
        return `Día ${dayNum} – ${label}`;
    }

    const { startHour, endHour, scheduledByDate, unscheduled } = useMemo(() => {
        let minMin = Infinity;
        let maxMin = -Infinity;
        const scheduled = {};
        const noTime = [];

        for (const dateKey of sortedDates) {
            scheduled[dateKey] = [];
            for (const item of localItemsByDate[dateKey]) {
                const startMin = parseMinutes(item.start_time);
                const endMin = parseMinutes(item.end_time);
                if (startMin !== null && endMin !== null) {
                    if (startMin < minMin) minMin = startMin;
                    if (endMin > maxMin) maxMin = endMin;
                    scheduled[dateKey].push(item);
                } else {
                    noTime.push(item);
                }
            }
        }

        const sH = minMin === Infinity ? 8 : Math.floor(minMin / 60);
        const eH = maxMin === -Infinity ? 20 : Math.ceil(maxMin / 60);

        return {
            startHour: sH,
            endHour: Math.max(eH, sH + 1),
            scheduledByDate: scheduled,
            unscheduled: noTime,
        };
    }, [localItemsByDate, sortedDates]);

    const hours = [];
    for (let h = startHour; h < endHour; h++) {
        hours.push(h);
    }

    const totalHeight = hours.length * HOUR_HEIGHT;

    const handleDragStart = useCallback((item, dateKey, mouseEvent) => {
        const colEl = columnRefs.current[dateKey];
        if (!colEl) return;

        const colRect = colEl.getBoundingClientRect();
        const startMin = parseMinutes(item.start_time);
        const blockTop = ((startMin - startHour * 60) / 60) * HOUR_HEIGHT;
        const offsetY = mouseEvent.clientY - colRect.top - blockTop;
        const duration = parseMinutes(item.end_time) - startMin;

        setDrag({
            item,
            originDateKey: dateKey,
            offsetY,
            duration,
            currentDateKey: dateKey,
            currentStartMin: startMin,
        });
    }, [startHour]);

    useEffect(() => {
        if (!drag) return;

        function handleMouseMove(e) {
            // Find which column the mouse is over
            let targetDateKey = null;
            for (const dateKey of sortedDates) {
                const colEl = columnRefs.current[dateKey];
                if (!colEl) continue;
                const rect = colEl.getBoundingClientRect();
                if (e.clientX >= rect.left && e.clientX <= rect.right) {
                    targetDateKey = dateKey;
                    break;
                }
            }

            if (!targetDateKey) return;

            const colEl = columnRefs.current[targetDateKey];
            const colRect = colEl.getBoundingClientRect();
            const relativeY = e.clientY - colRect.top - drag.offsetY;
            const rawMinutes = (relativeY / HOUR_HEIGHT) * 60 + startHour * 60;
            const snappedStart = snapToInterval(Math.max(0, rawMinutes));

            setDrag((prev) => ({
                ...prev,
                currentDateKey: targetDateKey,
                currentStartMin: snappedStart,
            }));
        }

        function handleMouseUp() {
            setDrag((prev) => {
                if (!prev) return null;

                const newStartMin = prev.currentStartMin;
                const newEndMin = newStartMin + prev.duration;
                const newDate = prev.currentDateKey;
                const oldStartMin = parseMinutes(prev.item.start_time);

                if (newDate === prev.originDateKey && newStartMin === oldStartMin) {
                    return null;
                }

                if (onMove) {
                    onMove(prev.item, {
                        date: newDate,
                        start_time: minutesToTime(newStartMin),
                        end_time: minutesToTime(newEndMin),
                    });
                }

                return null;
            });
        }

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [drag, sortedDates, startHour, onMove]);

    // Add grabbing cursor to body during drag
    useEffect(() => {
        if (drag) {
            document.body.style.cursor = 'grabbing';
            document.body.style.userSelect = 'none';
        } else {
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        }
    }, [drag]);

    return (
        <SpaceBetween size="l">
            <div
                style={{
                    overflowX: 'auto',
                    border: '1px solid #e9ebed',
                    borderRadius: 8,
                    background: '#fff',
                }}
            >
                <div
                    ref={gridRef}
                    style={{
                        display: 'grid',
                        gridTemplateColumns: `60px repeat(${sortedDates.length}, minmax(180px, 1fr))`,
                        minWidth: sortedDates.length > 3 ? sortedDates.length * 200 + 60 : undefined,
                    }}
                >
                    {/* Header row */}
                    <div style={{
                        borderBottom: '1px solid #e9ebed',
                        borderRight: '1px solid #e9ebed',
                        padding: '8px 4px',
                        background: '#fafafa',
                        position: 'sticky',
                        left: 0,
                        zIndex: 2,
                    }} />
                    {sortedDates.map((dateKey) => (
                        <div
                            key={dateKey}
                            style={{
                                borderBottom: '1px solid #e9ebed',
                                borderRight: '1px solid #f0f0f0',
                                padding: '8px 12px',
                                fontWeight: 700,
                                fontSize: 13,
                                background: '#fafafa',
                                textAlign: 'center',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            {dayLabel(dateKey)}
                        </div>
                    ))}

                    {/* Time labels column */}
                    <div style={{
                        position: 'sticky',
                        left: 0,
                        zIndex: 1,
                        background: '#fff',
                        borderRight: '1px solid #e9ebed',
                    }}>
                        {hours.map((h) => (
                            <div
                                key={h}
                                style={{
                                    height: HOUR_HEIGHT,
                                    fontSize: 11,
                                    color: '#5f6b7a',
                                    padding: '2px 6px 0 6px',
                                    borderBottom: '1px solid #f0f0f0',
                                    boxSizing: 'border-box',
                                }}
                            >
                                {formatHour(h)}
                            </div>
                        ))}
                    </div>

                    {/* Day columns */}
                    {sortedDates.map((dateKey) => (
                        <div
                            key={dateKey}
                            ref={(el) => { columnRefs.current[dateKey] = el; }}
                            style={{
                                position: 'relative',
                                height: totalHeight,
                                borderRight: '1px solid #f0f0f0',
                            }}
                        >
                            {/* Hour grid lines */}
                            {hours.map((h) => (
                                <div
                                    key={h}
                                    style={{
                                        position: 'absolute',
                                        top: (h - startHour) * HOUR_HEIGHT,
                                        left: 0,
                                        right: 0,
                                        borderBottom: '1px solid #f0f0f0',
                                        height: HOUR_HEIGHT,
                                        boxSizing: 'border-box',
                                    }}
                                />
                            ))}

                            {/* Ghost preview during drag */}
                            {drag && drag.currentDateKey === dateKey && (
                                <DragGhost
                                    item={drag.item}
                                    startMin={drag.currentStartMin}
                                    duration={drag.duration}
                                    startHour={startHour}
                                />
                            )}

                            {/* Session blocks */}
                            {(scheduledByDate[dateKey] || []).map((item) => (
                                <SessionBlock
                                    key={item.id}
                                    item={item}
                                    startHour={startHour}
                                    event={event}
                                    speakers={speakers}
                                    onDelete={onDelete}
                                    onDragStart={(e) => handleDragStart(item, dateKey, e)}
                                    isDragging={drag?.item.id === item.id}
                                />
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            {unscheduled.length > 0 && (
                <Container header={<Header variant="h3">Sesiones sin horario asignado</Header>}>
                    <SpaceBetween size="xs">
                        {unscheduled.map((item) => (
                            <div
                                key={item.id}
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '8px 12px',
                                    borderLeft: `3px solid ${(TYPE_COLORS[item.type] || DEFAULT_COLOR).border}`,
                                    background: (TYPE_COLORS[item.type] || DEFAULT_COLOR).bg,
                                    borderRadius: 4,
                                }}
                            >
                                <div>
                                    <Box variant="strong">{item.title}</Box>
                                    {item.type && (
                                        <Box fontSize="body-s" color="text-body-secondary"> {item.type}</Box>
                                    )}
                                </div>
                                <SpaceBetween direction="horizontal" size="xs">
                                    <Button
                                        variant="link"
                                        onClick={() => router.visit(`/events/${event.id}/agenda/${item.id}/edit`)}
                                    >
                                        Editar
                                    </Button>
                                    <Button variant="link" onClick={() => onDelete(item)}>
                                        Eliminar
                                    </Button>
                                </SpaceBetween>
                            </div>
                        ))}
                    </SpaceBetween>
                </Container>
            )}
        </SpaceBetween>
    );
}

function DragGhost({ item, startMin, duration, startHour }) {
    const colors = TYPE_COLORS[item.type] || DEFAULT_COLOR;
    const top = ((startMin - startHour * 60) / 60) * HOUR_HEIGHT;
    const height = Math.max((duration / 60) * HOUR_HEIGHT, 20);
    const timeRange = `${minutesToTime(startMin)} – ${minutesToTime(startMin + duration)}`;

    return (
        <div
            style={{
                position: 'absolute',
                top,
                left: 4,
                right: 4,
                height,
                background: colors.bg,
                borderLeft: `3px solid ${colors.border}`,
                borderRadius: 4,
                padding: '3px 6px',
                fontSize: 12,
                overflow: 'hidden',
                zIndex: 5,
                opacity: 0.85,
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                pointerEvents: 'none',
                border: `1px dashed ${colors.border}`,
            }}
        >
            <div style={{ fontWeight: 600, lineHeight: '16px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {item.title}
            </div>
            {height >= 36 && (
                <div style={{ color: '#5f6b7a', fontSize: 11, marginTop: 1 }}>
                    {timeRange}
                </div>
            )}
        </div>
    );
}

function SessionBlock({ item, startHour, event, speakers, onDelete, onDragStart, isDragging }) {
    const [popoverOpen, setPopoverOpen] = useState(false);
    const blockRef = useRef(null);
    const popoverRef = useRef(null);
    const dragStartPos = useRef(null);

    const startMin = parseMinutes(item.start_time);
    const endMin = parseMinutes(item.end_time);
    const colors = TYPE_COLORS[item.type] || DEFAULT_COLOR;

    const top = ((startMin - startHour * 60) / 60) * HOUR_HEIGHT;
    const height = Math.max(((endMin - startMin) / 60) * HOUR_HEIGHT, 20);

    const speakerName = useMemo(() => {
        if (item.speaker) return `${item.speaker.first_name} ${item.speaker.last_name}`;
        const found = speakers?.find((s) => s.id === item.speaker_id);
        return found ? `${found.first_name} ${found.last_name}` : null;
    }, [item, speakers]);

    const timeRange = [item.start_time, item.end_time].filter(Boolean).map((t) => t.slice(0, 5)).join(' – ');

    useEffect(() => {
        if (!popoverOpen) return;
        function handleClickOutside(e) {
            if (
                blockRef.current && !blockRef.current.contains(e.target) &&
                popoverRef.current && !popoverRef.current.contains(e.target)
            ) {
                setPopoverOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [popoverOpen]);

    function handleMouseDown(e) {
        if (e.button !== 0) return;
        dragStartPos.current = { x: e.clientX, y: e.clientY };

        function handleInitialMove(moveEvent) {
            const dx = moveEvent.clientX - dragStartPos.current.x;
            const dy = moveEvent.clientY - dragStartPos.current.y;
            if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
                document.removeEventListener('mousemove', handleInitialMove);
                document.removeEventListener('mouseup', handleInitialUp);
                setPopoverOpen(false);
                onDragStart(e);
            }
        }

        function handleInitialUp() {
            document.removeEventListener('mousemove', handleInitialMove);
            document.removeEventListener('mouseup', handleInitialUp);
            dragStartPos.current = null;
        }

        document.addEventListener('mousemove', handleInitialMove);
        document.addEventListener('mouseup', handleInitialUp);
    }

    return (
        <>
            <div
                ref={blockRef}
                onMouseDown={handleMouseDown}
                onClick={() => {
                    if (!isDragging) setPopoverOpen((v) => !v);
                }}
                title={`${item.title}\n${timeRange}${speakerName ? `\n${speakerName}` : ''}${item.description ? `\n${item.description}` : ''}`}
                style={{
                    position: 'absolute',
                    top,
                    left: 4,
                    right: 4,
                    height,
                    background: colors.bg,
                    borderLeft: `3px solid ${colors.border}`,
                    borderRadius: 4,
                    padding: '3px 6px',
                    fontSize: 12,
                    cursor: isDragging ? 'grabbing' : 'grab',
                    overflow: 'hidden',
                    zIndex: isDragging ? 0 : 1,
                    boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
                    transition: isDragging ? 'none' : 'box-shadow 0.15s',
                    opacity: isDragging ? 0.3 : 1,
                }}
                onMouseEnter={(e) => { if (!isDragging) e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.12)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.06)'; }}
            >
                <div style={{ fontWeight: 600, lineHeight: '16px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.title}
                </div>
                {height >= 36 && (
                    <div style={{ color: '#5f6b7a', fontSize: 11, marginTop: 1 }}>
                        {timeRange}
                    </div>
                )}
            </div>

            {popoverOpen && !isDragging && (
                <div
                    ref={popoverRef}
                    style={{
                        position: 'absolute',
                        top: top + height + 4,
                        left: 4,
                        right: 4,
                        background: '#fff',
                        border: '1px solid #d5dbdb',
                        borderRadius: 8,
                        padding: 12,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        zIndex: 10,
                        fontSize: 13,
                    }}
                >
                    <SpaceBetween size="xs">
                        <Box variant="strong">{item.title}</Box>
                        <Box fontSize="body-s" color="text-body-secondary">{timeRange}</Box>
                        {item.type && (
                            <Box fontSize="body-s">
                                <strong>Tipo:</strong> {item.type}
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
                        {item.description && (
                            <Box fontSize="body-s" color="text-body-secondary">
                                {item.description}
                            </Box>
                        )}
                        <SpaceBetween direction="horizontal" size="xs">
                            <Button
                                variant="link"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    router.visit(`/events/${event.id}/agenda/${item.id}/edit`);
                                }}
                            >
                                Editar
                            </Button>
                            <Button
                                variant="link"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete(item);
                                }}
                            >
                                Eliminar
                            </Button>
                        </SpaceBetween>
                    </SpaceBetween>
                </div>
            )}
        </>
    );
}
