<?php

namespace Tests\Feature\Admin;

use App\Models\Organization;
use App\Models\User;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminOrganizationTest extends TestCase
{
    use RefreshDatabase;

    protected User $superAdmin;
    protected User $regularUser;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RoleAndPermissionSeeder::class);

        $org = Organization::factory()->create();

        $this->superAdmin = User::factory()->create(['organization_id' => $org->id]);
        $this->superAdmin->assignRole('super_admin');

        $this->regularUser = User::factory()->create(['organization_id' => $org->id]);
        $this->regularUser->assignRole('org_admin');
    }

    public function test_super_admin_can_view_organizations_index()
    {
        Organization::factory()->count(3)->create();

        $response = $this->actingAs($this->superAdmin)->get(route('admin.organizations.index'));

        $response->assertStatus(200);
        $response->assertSee('Organizations'); // Assuming Inertia renders it or just check status
    }

    public function test_regular_user_cannot_view_organizations_index()
    {
        $response = $this->actingAs($this->regularUser)->get(route('admin.organizations.index'));

        $response->assertStatus(403);
    }

    public function test_super_admin_can_store_organization()
    {
        $response = $this->actingAs($this->superAdmin)->post(route('admin.organizations.store'), [
            'name' => 'New Org',
            'email' => 'contact@neworg.com',
        ]);

        $response->assertRedirect(route('admin.organizations.index'));
        $this->assertDatabaseHas('organizations', [
            'name' => 'New Org',
            'email' => 'contact@neworg.com',
            'slug' => 'new-org',
        ]);
    }

    public function test_super_admin_can_update_organization()
    {
        $org = Organization::factory()->create(['name' => 'Old Name']);

        $response = $this->actingAs($this->superAdmin)->put(route('admin.organizations.update', $org), [
            'name' => 'Updated Name',
            'slug' => 'updated-name',
            'email' => 'updated@exam.com',
        ]);

        $response->assertRedirect(route('admin.organizations.index'));
        $this->assertDatabaseHas('organizations', [
            'id' => $org->id,
            'name' => 'Updated Name',
            'email' => 'updated@exam.com',
        ]);
    }

    public function test_super_admin_can_toggle_organization_active_status()
    {
        $org = Organization::factory()->create(['is_active' => true]);

        $response = $this->actingAs($this->superAdmin)->patch(route('admin.organizations.toggle-active', $org));

        $response->assertRedirect();
        $this->assertDatabaseHas('organizations', [
            'id' => $org->id,
            'is_active' => false,
        ]);
    }

    public function test_super_admin_can_delete_organization()
    {
        $org = Organization::factory()->create();

        $response = $this->actingAs($this->superAdmin)->delete(route('admin.organizations.destroy', $org));

        $response->assertRedirect(route('admin.organizations.index'));
        $this->assertSoftDeleted('organizations', [
            'id' => $org->id,
        ]);
    }
}
