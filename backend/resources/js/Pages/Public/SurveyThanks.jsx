import { Head, Link } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';

export default function SurveyThanks({ event, survey }) {
    return (
        <PublicLayout>
            <Head title={`Gracias - ${survey.title}`} />

            <div className="survey-container">
                <div className="survey-message survey-message--success">
                    <div className="survey-message__icon">
                        <svg viewBox="0 0 24 24" fill="currentColor" width="80" height="80">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                        </svg>
                    </div>
                    <h1>Gracias por tu respuesta</h1>
                    <p>
                        Tu feedback nos ayuda a mejorar nuestros eventos.
                    </p>
                    <div className="survey-message__event">{event.name}</div>
                    <Link href={`/e/${event.slug}`} className="survey-message__link">
                        Volver al evento
                    </Link>
                </div>
            </div>
        </PublicLayout>
    );
}
