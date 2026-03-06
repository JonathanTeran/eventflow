<?php

namespace Database\Seeders;

use App\Models\AgendaItem;
use App\Models\Community;
use App\Models\Event;
use App\Models\Organization;
use App\Models\Participant;
use App\Models\ParticipantConnection;
use App\Models\Speaker;
use App\Models\Sponsor;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class DemoSeeder extends Seeder
{
    private function seedImage(string $directory, int $width, int $height, int $seed): ?string
    {
        try {
            $content = @file_get_contents("https://picsum.photos/seed/bf{$seed}/{$width}/{$height}");
            if ($content === false) {
                return null;
            }
            $filename = Str::random(40) . '.jpg';
            $path = "{$directory}/{$filename}";
            Storage::disk('public')->put($path, $content);
            return $path;
        } catch (\Exception $e) {
            return null;
        }
    }

    public function run(): void
    {
        // Create super admin (no organization)
        $superAdmin = User::create([
            'organization_id' => null,
            'first_name' => 'Super',
            'last_name' => 'Admin',
            'email' => 'superadmin@builderapp.app',
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
        ]);
        $superAdmin->assignRole('super_admin');

        // Create demo organization
        $organization = Organization::create([
            'name' => 'AmePhia Systems',
            'slug' => 'amephia-systems',
            'email' => 'info@amephia.com',
            'website' => 'https://amephia.com',
            'primary_color' => '#6366f1',
            'secondary_color' => '#4f46e5',
            'is_active' => true,
        ]);
        if ($logo = $this->seedImage("organizations/{$organization->id}", 400, 400, 1)) {
            $organization->update(['logo_path' => $logo]);
        }

        // Create admin user
        $admin = User::create([
            'organization_id' => $organization->id,
            'first_name' => 'Jonathan',
            'last_name' => 'Terán',
            'email' => 'admin@builderapp.app',
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
        ]);
        $admin->assignRole('org_admin');

        // Create collaborator user
        $collaborator = User::create([
            'organization_id' => $organization->id,
            'first_name' => 'María',
            'last_name' => 'García',
            'email' => 'maria@builderapp.app',
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
        ]);
        $collaborator->assignRole('collaborator');

        // Create demo events
        $devFest = Event::create([
            'organization_id' => $organization->id,
            'name' => 'DevFest Ecuador 2026',
            'slug' => 'devfest-ecuador-2026',
            'description' => 'El evento de tecnología más grande de Ecuador. Charlas, workshops y networking para desarrolladores, diseñadores y emprendedores tech.',
            'date_start' => '2026-06-15 08:00:00',
            'date_end' => '2026-06-16 18:00:00',
            'location' => 'Quito, Ecuador',
            'venue' => 'Centro de Convenciones Eugenio Espejo',
            'capacity' => 500,
            'registration_type' => 'open',
            'status' => 'published',
        ]);
        if ($cover = $this->seedImage("events/{$devFest->id}", 1200, 630, 10)) {
            $devFest->update(['cover_image_path' => $cover]);
        }

        // Default sponsor levels for DevFest
        $devFest->sponsorLevels()->createMany([
            ['name' => 'Oro', 'sort_order' => 1, 'price' => 5000.00, 'benefits' => ['Logo en pantalla principal', 'Stand premium', '10 entradas VIP', 'Charla patrocinada']],
            ['name' => 'Plata', 'sort_order' => 2, 'price' => 3000.00, 'benefits' => ['Logo en pantalla', 'Stand estándar', '5 entradas VIP']],
            ['name' => 'Bronce', 'sort_order' => 3, 'price' => 1000.00, 'benefits' => ['Logo en sitio web', '2 entradas VIP']],
        ]);

        // DevFest Participants
        $ana = $devFest->participants()->create([
            'first_name' => 'Ana', 'last_name' => 'Morales', 'email' => 'ana.morales@example.com',
            'company' => 'TechEC', 'job_title' => 'Frontend Developer', 'ticket_type' => 'general',
            'status' => 'confirmed', 'networking_pin' => 'ANA001', 'networking_visible' => true,
            'social_links' => ['linkedin' => 'https://linkedin.com/in/anamorales', 'github' => 'https://github.com/anamorales', 'instagram' => 'https://instagram.com/anamorales.dev'],
        ]);

        $luis = $devFest->participants()->create([
            'first_name' => 'Luis', 'last_name' => 'Herrera', 'email' => 'luis.herrera@example.com',
            'company' => 'DataLab', 'job_title' => 'Data Engineer', 'ticket_type' => 'vip',
            'status' => 'confirmed', 'networking_pin' => 'LUI002', 'networking_visible' => true,
            'social_links' => ['linkedin' => 'https://linkedin.com/in/luisherrera', 'website' => 'https://luisherrera.dev', 'whatsapp' => '+593991234567'],
        ]);

        $devFest->participants()->create([
            'first_name' => 'Sofía', 'last_name' => 'Paredes', 'email' => 'sofia.paredes@example.com',
            'company' => 'StartupXYZ', 'job_title' => 'CTO', 'ticket_type' => 'vip', 'status' => 'registered',
        ]);

        $diego = $devFest->participants()->create([
            'first_name' => 'Diego', 'last_name' => 'Ramírez', 'email' => 'diego.ramirez@example.com',
            'company' => 'Freelance', 'job_title' => 'Mobile Developer', 'ticket_type' => 'general',
            'status' => 'confirmed', 'networking_pin' => 'DIE003', 'networking_visible' => true,
            'social_links' => ['github' => 'https://github.com/diegoramirez', 'website' => 'https://diegodev.com'],
        ]);

        $devFest->participants()->create([
            'first_name' => 'Camila', 'last_name' => 'Torres', 'email' => 'camila.torres@example.com',
            'company' => 'Universidad Central', 'job_title' => 'Estudiante', 'ticket_type' => 'student', 'status' => 'registered',
        ]);

        $andres = $devFest->participants()->create([
            'first_name' => 'Andrés', 'last_name' => 'Villavicencio', 'email' => 'andres.v@example.com',
            'company' => 'CloudNet', 'job_title' => 'DevOps Engineer', 'ticket_type' => 'general',
            'status' => 'attended', 'checked_in_at' => now(), 'networking_pin' => 'AND004', 'networking_visible' => true,
            'social_links' => ['linkedin' => 'https://linkedin.com/in/andresv', 'github' => 'https://github.com/andresv'],
        ]);

        $devFest->participants()->create([
            'first_name' => 'Valentina', 'last_name' => 'Cruz', 'email' => 'valentina.cruz@example.com',
            'company' => 'EPN', 'job_title' => 'Estudiante', 'ticket_type' => 'student', 'status' => 'cancelled',
        ]);

        $mateo = $devFest->participants()->create([
            'first_name' => 'Mateo', 'last_name' => 'Salazar', 'email' => 'mateo.salazar@example.com',
            'company' => 'BancoDigital', 'job_title' => 'Backend Developer', 'ticket_type' => 'general',
            'status' => 'confirmed', 'networking_pin' => 'MAT005', 'networking_visible' => true,
            'social_links' => ['linkedin' => 'https://linkedin.com/in/mateosalazar', 'whatsapp' => '+593987654321'],
        ]);

        $isabella = $devFest->participants()->create([
            'first_name' => 'Isabella', 'last_name' => 'Mendoza', 'email' => 'isabella.m@example.com',
            'company' => 'DesignHub', 'job_title' => 'UX Designer', 'ticket_type' => 'vip',
            'status' => 'confirmed', 'networking_pin' => 'ISA006', 'networking_visible' => true,
            'social_links' => ['linkedin' => 'https://linkedin.com/in/isabellamendoza', 'instagram' => 'https://instagram.com/isabella.ux', 'website' => 'https://isabellamendoza.com'],
        ]);

        $devFest->participants()->create([
            'first_name' => 'Sebastián', 'last_name' => 'Aguirre', 'email' => 'sebastian.a@example.com',
            'company' => 'AILabs', 'job_title' => 'ML Engineer', 'ticket_type' => 'general', 'status' => 'registered',
        ]);

        // Demo connections
        ParticipantConnection::create(['participant_id' => $ana->id, 'connected_participant_id' => $luis->id]);
        ParticipantConnection::create(['participant_id' => $ana->id, 'connected_participant_id' => $diego->id]);
        ParticipantConnection::create(['participant_id' => $luis->id, 'connected_participant_id' => $ana->id]);

        // DevFest Speakers
        $speaker1 = $devFest->speakers()->create([
            'first_name' => 'Daniela', 'last_name' => 'Vega',
            'email' => 'daniela.vega@example.com', 'company' => 'Google',
            'job_title' => 'Developer Advocate',
            'bio' => 'Experta en Flutter y desarrollo mobile. GDE en Flutter con más de 8 años de experiencia construyendo apps multiplataforma.',
            'social_links' => ['twitter' => 'https://twitter.com/danielavega', 'linkedin' => 'https://linkedin.com/in/danielavega'],
            'status' => 'confirmed', 'sort_order' => 1,
        ]);
        if ($photo = $this->seedImage("events/{$devFest->id}/speakers", 400, 400, 20)) {
            $speaker1->update(['photo_path' => $photo]);
        }

        $speaker2 = $devFest->speakers()->create([
            'first_name' => 'Roberto', 'last_name' => 'Chen',
            'email' => 'roberto.chen@example.com', 'company' => 'AWS',
            'job_title' => 'Solutions Architect',
            'bio' => 'Arquitecto de soluciones cloud con experiencia en sistemas distribuidos y microservicios.',
            'social_links' => ['linkedin' => 'https://linkedin.com/in/robertochen', 'website' => 'https://robertochen.dev'],
            'status' => 'confirmed', 'sort_order' => 2,
        ]);
        if ($photo = $this->seedImage("events/{$devFest->id}/speakers", 400, 400, 21)) {
            $speaker2->update(['photo_path' => $photo]);
        }

        $speaker3 = $devFest->speakers()->create([
            'first_name' => 'Lucía', 'last_name' => 'Fernández',
            'email' => 'lucia.f@example.com', 'company' => 'OpenAI',
            'job_title' => 'Research Engineer',
            'bio' => 'Investigadora en IA generativa y procesamiento de lenguaje natural. PhD en Computer Science por MIT.',
            'social_links' => ['twitter' => 'https://twitter.com/luciafernandez'],
            'status' => 'confirmed', 'sort_order' => 3,
        ]);
        if ($photo = $this->seedImage("events/{$devFest->id}/speakers", 400, 400, 22)) {
            $speaker3->update(['photo_path' => $photo]);
        }

        $speaker4 = $devFest->speakers()->create([
            'first_name' => 'Pablo', 'last_name' => 'Martínez',
            'email' => 'pablo.m@example.com', 'company' => 'Vercel',
            'job_title' => 'Senior Engineer',
            'bio' => 'Core contributor de Next.js y especialista en performance web.',
            'social_links' => ['twitter' => 'https://twitter.com/pablomartinez', 'website' => 'https://pablom.dev'],
            'status' => 'invited', 'sort_order' => 4,
        ]);
        if ($photo = $this->seedImage("events/{$devFest->id}/speakers", 400, 400, 23)) {
            $speaker4->update(['photo_path' => $photo]);
        }

        // DevFest Sponsors
        $oroLevel = $devFest->sponsorLevels()->where('name', 'Oro')->first();
        $plataLevel = $devFest->sponsorLevels()->where('name', 'Plata')->first();
        $bronceLevel = $devFest->sponsorLevels()->where('name', 'Bronce')->first();

        $devFest->sponsors()->createMany([
            ['sponsor_level_id' => $oroLevel->id, 'company_name' => 'Google Ecuador', 'contact_name' => 'Pedro Alvarado', 'contact_email' => 'pedro@google.com', 'website' => 'https://google.com', 'amount_paid' => 5000, 'status' => 'paid', 'sort_order' => 1],
            ['sponsor_level_id' => $plataLevel->id, 'company_name' => 'Banco Pichincha', 'contact_name' => 'Laura Sánchez', 'contact_email' => 'laura@pichincha.com', 'website' => 'https://pichincha.com', 'amount_paid' => 3000, 'status' => 'paid', 'sort_order' => 2],
            ['sponsor_level_id' => $plataLevel->id, 'company_name' => 'MegaProfer', 'contact_name' => 'Carlos Ruiz', 'contact_email' => 'carlos@megaprofer.com', 'website' => 'https://megaprofer.com', 'amount_paid' => 3000, 'status' => 'confirmed', 'sort_order' => 3],
            ['sponsor_level_id' => $bronceLevel->id, 'company_name' => 'Kruger Corp', 'contact_name' => 'Ana Peña', 'contact_email' => 'ana@kruger.com', 'website' => 'https://kruger.com.ec', 'amount_paid' => 1000, 'status' => 'paid', 'sort_order' => 4],
        ]);

        // DevFest Agenda (2 days)
        $devFest->agendaItems()->createMany([
            // Day 1
            ['speaker_id' => null, 'title' => 'Registro y bienvenida', 'date' => '2026-06-15', 'start_time' => '08:00', 'end_time' => '09:00', 'type' => 'ceremony', 'sort_order' => 1],
            ['speaker_id' => $speaker1->id, 'title' => 'Flutter en 2026: Estado del arte', 'description' => 'Un recorrido por las últimas novedades del ecosistema Flutter y cómo aprovecharlas en producción.', 'date' => '2026-06-15', 'start_time' => '09:00', 'end_time' => '10:00', 'location_detail' => 'Sala Principal', 'type' => 'talk', 'sort_order' => 2],
            ['speaker_id' => null, 'title' => 'Coffee break', 'date' => '2026-06-15', 'start_time' => '10:00', 'end_time' => '10:30', 'type' => 'break', 'sort_order' => 3],
            ['speaker_id' => $speaker2->id, 'title' => 'Arquitectura serverless en AWS', 'description' => 'Patrones de diseño y mejores prácticas para construir aplicaciones serverless escalables.', 'date' => '2026-06-15', 'start_time' => '10:30', 'end_time' => '11:30', 'location_detail' => 'Sala Principal', 'type' => 'talk', 'sort_order' => 4],
            ['speaker_id' => null, 'title' => 'Intro a Kubernetes', 'description' => 'Conceptos fundamentales de orquestación de contenedores con Kubernetes.', 'date' => '2026-06-15', 'start_time' => '10:30', 'end_time' => '11:30', 'location_detail' => 'Sala B', 'type' => 'talk', 'sort_order' => 5],
            ['speaker_id' => $speaker3->id, 'title' => 'Workshop: Construye tu primer agente IA', 'description' => 'Taller práctico donde construiremos un agente conversacional usando LLMs.', 'date' => '2026-06-15', 'start_time' => '11:30', 'end_time' => '13:00', 'location_detail' => 'Sala B', 'type' => 'workshop', 'sort_order' => 6],
            ['speaker_id' => null, 'title' => 'Networking & almuerzo', 'date' => '2026-06-15', 'start_time' => '13:00', 'end_time' => '14:30', 'type' => 'networking', 'sort_order' => 7],
            // Day 2
            ['speaker_id' => $speaker3->id, 'title' => 'IA Generativa: Del hype a la producción', 'description' => 'Cómo las empresas están implementando IA generativa de forma responsable en sus productos.', 'date' => '2026-06-16', 'start_time' => '09:00', 'end_time' => '10:00', 'location_detail' => 'Sala Principal', 'type' => 'talk', 'sort_order' => 8],
            ['speaker_id' => $speaker4->id, 'title' => 'Performance web: Core Web Vitals en 2026', 'date' => '2026-06-16', 'start_time' => '10:00', 'end_time' => '11:00', 'location_detail' => 'Sala Principal', 'type' => 'talk', 'sort_order' => 9],
            ['speaker_id' => null, 'title' => 'Ceremonia de cierre y premios', 'date' => '2026-06-16', 'start_time' => '16:00', 'end_time' => '17:00', 'location_detail' => 'Sala Principal', 'type' => 'ceremony', 'sort_order' => 10],
        ]);

        // DevFest Communities
        $devFest->communities()->createMany([
            ['name' => 'Python Ecuador', 'url' => 'https://python.ec', 'description' => 'Comunidad de desarrolladores Python en Ecuador.', 'sort_order' => 1],
            ['name' => 'JavaScript EC', 'url' => 'https://javascript.ec', 'description' => 'Comunidad de JavaScript y tecnologías web en Ecuador.', 'sort_order' => 2],
            ['name' => 'AWS User Group Ecuador', 'url' => 'https://awsug.ec', 'description' => 'Grupo de usuarios de Amazon Web Services en Ecuador.', 'sort_order' => 3],
            ['name' => 'GDG Quito', 'url' => 'https://gdg.community.dev/gdg-quito', 'description' => 'Google Developer Group de Quito, Ecuador.', 'sort_order' => 4],
        ]);

        $meetup = Event::create([
            'organization_id' => $organization->id,
            'name' => 'Laravel Meetup Guayaquil',
            'slug' => 'laravel-meetup-gye-abril-2026',
            'description' => 'Meetup mensual de la comunidad Laravel en Guayaquil. Presentaciones técnicas y networking.',
            'date_start' => '2026-04-20 18:00:00',
            'date_end' => '2026-04-20 21:00:00',
            'location' => 'Guayaquil, Ecuador',
            'venue' => 'WeWork Guayaquil',
            'capacity' => 80,
            'registration_type' => 'open',
            'status' => 'published',
        ]);

        if ($cover = $this->seedImage("events/{$meetup->id}", 1200, 630, 11)) {
            $meetup->update(['cover_image_path' => $cover]);
        }

        $meetup->sponsorLevels()->createMany([
            ['name' => 'Oro', 'sort_order' => 1],
            ['name' => 'Plata', 'sort_order' => 2],
            ['name' => 'Bronce', 'sort_order' => 3],
        ]);

        // Meetup speakers
        $meetupSpeaker1 = $meetup->speakers()->create([
            'first_name' => 'Andrés', 'last_name' => 'Guamán',
            'email' => 'andres.guaman@example.com', 'company' => 'Banco Guayaquil',
            'job_title' => 'Tech Lead',
            'bio' => 'Especialista en Laravel y arquitectura de microservicios. Lidera el equipo de desarrollo digital.',
            'social_links' => ['linkedin' => 'https://linkedin.com/in/andresguaman'],
            'status' => 'confirmed', 'sort_order' => 1,
        ]);
        if ($photo = $this->seedImage("events/{$meetup->id}/speakers", 400, 400, 30)) {
            $meetupSpeaker1->update(['photo_path' => $photo]);
        }

        $meetupSpeaker2 = $meetup->speakers()->create([
            'first_name' => 'Carla', 'last_name' => 'Espinoza',
            'email' => 'carla.e@example.com', 'company' => 'Laravel Ecuador',
            'job_title' => 'Community Lead',
            'bio' => 'Organizadora de la comunidad Laravel Ecuador y desarrolladora full-stack con 5 años de experiencia.',
            'social_links' => ['twitter' => 'https://twitter.com/carlaespinoza'],
            'status' => 'confirmed', 'sort_order' => 2,
        ]);
        if ($photo = $this->seedImage("events/{$meetup->id}/speakers", 400, 400, 31)) {
            $meetupSpeaker2->update(['photo_path' => $photo]);
        }

        // Meetup agenda
        $meetup->agendaItems()->createMany([
            ['speaker_id' => null, 'title' => 'Registro y networking', 'date' => '2026-04-20', 'start_time' => '18:00', 'end_time' => '18:30', 'type' => 'networking', 'sort_order' => 1],
            ['speaker_id' => $meetupSpeaker1->id, 'title' => 'Laravel 12: Novedades y migración', 'description' => 'Las nuevas features de Laravel 12 y cómo migrar desde versiones anteriores.', 'date' => '2026-04-20', 'start_time' => '18:30', 'end_time' => '19:15', 'location_detail' => 'Sala Principal', 'type' => 'talk', 'sort_order' => 2],
            ['speaker_id' => null, 'title' => 'Coffee break', 'date' => '2026-04-20', 'start_time' => '19:15', 'end_time' => '19:30', 'type' => 'break', 'sort_order' => 3],
            ['speaker_id' => $meetupSpeaker2->id, 'title' => 'Testing en Laravel: De cero a héroe', 'description' => 'Estrategias y herramientas para testing efectivo en aplicaciones Laravel.', 'date' => '2026-04-20', 'start_time' => '19:30', 'end_time' => '20:15', 'location_detail' => 'Sala Principal', 'type' => 'talk', 'sort_order' => 4],
            ['speaker_id' => null, 'title' => 'Cierre y networking', 'date' => '2026-04-20', 'start_time' => '20:15', 'end_time' => '21:00', 'type' => 'networking', 'sort_order' => 5],
        ]);

        $hackathon = Event::create([
            'organization_id' => $organization->id,
            'name' => 'Hackathon IA 2026',
            'slug' => 'hackathon-ia-2026',
            'description' => 'Hackathon de 48 horas enfocado en soluciones con Inteligencia Artificial para problemas sociales en Latinoamérica.',
            'date_start' => '2026-08-01 09:00:00',
            'date_end' => '2026-08-03 17:00:00',
            'location' => 'Quito, Ecuador',
            'venue' => 'YACHAY Tech',
            'capacity' => 200,
            'registration_type' => 'invite',
            'status' => 'published',
        ]);
        if ($cover = $this->seedImage("events/{$hackathon->id}", 1200, 630, 12)) {
            $hackathon->update(['cover_image_path' => $cover]);
        }

        $hackathon->sponsorLevels()->createMany([
            ['name' => 'Diamante', 'sort_order' => 1, 'price' => 10000.00, 'benefits' => ['Naming rights', 'Keynote sponsor', 'Acceso a todos los equipos']],
            ['name' => 'Oro', 'sort_order' => 2, 'price' => 5000.00, 'benefits' => ['Logo en camisetas', 'Mesa de jueces', '5 mentores']],
            ['name' => 'Plata', 'sort_order' => 3, 'price' => 2500.00, 'benefits' => ['Logo en sitio web', '2 mentores']],
        ]);

        // Create second demo organization
        $org2 = Organization::create([
            'name' => 'TechConf LATAM',
            'slug' => 'techconf-latam',
            'email' => 'info@techconf.lat',
            'website' => 'https://techconf.lat',
            'primary_color' => '#059669',
            'secondary_color' => '#047857',
            'is_active' => true,
        ]);
        if ($logo = $this->seedImage("organizations/{$org2->id}", 400, 400, 2)) {
            $org2->update(['logo_path' => $logo]);
        }

        $adminOrg2 = User::create([
            'organization_id' => $org2->id,
            'first_name' => 'Carlos',
            'last_name' => 'López',
            'email' => 'carlos@techconf.lat',
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
        ]);
        $adminOrg2->assignRole('org_admin');

        $techConf = Event::create([
            'organization_id' => $org2->id,
            'name' => 'TechConf 2026',
            'slug' => 'techconf-2026',
            'description' => 'La conferencia de tecnología más importante de Latinoamérica.',
            'date_start' => '2026-09-10 09:00:00',
            'date_end' => '2026-09-12 18:00:00',
            'location' => 'Ciudad de México, México',
            'venue' => 'Centro Citibanamex',
            'capacity' => 1000,
            'registration_type' => 'open',
            'status' => 'published',
        ]);
        if ($cover = $this->seedImage("events/{$techConf->id}", 1200, 630, 13)) {
            $techConf->update(['cover_image_path' => $cover]);
        }

        // TechConf speakers
        $tcSpeaker1 = $techConf->speakers()->create([
            'first_name' => 'Miguel', 'last_name' => 'Ángel Durán',
            'email' => 'midudev@example.com', 'company' => 'Independiente',
            'job_title' => 'Creador de contenido & Developer',
            'bio' => 'Creador de contenido tech con más de 1M de seguidores. Especialista en JavaScript, React y desarrollo web moderno.',
            'social_links' => ['twitter' => 'https://twitter.com/midudev', 'website' => 'https://midu.dev'],
            'status' => 'confirmed', 'sort_order' => 1,
        ]);
        if ($photo = $this->seedImage("events/{$techConf->id}/speakers", 400, 400, 40)) {
            $tcSpeaker1->update(['photo_path' => $photo]);
        }

        $tcSpeaker2 = $techConf->speakers()->create([
            'first_name' => 'Natalia', 'last_name' => 'Venditto',
            'email' => 'natalia.v@example.com', 'company' => 'Microsoft',
            'job_title' => 'Principal JavaScript Engineer',
            'bio' => 'Principal engineer en Microsoft Azure. Experta en Node.js, TypeScript y arquitectura de aplicaciones cloud.',
            'social_links' => ['linkedin' => 'https://linkedin.com/in/nataliavenditto'],
            'status' => 'confirmed', 'sort_order' => 2,
        ]);
        if ($photo = $this->seedImage("events/{$techConf->id}/speakers", 400, 400, 41)) {
            $tcSpeaker2->update(['photo_path' => $photo]);
        }

        $tcSpeaker3 = $techConf->speakers()->create([
            'first_name' => 'Fernando', 'last_name' => 'Herrera',
            'email' => 'fernando.h@example.com', 'company' => 'DevTalles',
            'job_title' => 'Senior Instructor',
            'bio' => 'Instructor de programación con cursos de Flutter, React y Node.js. Más de 500K estudiantes en plataformas educativas.',
            'social_links' => ['website' => 'https://devtalles.com'],
            'status' => 'confirmed', 'sort_order' => 3,
        ]);
        if ($photo = $this->seedImage("events/{$techConf->id}/speakers", 400, 400, 42)) {
            $tcSpeaker3->update(['photo_path' => $photo]);
        }

        // TechConf agenda (3 days)
        $techConf->agendaItems()->createMany([
            ['speaker_id' => null, 'title' => 'Apertura TechConf 2026', 'date' => '2026-09-10', 'start_time' => '09:00', 'end_time' => '09:30', 'location_detail' => 'Auditorio Principal', 'type' => 'ceremony', 'sort_order' => 1],
            ['speaker_id' => $tcSpeaker1->id, 'title' => 'El futuro del desarrollo web', 'description' => 'Tendencias y herramientas que dominarán el desarrollo web en los próximos años.', 'date' => '2026-09-10', 'start_time' => '09:30', 'end_time' => '10:30', 'location_detail' => 'Auditorio Principal', 'type' => 'talk', 'sort_order' => 2],
            ['speaker_id' => $tcSpeaker2->id, 'title' => 'Node.js a escala: Lecciones de Azure', 'description' => 'Cómo escalar aplicaciones Node.js para millones de usuarios.', 'date' => '2026-09-10', 'start_time' => '11:00', 'end_time' => '12:00', 'location_detail' => 'Auditorio Principal', 'type' => 'talk', 'sort_order' => 3],
            ['speaker_id' => null, 'title' => 'Almuerzo', 'date' => '2026-09-10', 'start_time' => '12:00', 'end_time' => '14:00', 'type' => 'break', 'sort_order' => 4],
            ['speaker_id' => $tcSpeaker3->id, 'title' => 'Workshop: Flutter avanzado', 'description' => 'Taller práctico de arquitectura limpia y gestión de estado en Flutter.', 'date' => '2026-09-11', 'start_time' => '09:00', 'end_time' => '12:00', 'location_detail' => 'Sala de Workshops', 'type' => 'workshop', 'sort_order' => 5],
            ['speaker_id' => null, 'title' => 'Networking & cierre', 'date' => '2026-09-12', 'start_time' => '16:00', 'end_time' => '18:00', 'type' => 'networking', 'sort_order' => 6],
        ]);

        // TechConf communities
        $techConf->communities()->createMany([
            ['name' => 'Vue.js México', 'url' => 'https://vuejs.mx', 'description' => 'Comunidad de Vue.js en México.', 'sort_order' => 1],
            ['name' => 'React LATAM', 'url' => 'https://reactlatam.dev', 'description' => 'Comunidad de React en Latinoamérica.', 'sort_order' => 2],
        ]);

        $cloudSummit = Event::create([
            'organization_id' => $org2->id,
            'name' => 'Cloud Summit LATAM 2026',
            'slug' => 'cloud-summit-latam-2026',
            'description' => 'Cumbre de computación en la nube con expertos de AWS, Azure y Google Cloud. Talleres prácticos y certificaciones.',
            'date_start' => '2026-07-20 09:00:00',
            'date_end' => '2026-07-21 18:00:00',
            'location' => 'Bogotá, Colombia',
            'venue' => 'Centro de Convenciones Ágora',
            'capacity' => 600,
            'registration_type' => 'open',
            'status' => 'published',
        ]);
        if ($cover = $this->seedImage("events/{$cloudSummit->id}", 1200, 630, 14)) {
            $cloudSummit->update(['cover_image_path' => $cover]);
        }

        $startupWeekend = Event::create([
            'organization_id' => $org2->id,
            'name' => 'Startup Weekend Medellín',
            'slug' => 'startup-weekend-medellin-2026',
            'description' => 'Un fin de semana intensivo para lanzar tu startup. Mentores, inversores y mucho networking.',
            'date_start' => '2026-05-15 18:00:00',
            'date_end' => '2026-05-17 20:00:00',
            'location' => 'Medellín, Colombia',
            'venue' => 'Ruta N',
            'capacity' => 150,
            'registration_type' => 'open',
            'status' => 'published',
        ]);
        if ($cover = $this->seedImage("events/{$startupWeekend->id}", 1200, 630, 15)) {
            $startupWeekend->update(['cover_image_path' => $cover]);
        }
    }
}
