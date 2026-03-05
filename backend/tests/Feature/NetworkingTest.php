<?php

namespace Tests\Feature;

use App\Models\Event;
use App\Models\Participant;
use App\Models\ParticipantConnection;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class NetworkingTest extends TestCase
{
    use RefreshDatabase;

    protected Event $event;
    protected Participant $participant;

    protected function setUp(): void
    {
        parent::setUp();

        $this->event = Event::factory()->published()->create();

        $this->participant = Participant::factory()->create([
            'event_id' => $this->event->id,
            'status' => 'confirmed',
            'networking_pin' => 'ABC123',
            'networking_visible' => true,
            'social_links' => [
                'linkedin' => 'https://linkedin.com/in/testuser',
                'github' => 'https://github.com/testuser',
            ],
        ]);
    }

    // ─── show() ──────────────────────────────────────────────

    public function test_show_renders_networking_page(): void
    {
        $response = $this->get("/e/{$this->event->slug}/networking/{$this->participant->registration_code}");

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Public/Networking')
            ->has('event')
            ->has('participant')
            ->has('savedContactIds')
            ->has('profileUrl')
            ->where('participant.networking_pin', 'ABC123')
            ->where('participant.networking_visible', true)
            ->where('participant.social_links.linkedin', 'https://linkedin.com/in/testuser')
        );
    }

    public function test_show_returns_404_for_invalid_registration_code(): void
    {
        $response = $this->get("/e/{$this->event->slug}/networking/INVALID1");

        $response->assertStatus(404);
    }

    public function test_show_returns_404_for_draft_event(): void
    {
        $draftEvent = Event::factory()->create(['status' => 'draft']);
        $participant = Participant::factory()->create([
            'event_id' => $draftEvent->id,
            'status' => 'confirmed',
        ]);

        $response = $this->get("/e/{$draftEvent->slug}/networking/{$participant->registration_code}");

        $response->assertStatus(404);
    }

    public function test_show_includes_saved_contact_ids(): void
    {
        $other = Participant::factory()->create([
            'event_id' => $this->event->id,
            'status' => 'confirmed',
        ]);

        ParticipantConnection::create([
            'participant_id' => $this->participant->id,
            'connected_participant_id' => $other->id,
        ]);

        $response = $this->get("/e/{$this->event->slug}/networking/{$this->participant->registration_code}");

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->where('savedContactIds', [$other->id])
        );
    }

    // ─── updatePin() ─────────────────────────────────────────

    public function test_update_pin_successfully(): void
    {
        $participant = Participant::factory()->create([
            'event_id' => $this->event->id,
            'status' => 'confirmed',
            'networking_pin' => null,
        ]);

        $response = $this->postJson(
            "/e/{$this->event->slug}/networking/{$participant->registration_code}/pin",
            ['networking_pin' => 'XYZ789']
        );

        $response->assertOk();
        $response->assertJson([
            'networking_pin' => 'XYZ789',
            'message' => 'PIN actualizado correctamente.',
        ]);

        $this->assertDatabaseHas('participants', [
            'id' => $participant->id,
            'networking_pin' => 'XYZ789',
        ]);
    }

    public function test_update_pin_auto_enables_visibility_on_first_pin(): void
    {
        // First, clear the PIN to simulate a user without one,
        // or a scenario where the PIN was explicitly removed.
        $participant = Participant::factory()->create([
            'event_id' => $this->event->id,
            'status' => 'confirmed',
            'networking_visible' => false,
        ]);
        $participant->updateQuietly(['networking_pin' => null]);

        $response = $this->postJson(
            "/e/{$this->event->slug}/networking/{$participant->registration_code}/pin",
            ['networking_pin' => 'NEW001']
        );

        $response->assertOk();
        $response->assertJson(['networking_visible' => true]);

        $this->assertDatabaseHas('participants', [
            'id' => $participant->id,
            'networking_visible' => true,
        ]);
    }

    public function test_update_pin_rejects_duplicate_pin_in_same_event(): void
    {
        $response = $this->postJson(
            "/e/{$this->event->slug}/networking/{$this->participant->registration_code}/pin",
            ['networking_pin' => 'ABC123']
        );
        $response->assertOk();

        $other = Participant::factory()->create([
            'event_id' => $this->event->id,
            'status' => 'confirmed',
        ]);

        $response = $this->postJson(
            "/e/{$this->event->slug}/networking/{$other->registration_code}/pin",
            ['networking_pin' => 'ABC123']
        );

        $response->assertStatus(422);
    }

    public function test_update_pin_validates_format(): void
    {
        $response = $this->postJson(
            "/e/{$this->event->slug}/networking/{$this->participant->registration_code}/pin",
            ['networking_pin' => 'ab']
        );

        $response->assertStatus(422);
    }

    // ─── searchPin() ─────────────────────────────────────────

    public function test_search_pin_finds_participant(): void
    {
        $other = Participant::factory()->create([
            'event_id' => $this->event->id,
            'status' => 'confirmed',
            'networking_pin' => 'OTH001',
            'social_links' => ['github' => 'https://github.com/other'],
        ]);

        $response = $this->postJson(
            "/e/{$this->event->slug}/networking/{$this->participant->registration_code}/search",
            ['networking_pin' => 'OTH001']
        );

        $response->assertOk();
        $response->assertJson([
            'found' => true,
            'contact' => [
                'id' => $other->id,
                'full_name' => $other->full_name,
                'registration_code' => $other->registration_code,
            ],
            'already_saved' => false,
        ]);
    }

    public function test_search_pin_returns_already_saved_flag(): void
    {
        $other = Participant::factory()->create([
            'event_id' => $this->event->id,
            'status' => 'confirmed',
            'networking_pin' => 'OTH002',
        ]);

        ParticipantConnection::create([
            'participant_id' => $this->participant->id,
            'connected_participant_id' => $other->id,
        ]);

        $response = $this->postJson(
            "/e/{$this->event->slug}/networking/{$this->participant->registration_code}/search",
            ['networking_pin' => 'OTH002']
        );

        $response->assertOk();
        $response->assertJson([
            'found' => true,
            'already_saved' => true,
        ]);
    }

    public function test_search_pin_not_found(): void
    {
        $response = $this->postJson(
            "/e/{$this->event->slug}/networking/{$this->participant->registration_code}/search",
            ['networking_pin' => 'ZZZ999']
        );

        $response->assertOk();
        $response->assertJson([
            'found' => false,
            'contact' => null,
        ]);
    }

    public function test_search_pin_does_not_find_own_pin(): void
    {
        $response = $this->postJson(
            "/e/{$this->event->slug}/networking/{$this->participant->registration_code}/search",
            ['networking_pin' => 'ABC123']
        );

        $response->assertOk();
        $response->assertJson(['found' => false]);
    }

    public function test_search_pin_does_not_find_cancelled_participant(): void
    {
        Participant::factory()->create([
            'event_id' => $this->event->id,
            'status' => 'cancelled',
            'networking_pin' => 'CAN001',
        ]);

        $response = $this->postJson(
            "/e/{$this->event->slug}/networking/{$this->participant->registration_code}/search",
            ['networking_pin' => 'CAN001']
        );

        $response->assertOk();
        $response->assertJson(['found' => false]);
    }

    // ─── updateProfile() ─────────────────────────────────────

    public function test_update_profile_saves_social_links(): void
    {
        $response = $this->postJson(
            "/e/{$this->event->slug}/networking/{$this->participant->registration_code}/profile",
            [
                'social_links' => [
                    'linkedin' => 'https://linkedin.com/in/updated',
                    'github' => 'https://github.com/updated',
                    'instagram' => 'https://instagram.com/updated',
                    'website' => 'https://mysite.com',
                    'whatsapp' => '+593991234567',
                ],
                'networking_visible' => true,
            ]
        );

        $response->assertOk();
        $response->assertJson([
            'message' => 'Perfil de networking actualizado.',
            'social_links' => [
                'linkedin' => 'https://linkedin.com/in/updated',
                'whatsapp' => '+593991234567',
            ],
            'networking_visible' => true,
        ]);

        $this->participant->refresh();
        $this->assertEquals('https://github.com/updated', $this->participant->social_links['github']);
    }

    public function test_update_profile_toggles_visibility(): void
    {
        $response = $this->postJson(
            "/e/{$this->event->slug}/networking/{$this->participant->registration_code}/profile",
            [
                'social_links' => [],
                'networking_visible' => false,
            ]
        );

        $response->assertOk();
        $response->assertJson(['networking_visible' => false]);

        $this->assertDatabaseHas('participants', [
            'id' => $this->participant->id,
            'networking_visible' => false,
        ]);
    }

    public function test_update_profile_validates_urls(): void
    {
        $response = $this->postJson(
            "/e/{$this->event->slug}/networking/{$this->participant->registration_code}/profile",
            [
                'social_links' => [
                    'linkedin' => 'not-a-url',
                ],
            ]
        );

        $response->assertStatus(422);
    }

    // ─── profile() ───────────────────────────────────────────

    public function test_profile_renders_public_profile_page(): void
    {
        $response = $this->get("/e/{$this->event->slug}/networking/{$this->participant->registration_code}/profile");

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Public/NetworkingProfile')
            ->has('event')
            ->has('participant')
            ->where('participant.full_name', $this->participant->full_name)
            ->where('connectionStatus', 'none')
        );
    }

    public function test_profile_detects_own_profile_via_viewer_param(): void
    {
        $rc = $this->participant->registration_code;

        $response = $this->get("/e/{$this->event->slug}/networking/{$rc}/profile?viewer={$rc}");

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->where('connectionStatus', 'self')
        );
    }

    public function test_profile_detects_already_saved_via_viewer_param(): void
    {
        $viewer = Participant::factory()->create([
            'event_id' => $this->event->id,
            'status' => 'confirmed',
        ]);

        ParticipantConnection::create([
            'participant_id' => $viewer->id,
            'connected_participant_id' => $this->participant->id,
            'status' => 'pending',
        ]);

        $response = $this->get(
            "/e/{$this->event->slug}/networking/{$this->participant->registration_code}/profile?viewer={$viewer->registration_code}"
        );

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->where('connectionStatus', 'pending_sent')
        );
    }

    public function test_profile_returns_404_for_nonexistent_participant(): void
    {
        $response = $this->get("/e/{$this->event->slug}/networking/BADCODE1/profile");

        $response->assertStatus(404);
    }

    // ─── directory() ─────────────────────────────────────────

    public function test_directory_lists_visible_participants(): void
    {
        $visible = Participant::factory()->create([
            'event_id' => $this->event->id,
            'status' => 'confirmed',
            'networking_pin' => 'VIS001',
            'networking_visible' => true,
        ]);

        $invisible = Participant::factory()->create([
            'event_id' => $this->event->id,
            'status' => 'confirmed',
            'networking_pin' => 'INV001',
            'networking_visible' => false,
        ]);

        $noPinVisible = Participant::factory()->create([
            'event_id' => $this->event->id,
            'status' => 'confirmed',
            'networking_visible' => true,
        ]);
        $noPinVisible->updateQuietly(['networking_pin' => null]);

        $response = $this->get("/e/{$this->event->slug}/networking/{$this->participant->registration_code}/directory");

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Public/NetworkingDirectory')
            ->has('participants.data', 1) // only $visible (self excluded)
            ->where('participants.data.0.id', $visible->id)
        );
    }

    public function test_directory_excludes_self(): void
    {
        $response = $this->get("/e/{$this->event->slug}/networking/{$this->participant->registration_code}/directory");

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->has('participants.data', 0) // self is excluded, no other visible participants
        );
    }

    public function test_directory_filters_by_search(): void
    {
        $alice = Participant::factory()->create([
            'event_id' => $this->event->id,
            'status' => 'confirmed',
            'first_name' => 'Alice',
            'last_name' => 'Wonder',
            'networking_pin' => 'ALI001',
            'networking_visible' => true,
        ]);

        $bob = Participant::factory()->create([
            'event_id' => $this->event->id,
            'status' => 'confirmed',
            'first_name' => 'Bob',
            'last_name' => 'Builder',
            'networking_pin' => 'BOB001',
            'networking_visible' => true,
        ]);

        $response = $this->get(
            "/e/{$this->event->slug}/networking/{$this->participant->registration_code}/directory?search=Alice"
        );

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->has('participants.data', 1)
            ->where('participants.data.0.id', $alice->id)
        );
    }

    public function test_directory_returns_saved_contact_ids(): void
    {
        $other = Participant::factory()->create([
            'event_id' => $this->event->id,
            'status' => 'confirmed',
            'networking_pin' => 'OTH003',
            'networking_visible' => true,
        ]);

        ParticipantConnection::create([
            'participant_id' => $this->participant->id,
            'connected_participant_id' => $other->id,
        ]);

        $response = $this->get("/e/{$this->event->slug}/networking/{$this->participant->registration_code}/directory");

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->where('savedContactIds', [$other->id])
        );
    }

    // ─── saveContact() ───────────────────────────────────────

    public function test_save_contact_creates_connection(): void
    {
        $other = Participant::factory()->create([
            'event_id' => $this->event->id,
            'status' => 'confirmed',
        ]);

        $response = $this->postJson(
            "/e/{$this->event->slug}/networking/{$this->participant->registration_code}/contacts/save",
            ['connected_participant_id' => $other->id]
        );

        $response->assertOk();
        $response->assertJson(['saved' => true]);

        $this->assertDatabaseHas('participant_connections', [
            'participant_id' => $this->participant->id,
            'connected_participant_id' => $other->id,
        ]);
    }

    public function test_save_contact_is_idempotent(): void
    {
        $other = Participant::factory()->create([
            'event_id' => $this->event->id,
            'status' => 'confirmed',
        ]);

        // Save twice
        $this->postJson(
            "/e/{$this->event->slug}/networking/{$this->participant->registration_code}/contacts/save",
            ['connected_participant_id' => $other->id]
        );

        $response = $this->postJson(
            "/e/{$this->event->slug}/networking/{$this->participant->registration_code}/contacts/save",
            ['connected_participant_id' => $other->id]
        );

        $response->assertOk();

        // Should still have only one record
        $this->assertEquals(1, ParticipantConnection::where('participant_id', $this->participant->id)
            ->where('connected_participant_id', $other->id)
            ->count());
    }

    public function test_save_contact_rejects_self(): void
    {
        $response = $this->postJson(
            "/e/{$this->event->slug}/networking/{$this->participant->registration_code}/contacts/save",
            ['connected_participant_id' => $this->participant->id]
        );

        $response->assertStatus(422);
    }

    public function test_save_contact_rejects_participant_from_different_event(): void
    {
        $otherEvent = Event::factory()->published()->create();
        $otherParticipant = Participant::factory()->create([
            'event_id' => $otherEvent->id,
            'status' => 'confirmed',
        ]);

        $response = $this->postJson(
            "/e/{$this->event->slug}/networking/{$this->participant->registration_code}/contacts/save",
            ['connected_participant_id' => $otherParticipant->id]
        );

        $response->assertStatus(422);
    }

    // ─── removeContact() ─────────────────────────────────────

    public function test_remove_contact_deletes_connection(): void
    {
        $other = Participant::factory()->create([
            'event_id' => $this->event->id,
            'status' => 'confirmed',
        ]);

        ParticipantConnection::create([
            'participant_id' => $this->participant->id,
            'connected_participant_id' => $other->id,
        ]);

        $response = $this->postJson(
            "/e/{$this->event->slug}/networking/{$this->participant->registration_code}/contacts/remove",
            ['connected_participant_id' => $other->id]
        );

        $response->assertOk();
        $response->assertJson(['removed' => true]);

        $this->assertDatabaseMissing('participant_connections', [
            'participant_id' => $this->participant->id,
            'connected_participant_id' => $other->id,
        ]);
    }

    public function test_remove_contact_is_safe_when_no_connection_exists(): void
    {
        $other = Participant::factory()->create([
            'event_id' => $this->event->id,
            'status' => 'confirmed',
        ]);

        $response = $this->postJson(
            "/e/{$this->event->slug}/networking/{$this->participant->registration_code}/contacts/remove",
            ['connected_participant_id' => $other->id]
        );

        $response->assertOk();
        $response->assertJson(['removed' => true]);
    }

    // ─── myContacts() ────────────────────────────────────────

    public function test_my_contacts_lists_saved_contacts(): void
    {
        $contact1 = Participant::factory()->create([
            'event_id' => $this->event->id,
            'status' => 'confirmed',
            'social_links' => ['linkedin' => 'https://linkedin.com/in/contact1'],
        ]);

        $contact2 = Participant::factory()->create([
            'event_id' => $this->event->id,
            'status' => 'confirmed',
        ]);

        ParticipantConnection::create([
            'participant_id' => $this->participant->id,
            'connected_participant_id' => $contact1->id,
        ]);
        ParticipantConnection::create([
            'participant_id' => $this->participant->id,
            'connected_participant_id' => $contact2->id,
        ]);

        $response = $this->get(
            "/e/{$this->event->slug}/networking/{$this->participant->registration_code}/contacts"
        );

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Public/NetworkingContacts')
            ->has('contacts', 2)
            ->has('participant')
            ->where('participant.registration_code', $this->participant->registration_code)
        );
    }

    public function test_my_contacts_returns_empty_when_no_connections(): void
    {
        $response = $this->get(
            "/e/{$this->event->slug}/networking/{$this->participant->registration_code}/contacts"
        );

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->has('contacts', 0)
        );
    }

    // ─── Connections are unidirectional ──────────────────────

    public function test_connections_are_unidirectional(): void
    {
        $other = Participant::factory()->create([
            'event_id' => $this->event->id,
            'status' => 'confirmed',
            'networking_pin' => 'UNI001',
        ]);

        // participant saves other
        $this->postJson(
            "/e/{$this->event->slug}/networking/{$this->participant->registration_code}/contacts/save",
            ['connected_participant_id' => $other->id]
        );

        // other's contacts should be empty
        $response = $this->get(
            "/e/{$this->event->slug}/networking/{$other->registration_code}/contacts"
        );

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->has('contacts', 0)
        );

        // participant's contacts should have other
        $response = $this->get(
            "/e/{$this->event->slug}/networking/{$this->participant->registration_code}/contacts"
        );

        $response->assertInertia(fn ($page) => $page
            ->has('contacts', 1)
        );
    }

    // ─── acceptContact() ─────────────────────────────────────

    public function test_accept_contact_creates_bidirectional_connection(): void
    {
        $requester = Participant::factory()->create([
            'event_id' => $this->event->id,
            'status' => 'confirmed',
        ]);

        // Requester saves this->participant (creates pending)
        ParticipantConnection::create([
            'participant_id' => $requester->id,
            'connected_participant_id' => $this->participant->id,
            'status' => ParticipantConnection::STATUS_PENDING,
        ]);

        // this->participant accepts requester
        $response = $this->postJson(
            "/e/{$this->event->slug}/networking/{$this->participant->registration_code}/contacts/accept",
            ['requester_participant_id' => $requester->id]
        );

        $response->assertOk();
        $response->assertJson(['accepted' => true]);

        // Requester's connection should be accepted
        $this->assertDatabaseHas('participant_connections', [
            'participant_id' => $requester->id,
            'connected_participant_id' => $this->participant->id,
            'status' => ParticipantConnection::STATUS_ACCEPTED,
        ]);

        // Participant's reciprocal connection should be created and accepted
        $this->assertDatabaseHas('participant_connections', [
            'participant_id' => $this->participant->id,
            'connected_participant_id' => $requester->id,
            'status' => ParticipantConnection::STATUS_ACCEPTED,
        ]);
    }

    // ─── rejectContact() ─────────────────────────────────────

    public function test_reject_contact_deletes_pending_connection(): void
    {
        $requester = Participant::factory()->create([
            'event_id' => $this->event->id,
            'status' => 'confirmed',
        ]);

        // Requester saves this->participant (creates pending)
        ParticipantConnection::create([
            'participant_id' => $requester->id,
            'connected_participant_id' => $this->participant->id,
            'status' => ParticipantConnection::STATUS_PENDING,
        ]);

        // this->participant rejects requester
        $response = $this->postJson(
            "/e/{$this->event->slug}/networking/{$this->participant->registration_code}/contacts/reject",
            ['requester_participant_id' => $requester->id]
        );

        $response->assertOk();
        $response->assertJson(['rejected' => true]);

        // Requester's pending connection should be deleted
        $this->assertDatabaseMissing('participant_connections', [
            'participant_id' => $requester->id,
            'connected_participant_id' => $this->participant->id,
        ]);
    }
}
