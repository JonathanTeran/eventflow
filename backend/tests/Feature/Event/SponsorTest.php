<?php

namespace Tests\Feature\Event;

use App\Models\Event;
use App\Models\Organization;
use App\Models\Sponsor;
use App\Models\SponsorLevel;
use App\Models\User;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SponsorTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;
    protected Organization $org;
    protected Event $event;
    protected SponsorLevel $level;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RoleAndPermissionSeeder::class);

        $this->org = Organization::factory()->create();
        $this->user = User::factory()->create(['organization_id' => $this->org->id]);
        $this->user->assignRole('org_admin');
        
        $this->event = Event::factory()->create(['organization_id' => $this->org->id]);
        $this->level = SponsorLevel::factory()->create(['event_id' => $this->event->id]);
    }

    public function test_org_admin_can_view_sponsors_index()
    {
        Sponsor::factory()->count(3)->create(['event_id' => $this->event->id, 'sponsor_level_id' => $this->level->id]);

        $response = $this->actingAs($this->user)->get(route('events.sponsors.index', $this->event));
        
        $response->assertStatus(200);
    }

    public function test_org_admin_can_store_sponsor()
    {
        $response = $this->actingAs($this->user)->post(route('events.sponsors.store', $this->event), [
            'sponsor_level_id' => $this->level->id,
            'company_name' => 'Acme Corp',
            'contact_email' => 'info@acme.com',
            'contact_name' => 'John Boss',
            'amount_paid' => 1000,
            'status' => 'confirmed',
        ]);

        $response->assertRedirect(route('events.sponsors.index', $this->event));
        
        $this->assertDatabaseHas('sponsors', [
            'event_id' => $this->event->id,
            'company_name' => 'Acme Corp',
        ]);
    }

    public function test_org_admin_can_update_sponsor()
    {
        $sponsor = Sponsor::factory()->create(['event_id' => $this->event->id, 'sponsor_level_id' => $this->level->id, 'company_name' => 'Old Company']);

        $response = $this->actingAs($this->user)->put(route('events.sponsors.update', [$this->event, $sponsor]), [
            'sponsor_level_id' => $this->level->id,
            'company_name' => 'Updated Company',
            'contact_email' => $sponsor->contact_email,
            'status' => 'confirmed',
        ]);

        $response->assertRedirect(route('events.sponsors.index', $this->event));
        
        $this->assertDatabaseHas('sponsors', [
            'id' => $sponsor->id,
            'company_name' => 'Updated Company',
        ]);
    }

    public function test_org_admin_can_delete_sponsor()
    {
        $sponsor = Sponsor::factory()->create(['event_id' => $this->event->id, 'sponsor_level_id' => $this->level->id]);

        $response = $this->actingAs($this->user)->delete(route('events.sponsors.destroy', [$this->event, $sponsor]));

        $response->assertRedirect();
        
        $this->assertSoftDeleted('sponsors', [
            'id' => $sponsor->id,
        ]);
    }

    public function test_org_admin_can_reorder_sponsors()
    {
        $sponsor1 = Sponsor::factory()->create(['event_id' => $this->event->id, 'sponsor_level_id' => $this->level->id, 'sort_order' => 1]);
        $sponsor2 = Sponsor::factory()->create(['event_id' => $this->event->id, 'sponsor_level_id' => $this->level->id, 'sort_order' => 2]);

        $response = $this->actingAs($this->user)->post(route('events.sponsors.reorder', $this->event), [
            'sponsors' => [
                ['id' => $sponsor1->id, 'sort_order' => 2],
                ['id' => $sponsor2->id, 'sort_order' => 1],
            ],
        ]);

        $response->assertRedirect();
        
        $this->assertDatabaseHas('sponsors', ['id' => $sponsor1->id, 'sort_order' => 2]);
        $this->assertDatabaseHas('sponsors', ['id' => $sponsor2->id, 'sort_order' => 1]);
    }
}
