import { Head } from '@inertiajs/react';
import { QRCodeSVG } from 'qrcode.react';
import PublicLayout from '@/Layouts/PublicLayout';
import { useState, useEffect, useRef, useCallback } from 'react';
import { formatDateLong } from '@/utils/formatters';

function formatDateRange(start, end) {
    const s = formatDateLong(start);
    const e = end ? formatDateLong(end) : null;
    if (!e || s === e) return s;
    return `${s} - ${e}`;
}

/* ── Digital Ticket Generator (Canvas) ── */

function drawRoundedRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '';
    let currentY = y;
    for (const word of words) {
        const test = line + word + ' ';
        if (ctx.measureText(test).width > maxWidth && line) {
            ctx.fillText(line.trim(), x, currentY);
            line = word + ' ';
            currentY += lineHeight;
        } else {
            line = test;
        }
    }
    ctx.fillText(line.trim(), x, currentY);
    return currentY;
}

function generateTicketImage(qrSvgElement, event, participant) {
    return new Promise((resolve) => {
        const scale = 2;
        const W = 480 * scale;
        const H = 820 * scale;
        const pad = 40 * scale;
        const cardX = 0;
        const cardW = W;

        const canvas = document.createElement('canvas');
        canvas.width = W;
        canvas.height = H;
        const ctx = canvas.getContext('2d');

        // ── Background ──
        ctx.fillStyle = '#f0f2f5';
        ctx.fillRect(0, 0, W, H);

        // ── Card shadow (simulate) ──
        ctx.save();
        ctx.shadowColor = 'rgba(0,0,0,0.12)';
        ctx.shadowBlur = 24 * scale;
        ctx.shadowOffsetY = 4 * scale;
        drawRoundedRect(ctx, cardX + 16 * scale, 16 * scale, cardW - 32 * scale, H - 32 * scale, 24 * scale);
        ctx.fillStyle = '#fff';
        ctx.fill();
        ctx.restore();

        const innerX = cardX + 16 * scale;
        const innerW = cardW - 32 * scale;
        const innerR = 24 * scale;

        // ── Header gradient ──
        const headerH = 160 * scale;
        ctx.save();
        drawRoundedRect(ctx, innerX, 16 * scale, innerW, headerH, innerR);
        // clip bottom corners to be square
        ctx.rect(innerX, 16 * scale + innerR, innerW, headerH);
        ctx.clip();
        drawRoundedRect(ctx, innerX, 16 * scale, innerW, headerH, innerR);
        const grad = ctx.createLinearGradient(innerX, 16 * scale, innerX + innerW, 16 * scale + headerH);
        grad.addColorStop(0, '#0972d3');
        grad.addColorStop(1, '#033160');
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.restore();

        // Header text
        let ty = 16 * scale + 36 * scale;
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.font = `bold ${11 * scale}px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText('ENTRADA DIGITAL', W / 2, ty);

        ty += 28 * scale;
        ctx.fillStyle = '#fff';
        ctx.font = `bold ${20 * scale}px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`;
        const lastY = wrapText(ctx, event.name, W / 2, ty, innerW - pad * 2, 26 * scale);

        ty = lastY + 22 * scale;
        ctx.fillStyle = 'rgba(255,255,255,0.75)';
        ctx.font = `500 ${11 * scale}px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`;
        if (event.date_start) {
            wrapText(ctx, formatDateRange(event.date_start, event.date_end), W / 2, ty, innerW - pad * 2, 16 * scale);
            ty += 18 * scale;
        }
        if (event.venue || event.location) {
            wrapText(ctx, [event.venue, event.location].filter(Boolean).join(', '), W / 2, ty, innerW - pad * 2, 16 * scale);
        }

        // ── Tear line ──
        const tearY = 16 * scale + headerH;
        const circleR = 14 * scale;

        // Punch holes
        ctx.save();
        ctx.fillStyle = '#f0f2f5';
        ctx.beginPath();
        ctx.arc(innerX, tearY, circleR, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(innerX + innerW, tearY, circleR, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Dashed line
        ctx.save();
        ctx.strokeStyle = '#dde1e6';
        ctx.lineWidth = 1.5 * scale;
        ctx.setLineDash([6 * scale, 4 * scale]);
        ctx.beginPath();
        ctx.moveTo(innerX + circleR + 4 * scale, tearY);
        ctx.lineTo(innerX + innerW - circleR - 4 * scale, tearY);
        ctx.stroke();
        ctx.restore();

        // ── Participant info ──
        ctx.textAlign = 'left';
        let infoY = tearY + 32 * scale;
        const infoX = innerX + pad;
        const infoMaxW = innerW - pad * 2;

        function drawField(label, value, yPos, small) {
            ctx.fillStyle = '#9ba7b6';
            ctx.font = `600 ${9 * scale}px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`;
            ctx.fillText(label.toUpperCase(), infoX, yPos);
            ctx.fillStyle = '#16191f';
            ctx.font = `${small ? 500 : 600} ${(small ? 12 : 14) * scale}px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`;
            ctx.fillText(value, infoX, yPos + 18 * scale);
            return yPos + 44 * scale;
        }

        // Two-column layout for name fields
        infoY = drawField('Nombre completo', participant.full_name, infoY, false);
        infoY = drawField('Correo electronico', participant.email, infoY, true);

        // ── Registration code ──
        infoY += 4 * scale;
        ctx.fillStyle = '#9ba7b6';
        ctx.font = `600 ${9 * scale}px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText('CODIGO DE REGISTRO', W / 2, infoY);
        infoY += 24 * scale;
        ctx.fillStyle = '#0972d3';
        ctx.font = `bold ${26 * scale}px 'SF Mono', 'Fira Code', Consolas, monospace`;
        ctx.fillText(participant.registration_code, W / 2, infoY);

        // ── QR Code ──
        infoY += 28 * scale;

        // Render QR SVG to image
        const svgData = new XMLSerializer().serializeToString(qrSvgElement);
        const qrImg = new Image();
        qrImg.onload = () => {
            const qrSize = 200 * scale;
            const qrX = (W - qrSize) / 2;

            // QR background
            drawRoundedRect(ctx, qrX - 8 * scale, infoY - 8 * scale, qrSize + 16 * scale, qrSize + 16 * scale, 12 * scale);
            ctx.fillStyle = '#fff';
            ctx.fill();
            ctx.strokeStyle = '#e9ebed';
            ctx.lineWidth = 1 * scale;
            ctx.stroke();

            ctx.drawImage(qrImg, qrX, infoY, qrSize, qrSize);

            infoY += qrSize + 20 * scale;
            ctx.fillStyle = '#9ba7b6';
            ctx.font = `500 ${10 * scale}px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`;
            ctx.textAlign = 'center';
            ctx.fillText('Presenta este codigo en la entrada del evento', W / 2, infoY);

            // ── Footer ──
            const footerY = H - 16 * scale - 36 * scale;
            ctx.fillStyle = '#d5dbdb';
            ctx.beginPath();
            ctx.moveTo(innerX + pad, footerY);
            ctx.lineTo(innerX + innerW - pad, footerY);
            ctx.stroke();

            ctx.fillStyle = '#b8bfc7';
            ctx.font = `500 ${9 * scale}px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`;
            ctx.fillText('Generado por BuilderApp', W / 2, footerY + 20 * scale);

            resolve(canvas.toDataURL('image/png'));
        };
        qrImg.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    });
}

function ConfettiCanvas() {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const colors = ['#0972d3', '#ec7211', '#037f0c', '#d91515', '#8b5cf6', '#f59e0b'];
        const pieces = Array.from({ length: 80 }, () => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            w: Math.random() * 8 + 4,
            h: Math.random() * 6 + 2,
            color: colors[Math.floor(Math.random() * colors.length)],
            speed: Math.random() * 3 + 2,
            spin: Math.random() * 0.2 - 0.1,
            angle: Math.random() * Math.PI * 2,
            drift: Math.random() * 1 - 0.5,
        }));

        let frame;
        let elapsed = 0;
        function draw() {
            elapsed++;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (const p of pieces) {
                p.y += p.speed;
                p.x += p.drift;
                p.angle += p.spin;
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(p.angle);
                ctx.fillStyle = p.color;
                ctx.globalAlpha = Math.max(0, 1 - elapsed / 120);
                ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
                ctx.restore();
            }
            if (elapsed < 120) {
                frame = requestAnimationFrame(draw);
            }
        }
        draw();
        return () => cancelAnimationFrame(frame);
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: 1000,
            }}
        />
    );
}

export default function EventRegistrationSuccess({ event, participant, networkingUrl }) {
    const [copied, setCopied] = useState(false);
    const [showConfetti, setShowConfetti] = useState(true);
    const qrRef = useRef(null);
    const profileUrl = `${window.location.origin}/e/${event.slug}/networking/${participant.registration_code}/profile`;

    useEffect(() => {
        const timer = setTimeout(() => setShowConfetti(false), 4000);
        return () => clearTimeout(timer);
    }, []);

    function copyCode() {
        navigator.clipboard.writeText(participant.registration_code).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    }

    const [downloading, setDownloading] = useState(false);

    const downloadTicket = useCallback(async () => {
        const svg = qrRef.current?.querySelector('svg');
        if (!svg || downloading) return;
        setDownloading(true);
        try {
            const dataUrl = await generateTicketImage(svg, event, participant);
            const link = document.createElement('a');
            link.download = `entrada-${participant.registration_code}.png`;
            link.href = dataUrl;
            link.click();
        } finally {
            setDownloading(false);
        }
    }, [event, participant, downloading]);

    return (
        <PublicLayout>
            <Head title={`Registro exitoso - ${event.name}`} />

            {showConfetti && <ConfettiCanvas />}

            <div className="success-page">
                {/* Animated success header */}
                <div className="success-hero">
                    <div className="success-hero__check">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                    </div>
                    <h1 className="success-hero__title">Registro exitoso!</h1>
                    <p className="success-hero__subtitle">
                        Te has registrado en <strong>{event.name}</strong>
                    </p>
                    <p className="success-hero__email-note">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="2" y="4" width="20" height="16" rx="2" />
                            <path d="M22 4L12 13 2 4" />
                        </svg>
                        Hemos enviado la confirmacion a <strong>{participant.email}</strong>
                    </p>
                </div>

                {/* Ticket card */}
                <div className="success-ticket">
                    {/* Ticket top: event info */}
                    <div className="success-ticket__header">
                        <div className="success-ticket__event-name">{event.name}</div>
                        <div className="success-ticket__event-details">
                            {event.date_start && (
                                <span className="success-ticket__detail">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="4" width="18" height="18" rx="2" />
                                        <line x1="16" y1="2" x2="16" y2="6" />
                                        <line x1="8" y1="2" x2="8" y2="6" />
                                        <line x1="3" y1="10" x2="21" y2="10" />
                                    </svg>
                                    {formatDateRange(event.date_start, event.date_end)}
                                </span>
                            )}
                            {(event.location || event.venue) && (
                                <span className="success-ticket__detail">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                        <circle cx="12" cy="10" r="3" />
                                    </svg>
                                    {[event.venue, event.location].filter(Boolean).join(', ')}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Ticket tear line */}
                    <div className="success-ticket__tear">
                        <div className="success-ticket__tear-circle success-ticket__tear-circle--left" />
                        <div className="success-ticket__tear-line" />
                        <div className="success-ticket__tear-circle success-ticket__tear-circle--right" />
                    </div>

                    {/* Ticket body */}
                    <div className="success-ticket__body">
                        <div className="success-ticket__info">
                            <div className="success-ticket__field">
                                <span className="success-ticket__label">Nombre</span>
                                <span className="success-ticket__value">{participant.full_name}</span>
                            </div>
                            <div className="success-ticket__field">
                                <span className="success-ticket__label">Email</span>
                                <span className="success-ticket__value success-ticket__value--small">{participant.email}</span>
                            </div>
                            <div className="success-ticket__field">
                                <span className="success-ticket__label">Codigo de registro</span>
                                <div className="success-ticket__code-row">
                                    <span className="success-ticket__code">{participant.registration_code}</span>
                                    <button
                                        type="button"
                                        className="success-ticket__copy-btn"
                                        onClick={copyCode}
                                        title="Copiar codigo"
                                    >
                                        {copied ? (
                                            <>
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                                    <polyline points="20 6 9 17 4 12" />
                                                </svg>
                                                Copiado
                                            </>
                                        ) : (
                                            <>
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                                                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                                                </svg>
                                                Copiar
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* QR section */}
                        <div className="success-ticket__qr" ref={qrRef}>
                            <QRCodeSVG
                                value={profileUrl}
                                size={200}
                                level="M"
                                includeMargin
                            />
                            <p className="success-ticket__qr-label">Presenta este QR en el evento</p>
                            <button type="button" className="success-ticket__download-btn" onClick={downloadTicket} disabled={downloading}>
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                    <polyline points="7 10 12 15 17 10" />
                                    <line x1="12" y1="15" x2="12" y2="3" />
                                </svg>
                                {downloading ? 'Generando...' : 'Descargar entrada digital'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Next steps */}
                <div className="success-next">
                    <h3 className="success-next__title">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                        </svg>
                        Siguientes pasos
                    </h3>
                    <div className="success-next__steps">
                        <div className="success-next__step">
                            <span className="success-next__step-num">1</span>
                            <div>
                                <strong>Revisa tu correo</strong>
                                <p>Te enviamos la confirmacion con tu codigo QR</p>
                            </div>
                        </div>
                        <div className="success-next__step">
                            <span className="success-next__step-num">2</span>
                            <div>
                                <strong>Crea tu PIN de Networking</strong>
                                <p>Conecta con otros participantes del evento</p>
                            </div>
                        </div>
                        <div className="success-next__step">
                            <span className="success-next__step-num">3</span>
                            <div>
                                <strong>Presenta tu QR</strong>
                                <p>Muestralo en la entrada del evento para el check-in</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="success-buttons">
                    <a href={networkingUrl} className="success-buttons__primary">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                        </svg>
                        Ir a Networking
                    </a>
                    <a href={`/e/${event.slug}`} className="success-buttons__secondary">
                        Ver pagina del evento
                    </a>
                </div>
            </div>
        </PublicLayout>
    );
}
