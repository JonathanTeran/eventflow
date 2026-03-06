import { Head, router } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import { useState } from 'react';

export default function NetworkingDirectory({ event, participants, savedContactIds, viewerRegistrationCode, search }) {
    const [searchValue, setSearchValue] = useState(search || '');
    const [localSavedIds, setLocalSavedIds] = useState(savedContactIds || []);
    const [savingId, setSavingId] = useState(null);

    const baseUrl = `/e/${event.slug}/networking/${viewerRegistrationCode}`;

    const getInitials = (fullName) => {
        return fullName
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(`${baseUrl}/directory`, { search: searchValue }, { preserveState: true });
    };

    const handleSaveContact = async (contactId) => {
        setSavingId(contactId);
        try {
            await window.axios.post(`${baseUrl}/contacts/save`, {
                connected_participant_id: contactId,
            });
            setLocalSavedIds([...localSavedIds, contactId]);
        } catch {
            // silent fail
        } finally {
            setSavingId(null);
        }
    };

    const handleRemoveContact = async (contactId) => {
        setSavingId(contactId);
        try {
            await window.axios.post(`${baseUrl}/contacts/remove`, {
                connected_participant_id: contactId,
            });
            setLocalSavedIds(localSavedIds.filter((id) => id !== contactId));
        } catch {
            // silent fail
        } finally {
            setSavingId(null);
        }
    };

    return (
        <PublicLayout>
            <Head title={`Directorio - ${event.name}`} />

            <div className="networking-header">
                <div className="networking-header__content">
                    <h1 className="networking-header__title">{event.name}</h1>
                    <p className="networking-header__greeting">Directorio de participantes</p>
                </div>
            </div>

            <div className="directory-container">
                {/* Search Bar */}
                <form onSubmit={handleSearch} className="directory-search">
                    <input
                        type="text"
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        placeholder="Buscar por nombre o empresa..."
                        className="directory-search__input"
                    />
                    <button type="submit" className="networking-btn networking-btn--primary">
                        Buscar
                    </button>
                </form>

                {/* Participants Grid */}
                {participants.data.length === 0 ? (
                    <div className="directory-empty">
                        <p>No se encontraron participantes.</p>
                    </div>
                ) : (
                    <div className="directory-grid">
                        {participants.data.map((p) => {
                            const isSaved = localSavedIds.includes(p.id);
                            const isSaving = savingId === p.id;

                            return (
                                <div key={p.id} className="directory-card">
                                    <div className="directory-card__avatar">
                                        {getInitials(p.full_name)}
                                    </div>
                                    <div className="directory-card__info">
                                        <h3 className="directory-card__name">{p.full_name}</h3>
                                        {p.job_title && (
                                            <p className="directory-card__role">{p.job_title}</p>
                                        )}
                                        {p.company && (
                                            <p className="directory-card__company">{p.company}</p>
                                        )}
                                    </div>
                                    <div className="directory-card__actions">
                                        <a
                                            href={`/e/${event.slug}/networking/${p.registration_code}/profile?viewer=${viewerRegistrationCode}`}
                                            className="networking-btn networking-btn--small networking-btn--outline"
                                        >
                                            Ver perfil
                                        </a>
                                        {isSaved ? (
                                            <button
                                                onClick={() => handleRemoveContact(p.id)}
                                                disabled={isSaving}
                                                className="networking-btn networking-btn--small networking-btn--ghost"
                                            >
                                                {isSaving ? '...' : 'Guardado'}
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleSaveContact(p.id)}
                                                disabled={isSaving}
                                                className="networking-btn networking-btn--small networking-btn--primary"
                                            >
                                                {isSaving ? '...' : 'Guardar'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Pagination */}
                {participants.links && participants.links.length > 3 && (
                    <div className="directory-pagination">
                        {participants.links.map((link, i) => (
                            <a
                                key={i}
                                href={link.url}
                                className={`directory-pagination__link ${link.active ? 'directory-pagination__link--active' : ''} ${!link.url ? 'directory-pagination__link--disabled' : ''}`}
                            >
                                {link.label.replace(/&laquo;/g, '\u00AB').replace(/&raquo;/g, '\u00BB')}
                            </a>
                        ))}
                    </div>
                )}

                {/* Back link */}
                <div className="profile-back">
                    <a href={baseUrl} className="profile-back__link">
                        &larr; Volver a Networking
                    </a>
                </div>
            </div>
        </PublicLayout>
    );
}
