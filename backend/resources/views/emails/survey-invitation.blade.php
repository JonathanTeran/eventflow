<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $survey->title }}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f0f2f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; -webkit-font-smoothing: antialiased;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f0f2f5; padding: 40px 16px;">
        <tr>
            <td align="center">
                <table width="520" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">

                    {{-- Header --}}
                    <tr>
                        <td style="background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%); padding: 36px 40px; text-align: center;">
                            <p style="margin: 0 0 8px; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: rgba(255,255,255,0.6); font-weight: 700;">
                                Tu opinion importa
                            </p>
                            <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; line-height: 1.3;">
                                {{ $survey->title }}
                            </h1>
                        </td>
                    </tr>

                    {{-- Content --}}
                    <tr>
                        <td style="padding: 36px 40px;">
                            <p style="margin: 0 0 8px; color: #16191f; font-size: 18px; font-weight: 700;">
                                Hola {{ $participant->first_name }},
                            </p>
                            <p style="margin: 0 0 24px; color: #5f6b7a; font-size: 15px; line-height: 1.6;">
                                Gracias por participar en <strong>{{ $survey->event->name }}</strong>. Nos encantaria conocer tu experiencia.
                            </p>

                            @if($survey->description)
                            <p style="margin: 0 0 24px; color: #5f6b7a; font-size: 15px; line-height: 1.6;">
                                {{ $survey->description }}
                            </p>
                            @endif

                            {{-- Survey info box --}}
                            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f9fb; border-radius: 12px; margin-bottom: 28px;">
                                <tr>
                                    <td style="padding: 20px 24px;">
                                        <table width="100%" cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td width="50%">
                                                    <p style="margin: 0 0 4px; font-size: 10px; text-transform: uppercase; letter-spacing: 0.8px; color: #9ba7b6; font-weight: 600;">Evento</p>
                                                    <p style="margin: 0; font-size: 14px; color: #16191f; font-weight: 500;">{{ $survey->event->name }}</p>
                                                </td>
                                                <td width="50%">
                                                    <p style="margin: 0 0 4px; font-size: 10px; text-transform: uppercase; letter-spacing: 0.8px; color: #9ba7b6; font-weight: 600;">Preguntas</p>
                                                    <p style="margin: 0; font-size: 14px; color: #16191f; font-weight: 500;">{{ $survey->questions->count() }} preguntas</p>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>

                            {{-- CTA Button --}}
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center">
                                        <a href="{{ url("/e/{$survey->event->slug}/survey/{$survey->id}?code={$participant->registration_code}") }}"
                                           style="display: inline-block; background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 10px; font-size: 16px; font-weight: 600;">
                                            Responder encuesta
                                        </a>
                                    </td>
                                </tr>
                            </table>

                            <p style="margin: 28px 0 0; color: #9ba7b6; font-size: 13px; text-align: center; line-height: 1.5;">
                                Solo te tomara unos minutos y nos ayudara a mejorar futuros eventos.
                            </p>
                        </td>
                    </tr>

                    {{-- Footer --}}
                    <tr>
                        <td style="padding: 24px 40px; border-top: 1px solid #e9ebed; text-align: center;">
                            <p style="margin: 0; color: #9ba7b6; font-size: 12px;">
                                Si tienes problemas con el boton, copia y pega este enlace en tu navegador:
                            </p>
                            <p style="margin: 8px 0 0; font-size: 11px; word-break: break-all;">
                                <a href="{{ url("/e/{$survey->event->slug}/survey/{$survey->id}?code={$participant->registration_code}") }}"
                                   style="color: #7c3aed; text-decoration: none;">
                                    {{ url("/e/{$survey->event->slug}/survey/{$survey->id}?code={$participant->registration_code}") }}
                                </a>
                            </p>
                        </td>
                    </tr>

                </table>

                {{-- Footer brand --}}
                <table width="520" cellpadding="0" cellspacing="0">
                    <tr>
                        <td style="padding: 24px 40px; text-align: center;">
                            <p style="margin: 0; color: #9ba7b6; font-size: 12px;">
                                Enviado con BuilderApp
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
