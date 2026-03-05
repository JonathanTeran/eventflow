import { Head } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import { useState } from 'react';

export default function NetworkingContacts({ event, contacts: initialContacts, requests: initialRequests, participant }) {
    const [contacts, setContacts] = useState(initialContacts || []);
    const [requests, setRequests] = useState(initialRequests || []);
    const [removingId, setRemovingId] = useState(null);
    const [activeTab, setActiveTab] = useState('contacts');

    const baseUrl = `/e/${event.slug}/networking/${participant.registration_code}`;

    const getInitials = (fullName) => {
        return fullName
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const handleRemoveContact = async (contactId) => {
        setRemovingId(contactId);
        try {
            await window.axios.post(`${baseUrl}/contacts/remove`, {
                connected_participant_id: contactId,
            });
            setContacts(contacts.filter((c) => c.id !== contactId));
        } catch {
            // silent fail
        } finally {
            setRemovingId(null);
        }
    };

    const handleAcceptRequest = async (requestId) => {
        setRemovingId(requestId);
        try {
            await window.axios.post(`${baseUrl}/contacts/accept`, {
                requester_participant_id: requestId,
            });
            // Remover de pendientes
            setRequests(requests.filter((r) => r.id !== requestId));
            // Refrescar página para cargar los nuevos contactos (o agregarlo localmente)
            window.location.reload();
        } catch {
            // silent fail
        } finally {
            setRemovingId(null);
        }
    };

    const handleRejectRequest = async (requestId) => {
        setRemovingId(requestId);
        try {
            await window.axios.post(`${baseUrl}/contacts/reject`, {
                requester_participant_id: requestId,
            });
            setRequests(requests.filter((r) => r.id !== requestId));
        } catch {
            // silent fail
        } finally {
            setRemovingId(null);
        }
    };

    const socialIcons = {
        linkedin: {
            label: 'LinkedIn',
            icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>,
        },
        github: {
            label: 'GitHub',
            icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" /></svg>,
        },
        instagram: {
            label: 'Instagram',
            icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>,
        },
        website: {
            label: 'Web',
            icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" /></svg>,
        },
        whatsapp: {
            label: 'WhatsApp',
            icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>,
            getHref: (val) => {
                const digits = val.replace(/\D/g, '');
                return `https://wa.me/${digits}`;
            },
        },
    };

    return (
        <PublicLayout>
            <Head title={`Mis Contactos - ${event.name}`} />

            <div className="networking-header">
                <div className="networking-header__content">
                    <h1 className="networking-header__title">{event.name}</h1>
                    <p className="networking-header__greeting">Gestión de Contactos</p>
                </div>
            </div>

            <div className="contacts-container">
                <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '1px solid #e2e8f0' }}>
                    <button
                        onClick={() => setActiveTab('contacts')}
                        style={{
                            padding: '10px 20px',
                            background: 'none',
                            border: 'none',
                            borderBottom: activeTab === 'contacts' ? '2px solid #3182ce' : '2px solid transparent',
                            color: activeTab === 'contacts' ? '#3182ce' : '#4a5568',
                            fontWeight: activeTab === 'contacts' ? '600' : '400',
                            cursor: 'pointer',
                        }}
                    >
                        Mis Contactos ({contacts.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('requests')}
                        style={{
                            padding: '10px 20px',
                            background: 'none',
                            border: 'none',
                            borderBottom: activeTab === 'requests' ? '2px solid #3182ce' : '2px solid transparent',
                            color: activeTab === 'requests' ? '#3182ce' : '#4a5568',
                            fontWeight: activeTab === 'requests' ? '600' : '400',
                            cursor: 'pointer',
                        }}
                    >
                        Solicitudes Pendientes {requests.length > 0 && <span style={{ background: '#e53e3e', color: 'white', borderRadius: '12px', padding: '2px 8px', fontSize: '12px', marginLeft: '6px' }}>{requests.length}</span>}
                    </button>
                </div>

                {activeTab === 'contacts' ? (
                    contacts.length === 0 ? (
                        <div className="contacts-empty">
                            <div className="contacts-empty__icon">
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="#b0b8c1"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" /></svg>
                            </div>
                            <p className="contacts-empty__text">Aun no has guardado contactos</p>
                            <p className="contacts-empty__hint">
                                Busca participantes por su nombre o escanea códigos para conectar.
                            </p>
                        </div>
                    ) : (
                        <div className="contacts-list">
                            {contacts.map((contact) => {
                                const isRemoving = removingId === contact.id;
                                const contactSocialLinks = contact.social_links || {};
                                const hasSocials = Object.values(contactSocialLinks).some((v) => v);

                                return (
                                    <div key={contact.id} className="contact-card">
                                        <div className="contact-card__header">
                                            <div className="contact-card__avatar">
                                                {getInitials(contact.full_name)}
                                            </div>
                                            <div className="contact-card__main">
                                                <h3 className="contact-card__name">{contact.full_name}</h3>
                                                {contact.job_title && (
                                                    <p className="contact-card__role">{contact.job_title}</p>
                                                )}
                                                {contact.company && (
                                                    <p className="contact-card__company">{contact.company}</p>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => handleRemoveContact(contact.id)}
                                                disabled={isRemoving}
                                                className="networking-btn networking-btn--small networking-btn--danger"
                                                title="Eliminar contacto"
                                            >
                                                {isRemoving ? '...' : 'Eliminar'}
                                            </button>
                                        </div>

                                        <div className="contact-card__details">
                                            {contact.email && (
                                                <a href={`mailto:${contact.email}`} className="contact-card__link">
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" /></svg>
                                                    {contact.email}
                                                </a>
                                            )}

                                            {hasSocials && (
                                                <div className="contact-card__socials">
                                                    {Object.entries(contactSocialLinks).map(([key, value]) => {
                                                        if (!value || !socialIcons[key]) return null;
                                                        const { label, icon, getHref } = socialIcons[key];
                                                        const href = getHref ? getHref(value) : value;
                                                        return (
                                                            <a
                                                                key={key}
                                                                href={href}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="contact-card__social-link"
                                                                title={label}
                                                            >
                                                                {icon}
                                                            </a>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )
                ) : (
                    requests.length === 0 ? (
                        <div className="contacts-empty">
                            <div className="contacts-empty__icon">
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="#b0b8c1"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V10h2v6zm2-8h-2V6h2v2z" /></svg>
                            </div>
                            <p className="contacts-empty__text">No hay solicitudes pendientes</p>
                        </div>
                    ) : (
                        <div className="contacts-list">
                            {requests.map((request) => {
                                const isUpdating = removingId === request.id;
                                return (
                                    <div key={request.id} className="contact-card">
                                        <div className="contact-card__header">
                                            <div className="contact-card__avatar">
                                                {getInitials(request.full_name)}
                                            </div>
                                            <div className="contact-card__main">
                                                <h3 className="contact-card__name">{request.full_name}</h3>
                                                {request.job_title && (
                                                    <p className="contact-card__role">{request.job_title}</p>
                                                )}
                                                {request.company && (
                                                    <p className="contact-card__company">{request.company}</p>
                                                )}
                                            </div>
                                        </div>
                                        <div style={{ padding: '0 20px 20px', display: 'flex', gap: '10px' }}>
                                            <button
                                                onClick={() => handleAcceptRequest(request.id)}
                                                disabled={isUpdating}
                                                className="networking-btn networking-btn--primary"
                                                style={{ flex: 1, padding: '8px' }}
                                            >
                                                {isUpdating ? '...' : 'Aceptar'}
                                            </button>
                                            <button
                                                onClick={() => handleRejectRequest(request.id)}
                                                disabled={isUpdating}
                                                className="networking-btn"
                                                style={{ flex: 1, padding: '8px', backgroundColor: '#fed7d7', color: '#c53030' }}
                                            >
                                                {isUpdating ? '...' : 'Ignorar'}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )
                )}

                {/* Back link */}
                <div className="profile-back">
                    <a href={baseUrl} className="profile-back__link">
                        &larr; Volver a Networking
                    </a>
                </div>
            </div>
        </PublicLayout>
    );
}
