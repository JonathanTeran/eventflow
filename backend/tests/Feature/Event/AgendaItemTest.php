<?php

namespace Tests\Feature\Event;

use App\Models\Event;
use App\Models\Organization;
use App\Models\AgendaItem;
use App\Models\Speaker;
use App\Models\User;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AgendaItemTest extends TestCase
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

    public function test_org_admin_can_view_agenda_items()
    {
        AgendaItem::factory()->count(3)->create(['event_id' => $this->event->id]);

        $response = $this->actingAs($this->user)->get(route('events.agenda.index', $this->event));
        
        $response->assertStatus(200);
    }

    public function test_org_admin_can_store_agenda_item()
    {
        $speaker = Speaker::factory()->create(['event_id' => $this->event->id]);

        $response = $this->actingAs($this->user)->post(route('events.agenda.store', $this->event), [
            'title' => 'Keynote Speech',
            'speaker_id' => $speaker->id,
            'date' => now()->toDateString(),
            'start_time' => '10:00',
            'end_time' => '11:00',
            'type' => 'talk',
        ]);

        $response->assertRedirect(route('events.agenda.index', $this->event));
        
        $this->assertDatabaseHas('agenda_items', [
            'event_id' => $this->event->id,
            'title' => 'Keynote Speech',
        ]);
    }

    public function test_org_admin_can_update_agenda_item()
    {
        $item = AgendaItem::factory()->create(['event_id' => $this->event->id, 'title' => 'Old Title']);

        $response = $this->actingAs($this->user)->put(route('events.agenda.update', [$this->event, $item]), [
            'title' => 'Updated Title',
            'date' => $item->date->toDateString(),
            'start_time' => $item->start_time,
            'end_time' => $item->end_time,
            'type' => $item->type,
        ]);

        $response->assertRedirect(route('events.agenda.index', $this->event));
        
        $this->assertDatabaseHas('agenda_items', [
            'id' => $item->id,
            'title' => 'Updated Title',
        ]);
    }

    public function test_org_admin_can_delete_agenda_item()
    {
        $item = AgendaItem::factory()->create(['event_id' => $this->event->id]);

        $response = $this->actingAs($this->user)->delete(route('events.agenda.destroy', [$this->event, $item]));

        $response->assertRedirect();
        
        $this->assertSoftDeleted('agenda_items', [
            'id' => $item->id,
        ]);
    }

    public function test_org_admin_can_reorder_agenda_items()
    {
        $item1 = AgendaItem::factory()->create(['event_id' => $this->event->id, 'sort_order' => 1]);
        $item2 = AgendaItem::factory()->create(['event_id' => $this->event->id, 'sort_order' => 2]);

        $response = $this->actingAs($this->user)->post(route('events.agenda.reorder', $this->event), [
            'items' => [
                ['id' => $item1->id, 'sort_order' => 2],
                ['id' => $item2->id, 'sort_order' => 1],
            ],
        ]);

        $response->assertRedirect();
        
        $this->assertDatabaseHas('agenda_items', ['id' => $item1->id, 'sort_order' => 2]);
        $this->assertDatabaseHas('agenda_items', ['id' => $item2->id, 'sort_order' => 1]);
    }
}
