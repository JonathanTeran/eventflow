<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tienes un lugar! - {{ $event->name }}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f0f2f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; -webkit-font-smoothing: antialiased;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f0f2f5; padding: 40px 16px;">
        <tr>
            <td align="center">
                <table width="480" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">

                    {{-- HEADER --}}
                    <tr>
                        <td style="background: #037f0c; background: -webkit-linear-gradient(135deg, #037f0c 0%, #025f09 100%); background: linear-gradient(135deg, #037f0c 0%, #025f09 100%); padding: 32px 36px 28px; text-align: center;">
                            <p style="margin: 0 0 10px; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: rgba(255,255,255,0.55); font-weight: 700;">
                                Entrada Confirmada
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

                    {{-- TEAR LINE --}}
                    <tr>
                        <td style="padding: 0; height: 24px; position: relative; overflow: visible;">
                            <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
                                <tr>
                                    <td width="12" style="padding: 0;">
                                        <div style="width: 24px; height: 24px; border-radius: 50%; background: #f0f2f5; margin-left: -12px;"></div>
                                    </td>
                                    <td style="padding: 0; border-top: 2px dashed #e0e4e8;"></td>
                                    <td width="12" style="padding: 0;">
                                        <div style="width: 24px; height: 24px; border-radius: 50%; background: #f0f2f5; margin-right: -12px; float: right;"></div>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    {{-- CONTENT --}}
                    <tr>
                        <td style="padding: 24px 36px 0;">
                            <p style="margin: 0 0 6px; color: #16191f; font-size: 18px; font-weight: 700;">
                                Felicidades {{ $participant->first_name }}!
                            </p>
                            <p style="margin: 0 0 24px; color: #687078; font-size: 14px; line-height: 1.5;">
                                Se libero un cupo y ahora tienes un lugar confirmado en el evento!
                                Esta es tu entrada digital.
                            </p>

                            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                                <tr>
                                    <td width="50%" style="padding: 0 0 16px; vertical-align: top;">
                                        <p style="margin: 0 0 3px; font-size: 10px; text-transform: uppercase; letter-spacing: 0.8px; color: #9ba7b6; font-weight: 600;">Nombre completo</p>
                                        <p style="margin: 0; font-size: 15px; color: #16191f; font-weight: 600;">{{ $participant->first_name }} {{ $participant->last_name }}</p>
                                    </td>
                                    <td width="50%" style="padding: 0 0 16px; vertical-align: top;">
                                        <p style="margin: 0 0 3px; font-size: 10px; text-transform: uppercase; letter-spacing: 0.8px; color: #9ba7b6; font-weight: 600;">Correo electronico</p>
                                        <p style="margin: 0; font-size: 14px; color: #16191f; font-weight: 500;">{{ $participant->email }}</p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    {{-- CODE + QR --}}
                    <tr>
                        <td style="padding: 0 36px 28px; text-align: center;">
                            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f9fb; border-radius: 14px; overflow: hidden;">
                                <tr>
                                    <td style="padding: 24px 20px 8px; text-align: center;">
                                        <p style="margin: 0 0 6px; font-size: 10px; text-transform: uppercase; letter-spacing: 1.2px; color: #9ba7b6; font-weight: 600;">Codigo de registro</p>
                                        <p style="margin: 0; font-size: 30px; font-weight: 700; color: #037f0c; letter-spacing: 3px; font-family: 'SF Mono', 'Fira Code', 'Consolas', 'Courier New', monospace;">
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
                                        <img src="{{ $qrCodeUrl }}" alt="Codigo QR" width="240" height="240" style="border-radius: 12px; border: 4px solid #ffffff; box-shadow: 0 2px 8px rgba(0,0,0,0.06);" />
                                        <p style="margin: 10px 0 0; font-size: 12px; color: #9ba7b6;">
                                            Presenta este QR en la entrada del evento
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    {{-- CTA --}}
                    <tr>
                        <td style="padding: 0 36px 28px; text-align: center;">
                            <a href="{{ $networkingUrl }}" style="display: inline-block; background: #037f0c; background: -webkit-linear-gradient(135deg, #037f0c, #025f09); background: linear-gradient(135deg, #037f0c, #025f09); color: #ffffff; text-decoration: none; padding: 14px 44px; border-radius: 12px; font-size: 15px; font-weight: 600;">
                                Acceder a Networking
                            </a>
                            <p style="margin: 8px 0 0; color: #9ba7b6; font-size: 12px;">
                                Conecta con otros participantes del evento.
                            </p>
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
