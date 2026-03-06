import { Head } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import { formatEventDateRange } from '@/utils/formatters';

export default function EventWaitlist({ event, participant, position }) {
    return (
        <PublicLayout>
            <Head title={`Lista de espera - ${event.name}`} />

            <div className="success-page">
                {/* Waitlist header */}
                <div className="success-hero success-hero--waitlist">
                    <div className="success-hero__check success-hero__check--waitlist">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                        </svg>
                    </div>
                    <h1 className="success-hero__title">Estas en la lista de espera</h1>
                    <p className="success-hero__subtitle">
                        El evento <strong>{event.name}</strong> esta lleno, pero te hemos agregado a la lista de espera.
                    </p>
                </div>

                {/* Position card */}
                <div className="waitlist-card">
                    <div className="waitlist-card__position-section">
                        <span className="waitlist-card__position-label">Tu posicion en la lista</span>
                        <span className="waitlist-card__position-number">#{position}</span>
                    </div>

                    <div className="waitlist-card__info">
                        <div className="waitlist-card__field">
                            <span className="waitlist-card__label">Nombre</span>
                            <span className="waitlist-card__value">{participant.full_name}</span>
                        </div>
                        <div className="waitlist-card__field">
                            <span className="waitlist-card__label">Email</span>
                            <span className="waitlist-card__value waitlist-card__value--small">{participant.email}</span>
                        </div>
                    </div>

                    <div className="waitlist-card__event">
                        <div className="waitlist-card__event-name">{event.name}</div>
                        <div className="waitlist-card__event-details">
                            {event.date_start && (
                                <span className="waitlist-card__detail">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="4" width="18" height="18" rx="2" />
                                        <line x1="16" y1="2" x2="16" y2="6" />
                                        <line x1="8" y1="2" x2="8" y2="6" />
                                        <line x1="3" y1="10" x2="21" y2="10" />
                                    </svg>
                                    {formatEventDateRange(event.date_start, event.date_end)}
                                </span>
                            )}
                            {(event.location || event.venue) && (
                                <span className="waitlist-card__detail">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                        <circle cx="12" cy="10" r="3" />
                                    </svg>
                                    {[event.venue, event.location].filter(Boolean).join(', ')}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Info box */}
                <div className="waitlist-info">
                    <h3 className="waitlist-info__title">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="16" x2="12" y2="12" />
                            <line x1="12" y1="8" x2="12.01" y2="8" />
                        </svg>
                        Que significa esto?
                    </h3>
                    <ul className="waitlist-info__list">
                        <li>Si alguien cancela su registro, avanzaras automaticamente en la lista.</li>
                        <li>Cuando llegue tu turno, recibiras un email de confirmacion con tu entrada digital.</li>
                        <li>No necesitas hacer nada mas, te notificaremos automaticamente.</li>
                    </ul>
                </div>

                {/* Actions */}
                <div className="success-buttons">
                    <a href={`/e/${event.slug}`} className="success-buttons__secondary">
                        Ver pagina del evento
                    </a>
                </div>
            </div>

            <style>{`
                .success-hero--waitlist {
                    background: linear-gradient(135deg, #fef6e7 0%, #fde8c9 100%);
                }
                .success-hero__check--waitlist {
                    background: linear-gradient(135deg, #f89c0e 0%, #c27607 100%);
                    animation: pulse-orange 2s infinite;
                }
                @keyframes pulse-orange {
                    0%, 100% { box-shadow: 0 0 0 0 rgba(248, 156, 14, 0.4); }
                    50% { box-shadow: 0 0 0 12px rgba(248, 156, 14, 0); }
                }

                .waitlist-card {
                    background: #fff;
                    border-radius: 16px;
                    box-shadow: 0 4px 24px rgba(0,0,0,0.08);
                    overflow: hidden;
                    margin-bottom: 24px;
                }
                .waitlist-card__position-section {
                    background: linear-gradient(135deg, #f89c0e 0%, #c27607 100%);
                    padding: 32px;
                    text-align: center;
                }
                .waitlist-card__position-label {
                    display: block;
                    font-size: 11px;
                    text-transform: uppercase;
                    letter-spacing: 1.5px;
                    color: rgba(255,255,255,0.7);
                    font-weight: 600;
                    margin-bottom: 8px;
                }
                .waitlist-card__position-number {
                    display: block;
                    font-size: 64px;
                    font-weight: 700;
                    color: #fff;
                    line-height: 1;
                }
                .waitlist-card__info {
                    padding: 24px 32px;
                    border-bottom: 1px solid #f0f2f5;
                }
                .waitlist-card__field {
                    margin-bottom: 16px;
                }
                .waitlist-card__field:last-child {
                    margin-bottom: 0;
                }
                .waitlist-card__label {
                    display: block;
                    font-size: 10px;
                    text-transform: uppercase;
                    letter-spacing: 0.8px;
                    color: #9ba7b6;
                    font-weight: 600;
                    margin-bottom: 4px;
                }
                .waitlist-card__value {
                    font-size: 16px;
                    font-weight: 600;
                    color: #16191f;
                }
                .waitlist-card__value--small {
                    font-size: 14px;
                    font-weight: 500;
                }
                .waitlist-card__event {
                    padding: 20px 32px;
                    background: #f8f9fb;
                }
                .waitlist-card__event-name {
                    font-size: 15px;
                    font-weight: 600;
                    color: #16191f;
                    margin-bottom: 8px;
                }
                .waitlist-card__event-details {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 16px;
                }
                .waitlist-card__detail {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 13px;
                    color: #687078;
                }
                .waitlist-card__detail svg {
                    color: #9ba7b6;
                }

                .waitlist-info {
                    background: #f8f9fb;
                    border-radius: 12px;
                    padding: 20px 24px;
                    margin-bottom: 24px;
                }
                .waitlist-info__title {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 15px;
                    font-weight: 600;
                    color: #16191f;
                    margin: 0 0 12px;
                }
                .waitlist-info__title svg {
                    color: #f89c0e;
                }
                .waitlist-info__list {
                    margin: 0;
                    padding-left: 20px;
                    color: #414d5c;
                    font-size: 14px;
                    line-height: 1.6;
                }
                .waitlist-info__list li {
                    margin-bottom: 6px;
                }
                .waitlist-info__list li:last-child {
                    margin-bottom: 0;
                }
            `}</style>
        </PublicLayout>
    );
}
