<?php

namespace Tests\Feature\Event;

use App\Models\Event;
use App\Models\Organization;
use App\Models\SponsorLevel;
use App\Models\User;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SponsorLevelTest extends TestCase
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

    public function test_org_admin_can_view_sponsor_levels()
    {
        SponsorLevel::factory()->count(3)->create(['event_id' => $this->event->id]);

        $response = $this->actingAs($this->user)->get(route('events.sponsor-levels.index', $this->event));
        
        $response->assertStatus(200);
        $response->assertJsonStructure(['sponsor_levels']);
    }

    public function test_org_admin_can_store_sponsor_level()
    {
        $response = $this->actingAs($this->user)->post(route('events.sponsor-levels.store', $this->event), [
            'name' => 'Platinum',
            'benefits' => ['Booth', 'Logo'],
            'price' => 5000,
        ]);

        $response->assertRedirect();
        
        $this->assertDatabaseHas('sponsor_levels', [
            'event_id' => $this->event->id,
            'name' => 'Platinum',
            'price' => 5000,
        ]);
    }

    public function test_org_admin_can_update_sponsor_level()
    {
        $level = SponsorLevel::factory()->create(['event_id' => $this->event->id, 'name' => 'Old Level']);

        $response = $this->actingAs($this->user)->put(route('events.sponsor-levels.update', [$this->event, $level]), [
            'name' => 'Updated Level',
            'price' => 1000,
        ]);

        $response->assertRedirect();
        
        $this->assertDatabaseHas('sponsor_levels', [
            'id' => $level->id,
            'name' => 'Updated Level',
            'price' => 1000,
        ]);
    }

    public function test_org_admin_can_delete_sponsor_level()
    {
        $level = SponsorLevel::factory()->create(['event_id' => $this->event->id]);

        $response = $this->actingAs($this->user)->delete(route('events.sponsor-levels.destroy', [$this->event, $level]));

        $response->assertRedirect();
        
        $this->assertDatabaseMissing('sponsor_levels', [
            'id' => $level->id,
        ]);
    }

    public function test_org_admin_can_reorder_sponsor_levels()
    {
        $level1 = SponsorLevel::factory()->create(['event_id' => $this->event->id, 'sort_order' => 1]);
        $level2 = SponsorLevel::factory()->create(['event_id' => $this->event->id, 'sort_order' => 2]);

        $response = $this->actingAs($this->user)->post(route('events.sponsor-levels.reorder', $this->event), [
            'levels' => [
                ['id' => $level1->id, 'sort_order' => 2],
                ['id' => $level2->id, 'sort_order' => 1],
            ],
        ]);

        $response->assertRedirect();
        
        $this->assertDatabaseHas('sponsor_levels', ['id' => $level1->id, 'sort_order' => 2]);
        $this->assertDatabaseHas('sponsor_levels', ['id' => $level2->id, 'sort_order' => 1]);
    }
}
