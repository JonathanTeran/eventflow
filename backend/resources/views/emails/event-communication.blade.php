<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $communication->subject }} - {{ $event->name }}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f0f2f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; -webkit-font-smoothing: antialiased;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f0f2f5; padding: 40px 16px;">
        <tr>
            <td align="center">
                <table width="480" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">

                    {{-- HEADER --}}
                    <tr>
                        <td style="background: #0972d3; background: linear-gradient(135deg, #0972d3 0%, #033160 100%); padding: 32px 36px 28px; text-align: center;">
                            <p style="margin: 0 0 10px; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: rgba(255,255,255,0.55); font-weight: 700;">
                                Comunicado
                            </p>
                            <h1 style="margin: 0 0 14px; color: #ffffff; font-size: 22px; font-weight: 700; line-height: 1.3;">
                                {{ $event->name }}
                            </h1>
                            @if($event->date_start)
                            <p style="margin: 0 0 4px; font-size: 13px; color: rgba(255,255,255,0.75);">
                                {{ $event->date_start->translatedFormat('l, d \\d\\e F \\d\\e Y') }}
                            </p>
                            @endif
                        </td>
                    </tr>

                    {{-- CONTENT --}}
                    <tr>
                        <td style="padding: 32px 36px 0;">
                            <p style="margin: 0 0 6px; color: #16191f; font-size: 18px; font-weight: 700;">
                                Hola {{ $participant->first_name }}!
                            </p>
                            <h2 style="margin: 16px 0 12px; color: #16191f; font-size: 16px; font-weight: 700;">
                                {{ $communication->subject }}
                            </h2>
                            <div style="margin: 0 0 24px; color: #414d5c; font-size: 14px; line-height: 1.7;">
                                {!! nl2br(e($body)) !!}
                            </div>
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
