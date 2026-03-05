<?php

namespace Tests\Feature\Event;

use App\Models\Event;
use App\Models\Organization;
use App\Models\Speaker;
use App\Models\User;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SpeakerTest extends TestCase
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

    public function test_org_admin_can_view_speakers_index()
    {
        Speaker::factory()->count(3)->create(['event_id' => $this->event->id]);

        $response = $this->actingAs($this->user)->get(route('events.speakers.index', $this->event));
        
        $response->assertStatus(200);
    }

    public function test_org_admin_can_store_speaker()
    {
        $response = $this->actingAs($this->user)->post(route('events.speakers.store', $this->event), [
            'first_name' => 'Jane',
            'last_name' => 'Smith',
            'email' => 'jane@example.com',
            'job_title' => 'Software Engineer',
            'company' => 'Tech Corp',
            'status' => 'confirmed',
        ]);

        $response->assertRedirect(route('events.speakers.index', $this->event));
        
        $this->assertDatabaseHas('speakers', [
            'event_id' => $this->event->id,
            'email' => 'jane@example.com',
            'first_name' => 'Jane',
        ]);
    }

    public function test_org_admin_can_update_speaker()
    {
        $speaker = Speaker::factory()->create(['event_id' => $this->event->id, 'first_name' => 'Old Name']);

        $response = $this->actingAs($this->user)->put(route('events.speakers.update', [$this->event, $speaker]), [
            'first_name' => 'Updated Name',
            'last_name' => $speaker->last_name,
            'email' => $speaker->email,
            'status' => 'confirmed',
        ]);

        $response->assertRedirect(route('events.speakers.index', $this->event));
        
        $this->assertDatabaseHas('speakers', [
            'id' => $speaker->id,
            'first_name' => 'Updated Name',
        ]);
    }

    public function test_org_admin_can_delete_speaker()
    {
        $speaker = Speaker::factory()->create(['event_id' => $this->event->id]);

        $response = $this->actingAs($this->user)->delete(route('events.speakers.destroy', [$this->event, $speaker]));

        $response->assertRedirect();
        
        $this->assertSoftDeleted('speakers', [
            'id' => $speaker->id,
        ]);
    }

    public function test_org_admin_can_reorder_speakers()
    {
        $speaker1 = Speaker::factory()->create(['event_id' => $this->event->id, 'sort_order' => 1]);
        $speaker2 = Speaker::factory()->create(['event_id' => $this->event->id, 'sort_order' => 2]);

        $response = $this->actingAs($this->user)->post(route('events.speakers.reorder', $this->event), [
            'speakers' => [
                ['id' => $speaker1->id, 'sort_order' => 2],
                ['id' => $speaker2->id, 'sort_order' => 1],
            ],
        ]);

        $response->assertRedirect();
        
        $this->assertDatabaseHas('speakers', ['id' => $speaker1->id, 'sort_order' => 2]);
        $this->assertDatabaseHas('speakers', ['id' => $speaker2->id, 'sort_order' => 1]);
    }
}
