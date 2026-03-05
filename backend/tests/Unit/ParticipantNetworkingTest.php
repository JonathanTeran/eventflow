<?php

namespace Tests\Unit;

use App\Models\Event;
use App\Models\Participant;
use App\Models\ParticipantConnection;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ParticipantNetworkingTest extends TestCase
{
    use RefreshDatabase;

    // ─── Participant model: casts ────────────────────────────

    public function test_social_links_is_cast_to_array(): void
    {
        $event = Event::factory()->create();
        $participant = Participant::factory()->create([
            'event_id' => $event->id,
            'social_links' => ['linkedin' => 'https://linkedin.com/in/test'],
        ]);

        $participant->refresh();

        $this->assertIsArray($participant->social_links);
        $this->assertEquals('https://linkedin.com/in/test', $participant->social_links['linkedin']);
    }

    public function test_networking_visible_is_cast_to_boolean(): void
    {
        $event = Event::factory()->create();
        $participant = Participant::factory()->create([
            'event_id' => $event->id,
            'networking_visible' => 1,
        ]);

        $participant->refresh();

        $this->assertIsBool($participant->networking_visible);
        $this->assertTrue($participant->networking_visible);
    }

    public function test_social_links_defaults_to_null(): void
    {
        $event = Event::factory()->create();
        $participant = Participant::factory()->create([
            'event_id' => $event->id,
        ]);

        $participant->refresh();

        $this->assertNull($participant->social_links);
    }

    // ─── Participant model: scope networkingVisible ──────────

    public function test_scope_networking_visible_filters_correctly(): void
    {
        $event = Event::factory()->create();

        $visible = Participant::factory()->create([
            'event_id' => $event->id,
            'networking_pin' => 'VIS001',
            'networking_visible' => true,
        ]);

        // Invisible: networking_visible = false
        Participant::factory()->create([
            'event_id' => $event->id,
            'networking_pin' => 'INV001',
            'networking_visible' => false,
        ]);

        // Invisible: explicitly set networking_visible = false (even with PIN)
        Participant::factory()->create([
            'event_id' => $event->id,
            'networking_visible' => false,
        ]);

        $results = Participant::where('event_id', $event->id)->networkingVisible()->get();

        $this->assertCount(1, $results);
        $this->assertEquals($visible->id, $results->first()->id);
    }

    // ─── Participant model: relations ────────────────────────

    public function test_saved_contacts_relation(): void
    {
        $event = Event::factory()->create();
        $participant = Participant::factory()->create(['event_id' => $event->id]);
        $other = Participant::factory()->create(['event_id' => $event->id]);

        ParticipantConnection::create([
            'participant_id' => $participant->id,
            'connected_participant_id' => $other->id,
        ]);

        $this->assertCount(1, $participant->savedContacts);
        $this->assertEquals($other->id, $participant->savedContacts->first()->connected_participant_id);
    }

    public function test_saved_by_relation(): void
    {
        $event = Event::factory()->create();
        $participant = Participant::factory()->create(['event_id' => $event->id]);
        $other = Participant::factory()->create(['event_id' => $event->id]);

        ParticipantConnection::create([
            'participant_id' => $other->id,
            'connected_participant_id' => $participant->id,
        ]);

        $this->assertCount(1, $participant->savedBy);
        $this->assertEquals($other->id, $participant->savedBy->first()->participant_id);
    }

    // ─── ParticipantConnection model ─────────────────────────

    public function test_connection_belongs_to_participant(): void
    {
        $event = Event::factory()->create();
        $participant = Participant::factory()->create(['event_id' => $event->id]);
        $other = Participant::factory()->create(['event_id' => $event->id]);

        $connection = ParticipantConnection::create([
            'participant_id' => $participant->id,
            'connected_participant_id' => $other->id,
        ]);

        $this->assertInstanceOf(Participant::class, $connection->participant);
        $this->assertEquals($participant->id, $connection->participant->id);
    }

    public function test_connection_belongs_to_connected_participant(): void
    {
        $event = Event::factory()->create();
        $participant = Participant::factory()->create(['event_id' => $event->id]);
        $other = Participant::factory()->create(['event_id' => $event->id]);

        $connection = ParticipantConnection::create([
            'participant_id' => $participant->id,
            'connected_participant_id' => $other->id,
        ]);

        $this->assertInstanceOf(Participant::class, $connection->connectedParticipant);
        $this->assertEquals($other->id, $connection->connectedParticipant->id);
    }

    public function test_connection_uses_ulid_primary_key(): void
    {
        $event = Event::factory()->create();
        $participant = Participant::factory()->create(['event_id' => $event->id]);
        $other = Participant::factory()->create(['event_id' => $event->id]);

        $connection = ParticipantConnection::create([
            'participant_id' => $participant->id,
            'connected_participant_id' => $other->id,
        ]);

        $this->assertNotNull($connection->id);
        $this->assertEquals(26, strlen($connection->id)); // ULIDs are 26 chars
    }

    public function test_connection_unique_constraint(): void
    {
        $event = Event::factory()->create();
        $participant = Participant::factory()->create(['event_id' => $event->id]);
        $other = Participant::factory()->create(['event_id' => $event->id]);

        ParticipantConnection::create([
            'participant_id' => $participant->id,
            'connected_participant_id' => $other->id,
        ]);

        $this->expectException(\Illuminate\Database\QueryException::class);

        ParticipantConnection::create([
            'participant_id' => $participant->id,
            'connected_participant_id' => $other->id,
        ]);
    }

    public function test_deleting_participant_cascades_to_connections(): void
    {
        $event = Event::factory()->create();
        $participant = Participant::factory()->create(['event_id' => $event->id]);
        $other = Participant::factory()->create(['event_id' => $event->id]);

        ParticipantConnection::create([
            'participant_id' => $participant->id,
            'connected_participant_id' => $other->id,
        ]);

        // Force delete (not soft delete) to trigger cascade
        $participant->forceDelete();

        $this->assertDatabaseMissing('participant_connections', [
            'participant_id' => $participant->id,
        ]);
    }
}
