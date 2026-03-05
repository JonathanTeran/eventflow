<?php

namespace Tests\Feature\Event;

use App\Models\Event;
use App\Models\Organization;
use App\Models\Participant;
use App\Models\User;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ParticipantTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;
    protected Organization $org;
    protected Event $event;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RoleAndPermissionSeeder::class);

        $this->org = Organization::factory()->create();
        $this->user = User::factory()->create(['organization_id' => $this->org->id]);
        $this->user->assignRole('org_admin');
        
        $this->event = Event::factory()->create(['organization_id' => $this->org->id]);
    }

    public function test_org_admin_can_view_participants_index()
    {
        Participant::factory()->count(3)->create(['event_id' => $this->event->id]);

        $response = $this->actingAs($this->user)->get(route('events.participants.index', $this->event));
        
        $response->assertStatus(200);
    }

    public function test_org_admin_can_store_participant()
    {
        $response = $this->actingAs($this->user)->post(route('events.participants.store', $this->event), [
            'first_name' => 'John',
            'last_name' => 'Doe',
            'email' => 'john.doe@test.com',
            'country' => 'Ecuador',
            'city' => 'Quito',
            'ticket_type' => 'vip',
            'status' => 'confirmed',
        ]);

        $response->assertRedirect(route('events.participants.index', $this->event));
        
        $this->assertDatabaseHas('participants', [
            'event_id' => $this->event->id,
            'email' => 'john.doe@test.com',
            'ticket_type' => 'vip',
        ]);
    }

    public function test_org_admin_can_update_participant()
    {
        $participant = Participant::factory()->create(['event_id' => $this->event->id, 'first_name' => 'Old']);

        $response = $this->actingAs($this->user)->put(route('events.participants.update', [$this->event, $participant]), [
            'first_name' => 'Updated',
            'last_name' => $participant->last_name,
            'email' => $participant->email,
            'country' => 'Ecuador',
            'city' => 'Guayaquil',
            'ticket_type' => 'general',
            'status' => 'confirmed',
        ]);

        $response->assertRedirect(route('events.participants.index', $this->event));
        
        $this->assertDatabaseHas('participants', [
            'id' => $participant->id,
            'first_name' => 'Updated',
        ]);
    }

    public function test_org_admin_can_delete_participant()
    {
        $participant = Participant::factory()->create(['event_id' => $this->event->id]);

        $response = $this->actingAs($this->user)->delete(route('events.participants.destroy', [$this->event, $participant]));

        $response->assertRedirect();
        
        $this->assertSoftDeleted('participants', [
            'id' => $participant->id,
        ]);
    }

    public function test_user_with_permission_can_checkin_participant()
    {
        // org_admin has all permissions, including participants.checkin
        $participant = Participant::factory()->create(['event_id' => $this->event->id, 'status' => 'confirmed']);

        $response = $this->actingAs($this->user)->post(route('events.participants.check-in', [$this->event, $participant]));

        $response->assertRedirect();
        
        $this->assertDatabaseHas('participants', [
            'id' => $participant->id,
            'status' => 'attended',
        ]);
    }
}
