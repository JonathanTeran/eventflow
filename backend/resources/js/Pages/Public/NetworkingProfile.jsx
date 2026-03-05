import { Head } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import { useState } from 'react';

export default function NetworkingProfile({ event, participant, connectionStatus: initialConnectionStatus, viewerRegistrationCode }) {
    const [connectionStatus, setConnectionStatus] = useState(initialConnectionStatus);
    const [loading, setLoading] = useState(false);
    const [showPinInput, setShowPinInput] = useState(false);
    const [pin, setPin] = useState('');
    const [pinError, setPinError] = useState('');

    const baseUrl = `/e/${event.slug}/networking`;
    const viewerBaseUrl = viewerRegistrationCode ? `${baseUrl}/${viewerRegistrationCode}` : null;

    const getInitials = (fullName) => {
        return fullName
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const handleConnect = async () => {
        if (!viewerRegistrationCode || connectionStatus === 'self') return;
        setLoading(true);
        try {
            await window.axios.post(`${viewerBaseUrl}/contacts/save`, {
                connected_participant_id: participant.id,
            });
            setConnectionStatus('pending_sent');
        } catch {
            // silent fail
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async () => {
        if (!viewerRegistrationCode) return;
        setLoading(true);
        try {
            await window.axios.post(`${viewerBaseUrl}/contacts/accept`, {
                requester_participant_id: participant.id,
            });
            setConnectionStatus('accepted');
            // Refresh para obtener los datos completos del servidor
            window.location.reload();
        } catch {
            // silent fail
        } finally {
            setLoading(false);
        }
    };

    const handleReject = async () => {
        if (!viewerRegistrationCode) return;
        setLoading(true);
        try {
            await window.axios.post(`${viewerBaseUrl}/contacts/reject`, {
                requester_participant_id: participant.id,
            });
            setConnectionStatus('none');
        } catch {
            // silent fail
        } finally {
            setLoading(false);
        }
    };

    const handleConnectWithPin = async () => {
        if (!viewerRegistrationCode || connectionStatus === 'self' || pin.length !== 6) return;
        setLoading(true);
        setPinError('');
        try {
            await window.axios.post(`${viewerBaseUrl}/contacts/connect-with-pin`, {
                target_participant_id: participant.id,
                pin: pin,
            });
            setConnectionStatus('accepted');
            window.location.reload();
        } catch (error) {
            setPinError(error.response?.data?.message || 'PIN incorrecto. Intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    const socialLinks = participant.social_links || {};
    const hasSocialLinks = Object.values(socialLinks).some((v) => v);

    const socialIcons = [
        {
            key: 'linkedin',
            label: 'LinkedIn',
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
            ),
        },
        {
            key: 'github',
            label: 'GitHub',
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" /></svg>
            ),
        },
        {
            key: 'instagram',
            label: 'Instagram',
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
            ),
        },
        {
            key: 'website',
            label: 'Sitio web',
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" /></svg>
            ),
        },
        {
            key: 'whatsapp',
            label: 'WhatsApp',
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
            ),
            getHref: (val) => {
                const digits = val.replace(/\D/g, '');
                return `https://wa.me/${digits}`;
            },
        },
    ];

    return (
        <PublicLayout>
            <Head title={`${participant.full_name} - Networking`} />

            <div className="profile-header">
                <div className="profile-header__content">
                    <div className="profile-header__avatar">
                        {getInitials(participant.full_name)}
                    </div>
                    <h1 className="profile-header__name">{participant.full_name}</h1>
                    {participant.job_title && (
                        <p className="profile-header__role">{participant.job_title}</p>
                    )}
                    {participant.company && (
                        <p className="profile-header__company">{participant.company}</p>
                    )}
                </div>
            </div>

            <div className="profile-content">
                {/* Always show public basic info but lock sensitive info */}
                {['self', 'accepted'].includes(connectionStatus) ? (
                    <>
                        {/* Contact Info */}
                        <div className="profile-card">
                            <h2 className="profile-card__title">Contacto</h2>

                            {participant.email && (
                                <a href={`mailto:${participant.email}`} className="profile-contact-item">
                                    <span className="profile-contact-item__icon">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" /></svg>
                                    </span>
                                    {participant.email}
                                </a>
                            )}
                        </div>

                        {/* Social Links */}
                        {hasSocialLinks && (
                            <div className="profile-card">
                                <h2 className="profile-card__title">Redes Sociales</h2>
                                <div className="profile-social-list">
                                    {socialIcons.map(({ key, label, icon, getHref }) => {
                                        const value = socialLinks[key];
                                        if (!value) return null;
                                        const href = getHref ? getHref(value) : value;
                                        return (
                                            <a
                                                key={key}
                                                href={href}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="profile-social-link"
                                            >
                                                <span className="profile-social-link__icon">{icon}</span>
                                                <span className="profile-social-link__label">{label}</span>
                                            </a>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Save Contact Button is handled below in the Actions Section based on state */}
                    </>
                ) : (
                    <div className="profile-card">
                        <h2 className="profile-card__title" style={{ color: '#888' }}>
                            <svg style={{ verticalAlign: 'middle', marginRight: '8px' }} width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V10h2v6zm2-8h-2V6h2v2z" />
                            </svg>
                            Información Privada
                        </h2>
                        <p className="profile-card__description" style={{ color: '#687078', fontSize: '14px' }}>
                            Envía una solicitud para conectar con <strong>{participant.first_name}</strong> y poder ver su información de contacto (correo, teléfono y redes sociales).
                        </p>
                    </div>
                )}

                {/* Connection Status & Actions */}
                {viewerRegistrationCode && connectionStatus !== 'self' && (
                    <div className="profile-actions">
                        {connectionStatus === 'accepted' ? (
                            <div className="networking-badge networking-badge--saved networking-badge--large">
                                <svg style={{ marginRight: '6px' }} width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
                                Contacto Agregado
                            </div>
                        ) : connectionStatus === 'pending_sent' ? (
                            <div className="networking-badge" style={{ backgroundColor: '#f0f4f8', color: '#4a5568', width: '100%', padding: '12px', textAlign: 'center', borderRadius: '8px', fontSize: '15px', fontWeight: '500' }}>
                                <svg style={{ verticalAlign: 'middle', marginRight: '6px' }} width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" /></svg>
                                Solicitud Enviada
                            </div>
                        ) : connectionStatus === 'pending_received' ? (
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button
                                    onClick={handleAccept}
                                    disabled={loading}
                                    className={`networking-btn networking-btn--primary networking-btn--full ${loading ? 'networking-btn--disabled' : ''}`}
                                    style={{ flex: 1 }}
                                >
                                    Aceptar Solicitud
                                </button>
                                <button
                                    onClick={handleReject}
                                    disabled={loading}
                                    className={`networking-btn ${loading ? 'networking-btn--disabled' : ''}`}
                                    style={{ flex: 1, backgroundColor: '#fed7d7', color: '#c53030' }}
                                >
                                    Ignorar
                                </button>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {!showPinInput ? (
                                    <>
                                        <button
                                            onClick={handleConnect}
                                            disabled={loading}
                                            className={`networking-btn networking-btn--primary networking-btn--full networking-btn--large ${loading ? 'networking-btn--disabled' : ''}`}
                                        >
                                            {loading ? 'Enviando...' : 'Conectar'}
                                        </button>
                                        <button
                                            onClick={() => setShowPinInput(true)}
                                            disabled={loading}
                                            className="networking-btn networking-btn--full"
                                            style={{ backgroundColor: '#edf2f7', color: '#4a5568', borderColor: '#edf2f7' }}
                                        >
                                            Ingresar PIN de {participant.first_name}
                                        </button>
                                    </>
                                ) : (
                                    <div style={{ backgroundColor: '#f7fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0', width: '100%' }}>
                                        <p style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#4a5568', fontWeight: '500' }}>
                                            Ingresa el PIN de 6 dígitos de {participant.first_name} para conectar instantáneamente:
                                        </p>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <input
                                                type="text"
                                                maxLength="6"
                                                value={pin}
                                                onChange={(e) => setPin(e.target.value.toUpperCase())}
                                                placeholder="EJ: ABC123"
                                                style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e0', textTransform: 'uppercase', textAlign: 'center', letterSpacing: '2px', fontWeight: 'bold' }}
                                            />
                                            <button
                                                onClick={handleConnectWithPin}
                                                disabled={loading || pin.length !== 6}
                                                className={`networking-btn networking-btn--primary ${loading || pin.length !== 6 ? 'networking-btn--disabled' : ''}`}
                                                style={{ padding: '0 20px', minWidth: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                            >
                                                {loading ? '...' : 'Validar'}
                                            </button>
                                        </div>
                                        {pinError && <p style={{ color: '#e53e3e', fontSize: '13px', margin: '8px 0 0 0' }}>{pinError}</p>}
                                        <button
                                            onClick={() => { setShowPinInput(false); setPinError(''); setPin(''); }}
                                            style={{ background: 'none', border: 'none', color: '#718096', fontSize: '13px', marginTop: '10px', cursor: 'pointer', textDecoration: 'underline', padding: 0, width: '100%', textAlign: 'center' }}
                                        >
                                            Cancelar
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Back link */}
                <div className="profile-back">
                    {viewerRegistrationCode ? (
                        <a href={`${baseUrl}/${viewerRegistrationCode}`} className="profile-back__link">
                            &larr; Volver a Networking
                        </a>
                    ) : (
                        <p className="profile-back__text">
                            {event.name}
                        </p>
                    )}
                </div>
            </div>
        </PublicLayout>
    );
}
