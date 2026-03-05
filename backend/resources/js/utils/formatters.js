export function formatDate(dateString) {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('es-EC', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

export function formatDateLong(dateString) {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('es-EC', {
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

export function formatCurrency(value) {
    if (!value && value !== 0) return '-';
    return new Intl.NumberFormat('es-EC', { style: 'currency', currency: 'USD' }).format(value);
}

export function formatDateTimeLocal(dateString) {
    if (!dateString) return '';
    const d = new Date(dateString);
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
