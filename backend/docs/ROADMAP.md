# BuilderApp SaaS - Roadmap de Implementación

## Resumen de Progreso

| Fase | Módulo | Estado |
|------|--------|--------|
| 1 | Infraestructura Base | ✅ Completado |
| 2 | M1: Eventos (CRUD) | ✅ Completado |
| 2 | M2: Participantes | ✅ Completado |
| 2 | M3: Speakers | ✅ Completado |
| 2 | M4: Agenda | ✅ Completado |
| 3 | M5: Sponsors | ✅ Completado |
| 3 | M6: Comunidades | ✅ Completado |
| 4 | M7: Networking | ✅ Completado |
| 4 | M8: Registro Completo | ✅ Completado |
| 5 | M9: Check-in & Scanner | ✅ Completado |
| 5 | M10: Reportes & Métricas | ⬜ Pendiente |
| 6 | Integraciones & Polish | ⬜ Pendiente |

---

## ✅ Completado

### Fase 1 - Infraestructura Base
- Laravel 12 + Inertia.js + React 18 + Cloudscape
- Autenticación, roles (Spatie), ULIDs
- Panel admin + impersonación
- Multi-tenant por organización

### Fase 2 - Módulos Core
- **Eventos**: CRUD, estados, cover image, vista pública
- **Participantes**: CRUD, check-in, export CSV, import masivo
- **Speakers**: CRUD, foto, reorder, links sociales
- **Agenda**: CRUD, agrupación por día, reorder, speaker asociado

### Fase 3 - Sponsors + Comunidades
- **Sponsors**: Niveles, CRUD, logo, reorder, montos, estados
- **Comunidades**: CRUD catálogo, logo, reorder, vista pública

### Fase 4 - Networking + Registro Completo
- **Networking**: PIN, perfiles, directorio, conexiones, búsqueda por PIN
- **Registro completo**:
  - Formulario público con país/ciudad buscables, teléfono con código de país
  - Validación de capacidad (cupos disponibles)
  - Email de confirmación con entrada digital (QR + datos)
  - Página de éxito tipo boleto con descarga de entrada digital PNG
  - Acceso de participantes ya registrados ("Ya te registraste?" en página del evento)

### Fase 5 - Check-in & Scanner
- **Scanner QR móvil**: cámara, input manual, tabs por tipo de escaneo
- **Tipos de escaneo configurables**: Check-in, Almuerzo, Kit, etc.
- **Tabla `participant_scans`**: registro de escaneos con prevención de duplicados
- **Stats en tiempo real** por tipo de escaneo

---

## ⬜ Pendiente

### Fase 6 - Reportes & Métricas

#### M10: Reportes & Métricas
- Dashboard de métricas por evento
- Reportes de asistencia
- Reportes de ingresos por sponsors
- Gráficas y estadísticas
- Exportación de reportes

### Fase 7 - Integraciones & Polish

#### Integraciones
- Pasarela de pago (registro pagado)
- Integración con calendarios (Google Calendar, iCal)
- API pública / webhooks
- Integración con plataformas de streaming

#### Polish & UX
- Optimización de performance
- PWA / modo offline para check-in
- Accesibilidad (a11y)
- Internacionalización (i18n)
- Tests automatizados (Feature + Unit)
- CI/CD pipeline

---

## Stack Técnico

| Componente | Tecnología |
|------------|-----------|
| Backend | Laravel 12 (PHP 8.3) |
| Frontend | React 18 + Inertia.js |
| UI Library | Cloudscape Design System (AWS) |
| Base de datos | PostgreSQL |
| Roles/Permisos | Spatie Laravel Permission |
| Primary Keys | ULIDs |
| Servidor | FrankenPHP |
| Almacenamiento | S3 (archivos) / public disk (local dev) |

## Credenciales Demo

| Rol | Email | Password |
|-----|-------|----------|
| Super Admin | superadmin@builderapp.app | password |
| Org Admin | admin@builderapp.app | password |
| Collaborator | maria@builderapp.app | password |
