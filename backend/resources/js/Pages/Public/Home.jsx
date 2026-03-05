import { Head, router } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import { formatDateLong } from '@/utils/formatters';
import { useState } from 'react';

function formatDateRange(start, end) {
    const s = formatDateLong(start);
    const e = end ? formatDateLong(end) : null;
    if (!e || s === e) return s;
    return `${s} - ${e}`;
}

function getMonthDay(dateString) {
    if (!dateString) return null;
    const d = new Date(dateString);
    const month = d.toLocaleDateString('es-EC', { month: 'short' }).toUpperCase().replace('.', '');
    const day = d.getDate();
    return { month, day };
}

export default function Home({ events, search }) {
    const [searchValue, setSearchValue] = useState(search || '');

    function handleSearch(e) {
        e.preventDefault();
        router.get('/', { search: searchValue || undefined }, { preserveState: true });
    }

    const totalEvents = events.total || events.data.length;

    return (
        <PublicLayout>
            <Head title="Descubre Eventos" />

            {/* Hero */}
            <section className="home-hero">
                <div className="home-hero__shapes">
                    <div className="home-hero__shape home-hero__shape--1" />
                    <div className="home-hero__shape home-hero__shape--2" />
                    <div className="home-hero__shape home-hero__shape--3" />
                </div>
                <div className="home-hero__inner">
                    <span className="home-hero__badge">La plataforma de eventos #1</span>
                    <h1 className="home-hero__title">
                        Descubre eventos que<br />
                        <span className="home-hero__title-accent">inspiran y conectan</span>
                    </h1>
                    <p className="home-hero__subtitle">
                        Encuentra conferencias, workshops, meetups y experiencias de tecnologia
                        cerca de ti. Registrate y conecta con la comunidad.
                    </p>
                    <form className="home-search" onSubmit={handleSearch}>
                        <div className="home-search__icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="11" cy="11" r="8" />
                                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            className="home-search__input"
                            placeholder="Buscar eventos, ciudades o temas..."
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                        />
                        <button type="submit" className="home-search__btn">
                            Buscar eventos
                        </button>
                    </form>
                    <div className="home-hero__tags">
                        <span className="home-hero__tag">Conferencias</span>
                        <span className="home-hero__tag">Workshops</span>
                        <span className="home-hero__tag">Meetups</span>
                        <span className="home-hero__tag">Networking</span>
                        <span className="home-hero__tag">Hackathons</span>
                    </div>
                </div>
            </section>

            {/* Stats strip */}
            <section className="home-stats">
                <div className="home-stats__inner">
                    <div className="home-stats__item">
                        <span className="home-stats__number">{totalEvents}+</span>
                        <span className="home-stats__label">Eventos</span>
                    </div>
                    <div className="home-stats__divider" />
                    <div className="home-stats__item">
                        <span className="home-stats__number">500+</span>
                        <span className="home-stats__label">Participantes</span>
                    </div>
                    <div className="home-stats__divider" />
                    <div className="home-stats__item">
                        <span className="home-stats__number">5+</span>
                        <span className="home-stats__label">Ciudades</span>
                    </div>
                    <div className="home-stats__divider" />
                    <div className="home-stats__item">
                        <span className="home-stats__number">10+</span>
                        <span className="home-stats__label">Organizadores</span>
                    </div>
                </div>
            </section>

            {/* Events section */}
            <div className="home-content">
                {search ? (
                    <div className="home-section-header">
                        <h2 className="home-section-header__title">
                            Resultados para "{search}"
                        </h2>
                        <a href="/" className="home-section-header__link">
                            Limpiar busqueda
                        </a>
                    </div>
                ) : (
                    <div className="home-section-header">
                        <div>
                            <h2 className="home-section-header__title">Proximos eventos</h2>
                            <p className="home-section-header__subtitle">
                                Explora los eventos mas destacados que se vienen
                            </p>
                        </div>
                    </div>
                )}

                {events.data.length > 0 ? (
                    <div className="home-events-grid">
                        {events.data.map((event) => {
                            const dateInfo = getMonthDay(event.date_start);
                            return (
                                <a
                                    key={event.slug}
                                    href={`/e/${event.slug}`}
                                    className="home-event-card"
                                >
                                    <div className="home-event-card__image-wrap">
                                        <div
                                            className="home-event-card__image"
                                            style={
                                                event.cover_image_url
                                                    ? { backgroundImage: `url(${event.cover_image_url})` }
                                                    : undefined
                                            }
                                        >
                                            {!event.cover_image_url && (
                                                <div className="home-event-card__image-placeholder">
                                                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                                        <line x1="16" y1="2" x2="16" y2="6" />
                                                        <line x1="8" y1="2" x2="8" y2="6" />
                                                        <line x1="3" y1="10" x2="21" y2="10" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                        {dateInfo && (
                                            <div className="home-event-card__date-badge">
                                                <span className="home-event-card__date-month">{dateInfo.month}</span>
                                                <span className="home-event-card__date-day">{dateInfo.day}</span>
                                            </div>
                                        )}
                                        {event.registration_type === 'open' && (
                                            <span className="home-event-card__badge">Registro abierto</span>
                                        )}
                                        {event.registration_type === 'invite' && (
                                            <span className="home-event-card__badge home-event-card__badge--invite">Solo invitacion</span>
                                        )}
                                    </div>
                                    <div className="home-event-card__content">
                                        <h3 className="home-event-card__name">{event.name}</h3>
                                        {event.date_start && (
                                            <p className="home-event-card__date">
                                                {formatDateRange(event.date_start, event.date_end)}
                                            </p>
                                        )}
                                        {(event.location || event.venue) && (
                                            <p className="home-event-card__location">
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                                    <circle cx="12" cy="10" r="3" />
                                                </svg>
                                                {[event.venue, event.location].filter(Boolean).join(', ')}
                                            </p>
                                        )}
                                        {event.organization && (
                                            <p className="home-event-card__org">
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                                    <circle cx="12" cy="7" r="4" />
                                                </svg>
                                                {event.organization.name}
                                            </p>
                                        )}
                                    </div>
                                </a>
                            );
                        })}
                    </div>
                ) : (
                    <div className="home-empty">
                        <div className="home-empty__icon">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <circle cx="11" cy="11" r="8" />
                                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                            </svg>
                        </div>
                        <h2>No se encontraron eventos</h2>
                        <p>No hay eventos disponibles en este momento. Vuelve pronto para descubrir nuevas experiencias.</p>
                        {search && (
                            <a href="/" className="home-empty__btn">Ver todos los eventos</a>
                        )}
                    </div>
                )}

                {/* Pagination */}
                {events.last_page > 1 && (
                    <nav className="home-pagination">
                        {events.links.map((link, index) => (
                            <a
                                key={index}
                                href={link.url || '#'}
                                className={`home-pagination__link ${link.active ? 'home-pagination__link--active' : ''} ${!link.url ? 'home-pagination__link--disabled' : ''}`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </nav>
                )}
            </div>

            {/* CTA Section */}
            <section className="home-cta">
                <div className="home-cta__inner">
                    <h2 className="home-cta__title">Organiza tu propio evento</h2>
                    <p className="home-cta__text">
                        Crea eventos, gestiona participantes, sponsors y networking en una sola plataforma.
                    </p>
                    <a href="/register" className="home-cta__btn">Comenzar gratis</a>
                </div>
            </section>
        </PublicLayout>
    );
}
