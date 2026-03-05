<?php

namespace Tests\Feature\Event;

use App\Models\Event;
use App\Models\Organization;
use App\Models\User;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class EventTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;
    protected Organization $org;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RoleAndPermissionSeeder::class);

        $this->org = Organization::factory()->create();

        $this->user = User::factory()->create(['organization_id' => $this->org->id]);
        $this->user->assignRole('org_admin');
    }

    public function test_org_admin_can_view_events_index()
    {
        Event::factory()->count(3)->create(['organization_id' => $this->org->id]);

        $response = $this->actingAs($this->user)->get(route('events.index'));
        $response->assertStatus(200);
    }

    public function test_org_admin_can_store_event()
    {
        $response = $this->actingAs($this->user)->post(route('events.store'), [
            'name' => 'New Event',
            'slug' => 'new-event-1',
            'date_start' => now()->addDay()->toDateTimeString(),
            'date_end' => now()->addDays(2)->toDateTimeString(),
            'registration_type' => 'open',
            'capacity' => 100,
        ]);

        $event = Event::where('slug', 'new-event-1')->first();
        $response->assertRedirect(route('events.show', $event));
        
        $this->assertDatabaseHas('events', [
            'name' => 'New Event',
            'organization_id' => $this->org->id,
        ]);

        $this->assertDatabaseCount('sponsor_levels', 3);
    }

    public function test_org_admin_can_update_event()
    {
        $event = Event::factory()->create(['organization_id' => $this->org->id]);

        $response = $this->actingAs($this->user)->put(route('events.update', $event), [
            'name' => 'Updated Event',
            'slug' => 'updated-event-1',
            'date_start' => now()->addDay()->toDateTimeString(),
            'date_end' => now()->addDays(2)->toDateTimeString(),
            'registration_type' => 'invite',
            'capacity' => 200,
        ]);

        $response->assertRedirect(route('events.show', $event));
        $this->assertDatabaseHas('events', [
            'id' => $event->id,
            'name' => 'Updated Event',
            'capacity' => 200,
        ]);
    }

    public function test_org_admin_can_delete_event()
    {
        $event = Event::factory()->create(['organization_id' => $this->org->id]);

        $response = $this->actingAs($this->user)->delete(route('events.destroy', $event));

        $response->assertRedirect(route('events.index'));
        $this->assertSoftDeleted('events', [
            'id' => $event->id,
        ]);
    }

    public function test_org_admin_can_update_event_cover()
    {
        Storage::fake('public');
        $file = UploadedFile::fake()->image('cover.jpg');

        $event = Event::factory()->create(['organization_id' => $this->org->id]);

        $response = $this->actingAs($this->user)->post(route('events.cover', $event), [
            'cover_image' => $file,
        ]);

        $response->assertRedirect();
        $event->refresh();

        $this->assertNotNull($event->cover_image_path);
        Storage::disk('public')->assertExists($event->cover_image_path);
    }

    public function test_org_admin_can_update_event_status()
    {
        $event = Event::factory()->create([
            'organization_id' => $this->org->id,
            'status' => 'draft',
        ]);

        $response = $this->actingAs($this->user)->patch(route('events.status', $event), [
            'status' => 'published',
        ]);

        $response->assertRedirect();
        
        $this->assertDatabaseHas('events', [
            'id' => $event->id,
            'status' => 'published',
        ]);
    }
}
