import { useState, useRef, useEffect } from 'react';
import { COUNTRY_PHONES } from '@/data/locations';

export default function PhoneInput({
    phoneCode,
    phoneNumber,
    onCodeChange,
    onNumberChange,
    error = false,
    placeholder = '999 999 999',
}) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const containerRef = useRef(null);
    const searchRef = useRef(null);

    const current = COUNTRY_PHONES.find((c) => c.code === phoneCode) || COUNTRY_PHONES[0];

    const normalize = (str) =>
        str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    const filtered = search
        ? COUNTRY_PHONES.filter((c) => {
              const q = normalize(search);
              return (
                  normalize(c.country).includes(q) ||
                  c.code.includes(q) ||
                  c.iso.toLowerCase().includes(q)
              );
          })
        : COUNTRY_PHONES;

    useEffect(() => {
        function handleClick(e) {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setOpen(false);
                setSearch('');
            }
        }
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    useEffect(() => {
        if (open && searchRef.current) {
            searchRef.current.focus();
        }
    }, [open]);

    function selectCode(entry) {
        onCodeChange(entry.code);
        setOpen(false);
        setSearch('');
    }

    return (
        <div className="phone-input" ref={containerRef}>
            <div className={`phone-input__wrapper ${error ? 'phone-input__wrapper--error' : ''}`}>
                {/* Country code trigger */}
                <button
                    type="button"
                    className="phone-input__code-btn"
                    onClick={() => setOpen(!open)}
                    aria-label="Seleccionar codigo de pais"
                >
                    <span className="phone-input__flag">{current.flag}</span>
                    <span className="phone-input__code">{current.code}</span>
                    <svg
                        className={`phone-input__chevron ${open ? 'phone-input__chevron--open' : ''}`}
                        width="12" height="12" viewBox="0 0 24 24"
                        fill="none" stroke="currentColor" strokeWidth="2.5"
                        strokeLinecap="round" strokeLinejoin="round"
                    >
                        <polyline points="6 9 12 15 18 9" />
                    </svg>
                </button>

                <div className="phone-input__divider" />

                {/* Phone number input */}
                <input
                    type="tel"
                    className="phone-input__number"
                    value={phoneNumber}
                    onChange={(e) => onNumberChange(e.target.value)}
                    placeholder={placeholder}
                    autoComplete="tel-national"
                />
            </div>

            {/* Dropdown */}
            {open && (
                <div className="phone-input__dropdown">
                    <div className="phone-input__search-wrap">
                        <svg
                            className="phone-input__search-icon"
                            width="14" height="14" viewBox="0 0 24 24"
                            fill="none" stroke="currentColor" strokeWidth="2"
                            strokeLinecap="round" strokeLinejoin="round"
                        >
                            <circle cx="11" cy="11" r="8" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                        <input
                            ref={searchRef}
                            type="text"
                            className="phone-input__search"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Buscar pais o codigo..."
                        />
                    </div>
                    <ul className="phone-input__list">
                        {filtered.length === 0 && (
                            <li className="phone-input__empty">Sin resultados</li>
                        )}
                        {filtered.map((entry) => (
                            <li
                                key={entry.iso}
                                className={`phone-input__option ${entry.code === phoneCode && entry.iso === current.iso ? 'phone-input__option--active' : ''}`}
                                onMouseDown={(e) => {
                                    e.preventDefault();
                                    selectCode(entry);
                                }}
                            >
                                <span className="phone-input__option-flag">{entry.flag}</span>
                                <span className="phone-input__option-name">{entry.country}</span>
                                <span className="phone-input__option-code">{entry.code}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
