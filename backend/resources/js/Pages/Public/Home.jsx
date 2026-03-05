import { Head, router } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import { formatDateLong } from '@/utils/formatters';
import { useState } from 'react';
import Container from '@cloudscape-design/components/container';
import Header from '@cloudscape-design/components/header';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Box from '@cloudscape-design/components/box';
import Button from '@cloudscape-design/components/button';
import Input from '@cloudscape-design/components/input';
import Cards from '@cloudscape-design/components/cards';
import Badge from '@cloudscape-design/components/badge';
import ColumnLayout from '@cloudscape-design/components/column-layout';
import Link from '@cloudscape-design/components/link';
import Icon from '@cloudscape-design/components/icon';
import Pagination from '@cloudscape-design/components/pagination';
import TextFilter from '@cloudscape-design/components/text-filter';

function formatDateRange(start, end) {
    const s = formatDateLong(start);
    const e = end ? formatDateLong(end) : null;
    if (!e || s === e) return s;
    return `${s} - ${e}`;
}

function getMonthDay(dateString) {
    if (!dateString) return null;
    const d = new Date(dateString);
    const month = d
        .toLocaleDateString('es-EC', { month: 'short' })
        .toUpperCase()
        .replace('.', '');
    const day = d.getDate();
    return { month, day };
}

export default function Home({ events, search }) {
    const [searchValue, setSearchValue] = useState(search || '');

    function handleSearch(e) {
        if (e && e.preventDefault) e.preventDefault();
        router.get('/', { search: searchValue || undefined }, { preserveState: true });
    }

    const totalEvents = events.total || events.data.length;

    return (
        <PublicLayout>
            <Head title="Descubre Eventos" />

            {/* Hero */}
            <div className="home-hero-cs">
                <div className="home-hero-cs__inner">
                    <SpaceBetween size="l" alignItems="center">
                        <Box variant="small" color="text-status-info" fontWeight="bold">
                            La plataforma de eventos #1
                        </Box>
                        <Box variant="h1" fontSize="display-l" fontWeight="heavy" textAlign="center">
                            Descubre eventos que{' '}
                            <span className="home-hero-cs__accent">inspiran y conectan</span>
                        </Box>
                        <Box
                            variant="p"
                            color="text-body-secondary"
                            fontSize="heading-m"
                            textAlign="center"
                        >
                            Encuentra conferencias, workshops, meetups y experiencias de tecnologia
                            cerca de ti.
                        </Box>
                        <form
                            onSubmit={handleSearch}
                            className="home-hero-cs__search"
                        >
                            <div className="home-hero-cs__search-input">
                                <Input
                                    type="search"
                                    placeholder="Buscar eventos, ciudades o temas..."
                                    value={searchValue}
                                    onChange={({ detail }) => setSearchValue(detail.value)}
                                />
                            </div>
                            <Button variant="primary" onClick={handleSearch}>
                                Buscar eventos
                            </Button>
                        </form>
                        <div className="home-hero-cs__tags">
                            <Badge color="blue">Conferencias</Badge>
                            <Badge color="blue">Workshops</Badge>
                            <Badge color="blue">Meetups</Badge>
                            <Badge color="blue">Networking</Badge>
                            <Badge color="blue">Hackathons</Badge>
                        </div>
                    </SpaceBetween>
                </div>
            </div>

            {/* Stats */}
            <div className="home-stats-cs">
                <ColumnLayout columns={4} minColumnWidth={150}>
                    <div className="home-stat-cs">
                        <Box variant="h1" textAlign="center">
                            {totalEvents}+
                        </Box>
                        <Box variant="small" textAlign="center" color="text-body-secondary">
                            Eventos
                        </Box>
                    </div>
                    <div className="home-stat-cs">
                        <Box variant="h1" textAlign="center">
                            500+
                        </Box>
                        <Box variant="small" textAlign="center" color="text-body-secondary">
                            Participantes
                        </Box>
                    </div>
                    <div className="home-stat-cs">
                        <Box variant="h1" textAlign="center">
                            5+
                        </Box>
                        <Box variant="small" textAlign="center" color="text-body-secondary">
                            Ciudades
                        </Box>
                    </div>
                    <div className="home-stat-cs">
                        <Box variant="h1" textAlign="center">
                            10+
                        </Box>
                        <Box variant="small" textAlign="center" color="text-body-secondary">
                            Organizadores
                        </Box>
                    </div>
                </ColumnLayout>
            </div>

            {/* Events */}
            <div className="home-content-cs">
                <SpaceBetween size="l">
                    <Header
                        variant="h2"
                        description={
                            search
                                ? undefined
                                : 'Explora los eventos mas destacados que se vienen'
                        }
                        actions={
                            search ? (
                                <Button href="/" variant="link">
                                    Limpiar busqueda
                                </Button>
                            ) : undefined
                        }
                    >
                        {search ? `Resultados para "${search}"` : 'Proximos eventos'}
                    </Header>

                    {events.data.length > 0 ? (
                        <Cards
                            cardDefinition={{
                                header: (event) => (
                                    <Link href={`/e/${event.slug}`} fontSize="heading-m">
                                        {event.name}
                                    </Link>
                                ),
                                sections: [
                                    {
                                        id: 'image',
                                        content: (event) => (
                                            <a href={`/e/${event.slug}`} className="home-card-cs__image-link">
                                                <div
                                                    className="home-card-cs__image"
                                                    style={
                                                        event.cover_image_url
                                                            ? {
                                                                  backgroundImage: `url(${event.cover_image_url})`,
                                                              }
                                                            : undefined
                                                    }
                                                >
                                                    {!event.cover_image_url && (
                                                        <div className="home-card-cs__image-placeholder">
                                                            <Icon name="calendar" size="big" />
                                                        </div>
                                                    )}
                                                    {event.registration_type === 'open' && (
                                                        <span className="home-card-cs__badge">
                                                            <Badge color="green">Registro abierto</Badge>
                                                        </span>
                                                    )}
                                                    {event.registration_type === 'invite' && (
                                                        <span className="home-card-cs__badge">
                                                            <Badge color="grey">Solo invitacion</Badge>
                                                        </span>
                                                    )}
                                                </div>
                                            </a>
                                        ),
                                    },
                                    {
                                        id: 'date',
                                        header: 'Fecha',
                                        content: (event) =>
                                            event.date_start
                                                ? formatDateRange(event.date_start, event.date_end)
                                                : '-',
                                    },
                                    {
                                        id: 'location',
                                        header: 'Ubicacion',
                                        content: (event) =>
                                            [event.venue, event.location]
                                                .filter(Boolean)
                                                .join(', ') || '-',
                                    },
                                    {
                                        id: 'org',
                                        header: 'Organizador',
                                        content: (event) =>
                                            event.organization?.name || '-',
                                    },
                                ],
                            }}
                            cardsPerRow={[
                                { cards: 1 },
                                { minWidth: 500, cards: 2 },
                                { minWidth: 900, cards: 3 },
                            ]}
                            items={events.data}
                            empty={
                                <Box textAlign="center" color="inherit" padding="l">
                                    <SpaceBetween size="m">
                                        <Box variant="h3" color="text-body-secondary">
                                            No se encontraron eventos
                                        </Box>
                                        <Box variant="p" color="text-body-secondary">
                                            No hay eventos disponibles en este momento.
                                        </Box>
                                        {search && (
                                            <Button href="/">Ver todos los eventos</Button>
                                        )}
                                    </SpaceBetween>
                                </Box>
                            }
                        />
                    ) : (
                        <Container>
                            <Box textAlign="center" padding={{ vertical: 'xxl' }}>
                                <SpaceBetween size="m" alignItems="center">
                                    <Icon name="search" size="big" variant="disabled" />
                                    <Box variant="h3" color="text-body-secondary">
                                        No se encontraron eventos
                                    </Box>
                                    <Box variant="p" color="text-body-secondary">
                                        No hay eventos disponibles en este momento. Vuelve pronto
                                        para descubrir nuevas experiencias.
                                    </Box>
                                    {search && (
                                        <Button href="/" variant="primary">
                                            Ver todos los eventos
                                        </Button>
                                    )}
                                </SpaceBetween>
                            </Box>
                        </Container>
                    )}

                    {/* Pagination */}
                    {events.last_page > 1 && (
                        <Box textAlign="center">
                            <Pagination
                                currentPageIndex={events.current_page}
                                pagesCount={events.last_page}
                                onChange={({ detail }) => {
                                    router.get(
                                        '/',
                                        {
                                            page: detail.currentPageIndex,
                                            search: search || undefined,
                                        },
                                        { preserveState: true }
                                    );
                                }}
                            />
                        </Box>
                    )}
                </SpaceBetween>
            </div>

            {/* CTA */}
            <div className="home-cta-cs">
                <Container>
                    <Box textAlign="center" padding={{ vertical: 'xl' }}>
                        <SpaceBetween size="m" alignItems="center">
                            <Box variant="h2">Organiza tu propio evento</Box>
                            <Box variant="p" color="text-body-secondary" fontSize="heading-s">
                                Crea eventos, gestiona participantes, sponsors y networking en una
                                sola plataforma.
                            </Box>
                            <Button variant="primary" href="/register" iconName="add-plus">
                                Comenzar gratis
                            </Button>
                        </SpaceBetween>
                    </Box>
                </Container>
            </div>
        </PublicLayout>
    );
}
