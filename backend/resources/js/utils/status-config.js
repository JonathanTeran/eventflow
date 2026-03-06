export const eventStatusConfig = {
    draft: { label: 'Borrador', type: 'stopped' },
    published: { label: 'Publicado', type: 'info' },
    active: { label: 'Activo', type: 'success' },
    completed: { label: 'Completado', type: 'success' },
    cancelled: { label: 'Cancelado', type: 'error' },
};

export const participantStatusConfig = {
    registered: { label: 'Registrado', type: 'info' },
    confirmed: { label: 'Confirmado', type: 'success' },
    attended: { label: 'Asistido', type: 'success' },
    cancelled: { label: 'Cancelado', type: 'stopped' },
};

export const ticketTypeConfig = {
    general: { label: 'General', type: 'info' },
    vip: { label: 'VIP', type: 'warning' },
    student: { label: 'Estudiante', type: 'info' },
};

export const statusActions = [
    { from: 'draft', to: 'published', label: 'Publicar' },
    { from: 'draft', to: 'cancelled', label: 'Cancelar', danger: true },
    { from: 'published', to: 'active', label: 'Activar' },
    { from: 'published', to: 'draft', label: 'Volver a borrador' },
    { from: 'published', to: 'cancelled', label: 'Cancelar', danger: true },
    { from: 'active', to: 'completed', label: 'Completar' },
    { from: 'active', to: 'cancelled', label: 'Cancelar', danger: true },
    { from: 'completed', to: 'draft', label: 'Volver a borrador' },
    { from: 'cancelled', to: 'draft', label: 'Volver a borrador' },
];

export const allStatuses = [
    { value: 'draft', label: 'Borrador' },
    { value: 'published', label: 'Publicado' },
    { value: 'active', label: 'Activo' },
    { value: 'completed', label: 'Completado' },
    { value: 'cancelled', label: 'Cancelado' },
];

export const agendaTypeConfig = {
    talk:       { label: 'Charla',     border: '#0972d3', bg: '#e8f0fe', text: '#033160' },
    workshop:   { label: 'Taller',     border: '#1e8e3e', bg: '#e6f4ea', text: '#0d652d' },
    break:      { label: 'Descanso',   border: '#9aa0a6', bg: '#f1f3f4', text: '#5f6368' },
    networking: { label: 'Networking',  border: '#f9a825', bg: '#fef3e0', text: '#7c4a00' },
    ceremony:   { label: 'Ceremonia',  border: '#8430ce', bg: '#f3e8fd', text: '#4a0e78' },
};
