<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Recordatorio - {{ $event->name }}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f0f2f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; -webkit-font-smoothing: antialiased;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f0f2f5; padding: 40px 16px;">
        <tr>
            <td align="center">
                <table width="480" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">

                    {{-- HEADER --}}
                    <tr>
                        <td style="background: {{ $type === 'follow_up' ? '#037f0c' : '#0972d3' }}; background: -webkit-linear-gradient(135deg, {{ $type === 'follow_up' ? '#037f0c 0%, #025f09' : '#0972d3 0%, #033160' }} 100%); background: linear-gradient(135deg, {{ $type === 'follow_up' ? '#037f0c 0%, #025f09' : '#0972d3 0%, #033160' }} 100%); padding: 32px 36px 28px; text-align: center;">
                            <p style="margin: 0 0 10px; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: rgba(255,255,255,0.55); font-weight: 700;">
                                @if($type === '48h')
                                    Recordatorio
                                @elseif($type === 'day_of')
                                    Hoy es el dia!
                                @else
                                    Gracias por asistir
                                @endif
                            </p>
                            <h1 style="margin: 0 0 14px; color: #ffffff; font-size: 22px; font-weight: 700; line-height: 1.3;">
                                {{ $event->name }}
                            </h1>
                            @if($event->date_start)
                            <p style="margin: 0 0 4px; font-size: 13px; color: rgba(255,255,255,0.75);">
                                {{ $event->date_start->translatedFormat('l, d \\d\\e F \\d\\e Y · H:i') }}
                            </p>
                            @endif
                            @if($event->location || $event->venue)
                            <p style="margin: 0; font-size: 13px; color: rgba(255,255,255,0.75);">
                                {{ implode(', ', array_filter([$event->venue, $event->location])) }}
                            </p>
                            @endif
                        </td>
                    </tr>

                    {{-- CONTENT --}}
                    <tr>
                        <td style="padding: 32px 36px;">
                            <p style="margin: 0 0 6px; color: #16191f; font-size: 18px; font-weight: 700;">
                                Hola {{ $participant->first_name }}!
                            </p>

                            @if($type === '48h')
                                <p style="margin: 0 0 24px; color: #687078; font-size: 14px; line-height: 1.6;">
                                    Te recordamos que <strong>{{ $event->name }}</strong> es en <strong>2 dias</strong>.
                                    No olvides tener tu entrada digital lista para el check-in.
                                </p>
                            @elseif($type === 'day_of')
                                <p style="margin: 0 0 24px; color: #687078; font-size: 14px; line-height: 1.6;">
                                    <strong>Hoy es el gran dia!</strong> Te esperamos en {{ $event->venue ?? $event->location }}.
                                    Recuerda llevar tu entrada digital para el check-in.
                                </p>
                            @else
                                <p style="margin: 0 0 24px; color: #687078; font-size: 14px; line-height: 1.6;">
                                    Gracias por haber asistido a <strong>{{ $event->name }}</strong>.
                                    Esperamos que hayas disfrutado la experiencia y hayas hecho conexiones valiosas.
                                </p>
                            @endif

                            @if($type !== 'follow_up')
                                {{-- QR Code section --}}
                                <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f9fb; border-radius: 14px; overflow: hidden; margin-bottom: 24px;">
                                    <tr>
                                        <td style="padding: 24px 20px 8px; text-align: center;">
                                            <p style="margin: 0 0 6px; font-size: 10px; text-transform: uppercase; letter-spacing: 1.2px; color: #9ba7b6; font-weight: 600;">Tu codigo de registro</p>
                                            <p style="margin: 0; font-size: 26px; font-weight: 700; color: #0972d3; letter-spacing: 3px; font-family: 'SF Mono', 'Fira Code', 'Consolas', 'Courier New', monospace;">
                                                {{ $participant->registration_code }}
                                            </p>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 12px 20px;">
                                            <div style="border-top: 2px dashed #d5dbdb;"></div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 20px 24px; text-align: center;">
                                            <img src="{{ $qrCodeUrl }}" alt="Codigo QR" width="180" height="180" style="border-radius: 12px; border: 4px solid #ffffff; box-shadow: 0 2px 8px rgba(0,0,0,0.06);" />
                                            <p style="margin: 10px 0 0; font-size: 12px; color: #9ba7b6;">
                                                Presenta este QR en la entrada
                                            </p>
                                        </td>
                                    </tr>
                                </table>
                            @endif

                            @if($type === '48h')
                                <p style="margin: 0; color: #687078; font-size: 13px; line-height: 1.6; padding: 16px; background-color: #e8f4fd; border-radius: 8px; border-left: 4px solid #0972d3;">
                                    <strong>Tip:</strong> Guarda este correo o descarga tu entrada digital desde la pagina del evento para tener acceso rapido el dia del evento.
                                </p>
                            @elseif($type === 'day_of')
                                <p style="margin: 0; color: #687078; font-size: 13px; line-height: 1.6; padding: 16px; background-color: #e6f4ea; border-radius: 8px; border-left: 4px solid #037f0c;">
                                    <strong>Recuerda:</strong> El check-in comienza a las {{ $event->date_start->format('H:i') }}. Te recomendamos llegar con tiempo para evitar filas.
                                </p>
                            @else
                                <p style="margin: 0; color: #687078; font-size: 13px; line-height: 1.6; padding: 16px; background-color: #f8f9fb; border-radius: 8px;">
                                    No olvides revisar tus conexiones de networking. Puedes ver los contactos que intercambiaste en tu perfil.
                                </p>
                            @endif
                        </td>
                    </tr>

                    {{-- FOOTER --}}
                    <tr>
                        <td style="padding: 18px 36px 22px; border-top: 1px solid #f2f3f3; text-align: center;">
                            <p style="margin: 0; color: #b8bfc7; font-size: 11px; line-height: 1.6;">
                                Generado por BuilderApp
                                <br>
                                <span style="color: #d0d5db;">Este correo fue enviado automaticamente. No responda a este mensaje.</span>
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
