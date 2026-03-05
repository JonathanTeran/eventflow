import { Link } from '@inertiajs/react';
import Container from '@cloudscape-design/components/container';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Box from '@cloudscape-design/components/box';
import StatusBadge from '@/Components/StatusBadge';
import { formatDate, formatTime } from '@/utils/formatters';

export default function EventCard({ event }) {
    return (
        <Link href={`/events/${event.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <Container>
                <SpaceBetween size="s">
                    <SpaceBetween direction="horizontal" size="xs" alignItems="center">
                        <Box variant="h3" margin={{ bottom: 'n' }}>
                            {event.name}
                        </Box>
                        <StatusBadge status={event.status} />
                    </SpaceBetween>
                    {event.description && (
                        <Box variant="p" color="text-body-secondary">
                            {event.description.length > 100
                                ? event.description.substring(0, 100) + '...'
                                : event.description}
                        </Box>
                    )}
                    <SpaceBetween size="xxs">
                        <Box variant="small" color="text-body-secondary">
                            {formatDate(event.date_start)} &middot; {formatTime(event.date_start)}
                        </Box>
                        {(event.location || event.venue) && (
                            <Box variant="small" color="text-body-secondary">
                                {event.venue || event.location}
                            </Box>
                        )}
                        {event.capacity && (
                            <Box variant="small" color="text-body-secondary">
                                {event.capacity} personas
                            </Box>
                        )}
                    </SpaceBetween>
                </SpaceBetween>
            </Container>
        </Link>
    );
}
