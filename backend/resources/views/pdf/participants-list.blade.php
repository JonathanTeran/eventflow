<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Lista de Participantes - {{ $event->name }}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Helvetica', 'Arial', sans-serif; font-size: 10px; color: #333; line-height: 1.3; }
        .header { background: #0972d3; color: white; padding: 20px 30px; margin-bottom: 20px; }
        .header h1 { font-size: 18px; margin-bottom: 3px; }
        .header p { opacity: 0.8; font-size: 11px; }
        .container { padding: 0 30px 30px; }
        .summary { background: #f8f9fb; padding: 12px 15px; border-radius: 6px; margin-bottom: 20px; font-size: 11px; }
        .summary span { margin-right: 20px; }
        table { width: 100%; border-collapse: collapse; }
        th { background: #f1f3f4; padding: 8px 5px; text-align: left; font-size: 9px; text-transform: uppercase; color: #5f6368; border-bottom: 2px solid #e5e7eb; }
        td { padding: 6px 5px; border-bottom: 1px solid #e5e7eb; font-size: 10px; }
        tr:nth-child(even) { background: #fafafa; }
        .badge { display: inline-block; padding: 2px 5px; border-radius: 3px; font-size: 8px; font-weight: 600; }
        .badge-registered { background: #e8f4fd; color: #0972d3; }
        .badge-confirmed { background: #e6f4ea; color: #1e8e3e; }
        .badge-attended { background: #037f0c; color: white; }
        .badge-cancelled { background: #fce8e6; color: #c5221f; }
        .badge-waitlisted { background: #fef6e7; color: #c27607; }
        .badge-general { background: #f1f3f4; color: #5f6368; }
        .badge-vip { background: #fef3e0; color: #e37400; }
        .badge-student { background: #e8f4fd; color: #0972d3; }
        .check { color: #1e8e3e; font-weight: bold; }
        .footer { text-align: center; color: #9aa0a6; font-size: 9px; margin-top: 30px; padding-top: 15px; border-top: 1px solid #e5e7eb; }
        .page-break { page-break-after: always; }
    </style>
</head>
<body>
    <div class="header">
        <h1>{{ $event->name }}</h1>
        <p>Lista de Participantes</p>
    </div>

    <div class="container">
        <div class="summary">
            <span><strong>Total:</strong> {{ $participants->count() }}</span>
            <span><strong>Confirmados:</strong> {{ $participants->where('status', 'confirmed')->count() }}</span>
            <span><strong>Asistieron:</strong> {{ $participants->where('status', 'attended')->count() }}</span>
            <span><strong>Cancelados:</strong> {{ $participants->where('status', 'cancelled')->count() }}</span>
        </div>

        <table>
            <thead>
                <tr>
                    <th>#</th>
                    <th>Nombre</th>
                    <th>Email</th>
                    <th>Empresa</th>
                    <th>Ticket</th>
                    <th>Estado</th>
                    <th>Codigo</th>
                    <th>Check-in</th>
                </tr>
            </thead>
            <tbody>
                @foreach($participants as $index => $participant)
                <tr>
                    <td>{{ $index + 1 }}</td>
                    <td><strong>{{ $participant->first_name }} {{ $participant->last_name }}</strong></td>
                    <td>{{ $participant->email }}</td>
                    <td>{{ $participant->company ?? '-' }}</td>
                    <td><span class="badge badge-{{ $participant->ticket_type }}">{{ strtoupper($participant->ticket_type) }}</span></td>
                    <td><span class="badge badge-{{ $participant->status }}">{{ ucfirst($participant->status) }}</span></td>
                    <td style="font-family: monospace;">{{ $participant->registration_code }}</td>
                    <td>
                        @if($participant->checked_in_at)
                            <span class="check">{{ $participant->checked_in_at->format('H:i') }}</span>
                        @else
                            -
                        @endif
                    </td>
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
