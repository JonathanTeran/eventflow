import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import PublicLayout from '@/Layouts/PublicLayout';

function StarRating({ value, onChange, disabled }) {
    const [hover, setHover] = useState(0);

    return (
        <div className="survey-rating">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    disabled={disabled}
                    className={`survey-rating__star ${star <= (hover || value) ? 'active' : ''}`}
                    onClick={() => onChange(star)}
                    onMouseEnter={() => setHover(star)}
                    onMouseLeave={() => setHover(0)}
                >
                    <svg viewBox="0 0 24 24" fill="currentColor" width="32" height="32">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                </button>
            ))}
        </div>
    );
}

function TextQuestion({ question, value, onChange, error }) {
    return (
        <div className="survey-question">
            <label className="survey-question__label">
                {question.question_text}
                {question.required && <span className="required">*</span>}
            </label>
            <textarea
                className={`survey-question__textarea ${error ? 'error' : ''}`}
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                rows={4}
                placeholder="Escribe tu respuesta aquí..."
            />
            {error && <span className="survey-question__error">{error}</span>}
        </div>
    );
}

function RatingQuestion({ question, value, onChange, error }) {
    return (
        <div className="survey-question">
            <label className="survey-question__label">
                {question.question_text}
                {question.required && <span className="required">*</span>}
            </label>
            <StarRating value={value || 0} onChange={onChange} />
            {error && <span className="survey-question__error">{error}</span>}
        </div>
    );
}

function SingleChoiceQuestion({ question, value, onChange, error }) {
    return (
        <div className="survey-question">
            <label className="survey-question__label">
                {question.question_text}
                {question.required && <span className="required">*</span>}
            </label>
            <div className="survey-question__options">
                {(question.options || []).map((option, idx) => (
                    <label key={idx} className="survey-option">
                        <input
                            type="radio"
                            name={`question-${question.id}`}
                            value={option}
                            checked={value === option}
                            onChange={() => onChange(option)}
                        />
                        <span className="survey-option__radio" />
                        <span className="survey-option__label">{option}</span>
                    </label>
                ))}
            </div>
            {error && <span className="survey-question__error">{error}</span>}
        </div>
    );
}

function MultipleChoiceQuestion({ question, values, onChange, error }) {
    const selected = values || [];

    function toggle(option) {
        if (selected.includes(option)) {
            onChange(selected.filter((v) => v !== option));
        } else {
            onChange([...selected, option]);
        }
    }

    return (
        <div className="survey-question">
            <label className="survey-question__label">
                {question.question_text}
                {question.required && <span className="required">*</span>}
            </label>
            <div className="survey-question__options">
                {(question.options || []).map((option, idx) => (
                    <label key={idx} className="survey-option">
                        <input
                            type="checkbox"
                            checked={selected.includes(option)}
                            onChange={() => toggle(option)}
                        />
                        <span className="survey-option__checkbox" />
                        <span className="survey-option__label">{option}</span>
                    </label>
                ))}
            </div>
            {error && <span className="survey-question__error">{error}</span>}
        </div>
    );
}

export default function SurveyShow({ event, survey, participant, hasResponded, registrationCode }) {
    const [answers, setAnswers] = useState(() => {
        const initial = {};
        survey.questions.forEach((q) => {
            initial[q.id] = q.type === 'multiple_choice' ? [] : null;
        });
        return initial;
    });
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    const { post, processing } = useForm();

    function updateAnswer(questionId, value) {
        setAnswers({ ...answers, [questionId]: value });
        if (errors[questionId]) {
            setErrors({ ...errors, [questionId]: null });
        }
    }

    function validate() {
        const newErrors = {};
        survey.questions.forEach((q) => {
            if (q.required) {
                const value = answers[q.id];
                if (q.type === 'multiple_choice') {
                    if (!value || value.length === 0) {
                        newErrors[q.id] = 'Esta pregunta es requerida';
                    }
                } else if (!value) {
                    newErrors[q.id] = 'Esta pregunta es requerida';
                }
            }
        });
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }

    function handleSubmit(e) {
        e.preventDefault();
        if (!validate()) return;

        setSubmitting(true);

        const formattedAnswers = survey.questions.map((q) => ({
            question_id: q.id,
            value: q.type === 'multiple_choice' ? null : answers[q.id],
            values: q.type === 'multiple_choice' ? answers[q.id] : null,
        }));

        post(`/e/${event.slug}/survey/${survey.id}`, {
            data: {
                registration_code: registrationCode,
                answers: formattedAnswers,
            },
            onError: () => setSubmitting(false),
        });
    }

    if (hasResponded) {
        return (
            <PublicLayout>
                <Head title={`${survey.title} - ${event.name}`} />
                <div className="survey-container">
                    <div className="survey-message">
                        <div className="survey-message__icon">
                            <svg viewBox="0 0 24 24" fill="currentColor" width="64" height="64">
                                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                            </svg>
                        </div>
                        <h1>Ya respondiste esta encuesta</h1>
                        <p>Gracias por tu participación, {participant?.first_name || 'participante'}.</p>
                    </div>
                </div>
            </PublicLayout>
        );
    }

    return (
        <PublicLayout>
            <Head title={`${survey.title} - ${event.name}`} />

            <div className="survey-container">
                <div className="survey-header">
                    <div className="survey-header__event">{event.name}</div>
                    <h1 className="survey-header__title">{survey.title}</h1>
                    {survey.description && (
                        <p className="survey-header__description">{survey.description}</p>
                    )}
                    {participant && (
                        <p className="survey-header__participant">
                            Hola, <strong>{participant.first_name}</strong>
                        </p>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="survey-form">
                    {survey.questions.map((question) => (
                        <div key={question.id} className="survey-form__question">
                            {question.type === 'text' && (
                                <TextQuestion
                                    question={question}
                                    value={answers[question.id]}
                                    onChange={(v) => updateAnswer(question.id, v)}
                                    error={errors[question.id]}
                                />
                            )}
                            {question.type === 'rating' && (
                                <RatingQuestion
                                    question={question}
                                    value={answers[question.id]}
                                    onChange={(v) => updateAnswer(question.id, v)}
                                    error={errors[question.id]}
                                />
                            )}
                            {question.type === 'single_choice' && (
                                <SingleChoiceQuestion
                                    question={question}
                                    value={answers[question.id]}
                                    onChange={(v) => updateAnswer(question.id, v)}
                                    error={errors[question.id]}
                                />
                            )}
                            {question.type === 'multiple_choice' && (
                                <MultipleChoiceQuestion
                                    question={question}
                                    values={answers[question.id]}
                                    onChange={(v) => updateAnswer(question.id, v)}
                                    error={errors[question.id]}
                                />
                            )}
                        </div>
                    ))}

                    <button
                        type="submit"
                        className="survey-form__submit"
                        disabled={submitting || processing}
                    >
                        {submitting ? 'Enviando...' : 'Enviar respuestas'}
                    </button>
                </form>
            </div>
        </PublicLayout>
    );
}
