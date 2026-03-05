# BuilderApp SaaS - Changelog de Implementación

## Fase 1 - Infraestructura Base
> Estado: **Completada**

- Proyecto Laravel 12 + Inertia.js + React 18 + Cloudscape Design System
- Autenticación (login/register)
- Sistema de roles con Spatie Permission (`super_admin`, `org_admin`, `collaborator`, `participant`, `speaker`, `sponsor`)
- Trait `BelongsToOrganization` con global scope por organización
- Trait `HasUlid` para primary keys
- Panel de administración (`/admin/*`) con middleware `super_admin`
- CRUD de organizaciones y usuarios desde admin
- Impersonación de organizaciones por super admin
- Layout con Cloudscape AppLayout + SideNavigation + TopNavigation
- Middleware `has_organization` para rutas org-level

## Fase 2 - Módulos Core de Eventos

### M1: Eventos (CRUD)
> Estado: **Completado**

- CRUD completo de eventos con cover image
- Campos: nombre, slug, descripción, fechas, ubicación, venue, capacidad, tipo de registro, estado
- Cambio de estado (draft → published → active → completed → cancelled)
- Vista pública de evento (`/e/{slug}`) con URL firmada para preview

### M2: Participantes
> Estado: **Completado**

- CRUD de participantes por evento
- Campos: nombre, email, empresa, cargo, tipo de ticket, estado
- Check-in con timestamp
- Exportación CSV
- Importación masiva (bulk import)

### M3: Speakers
> Estado: **Completado**

- CRUD de speakers por evento
- Campos: nombre, email, empresa, cargo, bio, links sociales, foto, estado
- Upload de foto
- Reordenamiento (sort_order con botones up/down)

### M4: Agenda
> Estado: **Completado**

- CRUD de items de agenda por evento
- Campos: título, descripción, fecha, hora inicio/fin, ubicación, tipo, speaker asociado
- Agrupación por día
- Reordenamiento y movimiento entre días

## Fase 3 - Sponsors + Comunidades

### M5: Sponsors
> Estado: **Completado**

- Niveles de sponsor (CRUD con reordenamiento)
- CRUD de sponsors con nivel, contacto, monto, estado
- Upload de logo
- Reordenamiento
- Vista pública agrupada por nivel

### M6: Comunidades
> Estado: **Completado** (2026-02-26)

**Archivos creados:**
1. `database/migrations/2026_02_26_000007_create_communities_table.php`
2. `app/Models/Community.php`
3. `app/Http/Requests/StoreCommunityRequest.php`
4. `app/Http/Controllers/CommunityController.php`
5. `resources/js/Pages/Events/Communities/Index.jsx`
6. `resources/js/Pages/Events/Communities/Create.jsx`
7. `resources/js/Pages/Events/Communities/Edit.jsx`

**Archivos modificados:**
1. `app/Models/Event.php` → relación `communities()`
2. `routes/web.php` → 8 rutas de communities
3. `database/seeders/RoleAndPermissionSeeder.php` → 4 permisos + collaborator
4. `database/seeders/DemoSeeder.php` → 4 comunidades demo (Python Ecuador, JavaScript EC, AWS UG Ecuador, GDG Quito)
5. `resources/js/Layouts/EventLayout.jsx` → tab "Comunidades"
6. `app/Http/Controllers/PublicEventController.php` → eager load + pass communities
7. `resources/js/Pages/Public/EventShow.jsx` → sección pública de comunidades
8. `resources/js/styles/public-layout.css` → estilos `.community-card`, `.communities-grid`

**Post-implementación:**
- Migración ejecutada manualmente con `/opt/homebrew/opt/php@8.3/bin/php artisan migrate`
- Permisos agregados via tinker (no re-seed completo)
- 4 comunidades demo seeded para DevFest Ecuador 2026

**Funcionalidades:**
- Listado con cards (logo, nombre, URL, descripción truncada)
- Reordenamiento con botones up/down
- Crear comunidad (nombre, URL, descripción)
- Editar comunidad con layout grid 8-4 (formulario + logo/danger zone)
- Upload de logo (almacenado en `events/{eventId}/communities/`)
- Eliminar con confirmación (soft delete)
- Sección pública con cards linkeables (logo/iniciales + nombre)
- Collaborator solo puede ver (no crear/editar/eliminar)

## Fase 4 - Registro Completo de Participantes
> Estado: **Completado** (2026-02-26)

### Registro Público con Validación de Capacidad

**Flujo completo del participante:**

```
Pagina del evento → Formulario de registro → Validación → Pagina de éxito → Email de confirmación
     ↑                                                          ↓
     └──── "Ya te registraste?" (lookup por email) ←──── Networking
```

**Archivos creados:**
1. `app/Mail/RegistrationConfirmation.php` — Mailable sincrónico con QR + datos del evento
2. `resources/views/emails/registration-confirmation.blade.php` — Email HTML tipo entrada digital
3. `database/migrations/2026_02_26_300000_create_participant_scans_table.php` — Tabla de escaneos
4. `database/migrations/2026_02_26_400000_add_country_city_to_participants_table.php` — Columnas país/ciudad
5. `app/Models/ParticipantScan.php` — Modelo para escaneos (check-in, almuerzo, kit, etc.)
6. `app/Http/Controllers/ScannerController.php` — Endpoints del scanner móvil
7. `resources/js/Pages/Events/Scanner.jsx` — Scanner QR móvil con cámara
8. `resources/js/styles/scanner.css` — Estilos del scanner (dark mode, mobile-first)
9. `resources/js/Components/SearchableSelect.jsx` — Select buscable para formularios públicos
10. `resources/js/Components/PhoneInput.jsx` — Input de teléfono con selector de código de país + banderas
11. `resources/js/data/locations.js` — Datos de países, ciudades, códigos telefónicos

**Archivos modificados:**
1. `app/Models/Event.php` → `spotsLeft()`, `isFull()`, `registeredCount()`, `scans()`
2. `app/Models/Participant.php` → `$fillable` con country/city, relación `scans()`
3. `app/Http/Controllers/PublicEventController.php` → capacidad, email, lookup, props
4. `app/Http/Controllers/ParticipantController.php` → capacidad en store(), CSV con country/city
5. `app/Http/Controllers/ReportController.php` → bugfix `checked_in` → `attended`
6. `app/Http/Controllers/EventController.php` → scanTypes en edit()
7. `app/Http/Requests/PublicRegisterParticipantRequest.php` → country/city required
8. `app/Http/Requests/StoreParticipantRequest.php` → country/city required
9. `app/Http/Requests/UpdateParticipantRequest.php` → country/city required
10. `app/Http/Requests/UpdateEventRequest.php` → validar settings.scan_types
11. `routes/web.php` → rutas scanner + lookup
12. `resources/js/Pages/Public/EventRegister.jsx` → capacidad, SearchableSelect, PhoneInput
13. `resources/js/Pages/Public/EventShow.jsx` → registeredCount, sección "Ya te registraste?"
14. `resources/js/Pages/Public/EventRegistrationSuccess.jsx` — Rediseño tipo entrada digital
15. `resources/js/Pages/Events/Participants/Create.jsx` → Autosuggest país/ciudad, PhoneInput
16. `resources/js/Pages/Events/Participants/Edit.jsx` → Autosuggest país/ciudad, PhoneInput
17. `resources/js/Pages/Events/Edit.jsx` → Config scan types (Toggle + Input)
18. `resources/js/Layouts/EventLayout.jsx` → Tab Scanner
19. `resources/js/styles/public-layout.css` → Estilos de capacidad, formulario, éxito, lookup

**NPM:** `html5-qrcode`

---

### Funcionalidades detalladas

#### 1. Formulario de registro (`/e/{slug}/register`)

- Campos: nombre*, apellido*, email*, teléfono, país*, ciudad*, empresa, cargo
- **País/Ciudad**: selects buscables con filtro accent-insensitive
  - 32 países de LATAM/España con ciudades precargadas
  - Ciudades se filtran según el país seleccionado
  - Default: Ecuador
- **Teléfono**: componente con selector de código de país
  - Dropdown con bandera emoji + código (`🇪🇨 +593`)
  - Búsqueda por nombre de país o código
  - Se sincroniza automáticamente al cambiar el país
  - Almacena como `+593 999999999` en BD
- **Capacidad**: barra de progreso + "X cupos disponibles de Y"
  - Si lleno: formulario deshabilitado + banner "Cupos agotados"
- Validación server-side con mensajes en español
- Si el email ya existe → redirige a la página de éxito existente

#### 2. Página de éxito (`/e/{slug}/registered/{code}`)

Diseño tipo **entrada digital / boleto de evento**:
- Animación de confetti al cargar (4 segundos)
- Check animado con efecto "pop"
- Nota de confirmación de email enviado (chip verde)
- **Tarjeta tipo ticket**:
  - Header con degradado azul: nombre evento + fecha + ubicación (líneas separadas)
  - Línea de corte perforada con círculos laterales
  - Datos: nombre, email, código de registro con botón copiar
  - QR grande (200px) para escaneo
- **Descargar entrada digital**: genera PNG (960x1640px) con Canvas API
  - Misma estructura de ticket: header degradado, tear line, datos, código, QR grande (200px @2x)
  - Footer "Generado por BuilderApp"
- Pasos siguientes con números circulares
- Botón "Ir a Networking"

#### 3. Email de confirmación

Se envía automáticamente al registrarse (sincrónico, `MAIL_MAILER=log` en local).

Diseño **idéntico a la entrada digital**:
- Header degradado azul con "ENTRADA DIGITAL" + nombre evento
- Fecha y ubicación en líneas separadas
- Línea de corte perforada con punch holes
- Datos del participante (nombre + email)
- Código de registro grande (30px, monospace, azul)
- QR grande (240x240px, generado a 400x400 para nitidez)
- Pasos siguientes con números
- Botón CTA "Acceder a Networking"
- Footer "Generado por BuilderApp"

Mailable: `App\Mail\RegistrationConfirmation`
Template: `resources/views/emails/registration-confirmation.blade.php`
QR via: `api.qrserver.com`

#### 4. Acceso para ya registrados ("Ya te registraste?")

Sección en la página pública del evento (`/e/{slug}`), debajo del CTA de registro:
- Input de email + botón "Acceder"
- `POST /e/{slug}/lookup` busca participante por email
- Si existe (status: registered/confirmed/attended) → redirige a `/e/{slug}/networking/{code}`
- Si no existe → error "No encontramos un registro con este correo"
- Responsive: en mobile input y botón en columna

Ruta: `public.event.lookup`
Controller: `PublicEventController::lookup()`

#### 5. Validación de capacidad

- `Event::spotsLeft()` → `capacity - registeredCount` (null si sin capacidad)
- `Event::isFull()` → true si spotsLeft <= 0
- `Event::registeredCount()` → count donde status != cancelled
- Se valida tanto en registro público como en creación admin
- En página pública del evento: "X / Y registrados"

#### 6. Scanner móvil (`/events/{id}/scanner`)

Scanner QR para check-in con cámara del dispositivo:
- Full-screen, dark mode, mobile-first
- Tabs horizontales por tipo de escaneo (Check-in, Almuerzo, Kit, etc.)
- Cámara con `html5-qrcode` (facingMode: environment)
- Input manual de código como alternativa
- Panel de resultado: verde (éxito), amarillo (duplicado), rojo (error)
- Feedback: Web Audio beep + navigator.vibrate
- Auto-resume 2.5s después del resultado
- Stats en tiempo real por tipo de escaneo

**Tabla `participant_scans`**: id(ULID), participant_id, event_id, scan_type, scanned_by, scanned_at
- Unique constraint: (participant_id, event_id, scan_type)
- Check-in actualiza `participant.status='attended'` + `checked_in_at`

**Tipos de escaneo configurables** desde edición de evento:
- Default: Check-in (no eliminable)
- Agregar: Almuerzo, Kit, etc. (se guardan en `event.settings.scan_types`)

Rutas:
- `GET /events/{id}/scanner` → página del scanner
- `POST /events/{id}/scanner/scan` → registrar escaneo (JSON)
- `GET /events/{id}/scanner/stats` → estadísticas (JSON)

#### 7. Bugfix ReportController

- Corregido `checked_in` → `attended` en líneas 42 y 80 para que el check-in rate use el status correcto

---

### Configuración de email

| Variable | Local (dev) | Docker |
|----------|------------|--------|
| `MAIL_MAILER` | `log` | `smtp` |
| `MAIL_HOST` | — | `mailpit` |
| `MAIL_PORT` | — | `1025` |
| Mailpit UI | — | `http://localhost:8025` |

En local los emails se escriben en `storage/logs/laravel.log`.

### Rutas públicas agregadas

| Método | URI | Acción |
|--------|-----|--------|
| `POST` | `/e/{slug}/lookup` | Buscar registro por email → redirige a networking |
| `GET` | `/events/{id}/scanner` | Scanner QR (requiere auth) |
| `POST` | `/events/{id}/scanner/scan` | Registrar escaneo (JSON) |
| `GET` | `/events/{id}/scanner/stats` | Stats de escaneos (JSON) |
