# BuilderApp - Manual de Usuario

## Tabla de Contenido

1. [Introduccion](#introduccion)
2. [Acceso a la Plataforma](#acceso-a-la-plataforma)
3. [Panel de Administracion (Super Admin)](#panel-de-administracion-super-admin)
4. [Panel de Organizacion](#panel-de-organizacion)
5. [Gestion de Eventos](#gestion-de-eventos)
6. [Gestion de Participantes](#gestion-de-participantes)
7. [Speakers](#speakers)
8. [Sponsors](#sponsors)
9. [Comunidades](#comunidades)
10. [Agenda](#agenda)
11. [Scanner / Check-in](#scanner--check-in)
12. [Reportes](#reportes)
13. [Pagina Publica del Evento](#pagina-publica-del-evento)
14. [Registro de Participantes](#registro-de-participantes)
15. [Entrada Digital y Email de Confirmacion](#entrada-digital-y-email-de-confirmacion)
16. [Networking](#networking)
17. [Configuracion de la Organizacion](#configuracion-de-la-organizacion)

---

## Introduccion

BuilderApp es una plataforma SaaS para la gestion integral de eventos. Permite crear eventos, gestionar participantes, speakers, sponsors, agenda, networking entre asistentes, check-in con scanner QR y reportes en tiempo real.

### Roles del sistema

| Rol | Descripcion | Acceso |
|-----|-------------|--------|
| **Super Admin** | Administrador de la plataforma | Panel admin, organizaciones, usuarios |
| **Org Admin** | Administrador de organizacion | Eventos, participantes, reportes, config |
| **Collaborator** | Colaborador de organizacion | Lectura de eventos y participantes |
| **Participant** | Participante de evento | Registro publico, networking |

---

## Acceso a la Plataforma

### Iniciar sesion

1. Ir a `/login`
2. Ingresar **correo electronico** y **contrasena**
3. Hacer clic en **Iniciar sesion**

### Crear cuenta

1. Ir a `/register`
2. Completar los campos: nombre, apellido, email, contrasena
3. Hacer clic en **Registrarse**

---

## Panel de Administracion (Super Admin)

> Acceso: `/admin/dashboard`

El panel de administracion permite gestionar toda la plataforma.

### Dashboard

Muestra estadisticas globales:
- Total de organizaciones (activas/inactivas)
- Total de usuarios
- Total de eventos (publicados/borrador)
- Eventos activos

Tambien muestra tablas de **organizaciones recientes** y **eventos recientes**.

### Gestion de Organizaciones

> Menu: **Organizaciones**

| Accion | Descripcion |
|--------|-------------|
| Ver listado | Tabla con nombre, slug, estado, fecha de creacion |
| Buscar | Filtrar por nombre de organizacion |
| Crear | Formulario con nombre, slug, descripcion, sitio web, email, telefono, direccion |
| Editar | Modificar datos, subir logo |
| Activar/Desactivar | Cambiar estado de la organizacion |
| Eliminar | Borrar organizacion |

### Impersonar Organizacion

Permite al super admin actuar como si fuera el administrador de una organizacion:

1. En el listado de organizaciones, hacer clic en **Impersonar**
2. Se muestra un banner amarillo indicando la impersonacion activa
3. Navegar y gestionar como si fueras el org admin
4. Para salir, hacer clic en **Dejar de impersonar** en el banner

### Gestion de Usuarios

> Menu: **Usuarios**

| Accion | Descripcion |
|--------|-------------|
| Ver listado | Tabla con nombre, email, rol, organizacion, estado |
| Buscar | Filtrar por nombre o email |
| Filtrar | Por rol o por organizacion |
| Crear | Asignar nombre, email, contrasena, rol y organizacion |
| Editar | Modificar datos, cambiar rol, resetear contrasena |
| Activar/Desactivar | Cambiar estado del usuario |

---

## Panel de Organizacion

> Acceso: `/dashboard`

### Dashboard principal

Al iniciar sesion, el dashboard muestra:

**Metricas (8 tarjetas):**
- Eventos activos, en borrador, total
- Total de participantes
- Eventos completados
- Total de speakers y sponsors

**Graficas:**
- Eventos creados por mes (barras)
- Top eventos por participantes (barras)
- Distribucion de estados de eventos (pie)
- Distribucion de estados de participantes (pie)

**Tablas:**
- Proximos eventos
- Eventos recientes

### Navegacion principal

El menu lateral contiene:
- **Dashboard** — Metricas y graficas
- **Eventos** — Lista y gestion de eventos
- **Reportes** — Analiticas y estadisticas
- **Organizacion** — Configuracion

---

## Gestion de Eventos

> Menu: **Eventos** → `/events`

### Listado de eventos

- Tarjetas con nombre, estado, fecha, ubicacion, capacidad
- Busqueda por nombre
- Filtro por estado: borrador, publicado, activo, completado, cancelado

### Crear evento

1. Hacer clic en **Crear evento**
2. Completar el formulario:

| Campo | Requerido | Descripcion |
|-------|-----------|-------------|
| Nombre del evento | Si | Nombre visible publicamente |
| Slug | Si | URL amigable (auto-generado) |
| Descripcion | No | Texto descriptivo del evento |
| Fecha inicio | Si | Fecha y hora de inicio |
| Fecha fin | No | Fecha y hora de finalizacion |
| Ciudad | Si | Ciudad donde se realiza |
| Lugar (Venue) | Si | Nombre del recinto/salon |
| Ubicacion en mapa | No | Seleccionar en mapa interactivo |
| Capacidad | Si | Numero maximo de participantes |
| Tipo de registro | Si | Abierto o solo por invitacion |
| Imagen de portada | No | Imagen del evento |

3. Hacer clic en **Crear**

### Estados del evento

```
Borrador → Publicado → Activo → Completado
                                    ↓
                               Cancelado
```

- **Borrador**: solo visible con URL firmada (preview)
- **Publicado**: visible publicamente, registro abierto
- **Activo**: evento en curso
- **Completado**: evento finalizado
- **Cancelado**: evento cancelado

Para cambiar el estado, usar los botones de accion en la pagina del evento.

### Tabs del evento

Al entrar a un evento, se muestran pestanas para cada seccion:

| Tab | Contenido |
|-----|-----------|
| General | Detalles y estadisticas del evento |
| Participantes | Gestion de asistentes |
| Speakers | Ponentes del evento |
| Sponsors | Patrocinadores |
| Comunidades | Comunidades asociadas |
| Agenda | Programa del evento |
| Scanner | Check-in con QR |

---

## Gestion de Participantes

> Tab: **Participantes** → `/events/{id}/participants`

### Listado

- Tabla con nombre, email, telefono, empresa, cargo, tipo de ticket, estado, check-in
- Busqueda por nombre o email
- Filtros por estado y tipo de ticket

### Agregar participante

1. Hacer clic en **Agregar participante**
2. Completar:

| Campo | Requerido | Descripcion |
|-------|-----------|-------------|
| Nombre | Si | Nombre del participante |
| Apellido | Si | Apellido del participante |
| Email | Si | Correo electronico (unico por evento) |
| Telefono | No | Con selector de codigo de pais |
| Pais | Si | Select buscable |
| Ciudad | Si | Select buscable (depende del pais) |
| Empresa | No | Nombre de la empresa |
| Cargo | No | Cargo/posicion |
| Tipo de ticket | Si | General, VIP o Estudiante |
| Estado | Si | Registrado, Confirmado, Asistido, Cancelado |
| Notas | No | Notas internas |

3. Hacer clic en **Crear**

### Importar participantes (CSV)

1. Hacer clic en **Importar CSV**
2. Seleccionar archivo CSV con columnas: first_name, last_name, email, phone, company, job_title, country, city
3. El sistema valida y crea los participantes

### Exportar participantes (CSV)

1. Hacer clic en **Exportar CSV**
2. Se descarga un archivo con todos los participantes del evento

### Check-in manual

En el listado, hacer clic en el boton de **check-in** junto al participante para marcarlo como asistido.

---

## Speakers

> Tab: **Speakers** → `/events/{id}/speakers`

### Listado

Tarjetas con foto, nombre, cargo, empresa, estado de confirmacion y enlaces sociales.

### Crear speaker

| Campo | Requerido | Descripcion |
|-------|-----------|-------------|
| Nombre | Si | Nombre del ponente |
| Apellido | Si | Apellido del ponente |
| Cargo | No | Cargo/posicion |
| Empresa | No | Empresa actual |
| Bio | No | Biografia del speaker |
| Foto | No | Imagen de perfil |
| Twitter | No | URL de Twitter |
| LinkedIn | No | URL de LinkedIn |
| Website | No | URL de sitio web |
| Estado | Si | Invitado, Confirmado, Declinado |

### Reordenar

Usar los botones de flecha arriba/abajo para cambiar el orden de aparicion en la pagina publica.

---

## Sponsors

> Tab: **Sponsors** → `/events/{id}/sponsors`

### Niveles de patrocinio

Antes de agregar sponsors, crear niveles (ej: Diamante, Oro, Plata, Bronce):
1. Desde la pagina general del evento, seccion **Niveles de sponsor**
2. Crear nivel con nombre
3. Reordenar segun prioridad

### Crear sponsor

| Campo | Requerido | Descripcion |
|-------|-----------|-------------|
| Empresa | Si | Nombre de la empresa |
| Persona de contacto | No | Nombre del contacto |
| Email de contacto | No | Correo del contacto |
| Telefono | No | Telefono de contacto |
| Sitio web | No | URL de la empresa |
| Logo | No | Logotipo de la empresa |
| Nivel de patrocinio | Si | Nivel asignado |
| Notas | No | Notas internas |

---

## Comunidades

> Tab: **Comunidades** → `/events/{id}/communities`

Permite asociar comunidades tecnologicas u organizaciones al evento.

### Crear comunidad

| Campo | Requerido | Descripcion |
|-------|-----------|-------------|
| Nombre | Si | Nombre de la comunidad |
| Descripcion | No | Descripcion breve |
| Logo | No | Logotipo |
| URL | No | Sitio web o red social |

Las comunidades se muestran en la pagina publica del evento con su logo y enlace.

---

## Agenda

> Tab: **Agenda** → `/events/{id}/agenda`

### Vistas disponibles

- **Timeline**: Agenda agrupada por dia, ordenada cronologicamente
- **Por salas**: Agenda agrupada por ubicacion/sala
- **Calendario**: Vista de calendario interactiva

### Crear item de agenda

| Campo | Requerido | Descripcion |
|-------|-----------|-------------|
| Titulo | Si | Nombre de la sesion |
| Descripcion | No | Detalle de la sesion |
| Fecha | Si | Dia del evento |
| Hora inicio | Si | Hora de inicio |
| Hora fin | No | Hora de finalizacion |
| Sala/Ubicacion | No | Salon o espacio |
| Speaker | No | Ponente asignado (select) |
| Tipo | Si | Sesion, keynote, workshop, break, etc. |

---

## Scanner / Check-in

> Tab: **Scanner** → `/events/{id}/scanner`

El scanner permite hacer check-in de participantes usando la camara del dispositivo para leer codigos QR.

### Como usar

1. Ir a la pestana **Scanner** del evento
2. Seleccionar el **tipo de escaneo** (Check-in, Almuerzo, Kit, etc.)
3. Permitir acceso a la camara cuando el navegador lo solicite
4. Apuntar la camara al codigo QR del participante
5. El sistema muestra el resultado:
   - **Verde**: Escaneo exitoso + nombre del participante
   - **Amarillo**: Ya escaneado previamente
   - **Rojo**: Codigo no encontrado o participante cancelado
6. Se reproduce un sonido de confirmacion y vibracion (en movil)
7. La camara se reactiva automaticamente en 2.5 segundos

### Input manual

Si la camara no funciona o el QR esta danado:
1. Ingresar el **codigo de registro** manualmente en el campo de texto
2. Hacer clic en el boton de busqueda

### Tipos de escaneo configurables

Desde la edicion del evento, seccion **Configuracion de escaneos**:
1. **Check-in** viene por defecto (no eliminable)
2. Hacer clic en **Agregar tipo de escaneo**
3. Ingresar nombre (ej: "Almuerzo", "Kit de bienvenida")
4. Activar/desactivar con toggle
5. Guardar cambios

Cada tipo de escaneo es independiente: un participante puede tener check-in + almuerzo + kit, cada uno se escanea por separado.

### Estadisticas en tiempo real

En la parte superior del scanner se muestran:
- Total de participantes del evento
- Cantidad escaneada por cada tipo
- Porcentaje de avance

---

## Reportes

> Menu: **Reportes** → `/reports`

Dashboard de analiticas a nivel de organizacion:

### Metricas consolidadas

5 tarjetas con totales de:
- Eventos
- Participantes
- Check-ins realizados
- Speakers
- Sponsors

### Graficas

| Grafica | Tipo | Descripcion |
|---------|------|-------------|
| Participantes por evento (Top 10) | Barras | Cantidad de participantes por evento |
| Tasa de check-in | Barras | Porcentaje de asistencia real por evento |
| Registros ultimos 30 dias | Linea | Tendencia de registros en el tiempo |
| Distribucion de participantes | Pie | Desglose por estado (registrado, confirmado, asistido, cancelado) |

---

## Pagina Publica del Evento

> URL: `/e/{slug}`

La pagina publica es visible para cualquier persona (sin autenticacion).

### Contenido

- **Hero**: imagen de portada, nombre del evento, fecha, ubicacion, cuenta regresiva
- **Boton de registro**: "Registrarse ahora" (si el registro esta abierto)
- **Informacion del evento**: descripcion, fecha, lugar, mapa
- **Speakers**: tarjetas con foto, nombre, cargo, empresa, redes sociales
- **Agenda**: programa completo con vistas timeline/salas/calendario
- **Sponsors**: agrupados por nivel de patrocinio
- **Comunidades**: logos con enlaces
- **Capacidad**: "X / Y registrados" (si el evento tiene capacidad definida)

### Seccion "Ya te registraste?"

Al final de la pagina del evento aparece una seccion para participantes que ya se registraron:

1. Ingresar el **correo electronico** con el que se registraron
2. Hacer clic en **Acceder**
3. El sistema busca el registro y redirige a la pagina de **Networking**
4. Si el correo no se encuentra, muestra un mensaje de error

Esta seccion permite a los participantes volver a acceder a su entrada digital, QR y funciones de networking sin necesidad de guardar el enlace original.

---

## Registro de Participantes

> URL: `/e/{slug}/register`

### Flujo completo

```
1. Pagina del evento → Clic en "Registrarse ahora"
2. Formulario de registro → Completar datos → Enviar
3. Pagina de exito → Entrada digital con QR
4. Email de confirmacion → Llega automaticamente
5. Networking → Acceder desde la pagina de exito o "Ya te registraste?"
```

### Formulario

| Campo | Requerido | Descripcion |
|-------|-----------|-------------|
| Nombre | Si | Nombre del participante |
| Apellido | Si | Apellido del participante |
| Correo electronico | Si | Email (unico por evento) |
| Telefono | No | Con selector de codigo de pais y bandera |
| Pais | Si | Buscable, default Ecuador |
| Ciudad | Si | Buscable, depende del pais seleccionado |
| Empresa | No | Nombre de la empresa |
| Cargo | No | Cargo/posicion actual |

**Comportamiento del telefono:**
- Al seleccionar un pais, el codigo telefonico se actualiza automaticamente (ej: Ecuador → +593)
- El dropdown muestra bandera + codigo + nombre del pais
- Se puede buscar por nombre de pais dentro del dropdown

**Capacidad del evento:**
- Se muestra una barra de progreso con "X cupos disponibles de Y"
- Si el evento esta lleno, el formulario se deshabilita y muestra "Cupos agotados"

**Email duplicado:**
- Si el correo ya esta registrado en el evento, redirige automaticamente a la pagina de exito existente

---

## Entrada Digital y Email de Confirmacion

### Pagina de exito

> URL: `/e/{slug}/registered/{codigo}`

Al completar el registro, se muestra:

1. **Animacion de confetti** (4 segundos)
2. **Icono de exito** animado (check verde)
3. **Mensaje**: "Registro exitoso!" + nombre del evento
4. **Nota**: "Hemos enviado la confirmacion a tu@email.com"

**Tarjeta tipo boleto/entrada:**
- Header azul degradado con nombre del evento, fecha y ubicacion
- Linea de corte perforada (estilo boleto)
- Datos del participante: nombre, email
- Codigo de registro con boton **Copiar**
- **Codigo QR grande** para escaneo en el evento

**Descargar entrada digital:**
- Hacer clic en **"Descargar entrada digital"**
- Se genera una imagen PNG de alta resolucion (960x1640px)
- Diseno tipo boleto con:
  - Header degradado: "ENTRADA DIGITAL" + nombre del evento
  - Fecha y ubicacion en lineas separadas
  - Linea perforada con circulos laterales
  - Nombre completo y correo del participante
  - Codigo de registro en grande
  - QR grande para escaneo facil
  - Footer "Generado por BuilderApp"
- El archivo se descarga como `entrada-XXXXXXXX.png`

**Siguientes pasos** (se muestran en la pagina):
1. Revisa tu correo — confirmacion con QR enviada
2. Crea tu PIN de Networking — conecta con otros participantes
3. Presenta tu QR — muestralo en la entrada del evento

**Botones de accion:**
- **Ir a Networking** → accede al hub de networking
- **Ver pagina del evento** → vuelve a la pagina publica

### Email de confirmacion

Se envia automaticamente al registrarse. Tiene el **mismo formato de entrada digital**:

- Header azul degradado: "ENTRADA DIGITAL" + nombre del evento
- Fecha y ubicacion debajo del nombre
- Linea perforada con punch holes
- Saludo: "Hola {nombre}!"
- Datos: nombre completo y correo
- Codigo de registro grande (azul, monospace)
- **QR grande** (240x240px) para escaneo directo desde el email
- Pasos siguientes con numeros
- Boton **"Acceder a Networking"**
- Footer: "Generado por BuilderApp"

> **Nota:** En desarrollo local, los emails se guardan en `storage/logs/laravel.log` (MAIL_MAILER=log). En Docker/produccion, se envian via SMTP a Mailpit o al servicio configurado.

---

## Networking

> URL: `/e/{slug}/networking/{codigo}`

El sistema de networking permite a los participantes conectar entre si durante el evento para intercambiar sus datos de contacto de forma segura.

### Acceso

Hay 3 formas de acceder a tu perfil de networking privado:
1. Desde la **pagina de exito** del registro → boton "Ir a Networking"
2. Desde el **email de confirmacion** → boton "Acceder a Networking"
3. Desde la **pagina del evento** → seccion "Ya te registraste?" → ingresar email

### Intercambio de Contactos (Escaneo de Gafete)

1. Al verse en persona, un participante escanea el **Codigo QR** en el gafete de otro.
2. El sistema muestra el perfil **Publico** de la otra persona (Nombre, Cargo y Empresa). Los datos privados (Email, Teléfono y Redes Sociales) se mantienen ocultos por privacidad.
3. Para solicitar el acceso completo, haz clic en el boton **"Conectar"**. Esto enviara una solicitud de conexión a la otra persona.

### Solicitudes de Conexión y Mis Contactos

> URL: `/e/{slug}/networking/{codigo}/contacts`

Aqui se gestionan tus conexiones con otros participantes del evento:

- **Pestana: Mis Contactos**
  Lista de participantes con los que tienes una conexión establecida. Al hacer clic en ellos o ver su perfil, podras ver todos sus datos de contacto y enlaces a redes sociales. Tienes la opcion de **Eliminar** aquellos contactos que ya no desees tener.

- **Pestana: Solicitudes Pendientes**
  Muestra las solicitudes que otras personas te han enviado (cuando han escaneado tu gafete y presionaron "Conectar"). Puedes:
  - **Aceptar**: La conexión se vuelve mutua (bidireccional). Ambos podran ver mutuamente su informacion completa en "Mis Contactos".
  - **Ignorar**: Deniega la solicitud de conexión y no comparte tu informacion con esa persona.

### Directorio Publico

> URL: `/e/{slug}/networking/{codigo}/directory`

- Lista de todos los participantes del evento que tienen su perfil configurado como visible.
- Busqueda por nombre o empresa.
- Desde aqui tambien puedes ver sus perfiles y presionar **"Conectar"** para empezar a conocer profesionales de tu interes sin necesidad de escanear su gafete directamente.

### Editar tu Perfil

> URL: `/e/{slug}/networking/{codigo}/profile`

- Modificar informacion de tu perfil de networking.
- Configurar tus **redes sociales** (LinkedIn, GitHub, Instagram, Sitio Web, WhatsApp).
- Activar o desactivar la  **visibilidad** (Networking Visible) de tu perfil en el directorio publico del evento.

---

## Configuracion de la Organizacion

> Menu: **Organizacion** → `/organization`

Permite al org admin configurar los datos de la organizacion:

| Campo | Descripcion |
|-------|-------------|
| Nombre | Nombre de la organizacion |
| Slug | Identificador URL |
| Descripcion | Descripcion de la organizacion |
| Sitio web | URL del sitio web |
| Email | Correo de contacto |
| Telefono | Telefono de contacto |
| Direccion | Direccion fisica |
| Logo | Logotipo (upload de imagen) |

---

## Atajos y Tips

| Tip | Descripcion |
|-----|-------------|
| Preview de evento | Desde el panel, usar "Vista previa" para ver la pagina publica antes de publicar |
| Bulk import | Importar participantes masivamente con CSV |
| Scanner movil | Abrir el scanner desde el celular para check-in mas rapido |
| Tipos de escaneo | Configurar escaneos adicionales (almuerzo, kit) desde edicion del evento |
| Lookup por email | Los participantes pueden recuperar su acceso desde "Ya te registraste?" |
| Entrada digital | Los participantes pueden descargar su entrada como imagen desde la pagina de exito |
