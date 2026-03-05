import { Head } from '@inertiajs/react';
import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import '@/styles/scanner.css';

const RESULT_DISPLAY_MS = 2500;

function playBeep(success) {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = success ? 880 : 300;
        osc.type = success ? 'sine' : 'square';
        gain.gain.value = 0.3;
        osc.start();
        osc.stop(ctx.currentTime + (success ? 0.15 : 0.3));
    } catch {
        // Audio not available
    }
}

function vibrate(pattern) {
    try {
        if (navigator.vibrate) navigator.vibrate(pattern);
    } catch {
        // Vibration not available
    }
}

function extractRegistrationCode(text) {
    if (!text) return null;
    const trimmed = text.trim();

    // If it's a URL, try to extract registration code from path
    try {
        const url = new URL(trimmed);
        // Pattern: /e/{slug}/registered/{code} or /e/{slug}/networking/{code}/profile
        const match = url.pathname.match(/\/e\/[^/]+\/(?:registered|networking)\/([A-Z0-9]+)/i);
        if (match) return match[1].toUpperCase();
    } catch {
        // Not a URL
    }

    // Plain text - use as-is (uppercase)
    return trimmed.toUpperCase();
}

export default function Scanner({ event, scanTypes, stats: initialStats }) {
    const [activeType, setActiveType] = useState(scanTypes[0]?.key || 'checkin');
    const [result, setResult] = useState(null);
    const [scanning, setScanning] = useState(false);
    const [stats, setStats] = useState(initialStats);
    const [manualCode, setManualCode] = useState('');
    const [cameraReady, setCameraReady] = useState(false);
    const scannerRef = useRef(null);
    const resultTimerRef = useRef(null);
    const containerRef = useRef(null);

    const refreshStats = useCallback(() => {
        axios.get(`/events/${event.id}/scanner/stats`)
            .then(res => setStats(res.data))
            .catch(() => { });
    }, [event.id]);

    const processScanRef = useRef(null);

    const processScan = useCallback(async (code) => {
        if (scanning) return;
        setScanning(true);

        const registrationCode = extractRegistrationCode(code);
        if (!registrationCode) {
            setResult({ status: 'error', message: 'Codigo no valido.' });
            setScanning(false);
            return;
        }

        try {
            const res = await axios.post(`/events/${event.id}/scanner/scan`, {
                registration_code: registrationCode,
                scan_type: activeType,
            });
            setResult({ status: 'success', ...res.data });
            playBeep(true);
            vibrate(200);
            refreshStats();
        } catch (err) {
            const data = err.response?.data || {};
            const status = data.status || 'error';
            setResult({
                status,
                message: data.message || 'Error al procesar el escaneo.',
                participant: data.participant,
            });
            playBeep(false);
            vibrate([100, 50, 100]);
        } finally {
            setScanning(false);
        }
    }, [scanning, activeType, event.id, refreshStats]);

    // Keep ref in sync so the QR scanner callback always uses the latest processScan
    processScanRef.current = processScan;

    // Initialize QR scanner
    useEffect(() => {
        let html5QrCode = null;

        async function initScanner() {
            try {
                const { Html5Qrcode } = await import('html5-qrcode');
                html5QrCode = new Html5Qrcode('scanner-viewport');
                scannerRef.current = html5QrCode;

                await html5QrCode.start(
                    { facingMode: 'environment' },
                    {
                        fps: 10,
                        qrbox: { width: 250, height: 250 },
                        aspectRatio: 1,
                    },
                    (decodedText) => {
                        processScanRef.current(decodedText);
                    },
                    () => { } // Ignore scan errors
                );
                setCameraReady(true);
            } catch (err) {
                console.error('Camera error:', err);
            }
        }

        initScanner();

        return () => {
            if (html5QrCode) {
                html5QrCode.stop().catch(() => { });
            }
        };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Auto-clear result
    useEffect(() => {
        if (result) {
            if (resultTimerRef.current) clearTimeout(resultTimerRef.current);
            resultTimerRef.current = setTimeout(() => {
                setResult(null);
            }, RESULT_DISPLAY_MS);
        }
        return () => {
            if (resultTimerRef.current) clearTimeout(resultTimerRef.current);
        };
    }, [result]);

    function handleManualSubmit(e) {
        e.preventDefault();
        if (!manualCode.trim()) return;
        processScan(manualCode.trim());
        setManualCode('');
    }

    const activeLabel = scanTypes.find(t => t.key === activeType)?.label || activeType;
    const currentCount = stats.scan_counts?.[activeType] || 0;

    return (
        <>
            <Head title={`Scanner - ${event.name}`} />

            <div className="scanner-page" ref={containerRef}>
                {/* Header */}
                <div className="scanner-header">
                    <a href={`/events/${event.id}`} className="scanner-header__back">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="15 18 9 12 15 6" />
                        </svg>
                    </a>
                    <div className="scanner-header__info">
                        <h1 className="scanner-header__title">{event.name}</h1>
                        <div className="scanner-header__stats">
                            {currentCount} / {stats.total_participants} {activeLabel}
                        </div>
                    </div>
                </div>

                {/* Scan type tabs */}
                {scanTypes.length > 1 && (
                    <div className="scanner-tabs">
                        {scanTypes.map((type) => (
                            <button
                                key={type.key}
                                className={`scanner-tabs__item ${activeType === type.key ? 'scanner-tabs__item--active' : ''}`}
                                onClick={() => setActiveType(type.key)}
                            >
                                {type.label}
                                <span className="scanner-tabs__count">
                                    {stats.scan_counts?.[type.key] || 0}
                                </span>
                            </button>
                        ))}
                    </div>
                )}

                {/* Camera viewport */}
                <div className="scanner-camera">
                    <div id="scanner-viewport" className="scanner-camera__viewport" />
                    {!cameraReady && (
                        <div className="scanner-camera__loading">
                            Iniciando camara...
                        </div>
                    )}
                </div>

                {/* Result panel */}
                {result && (
                    <div className={`scanner-result scanner-result--${result.status}`}>
                        <div className="scanner-result__icon">
                            {result.status === 'success' && (
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                            )}
                            {result.status === 'duplicate' && (
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="12" y1="8" x2="12" y2="12" />
                                    <line x1="12" y1="16" x2="12.01" y2="16" />
                                </svg>
                            )}
                            {(result.status === 'not_found' || result.status === 'error' || result.status === 'cancelled') && (
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="15" y1="9" x2="9" y2="15" />
                                    <line x1="9" y1="9" x2="15" y2="15" />
                                </svg>
                            )}
                        </div>
                        <div className="scanner-result__text">
                            <div className="scanner-result__message">{result.message}</div>
                            {result.participant && (
                                <div className="scanner-result__participant">
                                    <strong>{result.participant.full_name}</strong>
                                    {result.participant.company && (
                                        <span> - {result.participant.company}</span>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Manual input */}
                <form className="scanner-manual" onSubmit={handleManualSubmit}>
                    <input
                        type="text"
                        className="scanner-manual__input"
                        value={manualCode}
                        onChange={(e) => setManualCode(e.target.value)}
                        placeholder="Codigo manual..."
                        autoComplete="off"
                    />
                    <button
                        type="submit"
                        className="scanner-manual__btn"
                        disabled={scanning || !manualCode.trim()}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                    </button>
                </form>
            </div>
        </>
    );
}
