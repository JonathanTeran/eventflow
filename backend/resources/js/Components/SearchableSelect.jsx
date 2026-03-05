import { useState, useRef, useEffect, useCallback } from 'react';

export default function SearchableSelect({
    value,
    onChange,
    options,
    placeholder = 'Buscar...',
    className = '',
    error = false,
}) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const containerRef = useRef(null);
    const inputRef = useRef(null);

    const normalize = (str) =>
        str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    const filtered = query
        ? options.filter((o) => normalize(o.label).includes(normalize(query)))
        : options;

    const handleSelect = useCallback((val) => {
        onChange(val);
        setQuery('');
        setOpen(false);
    }, [onChange]);

    // Close on outside click
    useEffect(() => {
        function handleClick(e) {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setOpen(false);
                setQuery('');
            }
        }
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    // Keyboard navigation
    const [highlighted, setHighlighted] = useState(-1);

    useEffect(() => {
        setHighlighted(-1);
    }, [query, open]);

    function handleKeyDown(e) {
        if (!open && (e.key === 'ArrowDown' || e.key === 'Enter')) {
            setOpen(true);
            e.preventDefault();
            return;
        }
        if (!open) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setHighlighted((h) => Math.min(h + 1, filtered.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setHighlighted((h) => Math.max(h - 1, 0));
        } else if (e.key === 'Enter' && highlighted >= 0 && filtered[highlighted]) {
            e.preventDefault();
            handleSelect(filtered[highlighted].value);
        } else if (e.key === 'Escape') {
            setOpen(false);
            setQuery('');
        }
    }

    return (
        <div className="searchable-select" ref={containerRef}>
            <div
                className={`searchable-select__trigger register-form__input ${error ? 'register-form__input--error' : ''} ${className}`}
                onClick={() => {
                    setOpen(true);
                    setTimeout(() => inputRef.current?.focus(), 0);
                }}
            >
                {open ? (
                    <input
                        ref={inputRef}
                        type="text"
                        className="searchable-select__input"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={value || placeholder}
                        autoComplete="off"
                    />
                ) : (
                    <span className={value ? 'searchable-select__value' : 'searchable-select__placeholder'}>
                        {value || placeholder}
                    </span>
                )}
                <svg
                    className={`searchable-select__arrow ${open ? 'searchable-select__arrow--open' : ''}`}
                    width="16" height="16" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" strokeWidth="2"
                    strokeLinecap="round" strokeLinejoin="round"
                >
                    <polyline points="6 9 12 15 18 9" />
                </svg>
            </div>

            {open && (
                <ul className="searchable-select__dropdown">
                    {filtered.length === 0 && (
                        <li className="searchable-select__empty">Sin resultados</li>
                    )}
                    {filtered.map((opt, i) => (
                        <li
                            key={opt.value}
                            className={`searchable-select__option ${opt.value === value ? 'searchable-select__option--selected' : ''} ${i === highlighted ? 'searchable-select__option--highlighted' : ''}`}
                            onMouseDown={(e) => {
                                e.preventDefault();
                                handleSelect(opt.value);
                            }}
                            onMouseEnter={() => setHighlighted(i)}
                        >
                            {opt.label}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
