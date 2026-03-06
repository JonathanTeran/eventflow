function parseDate(dateString) {
    const match = dateString.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (match) {
        return new Date(+match[1], +match[2] - 1, +match[3]);
    }
    return new Date(dateString);
}

export function formatDate(dateString) {
    if (!dateString) return '';
    return parseDate(dateString).toLocaleDateString('es-EC', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

export function formatDateLong(dateString) {
    if (!dateString) return '';
    return parseDate(dateString).toLocaleDateString('es-EC', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
}

export function formatTime(dateString) {
    if (!dateString) return '';
    return new Date(dateString).toLocaleTimeString('es-EC', {
        hour: '2-digit',
        minute: '2-digit',
    });
}

export function formatEventDateRange(dateStart, dateEnd) {
    if (!dateStart) return '';

    const start = parseDate(dateStart);
    const end = dateEnd ? parseDate(dateEnd) : null;

    const startDateStr = formatDateLong(dateStart);

    const sameDay = !end || (
        start.getFullYear() === end.getFullYear() &&
        start.getMonth() === end.getMonth() &&
        start.getDate() === end.getDate()
    );

    if (sameDay) {
        const pad = (n) => String(n).padStart(2, '0');
        const sH = start.getHours(), sM = start.getMinutes();
        const eH = end ? end.getHours() : 0, eM = end ? end.getMinutes() : 0;
        const hasStart = sH !== 0 || sM !== 0;
        const hasEnd = eH !== 0 || eM !== 0;

        if (hasStart && hasEnd) {
            return `${startDateStr} · ${pad(sH)}:${pad(sM)} - ${pad(eH)}:${pad(eM)}`;
        }
        if (hasStart) {
            return `${startDateStr} · ${pad(sH)}:${pad(sM)}`;
        }
        return startDateStr;
    }

    const endDateStr = formatDateLong(dateEnd);
    return `${startDateStr} - ${endDateStr}`;
}

export function formatCurrency(value) {
    if (!value && value !== 0) return '-';
    return new Intl.NumberFormat('es-EC', { style: 'currency', currency: 'USD' }).format(value);
}

export function formatDateTimeLocal(dateString) {
    if (!dateString) return '';
    const d = parseDate(dateString);
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
