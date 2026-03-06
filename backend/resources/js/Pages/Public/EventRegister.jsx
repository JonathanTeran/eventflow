import { Head, useForm } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import SearchableSelect from '@/Components/SearchableSelect';
import PhoneInput from '@/Components/PhoneInput';
import { formatEventDateRange } from '@/utils/formatters';
import { getCountryOptions, getCityOptions, getPhoneCode } from '@/data/locations';
import { useState } from 'react';

export default function EventRegister({ event, spotsLeft, registeredCount }) {
    const isFull = spotsLeft !== null && spotsLeft <= 0;

    const [phoneCode, setPhoneCode] = useState('+593');
    const [phoneNumber, setPhoneNumber] = useState('');

    const { data, setData, post, processing, errors } = useForm({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        company: '',
        job_title: '',
        country: 'Ecuador',
        city: '',
    });

    function handleSubmit(e) {
        e.preventDefault();
        const merged = phoneNumber.trim() ? `${phoneCode} ${phoneNumber.trim()}` : '';
        data.phone = merged;
        post(`/e/${event.slug}/register`);
    }

    const description = event.description
        ? (event.description.length > 150 ? event.description.substring(0, 150) + '...' : event.description)
        : null;

    return (
        <PublicLayout>
            <Head title={`Registrarse - ${event.name}`} />

            <div className="register-container">
                {/* Event header */}
                <div className="register-header">
                    {event.cover_image_url && (
                        <div
                            className="register-header__image"
                            style={{ backgroundImage: `url(${event.cover_image_url})` }}
                        />
                    )}
                    <h1 className="register-header__title">{event.name}</h1>
                    <div className="register-header__meta">
                        {event.date_start && (
                            <span>{formatEventDateRange(event.date_start, event.date_end)}</span>
                        )}
                        {(event.location || event.venue) && (
                            <span>{[event.venue, event.location].filter(Boolean).join(', ')}</span>
                        )}
                    </div>
                    {description && (
                        <p className="register-header__description">{description}</p>
                    )}
                    <span className="register-badge">General</span>
                </div>

                {/* Capacity indicator */}
                {spotsLeft !== null && (
                    <div className="register-spots">
                        <div className="register-spots__bar">
                            <div
                                className="register-spots__fill"
                                style={{ width: `${event.capacity > 0 ? Math.min(100, (registeredCount / event.capacity) * 100) : 0}%` }}
                            />
                        </div>
                        <div className={`register-spots__text ${isFull ? 'register-spots__full' : ''}`}>
                            {isFull
                                ? 'Cupos agotados'
                                : `${spotsLeft} cupos disponibles de ${event.capacity}`
                            }
                        </div>
                    </div>
                )}

                {/* Capacity error */}
                {errors.capacity && (
                    <div className="register-capacity-error">
                        {errors.capacity}
                    </div>
                )}

                {/* Full event banner */}
                {isFull && (
                    <div className="register-full-banner">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                        <span>Este evento ha alcanzado su capacidad maxima. No es posible registrarse.</span>
                    </div>
                )}

                {/* Registration form */}
                <form className="register-form" onSubmit={handleSubmit}>
                    <h2 className="register-form__title">Completa tu registro</h2>

                    <fieldset disabled={isFull} style={{ border: 'none', padding: 0, margin: 0, opacity: isFull ? 0.5 : 1 }}>
                        <div className="register-form__row">
                            <div className="register-form__field">
                                <label className="register-form__label">
                                    Nombre <span className="register-form__required">*</span>
                                </label>
                                <input
                                    type="text"
                                    className={`register-form__input ${errors.first_name ? 'register-form__input--error' : ''}`}
                                    value={data.first_name}
                                    onChange={(e) => setData('first_name', e.target.value)}
                                    placeholder="Tu nombre"
                                />
                                {errors.first_name && (
                                    <span className="register-form__error">{errors.first_name}</span>
                                )}
                            </div>

                            <div className="register-form__field">
                                <label className="register-form__label">
                                    Apellido <span className="register-form__required">*</span>
                                </label>
                                <input
                                    type="text"
                                    className={`register-form__input ${errors.last_name ? 'register-form__input--error' : ''}`}
                                    value={data.last_name}
                                    onChange={(e) => setData('last_name', e.target.value)}
                                    placeholder="Tu apellido"
                                />
                                {errors.last_name && (
                                    <span className="register-form__error">{errors.last_name}</span>
                                )}
                            </div>
                        </div>

                        <div className="register-form__field">
                            <label className="register-form__label">
                                Correo electronico <span className="register-form__required">*</span>
                            </label>
                            <input
                                type="email"
                                className={`register-form__input ${errors.email ? 'register-form__input--error' : ''}`}
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                placeholder="tu@email.com"
                            />
                            {errors.email && (
                                <span className="register-form__error">{errors.email}</span>
                            )}
                        </div>

                        <div className="register-form__field">
                            <label className="register-form__label">Telefono</label>
                            <PhoneInput
                                phoneCode={phoneCode}
                                phoneNumber={phoneNumber}
                                onCodeChange={setPhoneCode}
                                onNumberChange={setPhoneNumber}
                                error={!!errors.phone}
                                placeholder="999 999 999"
                            />
                            {errors.phone && (
                                <span className="register-form__error">{errors.phone}</span>
                            )}
                        </div>

                        <div className="register-form__row">
                            <div className="register-form__field">
                                <label className="register-form__label">
                                    Pais <span className="register-form__required">*</span>
                                </label>
                                <SearchableSelect
                                    value={data.country}
                                    onChange={(val) => {
                                        const code = getPhoneCode(val);
                                        if (code) setPhoneCode(code);
                                        setData((prev) => ({
                                            ...prev,
                                            country: val,
                                            city: prev.country !== val ? '' : prev.city,
                                        }));
                                    }}
                                    options={getCountryOptions()}
                                    placeholder="Selecciona un pais"
                                    error={!!errors.country}
                                />
                                {errors.country && (
                                    <span className="register-form__error">{errors.country}</span>
                                )}
                            </div>

                            <div className="register-form__field">
                                <label className="register-form__label">
                                    Ciudad <span className="register-form__required">*</span>
                                </label>
                                <SearchableSelect
                                    value={data.city}
                                    onChange={(val) => setData('city', val)}
                                    options={getCityOptions(data.country)}
                                    placeholder="Selecciona una ciudad"
                                    error={!!errors.city}
                                />
                                {errors.city && (
                                    <span className="register-form__error">{errors.city}</span>
                                )}
                            </div>
                        </div>

                        <div className="register-form__row">
                            <div className="register-form__field">
                                <label className="register-form__label">Empresa</label>
                                <input
                                    type="text"
                                    className={`register-form__input ${errors.company ? 'register-form__input--error' : ''}`}
                                    value={data.company}
                                    onChange={(e) => setData('company', e.target.value)}
                                    placeholder="Tu empresa"
                                />
                                {errors.company && (
                                    <span className="register-form__error">{errors.company}</span>
                                )}
                            </div>

                            <div className="register-form__field">
                                <label className="register-form__label">Cargo</label>
                                <input
                                    type="text"
                                    className={`register-form__input ${errors.job_title ? 'register-form__input--error' : ''}`}
                                    value={data.job_title}
                                    onChange={(e) => setData('job_title', e.target.value)}
                                    placeholder="Tu cargo"
                                />
                                {errors.job_title && (
                                    <span className="register-form__error">{errors.job_title}</span>
                                )}
                            </div>
                        </div>
                    </fieldset>

                    <button
                        type="submit"
                        className="register-form__submit"
                        disabled={processing || isFull}
                    >
                        {processing ? 'Registrando...' : isFull ? 'Cupos agotados' : 'Registrarme'}
                    </button>

                    <a href={`/e/${event.slug}`} className="register-form__back">
                        Volver al evento
                    </a>
                </form>
            </div>
        </PublicLayout>
    );
}
