<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Reporte de Organizacion</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Helvetica', 'Arial', sans-serif; font-size: 12px; color: #333; line-height: 1.4; }
        .header { background: #0972d3; color: white; padding: 30px; margin-bottom: 30px; }
        .header h1 { font-size: 24px; margin-bottom: 5px; }
        .header p { opacity: 0.8; font-size: 12px; }
        .container { padding: 0 30px 30px; }
        .metrics { display: table; width: 100%; margin-bottom: 30px; }
        .metric { display: table-cell; width: 20%; text-align: center; padding: 15px; background: #f8f9fb; border-right: 1px solid #e5e7eb; }
        .metric:last-child { border-right: none; }
        .metric-value { font-size: 28px; font-weight: bold; color: #0972d3; }
        .metric-label { font-size: 10px; text-transform: uppercase; color: #687078; margin-top: 5px; }
        h2 { font-size: 16px; color: #16191f; margin-bottom: 15px; padding-bottom: 8px; border-bottom: 2px solid #0972d3; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        th { background: #f1f3f4; padding: 10px 8px; text-align: left; font-size: 10px; text-transform: uppercase; color: #5f6368; border-bottom: 2px solid #e5e7eb; }
        td { padding: 10px 8px; border-bottom: 1px solid #e5e7eb; }
        tr:nth-child(even) { background: #fafafa; }
        .status { display: inline-block; padding: 3px 8px; border-radius: 4px; font-size: 10px; font-weight: 600; }
        .status-draft { background: #e5e7eb; color: #5f6368; }
        .status-published { background: #e8f4fd; color: #0972d3; }
        .status-active { background: #e6f4ea; color: #1e8e3e; }
        .status-completed { background: #f1f3f4; color: #5f6368; }
        .status-cancelled { background: #fce8e6; color: #c5221f; }
        .footer { text-align: center; color: #9aa0a6; font-size: 10px; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
    </style>
</head>
<body>
    <div class="header">
        <h1>{{ $organization->name }}</h1>
        <p>Reporte de Organizacion</p>
    </div>

    <div class="container">
        <div class="metrics">
            <div class="metric">
                <div class="metric-value">{{ $totalEvents }}</div>
                <div class="metric-label">Eventos</div>
            </div>
            <div class="metric">
                <div class="metric-value">{{ $totalParticipants }}</div>
                <div class="metric-label">Participantes</div>
            </div>
            <div class="metric">
                <div class="metric-value">{{ $totalAttended }}</div>
                <div class="metric-label">Asistieron</div>
            </div>
            <div class="metric">
                <div class="metric-value">{{ $totalSpeakers }}</div>
                <div class="metric-label">Speakers</div>
            </div>
            <div class="metric">
                <div class="metric-value">{{ $totalSponsors }}</div>
                <div class="metric-label">Sponsors</div>
            </div>
        </div>

        <h2>Eventos</h2>
        <table>
            <thead>
                <tr>
                    <th>Evento</th>
                    <th>Fecha</th>
                    <th>Estado</th>
                    <th class="text-center">Participantes</th>
                    <th class="text-center">Speakers</th>
                    <th class="text-center">Sponsors</th>
                </tr>
            </thead>
            <tbody>
                @foreach($events as $event)
                <tr>
                    <td><strong>{{ $event->name }}</strong></td>
                    <td>{{ $event->date_start ? $event->date_start->format('d/m/Y') : '-' }}</td>
                    <td>
                        <span class="status status-{{ $event->status }}">
                            {{ ucfirst($event->status) }}
                        </span>
                    </td>
                    <td class="text-center">{{ $event->participants_count }}</td>
                    <td class="text-center">{{ $event->speakers_count }}</td>
                    <td class="text-center">{{ $event->sponsors_count }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>

        <div class="footer">
            Generado el {{ $generatedAt->format('d/m/Y H:i') }} | BuilderApp
        </div>
    </div>
</body>
</html>
