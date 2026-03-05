import { Head } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

export default function Networking({ event, participant, savedContactIds, profileUrl }) {
    const [pin, setPin] = useState(participant.networking_pin || '');
    const [pinSaving, setPinSaving] = useState(false);
    const [pinMessage, setPinMessage] = useState(null);
    const [pinError, setPinError] = useState(null);

    const [searchPinValue, setSearchPinValue] = useState('');
    const [searching, setSearching] = useState(false);
    const [searchResult, setSearchResult] = useState(null);
    const [searchError, setSearchError] = useState(null);
    const [searchAlreadySaved, setSearchAlreadySaved] = useState(false);
    const [searchSaving, setSearchSaving] = useState(false);

    const [socialLinks, setSocialLinks] = useState(participant.social_links || {});
    const [networkingVisible, setNetworkingVisible] = useState(participant.networking_visible);
    const [profileSaving, setProfileSaving] = useState(false);
    const [profileMessage, setProfileMessage] = useState(null);
    const [profileError, setProfileError] = useState(null);

    const [localSavedIds, setLocalSavedIds] = useState(savedContactIds || []);

    const baseUrl = `/e/${event.slug}/networking/${participant.registration_code}`;

    const filterAlphanumeric = (value) => {
        return value.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 6);
    };

    const handlePinChange = (e) => {
        setPin(filterAlphanumeric(e.target.value));
        setPinMessage(null);
        setPinError(null);
    };

    const handleSavePin = async () => {
        if (pin.length !== 6) {
            setPinError('El PIN debe tener exactamente 6 caracteres.');
            return;
        }

        setPinSaving(true);
        setPinMessage(null);
        setPinError(null);

        try {
            const response = await window.axios.post(`${baseUrl}/pin`, {
                networking_pin: pin,
            });
            setPinMessage(response.data.message);
            setPin(response.data.networking_pin);
            if (response.data.networking_visible !== undefined) {
                setNetworkingVisible(response.data.networking_visible);
            }
        } catch (error) {
            if (error.response?.status === 422) {
                const errors = error.response.data.errors;
                const firstError = errors?.networking_pin?.[0] || error.response.data.message;
                setPinError(firstError);
            } else {
                setPinError('Ocurrio un error al guardar el PIN.');
            }
        } finally {
            setPinSaving(false);
        }
    };

    const handleSearchPinChange = (e) => {
        setSearchPinValue(filterAlphanumeric(e.target.value));
        setSearchResult(null);
        setSearchError(null);
        setSearchAlreadySaved(false);
    };

    const handleSearch = async () => {
        if (searchPinValue.length !== 6) {
            setSearchError('Ingresa un PIN de 6 caracteres.');
            return;
        }

        setSearching(true);
        setSearchResult(null);
        setSearchError(null);

        try {
            const response = await window.axios.post(`${baseUrl}/search`, {
                networking_pin: searchPinValue,
            });

            if (response.data.found) {
                setSearchResult(response.data.contact);
                setSearchAlreadySaved(response.data.already_saved);
            } else {
                setSearchError('No se encontro ningun participante con ese PIN.');
            }
        } catch {
            setSearchError('Ocurrio un error al buscar.');
        } finally {
            setSearching(false);
        }
    };

    const handleSaveContact = async (contactId) => {
        setSearchSaving(true);
        try {
            await window.axios.post(`${baseUrl}/contacts/save`, {
                connected_participant_id: contactId,
            });
            setSearchAlreadySaved(true);
            setLocalSavedIds([...localSavedIds, contactId]);
        } catch {
            // silent fail
        } finally {
            setSearchSaving(false);
        }
    };

    const handleSocialLinkChange = (key, value) => {
        setSocialLinks({ ...socialLinks, [key]: value });
        setProfileMessage(null);
        setProfileError(null);
    };

    const handleSaveProfile = async () => {
        setProfileSaving(true);
        setProfileMessage(null);
        setProfileError(null);

        try {
            const response = await window.axios.post(`${baseUrl}/profile`, {
                social_links: socialLinks,
                networking_visible: networkingVisible,
            });
            setProfileMessage(response.data.message);
            setSocialLinks(response.data.social_links);
            setNetworkingVisible(response.data.networking_visible);
        } catch (error) {
            if (error.response?.status === 422) {
                setProfileError('Verifica que las URLs sean validas.');
            } else {
                setProfileError('Ocurrio un error al guardar el perfil.');
            }
        } finally {
            setProfileSaving(false);
        }
    };

    const getInitials = (fullName) => {
        return fullName
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const socialFields = [
        { key: 'linkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com/in/tu-perfil' },
        { key: 'github', label: 'GitHub', placeholder: 'https://github.com/tu-usuario' },
        { key: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/tu-usuario' },
        { key: 'website', label: 'Sitio web', placeholder: 'https://tu-sitio.com' },
        { key: 'whatsapp', label: 'WhatsApp', placeholder: '+593 99 123 4567' },
    ];

    const contactsCount = localSavedIds.length;

    return (
        <PublicLayout>
            <Head title={`Networking - ${event.name}`} />

            <div className="networking-header">
                <div className="networking-header__content">
                    <h1 className="networking-header__title">{event.name}</h1>
                    <p className="networking-header__greeting">Hola, {participant.first_name}</p>
                </div>
            </div>

            <div className="networking-container">
                {/* QR Code Section */}
                {participant.networking_pin && (
                    <div className="networking-card">
                        <h2 className="networking-card__title">Mi Codigo QR</h2>
                        <p className="networking-card__description">
                            Otros participantes pueden escanear este codigo para ver tu perfil.
                        </p>
                        <div className="networking-qr">
                            <QRCodeSVG
                                value={profileUrl}
                                size={200}
                                level="M"
                                bgColor="#ffffff"
                                fgColor="#033160"
                            />
                        </div>
                    </div>
                )}

                {/* My PIN Section */}
                <div className="networking-card">
                    <h2 className="networking-card__title">Mi PIN de Networking</h2>
                    <p className="networking-card__description">
                        Comparte tu PIN con otros participantes para que puedan ver tu
                        informacion de contacto.
                    </p>

                    <div className="networking-input-group">
                        <input
                            type="text"
                            value={pin}
                            onChange={handlePinChange}
                            placeholder="Ej: ABC123"
                            maxLength={6}
                            className="networking-pin-input"
                        />
                        <button
                            onClick={handleSavePin}
                            disabled={pinSaving || pin.length !== 6}
                            className={`networking-btn networking-btn--primary ${pinSaving || pin.length !== 6 ? 'networking-btn--disabled' : ''}`}
                        >
                            {pinSaving ? 'Guardando...' : 'Guardar PIN'}
                        </button>
                    </div>

                    {pinMessage && (
                        <div className="networking-alert networking-alert--success">{pinMessage}</div>
                    )}
                    {pinError && (
                        <div className="networking-alert networking-alert--error">{pinError}</div>
                    )}
                </div>

                {/* Social Links / Profile Section */}
                <div className="networking-card">
                    <h2 className="networking-card__title">Mi Perfil de Networking</h2>
                    <p className="networking-card__description">
                        Agrega tus redes sociales para que otros participantes puedan conectar contigo.
                    </p>

                    <div className="networking-profile-form">
                        {socialFields.map((field) => (
                            <div key={field.key} className="networking-profile-form__field">
                                <label className="networking-profile-form__label">{field.label}</label>
                                <input
                                    type="text"
                                    value={socialLinks[field.key] || ''}
                                    onChange={(e) => handleSocialLinkChange(field.key, e.target.value)}
                                    placeholder={field.placeholder}
                                    className="networking-profile-form__input"
                                />
                            </div>
                        ))}

                        <div className="networking-profile-form__toggle">
                            <label className="networking-toggle">
                                <input
                                    type="checkbox"
                                    checked={networkingVisible}
                                    onChange={(e) => {
                                        setNetworkingVisible(e.target.checked);
                                        setProfileMessage(null);
                                    }}
                                />
                                <span className="networking-toggle__label">Visible en el directorio de participantes</span>
                            </label>
                        </div>

                        <button
                            onClick={handleSaveProfile}
                            disabled={profileSaving}
                            className={`networking-btn networking-btn--primary networking-btn--full ${profileSaving ? 'networking-btn--disabled' : ''}`}
                        >
                            {profileSaving ? 'Guardando...' : 'Guardar perfil'}
                        </button>

                        {profileMessage && (
                            <div className="networking-alert networking-alert--success">{profileMessage}</div>
                        )}
                        {profileError && (
                            <div className="networking-alert networking-alert--error">{profileError}</div>
                        )}
                    </div>
                </div>

                {/* Search Section */}
                <div className="networking-card">
                    <h2 className="networking-card__title">Buscar Participante</h2>
                    <p className="networking-card__description">
                        Ingresa el PIN de otro participante para ver su informacion de
                        contacto.
                    </p>

                    <div className="networking-input-group">
                        <input
                            type="text"
                            value={searchPinValue}
                            onChange={handleSearchPinChange}
                            placeholder="Ingresa un PIN"
                            maxLength={6}
                            className="networking-pin-input"
                        />
                        <button
                            onClick={handleSearch}
                            disabled={searching || searchPinValue.length !== 6}
                            className={`networking-btn networking-btn--secondary ${searching || searchPinValue.length !== 6 ? 'networking-btn--disabled' : ''}`}
                        >
                            {searching ? 'Buscando...' : 'Buscar'}
                        </button>
                    </div>

                    {searchError && (
                        <div className="networking-alert networking-alert--warning">{searchError}</div>
                    )}

                    {searchResult && (
                        <div className="networking-contact-card">
                            <div className="networking-contact-card__avatar">
                                {getInitials(searchResult.full_name)}
                            </div>
                            <div className="networking-contact-card__info">
                                <h3 className="networking-contact-card__name">
                                    {searchResult.full_name}
                                </h3>
                                {searchResult.job_title && (
                                    <p className="networking-contact-card__role">
                                        {searchResult.job_title}
                                    </p>
                                )}
                                {searchResult.company && (
                                    <p className="networking-contact-card__company">
                                        {searchResult.company}
                                    </p>
                                )}
                                {searchResult.email && (
                                    <a
                                        href={`mailto:${searchResult.email}`}
                                        className="networking-contact-card__email"
                                    >
                                        {searchResult.email}
                                    </a>
                                )}
                            </div>
                            <div className="networking-contact-card__actions">
                                {searchAlreadySaved ? (
                                    <span className="networking-badge networking-badge--saved">Guardado</span>
                                ) : (
                                    <button
                                        onClick={() => handleSaveContact(searchResult.id)}
                                        disabled={searchSaving}
                                        className="networking-btn networking-btn--small networking-btn--primary"
                                    >
                                        {searchSaving ? '...' : 'Guardar'}
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Navigation Links */}
                {participant.networking_pin && (
                    <div className="networking-nav">
                        <a href={`${baseUrl}/directory`} className="networking-nav__link">
                            <span className="networking-nav__icon">
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M7 10a3 3 0 100-6 3 3 0 000 6zm6 0a3 3 0 100-6 3 3 0 000 6zM7 12c-3.3 0-6 1.34-6 3v1h12v-1c0-1.66-2.7-3-6-3zm6 0c-.37 0-.7.02-1.03.06C13.17 13.13 14 14.1 14 15v1h5v-1c0-1.66-2.7-3-6-3z" fill="currentColor"/></svg>
                            </span>
                            Directorio de participantes
                        </a>
                        <a href={`${baseUrl}/contacts`} className="networking-nav__link">
                            <span className="networking-nav__icon">
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M16 2H4a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V4a2 2 0 00-2-2zM7 5a2 2 0 110 4 2 2 0 010-4zm4 10H3v-1c0-1.33 2.67-2 4-2s4 .67 4 2v1zm2-4h-2v-1h2v1zm3 0h-2v-1h2v1zm-3-2h-2V8h2v1zm3 0h-2V8h2v1z" fill="currentColor"/></svg>
                            </span>
                            Mis contactos ({contactsCount})
                        </a>
                    </div>
                )}
            </div>
        </PublicLayout>
    );
}
