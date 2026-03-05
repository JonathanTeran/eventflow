<?php

use App\Http\Controllers\Admin\AdminDashboardController;
use App\Http\Controllers\Admin\AdminOrganizationController;
use App\Http\Controllers\Admin\AdminUserController;
use App\Http\Controllers\Admin\ImpersonationController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\AgendaItemController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\OrganizationController;
use App\Http\Controllers\ParticipantController;
use App\Http\Controllers\SpeakerController;
use App\Http\Controllers\SponsorController;
use App\Http\Controllers\SponsorLevelController;
use App\Http\Controllers\CommunityController;
use App\Http\Controllers\NetworkingController;
use App\Http\Controllers\CalendarController;
use App\Http\Controllers\PublicEventController;
use App\Http\Controllers\PublicHomeController;
use App\Http\Controllers\PublicSurveyController;
use App\Http\Controllers\ScannerController;
use App\Http\Controllers\SurveyController;
use Illuminate\Support\Facades\Route;

// Public home (landing page)
Route::get('/', [PublicHomeController::class, 'index'])->name('home');

// Public event pages (no auth required)
Route::get('/e/{slug}', [PublicEventController::class, 'show'])->name('public.event');
Route::get('/e/{slug}/register', [PublicEventController::class, 'showRegistrationForm'])->name('public.event.register');
Route::post('/e/{slug}/register', [PublicEventController::class, 'register'])->name('public.event.register.store');
Route::get('/e/{slug}/registered/{registration_code}', [PublicEventController::class, 'registrationSuccess'])->name('public.event.registered');
Route::get('/e/{slug}/waitlist/{registration_code}', [PublicEventController::class, 'waitlistSuccess'])->name('public.event.waitlisted');
Route::post('/e/{slug}/lookup', [PublicEventController::class, 'lookup'])->name('public.event.lookup');

// Calendar exports (iCal)
Route::get('/e/{slug}/event.ics', [CalendarController::class, 'downloadEvent'])->name('public.event.ical');
Route::get('/e/{slug}/agenda.ics', [CalendarController::class, 'downloadAgenda'])->name('public.event.agenda.ical');

// Public surveys
Route::get('/e/{slug}/survey/{survey}', [PublicSurveyController::class, 'show'])->name('public.survey.show');
Route::post('/e/{slug}/survey/{survey}', [PublicSurveyController::class, 'submit'])->name('public.survey.submit');
Route::get('/e/{slug}/survey/{survey}/thanks', [PublicSurveyController::class, 'thanks'])->name('public.survey.thanks');

// Public networking (no auth required)
Route::get('/e/{slug}/networking/{registration_code}', [NetworkingController::class, 'show'])->name('public.networking');
Route::post('/e/{slug}/networking/{registration_code}/pin', [NetworkingController::class, 'updatePin'])->name('public.networking.pin');
Route::post('/e/{slug}/networking/{registration_code}/search', [NetworkingController::class, 'searchPin'])->name('public.networking.search');
Route::post('/e/{slug}/networking/{registration_code}/profile', [NetworkingController::class, 'updateProfile'])->name('public.networking.profile.update');
Route::get('/e/{slug}/networking/{registration_code}/profile', [NetworkingController::class, 'profile'])->name('public.networking.profile');
Route::get('/e/{slug}/networking/{registration_code}/directory', [NetworkingController::class, 'directory'])->name('public.networking.directory');
Route::get('/e/{slug}/networking/{registration_code}/contacts', [NetworkingController::class, 'myContacts'])->name('public.networking.contacts');
Route::post('/e/{slug}/networking/{registration_code}/contacts/save', [NetworkingController::class, 'saveContact'])->name('public.networking.contacts.save');
Route::post('/e/{slug}/networking/{registration_code}/contacts/accept', [NetworkingController::class, 'acceptContact'])->name('public.networking.contacts.accept');
Route::post('/e/{slug}/networking/{registration_code}/contacts/reject', [NetworkingController::class, 'rejectContact'])->name('public.networking.contacts.reject');
Route::post('/e/{slug}/networking/{registration_code}/contacts/remove', [NetworkingController::class, 'removeContact'])->name('public.networking.contacts.remove');
Route::post('/e/{slug}/networking/{registration_code}/contacts/connect-with-pin', [NetworkingController::class, 'connectWithPin'])->name('public.networking.contacts.connect-with-pin');

// Guest routes
Route::middleware('guest')->group(function () {
    Route::get('/login', [LoginController::class, 'create'])->name('login');
    Route::post('/login', [LoginController::class, 'store']);

    Route::get('/register', [RegisterController::class, 'create'])->name('register');
    Route::post('/register', [RegisterController::class, 'store']);
});

// Authenticated routes (shared)
Route::middleware('auth')->group(function () {
    Route::post('/logout', [LoginController::class, 'destroy'])->name('logout');
});

// Admin routes (super_admin only)
Route::middleware(['auth', 'super_admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/dashboard', AdminDashboardController::class)->name('dashboard');

    // Organizations CRUD
    Route::resource('organizations', AdminOrganizationController::class);
    Route::patch('organizations/{organization}/toggle-active', [AdminOrganizationController::class, 'toggleActive'])
        ->name('organizations.toggle-active');

    // Users management
    Route::resource('users', AdminUserController::class)->except(['show']);
    Route::patch('users/{user}/toggle-active', [AdminUserController::class, 'toggleActive'])
        ->withTrashed()
        ->name('users.toggle-active');

    // Impersonation
    Route::post('impersonate/{organization}', [ImpersonationController::class, 'start'])
        ->name('impersonate.start');
    Route::delete('impersonate', [ImpersonationController::class, 'stop'])
        ->name('impersonate.stop');
});

// Organization-level routes (requires org context)
Route::middleware(['auth', 'has_organization'])->group(function () {
    Route::get('/dashboard', DashboardController::class)->name('dashboard');

    // Organization settings
    Route::get('/organization', [OrganizationController::class, 'edit'])->name('organization.edit');
    Route::put('/organization', [OrganizationController::class, 'update'])->name('organization.update');
    Route::post('/organization/logo', [OrganizationController::class, 'updateLogo'])->name('organization.logo');

    // Reports
    Route::get('/reports', [\App\Http\Controllers\ReportController::class, 'index'])->name('reports.index');
    Route::get('/reports/export/pdf', [\App\Http\Controllers\ReportExportController::class, 'organizationReport'])->name('reports.export.pdf');

    // Events
    Route::resource('events', EventController::class);
    Route::post('events/{event}/cover', [EventController::class, 'updateCover'])->name('events.cover');
    Route::patch('events/{event}/status', [EventController::class, 'updateStatus'])->name('events.status');

    // Event nested resources
    Route::prefix('events/{event}')->name('events.')->group(function () {
        // Sponsor Levels
        Route::get('sponsor-levels', [SponsorLevelController::class, 'index'])->name('sponsor-levels.index');
        Route::post('sponsor-levels', [SponsorLevelController::class, 'store'])->name('sponsor-levels.store');
        Route::put('sponsor-levels/{sponsorLevel}', [SponsorLevelController::class, 'update'])->name('sponsor-levels.update');
        Route::delete('sponsor-levels/{sponsorLevel}', [SponsorLevelController::class, 'destroy'])->name('sponsor-levels.destroy');
        Route::post('sponsor-levels/reorder', [SponsorLevelController::class, 'reorder'])->name('sponsor-levels.reorder');

        // Participants
        Route::get('participants', [ParticipantController::class, 'index'])->name('participants.index');
        Route::get('participants/create', [ParticipantController::class, 'create'])->name('participants.create');
        Route::get('participants/export', [ParticipantController::class, 'exportCsv'])->name('participants.export');
        Route::get('participants/export/pdf', [\App\Http\Controllers\ReportExportController::class, 'participantsList'])->name('participants.export.pdf');
        Route::get('report/pdf', [\App\Http\Controllers\ReportExportController::class, 'eventReport'])->name('report.pdf');
        Route::post('participants/import', [ParticipantController::class, 'bulkImport'])->name('participants.import');
        Route::post('participants', [ParticipantController::class, 'store'])->name('participants.store');
        Route::get('participants/{participant}/edit', [ParticipantController::class, 'edit'])->name('participants.edit');
        Route::put('participants/{participant}', [ParticipantController::class, 'update'])->name('participants.update');
        Route::delete('participants/{participant}', [ParticipantController::class, 'destroy'])->name('participants.destroy');
        Route::post('participants/{participant}/check-in', [ParticipantController::class, 'checkIn'])->name('participants.check-in');

        // Speakers
        Route::get('speakers', [SpeakerController::class, 'index'])->name('speakers.index');
        Route::get('speakers/create', [SpeakerController::class, 'create'])->name('speakers.create');
        Route::post('speakers/reorder', [SpeakerController::class, 'reorder'])->name('speakers.reorder');
        Route::post('speakers', [SpeakerController::class, 'store'])->name('speakers.store');
        Route::get('speakers/{speaker}/edit', [SpeakerController::class, 'edit'])->name('speakers.edit');
        Route::put('speakers/{speaker}', [SpeakerController::class, 'update'])->name('speakers.update');
        Route::delete('speakers/{speaker}', [SpeakerController::class, 'destroy'])->name('speakers.destroy');
        Route::post('speakers/{speaker}/photo', [SpeakerController::class, 'updatePhoto'])->name('speakers.photo');

        // Sponsors
        Route::get('sponsors', [SponsorController::class, 'index'])->name('sponsors.index');
        Route::get('sponsors/create', [SponsorController::class, 'create'])->name('sponsors.create');
        Route::post('sponsors/reorder', [SponsorController::class, 'reorder'])->name('sponsors.reorder');
        Route::post('sponsors', [SponsorController::class, 'store'])->name('sponsors.store');
        Route::get('sponsors/{sponsor}/edit', [SponsorController::class, 'edit'])->name('sponsors.edit');
        Route::put('sponsors/{sponsor}', [SponsorController::class, 'update'])->name('sponsors.update');
        Route::delete('sponsors/{sponsor}', [SponsorController::class, 'destroy'])->name('sponsors.destroy');
        Route::post('sponsors/{sponsor}/logo', [SponsorController::class, 'updateLogo'])->name('sponsors.logo');

        // Communities
        Route::get('communities', [CommunityController::class, 'index'])->name('communities.index');
        Route::get('communities/create', [CommunityController::class, 'create'])->name('communities.create');
        Route::post('communities/reorder', [CommunityController::class, 'reorder'])->name('communities.reorder');
        Route::post('communities', [CommunityController::class, 'store'])->name('communities.store');
        Route::get('communities/{community}/edit', [CommunityController::class, 'edit'])->name('communities.edit');
        Route::put('communities/{community}', [CommunityController::class, 'update'])->name('communities.update');
        Route::delete('communities/{community}', [CommunityController::class, 'destroy'])->name('communities.destroy');
        Route::post('communities/{community}/logo', [CommunityController::class, 'updateLogo'])->name('communities.logo');

        // Scanner
        Route::get('scanner', [ScannerController::class, 'show'])->name('scanner.show');
        Route::post('scanner/scan', [ScannerController::class, 'scan'])->name('scanner.scan');
        Route::get('scanner/stats', [ScannerController::class, 'stats'])->name('scanner.stats');

        // Agenda
        Route::get('agenda', [AgendaItemController::class, 'index'])->name('agenda.index');
        Route::get('agenda/create', [AgendaItemController::class, 'create'])->name('agenda.create');
        Route::post('agenda/reorder', [AgendaItemController::class, 'reorder'])->name('agenda.reorder');
        Route::patch('agenda/{agendaItem}/move', [AgendaItemController::class, 'move'])->name('agenda.move');
        Route::post('agenda', [AgendaItemController::class, 'store'])->name('agenda.store');
        Route::get('agenda/{agendaItem}/edit', [AgendaItemController::class, 'edit'])->name('agenda.edit');
        Route::put('agenda/{agendaItem}', [AgendaItemController::class, 'update'])->name('agenda.update');
        Route::delete('agenda/{agendaItem}', [AgendaItemController::class, 'destroy'])->name('agenda.destroy');

        // Surveys
        Route::get('surveys', [SurveyController::class, 'index'])->name('surveys.index');
        Route::get('surveys/create', [SurveyController::class, 'create'])->name('surveys.create');
        Route::post('surveys', [SurveyController::class, 'store'])->name('surveys.store');
        Route::get('surveys/{survey}/edit', [SurveyController::class, 'edit'])->name('surveys.edit');
        Route::put('surveys/{survey}', [SurveyController::class, 'update'])->name('surveys.update');
        Route::delete('surveys/{survey}', [SurveyController::class, 'destroy'])->name('surveys.destroy');
        Route::get('surveys/{survey}/results', [SurveyController::class, 'results'])->name('surveys.results');
    });
});
