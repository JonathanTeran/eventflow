import { Head, Link } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';

export default function SurveyClosed({ event, survey }) {
    const isDraft = survey.status === 'draft';

    return (
        <PublicLayout>
            <Head title={`${survey.title} - ${event.name}`} />

            <div className="survey-container">
                <div className="survey-message survey-message--closed">
                    <div className="survey-message__icon">
                        <svg viewBox="0 0 24 24" fill="currentColor" width="80" height="80">
                            {isDraft ? (
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                            ) : (
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                            )}
                        </svg>
                    </div>
                    <h1>
                        {isDraft ? 'Encuesta no disponible' : 'Encuesta cerrada'}
                    </h1>
                    <p>
                        {isDraft
                            ? 'Esta encuesta aún no está disponible para responder.'
                            : 'Esta encuesta ya no acepta más respuestas.'}
                    </p>
                    <div className="survey-message__survey-title">{survey.title}</div>
                    <div className="survey-message__event">{event.name}</div>
                    <Link href={`/e/${event.slug}`} className="survey-message__link">
                        Volver al evento
                    </Link>
                </div>
            </div>
        </PublicLayout>
    );
}
