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
    { from: 'published', to: 'active', label: 'Activar' },
    { from: 'active', to: 'completed', label: 'Completar' },
    { from: 'draft', to: 'cancelled', label: 'Cancelar', danger: true },
    { from: 'published', to: 'cancelled', label: 'Cancelar', danger: true },
];
