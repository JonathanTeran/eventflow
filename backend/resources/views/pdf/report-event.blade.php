<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Reporte - {{ $event->name }}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Helvetica', 'Arial', sans-serif; font-size: 12px; color: #333; line-height: 1.4; }
        .header { background: #0972d3; color: white; padding: 30px; margin-bottom: 30px; }
        .header h1 { font-size: 22px; margin-bottom: 5px; }
        .header p { opacity: 0.8; font-size: 11px; }
        .container { padding: 0 30px 30px; }
        .event-info { background: #f8f9fb; padding: 15px; border-radius: 8px; margin-bottom: 25px; }
        .event-info p { margin-bottom: 5px; }
        .event-info strong { color: #16191f; }
        .metrics { display: table; width: 100%; margin-bottom: 30px; }
        .metric { display: table-cell; width: 25%; text-align: center; padding: 15px; background: #f8f9fb; border-right: 1px solid #e5e7eb; }
        .metric:last-child { border-right: none; }
        .metric-value { font-size: 28px; font-weight: bold; color: #0972d3; }
        .metric-label { font-size: 10px; text-transform: uppercase; color: #687078; margin-top: 5px; }
        h2 { font-size: 14px; color: #16191f; margin-bottom: 12px; padding-bottom: 6px; border-bottom: 2px solid #0972d3; }
        .section { margin-bottom: 25px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th { background: #f1f3f4; padding: 8px 6px; text-align: left; font-size: 10px; text-transform: uppercase; color: #5f6368; border-bottom: 2px solid #e5e7eb; }
        td { padding: 8px 6px; border-bottom: 1px solid #e5e7eb; font-size: 11px; }
        tr:nth-child(even) { background: #fafafa; }
        .badge { display: inline-block; padding: 2px 6px; border-radius: 3px; font-size: 9px; font-weight: 600; }
        .badge-registered { background: #e8f4fd; color: #0972d3; }
        .badge-confirmed { background: #e6f4ea; color: #1e8e3e; }
        .badge-attended { background: #037f0c; color: white; }
        .badge-cancelled { background: #fce8e6; color: #c5221f; }
        .badge-waitlisted { background: #fef6e7; color: #c27607; }
        .two-col { display: table; width: 100%; }
        .two-col > div { display: table-cell; width: 50%; padding-right: 15px; vertical-align: top; }
        .two-col > div:last-child { padding-right: 0; padding-left: 15px; }
        .stat-row { display: table; width: 100%; margin-bottom: 8px; }
        .stat-label { display: table-cell; width: 60%; }
        .stat-value { display: table-cell; width: 40%; text-align: right; font-weight: bold; }
        .footer { text-align: center; color: #9aa0a6; font-size: 10px; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
    </style>
</head>
<body>
    <div class="header">
        <h1>{{ $event->name }}</h1>
        <p>Reporte del Evento</p>
    </div>

    <div class="container">
        <div class="event-info">
            <p><strong>Fecha:</strong> {{ $event->date_start ? $event->date_start->format('d/m/Y H:i') : '-' }}</p>
            <p><strong>Ubicacion:</strong> {{ implode(', ', array_filter([$event->venue, $event->location])) ?: '-' }}</p>
            <p><strong>Capacidad:</strong> {{ $event->capacity ?? 'Sin limite' }}</p>
            <p><strong>Estado:</strong> {{ ucfirst($event->status) }}</p>
        </div>

        <div class="metrics">
            <div class="metric">
                <div class="metric-value">{{ $event->participants->count() }}</div>
                <div class="metric-label">Participantes</div>
            </div>
            <div class="metric">
                <div class="metric-value">{{ $participantsByStatus->get('attended', 0) }}</div>
                <div class="metric-label">Asistieron</div>
            </div>
            <div class="metric">
                <div class="metric-value">{{ $event->speakers->count() }}</div>
                <div class="metric-label">Speakers</div>
            </div>
            <div class="metric">
                <div class="metric-value">{{ $event->sponsors->count() }}</div>
                <div class="metric-label">Sponsors</div>
            </div>
        </div>

        <div class="two-col">
            <div>
                <div class="section">
                    <h2>Participantes por Estado</h2>
                    @foreach(['registered' => 'Registrados', 'confirmed' => 'Confirmados', 'attended' => 'Asistieron', 'cancelled' => 'Cancelados', 'waitlisted' => 'En espera'] as $status => $label)
                    <div class="stat-row">
                        <span class="stat-label">{{ $label }}</span>
                        <span class="stat-value">{{ $participantsByStatus->get($status, 0) }}</span>
                    </div>
                    @endforeach
                </div>
            </div>
            <div>
                <div class="section">
                    <h2>Participantes por Tipo</h2>
                    @foreach(['general' => 'General', 'vip' => 'VIP', 'student' => 'Estudiante'] as $type => $label)
                    <div class="stat-row">
                        <span class="stat-label">{{ $label }}</span>
                        <span class="stat-value">{{ $participantsByTicket->get($type, 0) }}</span>
                    </div>
                    @endforeach
                </div>
            </div>
        </div>

        @if($event->speakers->count() > 0)
        <div class="section">
            <h2>Speakers</h2>
            <table>
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Empresa</th>
                        <th>Cargo</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($event->speakers as $speaker)
                    <tr>
                        <td><strong>{{ $speaker->first_name }} {{ $speaker->last_name }}</strong></td>
                        <td>{{ $speaker->company ?? '-' }}</td>
                        <td>{{ $speaker->job_title ?? '-' }}</td>
                    </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
        @endif

        @if($event->sponsors->count() > 0)
        <div class="section">
            <h2>Sponsors</h2>
            <table>
                <thead>
                    <tr>
                        <th>Empresa</th>
                        <th>Nivel</th>
                        <th>Contacto</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($event->sponsors as $sponsor)
                    <tr>
                        <td><strong>{{ $sponsor->company_name }}</strong></td>
                        <td>{{ $sponsor->sponsorLevel->name ?? '-' }}</td>
                        <td>{{ $sponsor->contact_name ?? '-' }}</td>
                    </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
        @endif

        <div class="footer">
            Generado el {{ $generatedAt->format('d/m/Y H:i') }} | BuilderApp
        </div>
    </div>
</body>
</html>
