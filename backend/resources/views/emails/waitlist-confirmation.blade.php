<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Lista de espera - {{ $event->name }}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f0f2f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; -webkit-font-smoothing: antialiased;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f0f2f5; padding: 40px 16px;">
        <tr>
            <td align="center">
                <table width="480" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">

                    {{-- HEADER --}}
                    <tr>
                        <td style="background: #f89c0e; background: -webkit-linear-gradient(135deg, #f89c0e 0%, #c27607 100%); background: linear-gradient(135deg, #f89c0e 0%, #c27607 100%); padding: 32px 36px 28px; text-align: center;">
                            <p style="margin: 0 0 10px; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: rgba(255,255,255,0.55); font-weight: 700;">
                                Lista de Espera
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
                            <p style="margin: 0 0 24px; color: #687078; font-size: 14px; line-height: 1.6;">
                                El evento esta lleno, pero te hemos agregado a la <strong>lista de espera</strong>.
                                Te notificaremos por email si se libera un cupo.
                            </p>

                            {{-- Position card --}}
                            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fef6e7; border-radius: 14px; overflow: hidden; margin-bottom: 24px;">
                                <tr>
                                    <td style="padding: 24px 20px; text-align: center;">
                                        <p style="margin: 0 0 6px; font-size: 10px; text-transform: uppercase; letter-spacing: 1.2px; color: #9ba7b6; font-weight: 600;">Tu posicion en la lista</p>
                                        <p style="margin: 0; font-size: 48px; font-weight: 700; color: #f89c0e;">
                                            #{{ $position }}
                                        </p>
                                    </td>
                                </tr>
                            </table>

                            {{-- Info --}}
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

                            <p style="margin: 0; color: #687078; font-size: 13px; line-height: 1.6; padding: 16px; background-color: #f8f9fb; border-radius: 8px;">
                                <strong>Que significa esto?</strong><br>
                                Si alguien cancela su registro, avanzaras automaticamente en la lista.
                                Cuando llegue tu turno, recibiras un email de confirmacion con tu entrada digital.
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
